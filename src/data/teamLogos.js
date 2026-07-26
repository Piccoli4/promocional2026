import alianza from "../assets/Alianza.png";
import alumni from "../assets/Alumni.png";
import atleticoFranck from "../assets/AtleticoFranck.png";
import colonSF from "../assets/ColonSF.png";
import colonSJ from "../assets/ColonSJ.png";
import kimberley from "../assets/Kimberley.png";
import regatas from "../assets/RegatasSF.png";
import rincon from "../assets/Rincon.png";
import santaRosa from "../assets/SantaRosa.png";
import uypa from "../assets/UyPA.png";
import uypb from "../assets/UyPB.png";

export const teamLogos = {
    "COLÓN SF": colonSF,
    "COLÓN SJ": colonSJ,
    "REGATAS SF": regatas,
    "ALUMNI": alumni,
    "U. Y PROGRESO A": uypa,
    "U. Y PROGRESO B": uypb,
    "ATL. FRANCK A": atleticoFranck,
    "ATL. FRANCK B": atleticoFranck,
    "ALIANZA": alianza,
    "KIMBERLEY": kimberley,
    "SANTA ROSA": santaRosa,
    "CENTRAL RINCÓN": rincon,
};

/**
 * Clubes que presentan más de un equipo y comparten escudo.
 * La insignia se dibuja sobre el logo para distinguirlos.
 */
export const teamBadges = {
    "ATL. FRANCK A": "A",
    "ATL. FRANCK B": "B",
};

export const teamShortNames = {
    "COLÓN SF": "COLÓN SF",
    "COLÓN SJ": "COLÓN SJ",
    "REGATAS SF": "REGATAS",
    "ALUMNI": "ALUMNI",
    "U. Y PROGRESO A": "UyP A",
    "U. Y PROGRESO B": "UyP B",
    "ATL. FRANCK A": "FRANCK A",
    "ATL. FRANCK B": "FRANCK B",
    "ALIANZA": "ALIANZA",
    "KIMBERLEY": "KIMBER.",
    "SANTA ROSA": "STA ROSA",
    "CENTRAL RINCÓN": "CENTRAL",
};

/** Nombre ultra corto para el bracket y espacios apretados. */
export const teamTinyNames = {
    "COLÓN SF": "C. SF",
    "COLÓN SJ": "C. SJ",
    "REGATAS SF": "REGATAS",
    "ALUMNI": "ALUMNI",
    "U. Y PROGRESO A": "UyP A",
    "U. Y PROGRESO B": "UyP B",
    "ATL. FRANCK A": "FRANCK A",
    "ATL. FRANCK B": "FRANCK B",
    "ALIANZA": "ALIANZA",
    "KIMBERLEY": "KIMBER.",
    "SANTA ROSA": "STA ROSA",
    "CENTRAL RINCÓN": "RINCÓN",
};
