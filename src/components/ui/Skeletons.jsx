import { useLocation } from "react-router-dom";

/**
 * Esqueletos de carga: la silueta de cada pantalla con un brillo que la
 * recorre, en lugar de un spinner sobre una página vacía. Copian las medidas
 * del contenido real para que, cuando llegan los datos, nada salte de lugar.
 */

/** Pieza básica: un bloque con el brillo de `.skeleton`. */
export function Bone({ className = "", style }) {
    return <span aria-hidden="true" className={`skeleton block shrink-0 ${className}`} style={style} />;
}

/** Envoltorio accesible: anuncia "Cargando" una sola vez y oculta los huesos. */
function Cargando({ children, className = "flex flex-col gap-6" }) {
    return (
        <div role="status" aria-busy="true" className={className}>
            <span className="sr-only">Cargando…</span>
            {children}
        </div>
    );
}

const repetir = (n) => Array.from({ length: n }, (_, i) => i);

/* ── Piezas ───────────────────────────────────────────────────────── */

function TitleBones({ eyebrow = "w-40", title = "w-48" }) {
    return (
        <div className="flex flex-col gap-2">
            <Bone className={`h-3 rounded-md ${eyebrow}`} />
            <Bone className={`h-8 rounded-lg ${title}`} />
        </div>
    );
}

/** Fila de StatTile. `grid` trae las columnas (clases estáticas para Tailwind). */
function TileBones({ count, grid }) {
    return (
        <div className={`grid gap-3 ${grid}`}>
            {repetir(count).map((i) => (
                <div key={i} className="nm nm-edge flex flex-col items-center justify-center gap-2 px-2 py-4">
                    <Bone className="h-8 w-12 rounded-lg" />
                    <Bone className="h-2.5 w-16 rounded" />
                </div>
            ))}
        </div>
    );
}

function TabBones({ count, flex = false }) {
    return (
        <div className="flex gap-2 overflow-hidden">
            {repetir(count).map((i) => (
                <Bone key={i} className={`h-10 rounded-2xl ${flex ? "flex-1" : "w-24"}`} />
            ))}
        </div>
    );
}

function TeamRowBones() {
    return (
        <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Bone className="h-[34px] w-[34px] rounded-full" />
            <span className="flex flex-1 flex-col gap-1.5">
                <Bone className="h-3.5 w-24 rounded" />
                <Bone className="h-2 w-12 rounded" />
            </span>
            <Bone className="h-11 w-14 rounded-xl" />
        </div>
    );
}

/** Silueta de MatchCard. */
export function MatchCardSkeleton() {
    return (
        <div className="nm nm-edge flex flex-col gap-2 p-3">
            <TeamRowBones />
            <Bone className="mx-2 h-px" />
            <TeamRowBones />
        </div>
    );
}

/** Filas de una tabla de posiciones (sin el contenedor). */
export function StandingRowsSkeleton({ rows = 12 }) {
    return (
        <div aria-hidden="true" className="flex flex-col gap-0.5">
            {repetir(rows).map((i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-2">
                    <Bone className="h-6 w-1 rounded-full" />
                    <Bone className="h-3.5 w-4 rounded" />
                    <Bone className="ml-1 h-6 w-6 rounded-full" />
                    <Bone className="h-3.5 rounded" style={{ width: `${38 + ((i * 17) % 30)}%` }} />
                    <span className="flex-1" />
                    <Bone className="h-3.5 w-5 rounded" />
                    <Bone className="h-4 w-7 rounded" />
                </div>
            ))}
        </div>
    );
}

/** Tabla de posiciones completa, con su tarjeta. */
export function StandingsTableSkeleton() {
    return (
        <Cargando className="nm nm-edge flex flex-col gap-2 p-2 sm:p-3">
            <div className="flex gap-3 px-2 pt-1">
                <Bone className="h-2.5 w-4 rounded" />
                <Bone className="h-2.5 w-14 rounded" />
            </div>
            <StandingRowsSkeleton />
        </Cargando>
    );
}

/** Para un bloque dentro de una tarjeta que ya existe (mini tabla, calculadora). */
export function InlineRowsSkeleton({ rows = 6 }) {
    return (
        <Cargando className="block">
            <StandingRowsSkeleton rows={rows} />
        </Cargando>
    );
}

function RoundBones({ count }) {
    return (
        <div className="flex flex-col gap-3">
            {repetir(count).map((i) => (
                <div key={i} className="nm nm-edge flex items-center gap-3 rounded-3xl px-4 py-4 sm:px-5">
                    <Bone className="h-11 w-11 rounded-2xl" />
                    <span className="flex flex-1 flex-col gap-1.5">
                        <Bone className="h-4 w-24 rounded" />
                        <Bone className="h-2.5 w-20 rounded" />
                    </span>
                    <Bone className="h-2.5 w-2.5 rounded-full" />
                    <Bone className="h-3.5 w-8 rounded" />
                </div>
            ))}
        </div>
    );
}

function TableBones({ rows }) {
    return (
        <div className="nm nm-edge flex flex-col overflow-hidden">
            {repetir(rows + 1).map((i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5"
                    style={{ borderBottom: "1px solid var(--line)" }}
                >
                    <Bone className="h-3 w-5 rounded" />
                    <Bone className="h-3.5 w-28 rounded" />
                    <span className="flex-1" />
                    {repetir(4).map((j) => (
                        <Bone key={j} className="h-3 w-6 rounded" />
                    ))}
                </div>
            ))}
        </div>
    );
}

/* ── Páginas ──────────────────────────────────────────────────────── */

