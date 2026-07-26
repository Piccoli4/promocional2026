/**
 * Fondo fijo de la app: halos animados (CSS) + líneas de cancha en SVG.
 * Puramente decorativo, no intercepta eventos.
 */
export default function CourtBackdrop() {
    return (
        <div className="court-bg" aria-hidden="true">
            <svg
                className="court-lines"
                viewBox="0 0 1000 620"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
            >
                {/* Perímetro */}
                <rect x="40" y="40" width="920" height="540" rx="6" />

                {/* Mitad de cancha */}
                <line x1="500" y1="40" x2="500" y2="580" />
                <circle cx="500" cy="310" r="72" />
                <circle cx="500" cy="310" r="6" fill="currentColor" stroke="none" />

                {/* Zona pintada + tiro libre — izquierda */}
                <rect x="40" y="222" width="176" height="176" />
                <circle cx="216" cy="310" r="60" />
                <path d="M40 96 A 232 232 0 0 1 40 524" />
                <line x1="40" y1="290" x2="70" y2="290" />
                <line x1="40" y1="330" x2="70" y2="330" />

                {/* Zona pintada + tiro libre — derecha */}
                <rect x="784" y="222" width="176" height="176" />
                <circle cx="784" cy="310" r="60" />
                <path d="M960 96 A 232 232 0 0 0 960 524" />
                <line x1="930" y1="290" x2="960" y2="290" />
                <line x1="930" y1="330" x2="960" y2="330" />
            </svg>
        </div>
    );
}
