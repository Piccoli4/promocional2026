import ScoreEditor from "./ScoreEditor";
import DateEditor from "./DateEditor";
import { saveResult, deleteResult } from "../../services/resultsService";
import { saveMatchDate, deleteMatchDate } from "../../services/roundDatesService";
import { teamTinyNames } from "../../data/teamLogos";
import { formatDateLong } from "../../data/fixture";
import { auth } from "../../services/firebase";

/**
 * Avisa a los suscriptos. Un fallo acá no debe tumbar el guardado.
 * La función valida el token de sesión del admin, así que no hace falta
 * ninguna clave secreta en el cliente.
 */
async function notify(title, body) {
    try {
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) return;
        await fetch("/api/send-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ title, body }),
        });
    } catch (err) {
        console.error("No se pudo enviar la notificación:", err);
    }
}

export default function MatchResultForm({ match, roundDate, delay = 0 }) {
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
            subtitle={match.date ? formatDateLong(match.date) : undefined}
            result={match.result}
            onSave={handleSave}
            onDelete={() => deleteResult(match.id)}
            delay={delay}
            footer={
                <DateEditor
                    compact
                    label="Día del partido"
                    date={match.date}
                    defaultDate={roundDate}
                    // Guardar el día de la fecha equivale a quitar la reprogramación
                    onSave={(iso) => (iso === roundDate ? deleteMatchDate(match.id) : saveMatchDate(match.id, iso))}
                    onReset={() => deleteMatchDate(match.id)}
                />
            }
        />
    );
}
