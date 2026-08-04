/**
 * Agrega las planillas de partido en totales de jugador y de equipo.
 *
 * Es una función pura, igual que `standingsCalculator`: recibe los documentos
 * de `matchStats` y devuelve el objeto que se guarda en `statsAggregates`.
 * Así el mismo cálculo corre en el navegador del admin al guardar, en la app
 * pública si hiciera falta, y en los tests de `npm run check`.
 */

/** Campos que se suman partido a partido. Los porcentajes se derivan al final. */
export const CAMPOS_SUMABLES = [
    "seg", "pts",
    "t2c", "t2i", "t3c", "t3i", "tlc", "tli",
    "rd", "ro", "rt",
    "ast", "rec", "per", "tap", "tapR", "fc", "fr", "val", "pm",
];

export function totalesVacios() {
    const base = { pj: 0 };
    for (const campo of CAMPOS_SUMABLES) base[campo] = 0;
    return base;
}

function acumular(destino, origen) {
    for (const campo of CAMPOS_SUMABLES) destino[campo] += origen[campo] ?? 0;
}

/* ── Derivados ───────────────────────────────────────────────────────── */

/** Porcentaje entero, o null si no hubo intentos (así el 0% real se distingue del "sin datos"). */
export function pct(convertidos, intentados) {
    if (!intentados) return null;
    return Math.round((convertidos / intentados) * 100);
}

/** Promedio por partido con un decimal. */
export function porPartido(total, pj) {
    if (!pj) return 0;
    return Math.round((total / pj) * 10) / 10;
}

