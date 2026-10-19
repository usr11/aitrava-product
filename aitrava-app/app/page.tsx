import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContinueTrip, PassPrice, SavingsExample } from '@/components/home';
import { Icon, type IconName } from '@/components/Icon';

export const metadata: Metadata = {
  title: { absolute: 'AITRAVA | Tu viaje vive aquí' },
};

const BENEFITS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'list', title: 'Todo en un solo lugar', text: 'Planifica y centraliza tu viaje.' },
  { icon: 'piggy', title: 'Ahorra para tu viaje', text: 'Un plan de ahorro desde hoy hasta el día que viajas.' },
  { icon: 'folder', title: 'Organiza tus reservas', text: 'Incluso si las compraste en otro lugar.' },
  { icon: 'navigation', title: 'Guía durante el viaje', text: 'Consulta qué sigue y cómo llegar.' },
  { icon: 'shield', title: 'Viaja con tranquilidad', text: 'Tu viaje siempre contigo.' },
];

const DESTINATIONS = [
  { slug: 'barcelona', name: 'Barcelona', country: 'España' },
  { slug: 'nueva-york', name: 'Nueva York', country: 'Estados Unidos' },
  { slug: 'roma', name: 'Roma', country: 'Italia' },
  { slug: 'cancun', name: 'Cancún', country: 'México' },
  { slug: 'tokio', name: 'Tokio', country: 'Japón' },
  { slug: 'paris', name: 'París', country: 'Francia' },
];

const SAVINGS_STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'target', title: 'Pon tu meta', text: 'El costo de tu viaje sale de tu presupuesto. Dinos cuánto llevas ahorrado.' },
  { icon: 'calendar', title: 'Elige cuándo ahorras', text: 'Cada viernes, cada quincena o cada fin de mes: como te pagan.' },
  {
    icon: 'zap',
    title: 'Te decimos cuánto y cuándo',
    text: 'Calculamos la cuota para que tengas la plata del vuelo, del hotel y de todo lo demás en la fecha en que lo vas a pagar.',
  },
  { icon: 'trendingUp', title: 'Lleva tu avance', text: 'Registra tus aportes y el plan se recalcula si te atrasas o te adelantas.' },
];

