import { TEAMS } from "../data/fixture.js";
import { calculateStandings, playedMatches, hasScores, TEAM_SANCTIONS } from "./standingsCalculator.js";

/**
 * Calculadora de clasificación: "¿qué necesita mi equipo?".
 *
 * Recorre todas las combinaciones de ganadores de los partidos que faltan
 * y, en cada una, arma la tabla final con la misma cadena de desempates que
 * `standingsCalculator`. De ahí sale, para cada equipo, la mejor y la peor
 * posición posibles, en total y según cuántos de sus partidos gane.
 *
 * Supuestos:
 *  - Los partidos que faltan no se pierden por default (el perdedor suma 1).
 *  - Los marcadores futuros son desconocidos: si un desempate llega a la
 *    diferencia de puntos y en ella interviene un partido sin jugar, se
 *    prueban todos los márgenes con que puede terminar ese partido. Si son
 *    dos o más los partidos sin jugar, o el desempate llega a los puntos a
 *    favor, los empatados pueden quedar en cualquier orden entre sí.
 *
 * Con N partidos pendientes son 2^N combinaciones, así que solo se calcula
 * cuando faltan pocos (las últimas fechas, que es cuando interesa).
 */

/** Hasta cuántos partidos pendientes se hace el cálculo (2^20 ≈ 1 millón). */
export const MAX_PENDING = 20;

/** Zona de Cuartos directo: del 1° al 4°. */
const DIRECT_SPOTS = 4;

/**
 * @returns {{ mode: "final" | "unavailable" | "exact", pending: number, teams?: Object }}
 *   teams: { [equipo]: { remaining, minPos, maxPos, status, byWins: [{ wins, minPos, maxPos }] } }
 *   status: "cuartos" (asegurado) | "playin" (asegurado) | "open" (en disputa)
 */
export function analyzeQualification(results = {}, fixture = [], sanctions = TEAM_SANCTIONS) {
    const pendingMatches = fixture.flatMap((r) => r.matches).filter((m) => !hasScores(results[m.id]));
    const standings = calculateStandings(results, fixture, sanctions);

    if (pendingMatches.length === 0) {
        const teams = {};
        standings.forEach((e) => {
            teams[e.team] = {
                remaining: 0,
                minPos: e.position,
                maxPos: e.position,
                status: statusOf(e.position, e.position),
                byWins: [],
            };
        });
        return { mode: "final", pending: 0, teams };
    }

    if (pendingMatches.length > MAX_PENDING) {
        return { mode: "unavailable", pending: pendingMatches.length };
    }

    return { mode: "exact", pending: pendingMatches.length, teams: enumerate(results, fixture, standings, pendingMatches) };
}

function statusOf(minPos, maxPos) {
    if (maxPos <= DIRECT_SPOTS) return "cuartos";
    if (minPos > DIRECT_SPOTS) return "playin";
    return "open";
}

