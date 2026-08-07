/**
 * Placas compartibles: dibuja una imagen lista para WhatsApp o una story.
 *
 * El canvas no espera a las fuentes ni a las imágenes, así que todo se
 * precarga antes de dibujar: si no, la placa sale con la tipografía del
 * sistema y sin escudos, y no te enterás hasta que la mandaste.
 *
 * La estética es fija (azul del club + rojo) y no sigue el tema de la app:
 * lo que sale para afuera tiene que verse siempre igual, y una placa oscura
 * y saturada resalta mucho más en un feed que una clara.
 */

import logoClub from "../assets/UyP.png";
import { teamLogos, teamBadges, teamShortNames } from "../data/teamLogos";

export const FORMATOS = {
    cuadrada: { id: "cuadrada", label: "Cuadrada", hint: "WhatsApp y feed", w: 1080, h: 1080 },
    historia: { id: "historia", label: "Historia", hint: "Stories", w: 1080, h: 1920 },
};

const BEBAS = '"Bebas Neue", sans-serif';
const COND = '"Barlow Condensed", sans-serif';

const BLANCO = "#ffffff";
const TENUE = "rgba(255,255,255,0.58)";
const ROJO = "#e01414";

/* ── Precarga ──────────────────────────────────────────────────────── */

const FUENTES = [
    `400 100px ${BEBAS}`,
    `700 100px ${COND}`,
    `600 100px ${COND}`,
];

let fuentesListas = null;

function cargarFuentes() {
    if (!fuentesListas) {
        fuentesListas = Promise.all(FUENTES.map((f) => document.fonts.load(f)))
            .then(() => document.fonts.ready)
            .catch(() => { });
    }
    return fuentesListas;
}

const cacheImagenes = new Map();

/** Resuelve en `null` si la imagen falla: la placa se dibuja igual. */
function cargarImagen(src) {
    if (!src) return Promise.resolve(null);
    if (!cacheImagenes.has(src)) {
        cacheImagenes.set(
            src,
            new Promise((resolver) => {
                const img = new Image();
                img.onload = () => resolver(img);
                img.onerror = () => resolver(null);
                img.src = src;
            })
        );
    }
    return cacheImagenes.get(src);
}

/* ── Helpers de dibujo ─────────────────────────────────────────────── */

function texto(ctx, txt, x, y, opciones = {}) {
    const {
        font,
        color = BLANCO,
        align = "left",
        base = "middle",
        spacing = 0,
        alpha = 1,
    } = opciones;

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = base;
    ctx.globalAlpha = alpha;
    // Chrome 99+ / Safari 17.4+; donde no exista, el texto sale sin tracking.
    if (spacing) ctx.letterSpacing = `${spacing}px`;
    ctx.fillText(txt, x, y);
    ctx.restore();
}

function anchoTexto(ctx, txt, font) {
    ctx.save();
    ctx.font = font;
    const w = ctx.measureText(txt).width;
    ctx.restore();
    return w;
}

/** Achica la tipografía hasta que el texto entre en `maxW`. */
function fuenteQueEntra(ctx, txt, maxW, tam, familia, peso = 400) {
    let t = tam;
    while (t > 14 && anchoTexto(ctx, txt, `${peso} ${t}px ${familia}`) > maxW) t -= 2;
    return `${peso} ${t}px ${familia}`;
}

/** Dibuja la imagen contenida en la caja, sin deformarla. */
function imagenContenida(ctx, img, x, y, w, h) {
    if (!img) return;
    const escala = Math.min(w / img.width, h / img.height);
    const iw = img.width * escala;
    const ih = img.height * escala;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}

