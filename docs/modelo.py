"""Modelo financiero AiTrava — 12 meses, 3 escenarios, sensibilidad.
Todas las cifras en COP. Supuestos estimados (ver documento, marcados [VERIFY])."""
import copy, json

LINEAS = {  # precio por persona, cupo por salida, participación en reservas
    "L1 Urbano":    {"precio": 65_000,  "cupo": 8,  "mix": 0.50},
    "L2 Naturaleza": {"precio": 110_000, "cupo": 8,  "mix": 0.35},
    "L3 Escapada":  {"precio": 220_000, "cupo": 10, "mix": 0.15},
}

BASE = dict(
    comision=0.20,
    fee_servicio=0,                       # cargo extra al viajero por reserva
    salidas=[2,4,6,8,10,12,14,16,18,20,22,24],
    ocupacion=[0.70,0.70,0.75,0.75,0.80,0.80,0.80,0.85,0.85,0.85,0.85,0.85],
    recompra=[0.00,0.10,0.20,0.25,0.30,0.35,0.35,0.40,0.40,0.40,0.40,0.40],
    cac=10_400,
    kit_salida=15_000,
    horas_salida=[6,6,6,3,3,3,3,3,3,3,3,3],
    valor_hora=15_000,
    fijos=[20_000]*3 + [250_000]*9,
    formalizacion=(4, 500_000),          # mes, costo único
)

def escenario(nombre):
    e = copy.deepcopy(BASE)
    if nombre == "Pesimista":
        e.update(comision=0.16, cac=18_000,
                 salidas=[2,3,4,5,6,7,8,9,10,11,12,13],
                 ocupacion=[o-0.10 for o in BASE["ocupacion"]],
                 recompra=[r*0.6 for r in BASE["recompra"]],
                 horas_salida=[6]*6+[4]*6)
    if nombre == "Optimista":
        e.update(cac=7_000, fee_servicio=5_000,
                 ocupacion=[min(o+0.05,0.95) for o in BASE["ocupacion"]],
                 recompra=[min(r+0.10,0.55) for r in BASE["recompra"]])
    return e

def ticket_prom():
    return sum(l["precio"]*l["mix"] for l in LINEAS.values())

def cupo_prom():
    # cupo promedio por salida, ponderado por participación en salidas (aprox. por mix)
    return sum(l["cupo"]*l["mix"] for l in LINEAS.values())

def correr(e):
    tk, cupo = ticket_prom(), cupo_prom()
    filas, caja = [], 0
    for m in range(12):
        sal = e["salidas"][m]
        res = sal * cupo * e["ocupacion"][m]
        nuevas = res * (1 - e["recompra"][m])
        gmv = res * tk
        ingreso = gmv * e["comision"] + res * e["fee_servicio"]
        c_cac = nuevas * e["cac"]
        c_kit = sal * e["kit_salida"]
        c_horas = sal * e["horas_salida"][m] * e["valor_hora"]
        c_fijos = e["fijos"][m] + (e["formalizacion"][1] if m+1 == e["formalizacion"][0] else 0)
        resultado = ingreso - c_cac - c_kit - c_horas - c_fijos
        caja += resultado
        filas.append(dict(mes=m+1, salidas=sal, reservas=round(res,1), gmv=gmv, ingreso=ingreso,
                          cac=c_cac, kit=c_kit, horas=c_horas, fijos=c_fijos,
                          resultado=resultado, caja=caja))
    return filas

def resumen(f):
    tot = {k: sum(x[k] for x in f) for k in ["reservas","gmv","ingreso","cac","kit","horas","fijos","resultado"]}
    be = next((x["mes"] for x in f if x["resultado"] > 0), None)
    minimo = min(x["caja"] for x in f)
    return tot, be, minimo

def unit(e, horas, recompra=0.0, cupo_ocup=None):
    tk = ticket_prom()
    ocup = cupo_ocup or cupo_prom()*0.80
    ing = tk*e["comision"] + e["fee_servicio"]
    cac = e["cac"]*(1-recompra)
    kit = e["kit_salida"]/ocup
    hr = horas*e["valor_hora"]/ocup
    return dict(ticket=tk, ingreso=ing, cac=cac, kit=kit, horas=hr, contribucion=ing-cac-kit-hr, asist=ocup)

if __name__ == "__main__":
    out = {"ticket_prom": ticket_prom(), "cupo_prom": cupo_prom()}
    for n in ["Pesimista","Base","Optimista"]:
        f = correr(escenario(n)); tot, be, mn = resumen(f)
        out[n] = dict(filas=f, tot=tot, break_even=be, caja_min=mn)
    b = escenario("Base")
    out["unit_piloto_nuevo"] = unit(b, 6)
    out["unit_estandar_nuevo"] = unit(b, 3)
    out["unit_estandar_recompra40"] = unit(b, 3, recompra=0.40)
    # sensibilidad sobre resultado acumulado 12 meses (base)
    base_res = resumen(correr(b))[0]["resultado"]
    sens = {}
    def prueba(nombre, cambios_bajo, cambios_alto):
        r=[]
        for c in (cambios_bajo, cambios_alto):
            e = escenario("Base"); e.update(c); r.append(resumen(correr(e))[0]["resultado"])
        sens[nombre]=r
    prueba("Comisión 16% / 24%", {"comision":0.16}, {"comision":0.24})
    prueba("CAC $18.000 / $7.000", {"cac":18_000}, {"cac":7_000})
    prueba("Ocupación −10 pp / +10 pp", {"ocupacion":[o-0.10 for o in b["ocupacion"]]}, {"ocupacion":[min(o+0.10,1) for o in b["ocupacion"]]})
    prueba("Horas por salida 5 / 2 (desde mes 4)", {"horas_salida":[6]*3+[5]*9}, {"horas_salida":[6]*3+[2]*9})
    prueba("Recompra −15 pp / +15 pp", {"recompra":[max(r-0.15,0) for r in b["recompra"]]}, {"recompra":[min(r+0.15,0.6) for r in b["recompra"]]})
    prueba("Fee de servicio $0 / $5.000", {"fee_servicio":0}, {"fee_servicio":5_000})
    out["sens_base"]=base_res; out["sens"]=sens
    # punto de equilibrio mensual en reservas (estado estándar, mes 12 base: 3 h, recompra 40%)
    u = unit(b, 3, recompra=0.40, cupo_ocup=cupo_prom()*0.85)
    out["be_reservas_mes"] = 250_000 / u["contribucion"] if u["contribucion"]>0 else None
    out["unit_m12"]=u
    json.dump(out, open("/home/claude/aitrava/salida.json","w"), indent=1, default=float)
    print("ticket", ticket_prom(), "cupo", cupo_prom())
    for n in ["Pesimista","Base","Optimista"]:
        t=out[n]; print(n, {k:round(v) for k,v in t["tot"].items()}, "BE mes", t["break_even"], "caja min", round(t["caja_min"]))
    for k in ["unit_piloto_nuevo","unit_estandar_nuevo","unit_estandar_recompra40","unit_m12"]:
        print(k, {a:round(v) for a,v in out[k].items()})
    print("BE reservas/mes", out["be_reservas_mes"])
    print("sens base", round(base_res)); [print(k,[round(x) for x in v]) for k,v in sens.items()]
    print("--- base mensual")
    for x in out["Base"]["filas"]: print({k:round(v) for k,v in x.items()})