function enumerate(results, fixture, standings, pendingMatches) {
    const N = TEAMS.length;
    const idx = Object.fromEntries(TEAMS.map((t, i) => [t, i]));

    // Puntos actuales (con sanciones y defaults ya aplicados).
    const base = new Int32Array(N);
    standings.forEach((e) => {
        base[idx[e.team]] = e.points;
    });

    // Enfrentamientos directos: puntos que sacó `a` contra `b` y, para los
    // partidos ya jugados, el marcador (para la diferencia de la reducida).
    const miniPts = new Int8Array(N * N);
    const real = new Uint8Array(N * N);
    const realFor = new Int32Array(N * N);
    playedMatches(results, fixture).forEach((m) => {
        const h = idx[m.home];
        const a = idx[m.away];
        if (h === undefined || a === undefined) return;
        const homeWon = m.homeScore > m.awayScore;
        const loserPts = m.walkover ? 0 : 1;
        miniPts[h * N + a] = homeWon ? 2 : loserPts;
        miniPts[a * N + h] = homeWon ? loserPts : 2;
        real[h * N + a] = real[a * N + h] = 1;
        realFor[h * N + a] = m.homeScore;
        realFor[a * N + h] = m.awayScore;
    });

    const P = pendingMatches.length;
    const ph = pendingMatches.map((m) => idx[m.home]);
    const pa = pendingMatches.map((m) => idx[m.away]);

    const remaining = new Int32Array(N);
    for (let i = 0; i < P; i++) {
        remaining[ph[i]]++;
        remaining[pa[i]]++;
    }

    /* ── Desempate con lo que se sabe en cada escenario ─────────────── */

    const sum = (group, t, arr) => {
        let s = 0;
        for (const o of group) if (o !== t) s += arr[t * N + o];
        return s;
    };
    /**
     * Diferencia de la reducida. `margin` es el margen supuesto del único
     * partido sin jugar dentro del grupo (null si no hay ninguno).
     */
    const miniDiff = (group, t, margin) => {
        let s = 0;
        for (const o of group) {
            if (o === t) continue;
            if (real[t * N + o]) s += realFor[t * N + o] - realFor[o * N + t];
            else s += miniPts[t * N + o] === 2 ? margin : -margin;
        }
        return s;
    };
    const overallDiff = (t) => realOverall[t].diff;
    const overallFor = (t) => realOverall[t].for;

    // Diferencia y puntos a favor generales: solo son definitivos para
    // equipos que ya jugaron todo.
    const realOverall = TEAMS.map((team) => {
        const e = standings.find((s) => s.team === team);
        return { diff: e.pointsDiff, for: e.pointsFor };
    });

    /** Separa el grupo por un valor; devuelve los subgrupos (mayor primero) o null si no separa. */
    const splitBy = (group, value) => {
        const vals = new Map(group.map((t) => [t, value(t)]));
        const sorted = [...group].sort((x, y) => vals.get(y) - vals.get(x));
        if (vals.get(sorted[0]) === vals.get(sorted[sorted.length - 1])) return null;
        const out = [];
        let run = [sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            if (vals.get(sorted[i]) === vals.get(run[0])) run.push(sorted[i]);
            else {
                out.push(run);
                run = [sorted[i]];
            }
        }
        out.push(run);
        return out;
    };

    const allReal = (group) => {
        for (const x of group) for (const y of group) if (x !== y && !real[x * N + y]) return false;
        return true;
    };

    /**
     * Espejo de `breakTie`: devuelve bloques en orden; dentro de cada bloque
     * el orden no se puede saber sin los marcadores que faltan.
     *
     * `margin`: margen supuesto del único partido sin jugar dentro del grupo
     * original (los subgrupos lo heredan). Con null, la diferencia de la
     * reducida solo se usa si todos los partidos del grupo ya se jugaron.
     */
    const resolve = (group, margin = null) => {
        if (group.length < 2) return [group];
        const played = allReal(group);

        // 1. Puntos de la reducida: dependen solo de quién gana, siempre se saben.
        let parts = splitBy(group, (t) => sum(group, t, miniPts));

        // 2. Diferencia de la reducida: con los partidos jugados o con el
        // margen supuesto del que falta.
        if (!parts && (played || margin !== null)) {
            parts = splitBy(group, (t) => miniDiff(group, t, margin));
        }
        // 3. Puntos a favor de la reducida: solo si esos partidos ya se jugaron.
        if (!parts && played) parts = splitBy(group, (t) => sum(group, t, realFor));

        if (parts) return parts.flatMap((g) => resolve(g, margin));
        if (!played) return [group];

        // 4. Criterios generales: definitivos solo si nadie del grupo tiene partidos pendientes.
        if (group.some((t) => remaining[t] > 0)) return [group];
        const byDiff = splitBy(group, overallDiff);
        if (!byDiff) return splitBy(group, overallFor) ?? [group];
        return byDiff.flatMap((g) => (g.length > 1 ? splitBy(g, overallFor) ?? [g] : [g]));
    };

    /* ── Recorrido de escenarios (código Gray: cambia un partido por paso) ── */

    const points = Int32Array.from(base);
    const pendWins = new Int32Array(N);
    const homeWins = new Uint8Array(P);

    for (let i = 0; i < P; i++) {
        // Escenario inicial: gana siempre el visitante.
        points[pa[i]] += 2;
        points[ph[i]] += 1;
        pendWins[pa[i]]++;
        miniPts[pa[i] * N + ph[i]] = 2;
        miniPts[ph[i] * N + pa[i]] = 1;
    }

    const minPos = new Int32Array(N).fill(N + 1);
    const maxPos = new Int32Array(N);
    const winsMin = TEAMS.map((_, t) => new Int32Array(remaining[t] + 1).fill(N + 1));
    const winsMax = TEAMS.map((_, t) => new Int32Array(remaining[t] + 1));

    /**
     * Posiciones posibles de cada equipo dentro del grupo empatado, como
     * [equipo, desde, hasta] contados desde 0.
     *
     * Si entre los empatados hay un solo partido sin jugar, se prueban todos
     * sus márgenes. Cada comparación de diferencias es `constante ± k·margen`,
     * con la constante acotada por el doble de la suma de los márgenes ya
     * jugados entre ellos: pasado ese valor el orden ya no cambia, así que
     * alcanza con probar hasta ahí.
     */
    const ranges = (group, inside) => {
        const fromBlocks = (blocks) => {
            const out = [];
            let pos = 0;
            for (const block of blocks) {
                for (const t of block) out.push([t, pos, pos + block.length - 1]);
                pos += block.length;
            }
            return out;
        };
        if (inside === 0 || inside & (inside - 1)) return fromBlocks(resolve(group));

        let played = 0;
        for (const x of group) {
            for (const y of group) {
                if (x < y && real[x * N + y]) played += Math.abs(realFor[x * N + y] - realFor[y * N + x]);
            }
        }
        const lo = new Map(group.map((t) => [t, Infinity]));
        const hi = new Map(group.map((t) => [t, -1]));
        for (let m = 1; m <= 2 * played + 1; m++) {
            for (const [t, a, b] of fromBlocks(resolve(group, m))) {
                if (a < lo.get(t)) lo.set(t, a);
                if (b > hi.get(t)) hi.set(t, b);
            }
        }
        return group.map((t) => [t, lo.get(t), hi.get(t)]);
    };

    // El desempate de un grupo solo depende de quiénes lo forman y de cómo
    // salieron los partidos pendientes entre ellos: se resuelve una vez y se
    // reutiliza en todos los escenarios que repiten ese grupo.
    const cache = new Map();
    let outcomes = 0; // bit i = ganó el local el partido pendiente i
    const resolveCached = (group) => {
        let g = 0;
        for (const t of group) g |= 1 << t;
        let inside = 0;
        for (let i = 0; i < P; i++) {
            if (g & (1 << ph[i]) && g & (1 << pa[i])) inside |= 1 << i;
        }
        const key = g + 2 ** N * ((outcomes & inside) >>> 0);
        let result = cache.get(key);
        if (!result) {
            result = ranges(group, inside);
            cache.set(key, result);
        }
        return result;
    };

    const order = Array.from({ length: N }, (_, i) => i);

    const evaluate = () => {
        // Orden por puntos (inserción: son 12 y casi siempre ya vienen ordenados).
        for (let i = 1; i < N; i++) {
            const t = order[i];
            let j = i - 1;
            while (j >= 0 && points[order[j]] < points[t]) {
                order[j + 1] = order[j];
                j--;
            }
            order[j + 1] = t;
        }
        let i = 0;
        while (i < N) {
            let j = i + 1;
            while (j < N && points[order[j]] === points[order[i]]) j++;
            const placed = j - i === 1 ? [[order[i], 0, 0]] : resolveCached(order.slice(i, j));
            for (const [t, a, b] of placed) {
                const lo = i + a + 1;
                const hi = i + b + 1;
                if (lo < minPos[t]) minPos[t] = lo;
                if (hi > maxPos[t]) maxPos[t] = hi;
                const w = pendWins[t];
                if (lo < winsMin[t][w]) winsMin[t][w] = lo;
                if (hi > winsMax[t][w]) winsMax[t][w] = hi;
            }
            i = j;
        }
    };

    evaluate();
    const total = 2 ** P;
    for (let k = 1; k < total; k++) {
        const b = 31 - Math.clz32(k & -k);
        const h = ph[b];
        const a = pa[b];
        homeWins[b] ^= 1;
        outcomes ^= 1 << b;
        const d = homeWins[b] ? 1 : -1;
        points[h] += d;
        points[a] -= d;
        pendWins[h] += d;
        pendWins[a] -= d;
        miniPts[h * N + a] = homeWins[b] ? 2 : 1;
        miniPts[a * N + h] = homeWins[b] ? 1 : 2;
        evaluate();
    }

    const teams = {};
    TEAMS.forEach((team, t) => {
        const byWins = [];
        for (let w = remaining[t]; w >= 0; w--) {
            byWins.push({ wins: w, minPos: winsMin[t][w], maxPos: winsMax[t][w] });
        }
        teams[team] = {
            remaining: remaining[t],
            minPos: minPos[t],
            maxPos: maxPos[t],
            status: statusOf(minPos[t], maxPos[t]),
            byWins,
        };
    });
    return teams;
}
