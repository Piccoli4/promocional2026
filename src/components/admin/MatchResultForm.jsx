import ScoreEditor from "./ScoreEditor";
import { saveResult, deleteResult } from "../../services/resultsService";
import { teamTinyNames } from "../../data/teamLogos";
import { formatDateLong } from "../../data/fixture";

/** Avisa a los suscriptos. Un fallo acá no debe tumbar el guardado. */
async function notify(title, body) {
    try {
        await fetch("/api/send-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-internal-key": import.meta.env.VITE_INTERNAL_FUNCTION_KEY,
            },
            body: JSON.stringify({ title, body }),
        });
    } catch (err) {
        console.error("No se pudo enviar la notificación:", err);
    }
}

export default function MatchResultForm({ match, date, delay = 0 }) {
    const short = (t) => teamTinyNames[t] ?? t;

    const handleSave = async (homeScore, awayScore, walkover) => {
        await saveResult(match.id, homeScore, awayScore, walkover);
        await notify(
            "🏀 Resultado cargado",
            `${short(match.home)} ${homeScore} - ${awayScore} ${short(match.away)}`
        );
    };

    return (
        <ScoreEditor
            home={match.home}
            away={match.away}
            title={`${short(match.home)} vs ${short(match.away)}`}
            subtitle={date ? formatDateLong(date) : undefined}
            result={match.result}
            onSave={handleSave}
            onDelete={() => deleteResult(match.id)}
            delay={delay}
        />
    );
}