function rectRedondeado(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/* ── Piezas comunes ────────────────────────────────────────────────── */

function fondo(ctx, w, h) {
    const base = ctx.createLinearGradient(0, 0, w * 0.35, h);
    base.addColorStop(0, "#0b0b52");
    base.addColorStop(1, "#02021c");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    const halo = ctx.createRadialGradient(w * 0.85, h * 0.08, 0, w * 0.85, h * 0.08, w * 0.8);
    halo.addColorStop(0, "rgba(200,17,17,0.32)");
    halo.addColorStop(1, "rgba(200,17,17,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    // Guiño a las líneas de cancha del fondo de la app
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = w * 0.005;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.31, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.46, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

async function cabecera(ctx, w, k) {
    const y = 82 * k;
    const s = 76 * k;
    imagenContenida(ctx, await cargarImagen(logoClub), 70 * k, y - s / 2, s, s);
    texto(ctx, "TORNEO OFICIAL PROMOCIONAL 2026", 70 * k + s + 24 * k, y, {
        font: `700 ${29 * k}px ${COND}`,
        color: TENUE,
        spacing: 3.5 * k,
    });
}

async function pie(ctx, w, h, k) {
    const y = h - 82 * k;
    texto(ctx, "PROMOCIONAL.COM.AR", 70 * k, y, {
        font: `700 ${29 * k}px ${COND}`,
        color: TENUE,
        spacing: 3.5 * k,
    });
    const s = 84 * k;
    imagenContenida(ctx, await cargarImagen("/pelota.png"), w - 70 * k - s, y - s / 2, s, s);
}

/** Escudo con la insignia A/B de los clubes que presentan dos equipos. */
async function escudo(ctx, equipo, x, y, tam) {
    imagenContenida(ctx, await cargarImagen(teamLogos[equipo]), x, y, tam, tam);

    const insignia = teamBadges[equipo];
    if (!insignia) return;

    const r = tam * 0.17;
    const cx = x + tam - r * 0.9;
    const cy = y + tam - r * 0.9;
    ctx.save();
    ctx.fillStyle = ROJO;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    texto(ctx, insignia, cx, cy + r * 0.04, {
        font: `700 ${r * 1.25}px ${COND}`,
        align: "center",
    });
}

/* ── Placa de partido ──────────────────────────────────────────────── */

async function dibujarPartido(ctx, datos, w, h, k, g) {
    const { local, visitante, ptsLocal, ptsVisitante, etiqueta } = datos;

    const ganaLocal = ptsLocal > ptsVisitante;
    const ganaVisita = ptsVisitante > ptsLocal;

    const colL = w * 0.28;
    const colV = w * 0.72;
    const anchoCol = w * 0.4;

    const hEyebrow = 40 * k;
    const gap1 = 52 * k * g;
    const tamEscudo = 230 * k;
    const gap2 = 26 * k * g;
    const hNombre = 62 * k;
    const gap3 = 30 * k * g;
    const hMarcador = 185 * k;
    const hBarra = 12 * k;
    const gap4 = 36 * k * g;
    const hFinal = 38 * k;

    const alto =
        hEyebrow + gap1 + tamEscudo + gap2 + hNombre + gap3 + hMarcador + hBarra + gap4 + hFinal;

    const arriba = 172 * k;
    const abajo = h - 172 * k;
    let y = arriba + (abajo - arriba - alto) / 2;

    texto(ctx, etiqueta.toUpperCase(), w / 2, y + hEyebrow / 2, {
        font: `700 ${34 * k}px ${COND}`,
        color: ROJO,
        align: "center",
        spacing: 5 * k,
    });
    y += hEyebrow + gap1;

    await escudo(ctx, local, colL - tamEscudo / 2, y, tamEscudo);
    await escudo(ctx, visitante, colV - tamEscudo / 2, y, tamEscudo);
    y += tamEscudo + gap2;

    for (const [equipo, cx] of [[local, colL], [visitante, colV]]) {
        const nombre = (teamShortNames[equipo] ?? equipo).toUpperCase();
        texto(ctx, nombre, cx, y + hNombre / 2, {
            font: fuenteQueEntra(ctx, nombre, anchoCol, 58 * k, BEBAS),
            align: "center",
            spacing: 1.5 * k,
        });
    }
    y += hNombre + gap3;

    const yMarcador = y + hMarcador / 2;
    const fuenteMarcador = `400 ${172 * k}px ${BEBAS}`;

    texto(ctx, String(ptsLocal), colL, yMarcador, {
        font: fuenteMarcador,
        align: "center",
        alpha: ganaVisita ? 0.4 : 1,
    });
    texto(ctx, String(ptsVisitante), colV, yMarcador, {
        font: fuenteMarcador,
        align: "center",
        alpha: ganaLocal ? 0.4 : 1,
    });
    texto(ctx, "–", w / 2, yMarcador, {
        font: `400 ${96 * k}px ${BEBAS}`,
        color: TENUE,
        align: "center",
    });

    // Barra roja bajo el ganador (en empate no se dibuja ninguna)
    const yBarra = y + hMarcador + 4 * k;
    const anchoBarra = 118 * k;
    ctx.fillStyle = ROJO;
    if (ganaLocal) ctx.fillRect(colL - anchoBarra / 2, yBarra, anchoBarra, hBarra);
    if (ganaVisita) ctx.fillRect(colV - anchoBarra / 2, yBarra, anchoBarra, hBarra);

    y += hMarcador + hBarra + gap4;

    texto(ctx, "FINAL", w / 2, y + hFinal / 2, {
        font: `700 ${30 * k}px ${COND}`,
        color: TENUE,
        align: "center",
        spacing: 6 * k,
    });
}

/* ── Placa de jugador ──────────────────────────────────────────────── */

async function dibujarJugador(ctx, datos, w, h, k, g) {
    const { nombre, equipo, num, pj, prom, pctT2, pctT3, pctTL } = datos;

    const margen = 84 * k;
    const anchoCont = w - margen * 2;

    // Las cajas se derivan del ancho para que queden cuadradas en los dos
    // formatos: en la story sobra alto, no ancho.
    const gapCaja = 20 * k;
    const anchoCaja = (anchoCont - gapCaja * 3) / 4;

    const hClub = 108 * k;
    const gap1 = 34 * k * g;
    const hNombre = 112 * k;
    const gap2 = 48 * k * g;
    const hCajas = anchoCaja;
    const gap3 = 36 * k * g;
    const hChips = 58 * k;
    const gap4 = 28 * k * g;
    const hPj = 34 * k;

    const alto = hClub + gap1 + hNombre + gap2 + hCajas + gap3 + hChips + gap4 + hPj;

    const arriba = 172 * k;
    const abajo = h - 172 * k;
    let y = arriba + (abajo - arriba - alto) / 2;

    await escudo(ctx, equipo, margen, y, hClub);
    const etiquetaClub =
        (teamShortNames[equipo] ?? equipo).toUpperCase() + (num ? `  ·  #${num}` : "");
    texto(ctx, etiquetaClub, margen + hClub + 28 * k, y + hClub / 2, {
        font: `700 ${34 * k}px ${COND}`,
        color: TENUE,
        spacing: 4 * k,
    });
    y += hClub + gap1;

    texto(ctx, nombre.toUpperCase(), margen, y + hNombre / 2, {
        font: fuenteQueEntra(ctx, nombre.toUpperCase(), anchoCont, 104 * k, BEBAS),
        spacing: 1.5 * k,
    });
    y += hNombre + gap2;

    const cajas = [
        ["PTS", prom.pts.toFixed(1), ROJO],
        ["REB", prom.rt.toFixed(1), BLANCO],
        ["AST", prom.ast.toFixed(1), BLANCO],
        ["VAL", prom.val.toFixed(1), "#e8b53c"],
    ];

    cajas.forEach(([etiqueta, valor, color], i) => {
        const x = margen + i * (anchoCaja + gapCaja);
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 2 * k;
        rectRedondeado(ctx, x, y, anchoCaja, hCajas, 30 * k);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        texto(ctx, valor, x + anchoCaja / 2, y + hCajas * 0.42, {
            font: fuenteQueEntra(ctx, valor, anchoCaja - 24 * k, 92 * k, BEBAS),
            color,
            align: "center",
        });
        texto(ctx, etiqueta, x + anchoCaja / 2, y + hCajas * 0.76, {
            font: `700 ${27 * k}px ${COND}`,
            color: TENUE,
            align: "center",
            spacing: 3.5 * k,
        });
    });
    y += hCajas + gap3;

    // Porcentajes de tiro: los que no tienen intentos se omiten
    const chips = [
        ["2P", pctT2],
        ["3P", pctT3],
        ["TL", pctTL],
    ].filter(([, v]) => v !== null && v !== undefined);

    let x = margen;
    for (const [etiqueta, valor] of chips) {
        const txt = `${etiqueta} ${valor}%`;
        const font = `600 ${32 * k}px ${COND}`;
        const anchoChip = anchoTexto(ctx, txt, font) + 52 * k;
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        rectRedondeado(ctx, x, y, anchoChip, hChips, hChips / 2);
        ctx.fill();
        ctx.restore();
        texto(ctx, txt, x + anchoChip / 2, y + hChips / 2, { font, align: "center" });
        x += anchoChip + 16 * k;
    }
    y += hChips + gap4;

    texto(ctx, `${pj} ${pj === 1 ? "PARTIDO" : "PARTIDOS"} · PROMEDIOS DEL TORNEO`, margen, y + hPj / 2, {
        font: `700 ${28 * k}px ${COND}`,
        color: TENUE,
        spacing: 3.5 * k,
    });
}

/* ── API ───────────────────────────────────────────────────────────── */

/**
 * Dibuja la placa y devuelve un Blob PNG.
 *
 * Conviene llamarla *antes* de que el usuario toque "Compartir": iOS exige
 * que `navigator.share()` salga de un gesto y no perdona el await de por medio.
 */
export async function generarPlaca({ tipo, datos, formato = "cuadrada" }) {
    const fmt = FORMATOS[formato] ?? FORMATOS.cuadrada;
    const { w, h } = fmt;

    await cargarFuentes();

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";

    /* En la story sobra alto pero el ancho es el mismo, así que los elementos
       crecen apenas (van atados al ancho) y lo que se estira son los espacios.
       Escalarlo todo por igual dejaba el contenido flotando en el medio. */
    const historia = h > w;
    const k = historia ? 1.25 : 1;
    const g = historia ? 2.6 : 1;

    fondo(ctx, w, h);
    await cabecera(ctx, w, k);
    if (tipo === "jugador") await dibujarJugador(ctx, datos, w, h, k, g);
    else await dibujarPartido(ctx, datos, w, h, k, g);
    await pie(ctx, w, h, k);

    // JPEG y no PNG: la placa no tiene transparencia y en PNG pesaba más de
    // 1 MB, que es mucho para mandar por datos móviles.
    return new Promise((resolver) => canvas.toBlob(resolver, "image/jpeg", 0.92));
}

/** Nombre de archivo sin acentos ni espacios, que sobreviva a cualquier app. */
export function nombreArchivo(base) {
    const limpio = base
        .normalize("NFD")
        .split("")
        .filter((c) => /[a-zA-Z0-9 ]/.test(c))
        .join("")
        .trim()
        .replace(/ +/g, "-");
    return `Promocional2026-${limpio}.jpg`;
}
