import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://promocional.com.ar";

// Los valores de index.html son los de la Home y el respaldo de cualquier
// página que no defina los suyos: así hay una sola fuente de verdad.
const DEFAULT_TITLE = document.title;
const DEFAULT_DESCRIPTION = document.querySelector('meta[name="description"]')?.content ?? "";

/**
 * Título, descripción y URL canónica de cada página. Google ejecuta el JS, así
 * que cada sección se indexa con lo suyo y no como una copia de la Home (el
 * canonical fijo de index.html le decía justamente eso).
 */
export function usePageMeta({ title, description } = {}) {
    const { pathname } = useLocation();

    useEffect(() => {
        document.title = title ? `${title} | Torneo Promocional 2026` : DEFAULT_TITLE;
        document.querySelector('meta[name="description"]')?.setAttribute("content", description ?? DEFAULT_DESCRIPTION);
        document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${SITE}${pathname}`);
    }, [title, description, pathname]);
}
