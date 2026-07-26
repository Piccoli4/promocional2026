import MatchCard from "./MatchCard";
import { SectionTitle, Chip } from "../ui/Primitives";
import { formatDateLong } from "../../data/fixture";

export default function NextRound({ round }) {
    if (!round) return null;

    return (
        <section className="flex flex-col gap-4">
            <SectionTitle
                eyebrow={formatDateLong(round.date)}
                title={round.label}
                right={<Chip tone="accent">Próxima fecha</Chip>}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {round.matches.map((match, i) => (
                    <MatchCard key={match.id} match={match} delay={i * 50} />
                ))}
            </div>
        </section>
    );
}