/** 1231 segundos → "20:31" */
export function segundosAReloj(segundos) {
    const s = Math.max(0, Math.round(segundos ?? 0));
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Puntos por tiro de campo, incluyendo libres, en la escala habitual de la FIBA.
 * Devuelve null cuando no hay intentos suficientes para que signifique algo.
 */
export function tsPct(totales) {
    const intentos = totales.t2i + totales.t3i + 0.44 * totales.tli;
    if (intentos <= 0) return null;
    return Math.round((totales.pts / (2 * intentos)) * 100);
}

/**
 * Añade a un bloque de totales las columnas calculadas que consumen las vistas.
 */
export function conDerivados(totales) {
    const t2 = pct(totales.t2c, totales.t2i);
    const t3 = pct(totales.t3c, totales.t3i);
    const tl = pct(totales.tlc, totales.tli);
    const tcc = totales.t2c + totales.t3c;
    const tci = totales.t2i + totales.t3i;

    return {
        ...totales,
        tcc,
        tci,
        pctT2: t2,
        pctT3: t3,
        pctTL: tl,
        pctTC: pct(tcc, tci),
        ts: tsPct(totales),
        prom: {
            pts: porPartido(totales.pts, totales.pj),
            rt: porPartido(totales.rt, totales.pj),
            ast: porPartido(totales.ast, totales.pj),
            rec: porPartido(totales.rec, totales.pj),
            per: porPartido(totales.per, totales.pj),
            tap: porPartido(totales.tap, totales.pj),
            val: porPartido(totales.val, totales.pj),
            fc: porPartido(totales.fc, totales.pj),
            min: porPartido(totales.seg / 60, totales.pj),
        },
    };
}

/* ── Agregación ──────────────────────────────────────────────────────── */

/**
 * @param {Array} partidos documentos de `matchStats`
 * @param {Object} [opciones]
 * @param {"todo"|"regular"|"playoffs"} [opciones.fase="todo"]
 * @returns {{ jugadores: object[], equipos: object[], partidos: number, fases: object }}
 */
export function agregarEstadisticas(partidos, { fase = "todo" } = {}) {
    const usados = (partidos ?? []).filter(
        (p) => p && Array.isArray(p.equipos) && (fase === "todo" || p.fase === fase)
    );

    const jugadores = new Map();
    const equipos = new Map();

    for (const partido of usados) {
        const [ladoA, ladoB] = partido.equipos;

        partido.equipos.forEach((lado, indice) => {
            const rival = indice === 0 ? ladoB : ladoA;
            if (!lado?.key) return;

            /* — Equipo — */
            if (!equipos.has(lado.key)) {
                equipos.set(lado.key, {
                    equipo: lado.key,
                    ...totalesVacios(),
                    ptsContra: 0,
                    rebContra: 0,
                });
            }
            const equipo = equipos.get(lado.key);
            equipo.pj += 1;

            const totalEquipo = totalesVacios();
            for (const jugador of lado.jugadores ?? []) acumular(totalEquipo, jugador);
            acumular(equipo, totalEquipo);

            // Los minutos de equipo son la suma de los cinco en cancha, no un dato
            // comparable con los de un jugador; los dejamos en el largo del partido.
            const totalRival = totalesVacios();
            for (const jugador of rival?.jugadores ?? []) acumular(totalRival, jugador);
            equipo.ptsContra += totalRival.pts;
            equipo.rebContra += totalRival.rt;

            /* — Jugadores — */
            for (const jugador of lado.jugadores ?? []) {
                if (!jugador?.playerId) continue;

                if (!jugadores.has(jugador.playerId)) {
                    jugadores.set(jugador.playerId, {
                        id: jugador.playerId,
                        nombre: jugador.nombre,
                        equipo: lado.key,
                        num: jugador.num,
                        ...totalesVacios(),
                        log: [],
                    });
                }

                const acumulado = jugadores.get(jugador.playerId);
                acumulado.pj += 1;
                acumulado.num = jugador.num || acumulado.num; // último dorsal conocido
                acumular(acumulado, jugador);

                // Registro compacto por partido: alcanza para la ficha del jugador
                // sin tener que leer los 70+ documentos de partido.
                acumulado.log.push({
                    m: partido.matchId,
                    f: partido.fecha ?? null,
                    r: rival?.key ?? null,
                    s: jugador.seg,
                    p: jugador.pts,
                    b: jugador.rt,
                    a: jugador.ast,
                    v: jugador.val,
                });
            }
        });
    }

    return {
        jugadores: [...jugadores.values()],
        equipos: [...equipos.values()],
        // Qué partidos tienen planilla: permite que el fixture muestre el enlace
        // al box score sin leer la colección entera.
        ids: usados.map((p) => p.matchId).filter(Boolean),
        partidos: usados.length,
        fases: {
            regular: (partidos ?? []).filter((p) => p?.fase === "regular").length,
            playoffs: (partidos ?? []).filter((p) => p?.fase === "playoffs").length,
        },
    };
}

/* ── Rankings ────────────────────────────────────────────────────────── */

/** Métricas que se pueden rankear, con su etiqueta y cómo se leen. */
export const METRICAS = [
    { key: "pts", label: "Puntos", corto: "PTS" },
    { key: "rt", label: "Rebotes", corto: "REB" },
    { key: "ast", label: "Asistencias", corto: "AST" },
    { key: "val", label: "Valoración", corto: "VAL" },
    { key: "rec", label: "Recuperos", corto: "REC" },
    { key: "tap", label: "Tapones", corto: "TAP" },
    { key: "t3c", label: "Triples", corto: "3PC" },
    { key: "seg", label: "Minutos", corto: "MIN" },
];

/**
 * Ordena jugadores por una métrica.
 *
 * `modo` "total" usa el acumulado; "prom" divide por partidos jugados. Sin
 * mínimo de partidos: los rankings por promedio marcan aparte a quien jugó
 * poco, y de eso se encarga la vista.
 */
export function rankear(jugadores, metrica, modo = "total", limite = 0) {
    const valor = (j) => {
        const bruto = j[metrica] ?? 0;
        return modo === "prom" ? (j.pj ? bruto / j.pj : 0) : bruto;
    };

    const orden = [...jugadores]
        .filter((j) => j.pj > 0)
        .sort((a, b) => valor(b) - valor(a) || b.pj - a.pj || a.nombre.localeCompare(b.nombre));

    return limite > 0 ? orden.slice(0, limite) : orden;
}

/**
 * Partidos jugados por el equipo más activo. Sirve como referencia para marcar
 * a los jugadores con pocos partidos en los rankings por promedio.
 */
export function maxPartidos(jugadores) {
    return jugadores.reduce((max, j) => Math.max(max, j.pj), 0);
}
