import { TEAMS } from "../data/fixture";

/**
 * Genera una entrada vacía para un equipo en la tabla
 */
const createEmptyEntry = (team) => ({
    team,
    played: 0,
    won: 0,
    lost: 0,
    pointsFor: 0,  // Puntos a favor
    pointsAgainst: 0, // Puntos en contra
    pointsDiff: 0,  // Diferencia de puntos
    points: 0,  // Puntos en la tabla (2 por victoria, 1 por derrota)
});

/**
 * Calcula la tabla de posiciones a partir de los resultados cargados.
 * @param {Object} results - Objeto con los resultados de Firebase.
 *                           Formato: { "1-1": { homeScore: 80, awayScore: 70 }, ... }
 * @param {Array}  fixture - El fixture completo con todos los partidos.
 * @returns {Array} - Tabla de posiciones ordenada.
 */
export function calculateStandings(results = {}, fixture = []) {
    // Inicializamos la tabla con todos los equipos en cero
    const table = {};
    TEAMS.forEach((team) => {
        table[team] = createEmptyEntry(team);
    });

    // Recorremos todas las fechas y partidos
    fixture.forEach((round) => {
        round.matches.forEach((match) => {
            const result = results[match.id];

            // Si el partido no tiene resultado cargado, lo saltamos
            if (
                !result ||
                result.homeScore === null ||
                result.homeScore === undefined ||
                result.awayScore === null ||
                result.awayScore === undefined
            ) {
                return;
            }

            const homeScore = Number(result.homeScore);
            const awayScore = Number(result.awayScore);
            const home = table[match.home];
            const away = table[match.away];

            // Actualizamos partidos jugados
            home.played += 1;
            away.played += 1;

            // Actualizamos puntos a favor y en contra
            home.pointsFor += homeScore;
            home.pointsAgainst += awayScore;
            away.pointsFor += awayScore;
            away.pointsAgainst += homeScore;

            // En básquet no hay empates
            if (homeScore > awayScore) {
                // Ganó el local
                home.won += 1;
                home.points += 2;
                away.lost += 1;
                away.points += 1;
            } else {
                // Ganó el visitante
                away.won += 1;
                away.points += 2;
                home.lost += 1;
                home.points += 1;
            }
        });
    });

    // Convertimos el objeto en array y calculamos la diferencia
    const standings = Object.values(table).map((entry) => ({
        ...entry,
        pointsDiff: entry.pointsFor - entry.pointsAgainst,
    }));

    // Ordenamos la tabla
    standings.sort((a, b) => {
        // 1° criterio: puntos en la tabla
        if (b.points !== a.points) return b.points - a.points;

        // 2° criterio: partidos ganados
        if (b.won !== a.won) return b.won - a.won;

        // 3° criterio: diferencia de puntos
        if (b.pointsDiff !== a.pointsDiff) return b.pointsDiff - a.pointsDiff;

        // 4° criterio: puntos a favor
        return b.pointsFor - a.pointsFor;
    });

    return standings;
}