export default function HomePage() {
  return (
    <>
      <ContinueTrip />

      {/* HERO */}
      <section className="container-app grid items-center gap-8 pt-8 pb-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-14 lg:pb-20">
        <div className="animate-fade-up">
          <p className="eyebrow inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1.5 text-blue">
            <Icon name="sparkle" size={14} /> Asistente inteligente de viajes
          </p>
          <h1 className="h-display mt-5 text-[2.9rem] text-navy sm:text-6xl lg:text-7xl">
            Tu viaje
            <br />
            <span className="relative inline-block">
              vive aquí.
              <span className="absolute inset-x-0 -bottom-1 -z-10 h-4 rounded-full bg-yellow/70 sm:h-5" aria-hidden />
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-text-2 sm:text-xl">
            Planea, ahorra, organiza y lleva contigo todo tu viaje en un solo lugar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/planear" className="btn btn-primary btn-lg">
              Crear mi viaje <Icon name="arrow" size={20} />
            </Link>
            <Link href="#como-funciona" className="btn btn-outline btn-lg">
              Ver cómo funciona
            </Link>
          </div>
          <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-2">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={16} className="text-ok" /> Gratis para empezar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={16} className="text-ok" /> Sin tarjeta de crédito
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="check" size={16} className="text-ok" /> Desde el celular
            </span>
          </p>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] shadow-[var(--shadow-lift)] lg:aspect-[5/6]">
            <Image src="/img/hero.jpg" alt="Atardecer sobre Barcelona" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
          </div>
          {/* Vista del producto (ilustrativa) */}
          <div className="card absolute -bottom-6 left-3 w-[62%] max-w-[260px] p-3.5 sm:left-6 sm:p-4" aria-hidden>
            <p className="eyebrow text-[0.65rem] text-blue">Tu próxima actividad</p>
            <p className="mt-1 font-bold text-navy">Museo del Prado</p>
            <p className="text-sm text-text-2">10:30 a. m. · Madrid</p>
            <span className="btn btn-navy btn-sm mt-3 w-full">
              <Icon name="navigation" size={16} /> Cómo llegar
            </span>
          </div>
          <div className="card absolute top-5 right-3 w-[48%] max-w-[210px] p-3.5 sm:right-6" aria-hidden>
            <p className="eyebrow text-[0.65rem] text-blue">Plan de ahorro</p>
            <p className="mt-1 text-2xl font-extrabold text-navy">72 %</p>
            <div className="mt-2 h-2 rounded-full bg-line">
              <div className="h-2 w-[72%] rounded-full bg-yellow" />
            </div>
            <p className="mt-2 text-xs text-text-2">Vas al día con tu meta</p>
          </div>
          <p className="mt-9 text-right text-xs text-text-3">Vista ilustrativa de la app</p>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-surface py-14 lg:py-20">
        <div className="container-app">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card flex items-start gap-4 p-4 sm:block sm:p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-navy text-yellow">
                  <Icon name={b.icon} />
                </span>
                <div>
                  <h3 className="font-extrabold text-navy uppercase sm:mt-4">{b.title}</h3>
                  <p className="mt-1 text-text-2">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AHORRO: PILAR */}
      <section id="ahorro" className="container-app grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <p className="eyebrow text-blue">Plan de ahorro inteligente</p>
          <h2 className="h-display mt-3 text-4xl text-navy sm:text-5xl">Tu viaje empieza el día que lo planeas.</h2>
          <p className="mt-4 text-lg text-text-2">
            Un viaje no se paga todo el mismo día: el vuelo se compra antes que el hotel, y el hotel antes que los planes.
            AITRAVA arma un plan de ahorro que va al ritmo de tu viaje, desde hoy hasta la fecha de salida.
          </p>
          <ol className="mt-8 space-y-5">
            {SAVINGS_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-yellow font-extrabold text-navy">{i + 1}</span>
                <div>
                  <p className="font-bold text-navy">{s.title}</p>
                  <p className="text-text-2">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 flex items-start gap-2 rounded-2xl bg-sky p-4 text-sm text-navy">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-blue" />
            AITRAVA no guarda tu dinero: ahorras en tu propia cuenta y aquí llevas el plan y tu avance.
          </p>
        </div>
        <SavingsExample />
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="scroll-mt-20 bg-navy py-16 text-white lg:py-24">
        <div className="container-app">
          <p className="eyebrow text-yellow">Cómo funciona</p>
          <h2 className="h-display mt-3 max-w-2xl text-4xl sm:text-5xl">Antes y durante tu viaje, todo conectado.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {[
              {
                tag: 'Antes del viaje',
                icon: 'calendar' as IconName,
                items: [
                  'Crea tu viaje: sabes a dónde vas, te ayudamos a elegir o te proponemos un destino sorpresa.',
                  'Arma tu plan de ahorro y tu presupuesto por categorías.',
                  'Agrega vuelos, hoteles, tours y seguros, los hayas comprado donde los hayas comprado.',
                  'Guarda tiquetes, reservas, QR y pólizas en tu Bóveda.',
                ],
              },
              {
                tag: 'Durante el viaje',
                icon: 'navigation' as IconName,
                items: [
                  'Modo Viaje: qué tienes ahora, qué sigue y qué viene después.',
                  'Cómo llegar a tu próxima actividad, a pie, en transporte público o en carro.',
                  'Explora lugares cerca de ti cuando tengas tiempo libre.',
                  'Registra tus gastos y cambia tus planes sin perder el orden.',
                ],
              },
            ].map((col) => (
              <div key={col.tag} className="rounded-[28px] bg-white/[0.06] p-6 ring-1 ring-white/10 sm:p-8">
                <p className="inline-flex items-center gap-2 font-bold text-yellow">
                  <Icon name={col.icon} size={20} /> {col.tag}
                </p>
                <ul className="mt-5 space-y-4">
                  {col.items.map((t) => (
                    <li key={t} className="flex gap-3 text-white/85">
                      <Icon name="checkCircle" size={20} className="mt-0.5 shrink-0 text-yellow" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-[28px] bg-yellow p-6 text-navy sm:p-8">
            <p className="text-xl font-extrabold sm:text-2xl">Lo hayas comprado donde lo hayas comprado, agrégalo a tu viaje.</p>
            <p className="mt-2 max-w-3xl">
              Una plataforma conoce tu vuelo, otra tu hotel y otra un restaurante. AITRAVA conoce tu viaje.
            </p>
          </div>
        </div>
      </section>

      {/* DESTINOS */}
      <section className="container-app py-16 lg:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-blue">Inspírate</p>
            <h2 className="h-display mt-3 text-4xl text-navy sm:text-5xl">Destinos populares</h2>
          </div>
          <Link href="/destinos" className="btn btn-ghost hidden sm:inline-flex">
            Ver todos <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="scroll-x -mx-4 mt-8 snap-x px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.slug}
              href={`/planear?destino=${d.slug}`}
              className="group relative aspect-[3/4] w-[62%] shrink-0 snap-start overflow-hidden rounded-3xl sm:w-auto"
            >
              <Image src={`/img/destinos/${d.slug}.jpg`} alt={d.name} fill sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 62vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-lg font-extrabold">{d.name}</p>
                <p className="text-sm text-white/80">{d.country}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-text-3">Contenido de inspiración: no mostramos precios ni disponibilidad.</p>
      </section>

      {/* PLANES */}
      <section id="pass" className="bg-surface py-16 lg:py-24">
        <div className="container-app">
          <p className="eyebrow text-blue">Precios claros</p>
          <h2 className="h-display mt-3 text-4xl text-navy sm:text-5xl">Empieza gratis. Paga solo por el viaje que quieras llevar contigo.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="card p-6 sm:p-8">
              <p className="font-extrabold text-navy">AITRAVA Free</p>
              <p className="mt-2 text-4xl font-extrabold text-navy">$0</p>
              <ul className="mt-6 space-y-3 text-text-2">
                {[
                  'Crear viajes y ver Mi Viaje',
                  'Plan de ahorro inteligente completo',
                  'Itinerario y presupuesto con gastos',
                  'Reservas externas',
                  'Bóveda con hasta 3 documentos por viaje',
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Icon name="check" size={20} className="mt-0.5 shrink-0 text-ok" /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/planear" className="btn btn-outline mt-8 w-full">
                Crear mi viaje gratis
              </Link>
            </div>
            <div className="card relative overflow-hidden bg-navy p-6 text-white sm:p-8">
              <span className="badge absolute top-6 right-6 bg-yellow text-navy">Por viaje</span>
              <p className="font-extrabold">AITRAVA Pass</p>
              <p className="mt-2 text-4xl font-extrabold">
                <PassPrice /> <span className="text-base font-semibold text-white/70">COP por viaje</span>
              </p>
              <p className="mt-1 text-sm text-white/70">Pago único. No es una suscripción.</p>
              <ul className="mt-6 space-y-3 text-white/85">
                {['Bóveda completa', 'Modo Viaje', 'Cómo llegar a cada actividad', 'Explora cerca de ti', 'Cambiar mis planes'].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Icon name="check" size={20} className="mt-0.5 shrink-0 text-yellow" /> {t}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-white/70">Lo activas dentro de tu viaje, cuando lo necesites. Pago seguro procesado mediante Wompi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container-app py-16 text-center lg:py-24">
        <h2 className="h-display mx-auto max-w-3xl text-4xl text-navy sm:text-5xl">Tu próximo viaje empieza aquí.</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-text-2">Crea tu viaje en minutos y empieza a ahorrar para él hoy.</p>
        <Link href="/planear" className="btn btn-primary btn-lg mt-8">
          Crear mi viaje <Icon name="arrow" size={20} />
        </Link>
      </section>
    </>
  );
}
