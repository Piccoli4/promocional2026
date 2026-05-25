import { TEAMS } from "../data/fixture";

// Sanciones de puntos por equipo (se restan al total final)
const TEAM_SANCTIONS = {
    "CENTRAL RINCÓN": 2,
    "U. Y PROGRESO A": 1,
    "U. Y PROGRESO B": 1,
};

const createEmptyEntry = (team) => ({
    team,
    played: 0,
    won: 0,
    lost: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointsDiff: 0,
    points: 0,
});

export function calculateStandings(results = {}, fixture = []) {
    const table = {};
    TEAMS.forEach((team) => {
        table[team] = createEmptyEntry(team);
    });

    const headToHead = {};

    fixture.forEach((round) => {
        round.matches.forEach((match) => {
            const result = results[match.id];

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

            home.played += 1;
            away.played += 1;

            home.pointsFor += homeScore;
            home.pointsAgainst += awayScore;
            away.pointsFor += awayScore;
            away.pointsAgainst += homeScore;

            if (homeScore > awayScore) {
                home.won += 1;
                home.points += 2;
                away.lost += 1;
                away.points += 1;

                if (!headToHead[match.home]) headToHead[match.home] = {};
                headToHead[match.home][match.away] = true;
            } else {
                away.won += 1;
                away.points += 2;
                home.lost += 1;
                home.points += 1;

                if (!headToHead[match.away]) headToHead[match.away] = {};
                headToHead[match.away][match.home] = true;
            }
        });
    });

    const standings = Object.values(table).map((entry) => ({
        ...entry,
        pointsDiff: entry.pointsFor - entry.pointsAgainst,
        sanction: TEAM_SANCTIONS[entry.team] ?? 0,
    }));

    // Aplicamos sanciones
    standings.forEach((entry) => {
        if (entry.sanction > 0) {
            entry.points -= entry.sanction;
        }
    });

    // Sort: puntos → ganados → diferencia → puntos a favor
    standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.won !== a.won) return b.won - a.won;
        if (b.pointsDiff !== a.pointsDiff) return b.pointsDiff - a.pointsDiff;
        return b.pointsFor - a.pointsFor;
    });

    // Post-procesamiento: partido entre sí para grupos de exactamente 2 empatados
    const final = [];
    let i = 0;
    while (i < standings.length) {
        let j = i + 1;
        while (
            j < standings.length &&
            standings[j].points === standings[i].points &&
            standings[j].won === standings[i].won
        ) {
            j++;
        }

        const group = standings.slice(i, j);

        if (group.length === 2) {
            const [a, b] = group;
            if (headToHead[b.team]?.[a.team]) {
                final.push(b, a);
            } else {
                final.push(a, b);
            }
        } else {
            final.push(...group);
        }

        i = j;
    }

    return final;
}