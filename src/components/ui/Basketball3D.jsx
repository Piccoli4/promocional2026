/**
 * Pelota de básquet en 3D real (CSS transforms, sin librerías).
 * Una esfera sombreada + meridianos rotados en el eje Y dentro de un
 * contenedor con `preserve-3d`, girando de forma continua.
 */

const MERIDIANS = 10;

export default function Basketball3D({ size = 168, className = "" }) {
    return (
        <div
            className={`scene shrink-0 ${className}`}
            style={{ width: size, height: size }}
            aria-hidden="true"
        >
            <div className="ball a-float" style={{ width: size, height: size }}>
                <div className="ball-core" />

                {/* Meridianos: cada uno es un círculo girado sobre el eje Y */}
                {Array.from({ length: MERIDIANS }, (_, i) => (
                    <div
                        key={i}
                        className="ball-meridian"
                        style={{ transform: `rotateY(${(180 / MERIDIANS) * i}deg)` }}
                    />
                ))}

                {/* Costuras horizontales características */}
                <div className="ball-parallel" />
                <div
                    className="ball-parallel"
                    style={{ transform: "rotateZ(90deg) scale(0.98)" }}
                />

                <div className="ball-shine" />
            </div>
        </div>
    );
}