export function FixtureSkeleton() {
    return (
        <Cargando>
            <TitleBones eyebrow="w-52" title="w-32" />
            <TileBones count={3} grid="grid-cols-3" />
            <TabBones count={5} />
            <RoundBones count={11} />
        </Cargando>
    );
}

export function StandingsSkeleton() {
    return (
        <Cargando>
            <TitleBones title="w-64" />
            <TileBones count={4} grid="grid-cols-2 sm:grid-cols-4" />
            <StandingsTableSkeleton />
        </Cargando>
    );
}

export function BoxScoreSkeleton() {
    const equipo = (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <Bone className="h-9 w-9 rounded-full" />
                <Bone className="h-6 w-28 rounded-lg" />
                <span className="flex-1" />
                <Bone className="h-8 w-12 rounded-lg" />
            </div>
            <div className="flex flex-wrap gap-2">
                {repetir(5).map((i) => (
                    <Bone key={i} className="h-6 w-16 rounded-full" />
                ))}
            </div>
            <TableBones rows={8} />
        </div>
    );

    return (
        <Cargando className="flex flex-col gap-7">
            <div className="nm nm-edge flex items-center justify-between gap-3 p-5">
                {repetir(3).map((i) =>
                    i === 1 ? (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <Bone className="h-10 w-28 rounded-lg" />
                            <Bone className="h-2.5 w-16 rounded" />
                        </div>
                    ) : (
                        <div key={i} className="flex flex-1 flex-col items-center gap-2">
                            <Bone className="h-12 w-12 rounded-full" />
                            <Bone className="h-3.5 w-16 rounded" />
                        </div>
                    )
                )}
            </div>
            <Bone className="h-9 w-44 rounded-2xl" />
            {equipo}
            {equipo}
        </Cargando>
    );
}

export function StatsSkeleton() {
    return (
        <Cargando>
            <TitleBones eyebrow="w-52" title="w-44" />
            <TabBones count={3} flex />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {repetir(3).map((i) => (
                    <div key={i} className="nm nm-edge flex flex-col gap-3 p-4">
                        <Bone className="h-3 w-24 rounded" />
                        {repetir(5).map((j) => (
                            <div key={j} className="flex items-center gap-2.5">
                                <Bone className="h-3 w-4 rounded" />
                                <Bone className="h-7 w-7 rounded-full" />
                                <Bone className="h-3.5 flex-1 rounded" />
                                <Bone className="h-4 w-8 rounded" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Cargando>
    );
}

export function PlayerSkeleton() {
    return (
        <Cargando>
            <div className="flex items-center gap-4">
                <Bone className="h-14 w-14 rounded-full" />
                <div className="flex-1">
                    <TitleBones eyebrow="w-28" title="w-56" />
                </div>
            </div>
            <TileBones count={4} grid="grid-cols-2 sm:grid-cols-4" />
            <div className="flex gap-2">
                {repetir(3).map((i) => (
                    <Bone key={i} className="h-6 w-24 rounded-full" />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
                {repetir(3).map((i) => (
                    <Bone key={i} className="h-24 rounded-2xl" />
                ))}
            </div>
            <TableBones rows={5} />
        </Cargando>
    );
}

export function PlayoffsSkeleton() {
    return (
        <Cargando>
            <TitleBones eyebrow="w-56" title="w-40" />
            <TabBones count={5} />
            <Bone className="h-3 w-64 rounded" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {repetir(4).map((i) => (
                    <div key={i} className="nm nm-edge flex flex-col gap-3 p-3.5">
                        <Bone className="h-3 w-28 rounded" />
                        {repetir(2).map((j) => (
                            <div key={j} className="flex items-center gap-2">
                                <Bone className="h-[30px] w-[30px] rounded-full" />
                                <Bone className="h-3.5 flex-1 rounded" />
                                <Bone className="h-5 w-6 rounded" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </Cargando>
    );
}

/** Lo que va debajo del hero de la portada mientras llegan los resultados. */
export function HomeSkeleton() {
    return (
        <Cargando className="grid grid-cols-1 gap-9 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
                <TitleBones eyebrow="w-32" title="w-36" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {repetir(4).map((i) => (
                        <MatchCardSkeleton key={i} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <TitleBones eyebrow="w-24" title="w-40" />
                <div className="nm nm-edge p-2 sm:p-3">
                    <StandingRowsSkeleton />
                </div>
            </div>
        </Cargando>
    );
}

function GenericSkeleton() {
    return (
        <Cargando>
            <TitleBones />
            <TileBones count={3} grid="grid-cols-3" />
            {repetir(4).map((i) => (
                <Bone key={i} className="h-20 rounded-3xl" />
            ))}
        </Cargando>
    );
}

/**
 * Esqueleto de la página a la que se está entrando. Lo usa el Suspense
 * mientras baja el código de la página: así se ve la misma silueta que la
 * página muestra después mientras llegan sus datos, sin un salto en el medio.
 */
export function RouteSkeleton() {
    const { pathname } = useLocation();
    if (pathname.startsWith("/fixture")) return <FixtureSkeleton />;
    if (pathname.startsWith("/tabla")) return <StandingsSkeleton />;
    if (pathname.startsWith("/partido/")) return <BoxScoreSkeleton />;
    if (pathname.startsWith("/jugador/")) return <PlayerSkeleton />;
    if (pathname.startsWith("/estadisticas")) return <StatsSkeleton />;
    if (pathname.startsWith("/playoffs")) return <PlayoffsSkeleton />;
    return <GenericSkeleton />;
}
