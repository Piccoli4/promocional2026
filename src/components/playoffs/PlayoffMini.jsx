import { Link } from "react-router-dom";
import SeriesCard from "./SeriesCard";
import GameCard from "./GameCard";
import ChampionBanner from "./ChampionBanner";
import { SectionTitle, Chip } from "../ui/Primitives";
import { activeStage } from "../../utils/playoffCalculator";

const STAGE_TITLES = {
    playIn: { eyebrow: "Del 18 al 27 de octubre", title: "Play In" },
    quarters: { eyebrow: "Del 1 al 10 de noviembre", title: "Cuartos de Final" },
    semis: { eyebrow: "Del 15 al 24 de noviembre", title: "Semifinales" },
    final: { eyebrow: "Del 29/11 al 12/12", title: "Gran Final" },
};

export default function PlayoffMini({ bracket, loading }) {
    if (loading || !bracket) return null;

    const stage = activeStage(bracket);

    if (!stage) {
        return (
            <section className="flex flex-col gap-4">
                <SectionTitle eyebrow="Arranca el 18 de octubre" title="Fase Final" />
                <div className="nm nm-edge a-rise flex flex-col gap-3 p-5">
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>
                        Los 4 primeros van directo a Cuartos. Del 5° al 12° juegan
                        el <strong style={{ color: "var(--red)" }}>Play In</strong> al mejor de tres.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Chip>5° vs 12°</Chip>
                        <Chip>6° vs 11°</Chip>
                        <Chip>7° vs 10°</Chip>
                        <Chip>8° vs 9°</Chip>
                    </div>
                    <Link to="/playoffs" className="nm-btn mt-1 w-fit px-5 py-2.5 text-xs">
                        Ver el cuadro completo
                    </Link>
                </div>
            </section>
        );
    }

    const meta = STAGE_TITLES[stage];
    const cards =
        stage === "final"
            ? [bracket.final]
            : stage === "semis"
                ? bracket.semiFinals
                : stage === "quarters"
                    ? bracket.quarterFinals
                    : bracket.playIn;

    return (
        <section className="flex flex-col gap-4">
            <SectionTitle
                eyebrow={meta.eyebrow}
                title={meta.title}
                right={
                    <Link to="/playoffs" className="nm-btn px-4 py-2 text-xs">
                        Ver cuadro
                    </Link>
                }
            />

            {bracket.champion && <ChampionBanner team={bracket.champion} />}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cards.map((s, i) => (
                    <SeriesCard key={s.id} series={s} delay={i * 60} compact />
                ))}
                {stage === "final" && bracket.p34.ready && (
                    <GameCard game={bracket.p34} delay={120} />
                )}
            </div>
        </section>
    );
}
