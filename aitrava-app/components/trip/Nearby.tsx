"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import {
  formatDuration,
  formatKm,
  haversineKm,
  walkMinutes,
} from "@/lib/format";
import { GEO_EXPLAIN, type LatLng, useGeolocation } from "@/lib/geo";
import { api } from "@/lib/api";
import { geocode, placeUrl } from "@/lib/itinerary";
import { track } from "@/lib/track";
import { Icon, type IconName } from "../Icon";
import { Alert } from "../ui";

const NearbyMap = dynamic(() => import("./NearbyMap"), {
  ssr: false,
  loading: () => <div className="skeleton h-72" />,
});

export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  km: number;
};

const CATEGORIES: { key: string; label: string; icon: IconName }[] = [
  { key: "turismo", label: "Turismo", icon: "landmark" },
  { key: "comida", label: "Comida", icon: "utensils" },
  { key: "cafe", label: "Café", icon: "coffee" },
  { key: "experiencias", label: "Experiencias", icon: "ticket" },
  { key: "compras", label: "Compras", icon: "bag" },
  { key: "nocturna", label: "Vida nocturna", icon: "moon" },
  { key: "servicios", label: "Servicios", icon: "service" },
];
const ALL = ["turismo", "comida", "cafe"];

/** Lugares de OpenStreetMap, consultados a través del backend (/api/nearby). */
async function overpass(center: LatLng, cats: string[]): Promise<Place[]> {
  const data = await api<{
    elements: {
      id: number;
      type: string;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }[];
  }>(`/nearby?lat=${center.lat}&lng=${center.lng}&cats=${cats.join(",")}`);
  const catOf = (t: Record<string, string>) => {
    const a = t.amenity ?? "";
    if (a === "cafe" || t.shop === "bakery") return "cafe";
    if (["restaurant", "food_court"].includes(a)) return "comida";
    if (["bar", "pub", "nightclub"].includes(a)) return "nocturna";
    if (
      ["pharmacy", "atm", "bank", "hospital", "police", "toilets"].includes(a)
    )
      return "servicios";
    if (t.shop || a === "marketplace") return "compras";
    if (
      ["theme_park", "zoo", "aquarium"].includes(t.tourism ?? "") ||
      t.leisure ||
      ["theatre", "cinema", "arts_centre"].includes(a)
    )
      return "experiencias";
    return "turismo";
  };
  const seen = new Set<string>();
  return data.elements
    .map((e) => {
      const lat = e.lat ?? e.center?.lat;
      const lng = e.lon ?? e.center?.lon;
      if (lat == null || lng == null || !e.tags?.name) return null;
      return {
        id: `${e.type}${e.id}`,
        name: e.tags.name,
        lat,
        lng,
        category: catOf(e.tags),
        km: haversineKm(center, { lat, lng }),
      };
    })
    .filter((p): p is Place => {
      if (!p || seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    })
    .sort((a, b) => a.km - b.km)
    .slice(0, 30);
}

/** "Explora cerca de ti": lugares reales de OpenStreetMap alrededor tuyo o de tu próxima actividad. */
export function NearbyExplorer({
  tripId,
  city,
  fallback,
  freeMinutes,
  nextTitle,
}: {
  tripId: string;
  city: string;
  fallback: LatLng | null;
  freeMinutes: number | null;
  nextTitle?: string;
}) {
  const geo = useGeolocation();
  const [cat, setCat] = useState("todo");
  const [view, setView] = useState<"lista" | "mapa">("lista");
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [error, setError] = useState("");
  const [center, setCenter] = useState<{ pos: LatLng; label: string } | null>(
    null,
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    track("nearby_explore_opened", {}, tripId);
  }, [tripId]);

  // Centro: tu ubicación > tu próxima actividad > la ciudad del viaje
  useEffect(() => {
    if (geo.pos) setCenter({ pos: geo.pos, label: "cerca de ti" });
    else if (fallback)
      setCenter(
        (c) =>
          c ?? {
            pos: fallback,
            label: nextTitle
              ? `cerca de ${nextTitle}`
              : "cerca de tu próxima actividad",
          },
      );
    else
      geocode(city).then((p) => {
        if (p) setCenter((c) => c ?? { pos: p, label: `en ${city}` });
      });
  }, [geo.pos, fallback, city, nextTitle]);

  const load = useCallback(async () => {
    if (!center) return;
    setError("");
    setPlaces(null);
    try {
      setPlaces(await overpass(center.pos, cat === "todo" ? ALL : [cat]));
    } catch (e) {
      setError((e as Error).message);
      setPlaces([]);
    }
  }, [center, cat]);

  useEffect(() => {
    load();
  }, [load]);

  const fits = (km: number) =>
    freeMinutes != null && walkMinutes(km) * 2 + 30 <= freeMinutes;

  return (
    <section id="cerca" className="scroll-mt-20">
      <h2 className="text-xl font-extrabold text-navy">Explora cerca de ti</h2>
      <p className="text-sm text-text-2">
        {center ? `Lugares ${center.label}.` : "Buscando dónde estás…"}
      </p>

      {geo.state !== "granted" && (
        <div className="mt-3">
          {geo.state === "denied" ? (
            <Alert tone="warn">
              No tenemos permiso de ubicación: te mostramos lugares cerca de tu
              próxima actividad. Puedes activarlo en los ajustes del navegador.
            </Alert>
          ) : geo.state === "unavailable" ? (
            <Alert tone="warn">
              No pudimos obtener tu ubicación. Te mostramos lugares cerca de tu
              próxima actividad.
            </Alert>
          ) : (
            <div className="card-flat p-4">
              <p className="text-sm text-navy">{GEO_EXPLAIN}</p>
              <button
                onClick={geo.request}
                className="btn btn-navy btn-sm mt-3"
                disabled={geo.state === "asking"}
              >
                <Icon name="navigation" size={16} />{" "}
                {geo.state === "asking" ? "Buscando…" : "Usar mi ubicación"}
              </button>
            </div>
          )}
        </div>
      )}

      {freeMinutes != null && freeMinutes >= 30 && (
        <p className="mt-3 rounded-2xl bg-yellow-soft p-3 text-sm text-navy">
          <Icon
            name="clock"
            size={16}
            className="mr-1 inline -translate-y-px"
          />{" "}
          Tienes <strong>{formatDuration(freeMinutes)} libres</strong>
          {nextTitle ? ` antes de “${nextTitle}”` : ""}.
        </p>
      )}

      <div className="scroll-x -mx-4 mt-3 px-4 pb-1">
        <button
          className="chip"
          aria-pressed={cat === "todo"}
          onClick={() => setCat("todo")}
        >
          Todo
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className="chip"
            aria-pressed={cat === c.key}
            onClick={() => setCat(c.key)}
          >
            <Icon name={c.icon} size={16} /> {c.label}
          </button>
        ))}
      </div>
      <div
        className="mt-3 inline-flex rounded-full bg-surface p-1"
        role="tablist"
        aria-label="Vista"
      >
        {(["lista", "mapa"] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${view === v ? "bg-white text-navy shadow-sm" : "text-text-2"}`}
          >
            {v === "lista" ? "Lista" : "Mapa"}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {error && (
          <Alert tone="warn">
            {error}{" "}
            {center && (
              <a
                className="font-semibold underline"
                href={`https://www.google.com/maps/search/${encodeURIComponent(cat === "todo" ? "lugares de interés" : (CATEGORIES.find((c) => c.key === cat)?.label ?? ""))}/@${center.pos.lat},${center.pos.lng},16z`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Buscar en Google Maps
              </a>
            )}
          </Alert>
        )}
        {!places ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-20" />
            ))}
          </div>
        ) : !places.length && !error ? (
          <p className="py-6 text-center text-text-2">
            No encontramos lugares de este tipo a menos de 1,2 km.
          </p>
        ) : view === "mapa" && center ? (
          <NearbyMap
            center={center.pos}
            places={places}
            selected={selected}
            onSelect={setSelected}
          />
        ) : (
          <>
            <ul className="space-y-2">
              {(showAll ? places : places.slice(0, 10)).map((p, i) => {
                const c = CATEGORIES.find((x) => x.key === p.category)!;
                return (
                  <li
                    key={p.id}
                    className={`card flex items-center gap-3 p-3 ${selected === p.id ? "ring-2 ring-blue" : ""}`}
                  >
                    <span
                      className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sky text-blue"
                      aria-hidden
                    >
                      <Icon name={c.icon} size={24} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-navy">{p.name}</p>
                      <p className="text-sm text-text-2">
                        {c.label} ·{" "}
                        <Icon
                          name="walk"
                          size={14}
                          className="inline -translate-y-px"
                        />{" "}
                        {formatDuration(walkMinutes(p.km))} · {formatKm(p.km)}
                      </p>
                      {i < 3 && fits(p.km) && (
                        <p className="text-xs font-semibold text-ok">
                          Tienes tiempo para visitarlo antes de tu próxima
                          actividad.
                        </p>
                      )}
                    </div>
                    <a
                      href={placeUrl(p.name, p.lat, p.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm shrink-0"
                    >
                      Ver
                    </a>
                  </li>
                );
              })}
            </ul>
            {places.length > 10 && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="btn btn-ghost btn-sm mt-2 w-full"
              >
                {showAll
                  ? "Ver menos"
                  : `Ver ${places.length - 10} lugares más`}
              </button>
            )}
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-text-3">
        Lugares de OpenStreetMap. Tiempos a pie aproximados sobre la distancia
        en línea recta.
      </p>
    </section>
  );
}
