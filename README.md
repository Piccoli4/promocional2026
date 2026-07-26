# 🏀 Torneo Oficial Promocional 2026

Aplicación web del Torneo Oficial Promocional 2026 de básquet masculino, organizado por la Asociación Santafesina de Básquetbol. Desarrollada para el Club Unión y Progreso de Santa Fe.

---

## 📋 Descripción

Sistema web para seguir el torneo en tiempo real: fixture, tabla de posiciones y fase final completa, con un panel protegido para que los organizadores carguen resultados.

**Formato del torneo (reglamento ASB):**

| Etapa | Formato | Fechas |
|---|---|---|
| Fase Regular | Zona única, 12 equipos, todos contra todos ida, 11 fechas | 02/08 al 11/10 |
| Play In | 5°v12° · 6°v11° · 7°v10° · 8°v9° — al mejor de 3 (1-1-1) | 18/10 · 25/10 · 27/10 |
| Cuartos de Final | 1°v8° · 2°v7° · 3°v6° · 4°v5° — al mejor de 3 | 01/11 · 08/11 · 10/11 |
| Semifinales | Reordenamiento: 1°v4° · 2°v3° — al mejor de 3 | 15/11 · 22/11 · 24/11 |
| Final | 1°v2° — al mejor de 3 · tercer puesto a un juego | 29/11 · 05/12 · 12/12 |
| Puestos 5° a 8° | Perdedores de cuartos, todos a un juego | 15/11 · 22/11 |
| Reposicionamiento 9° a 12° | Perdedores del Play In, round robin de 3 jornadas | 01/11 · 08/11 · 15/11 |

Los 4 primeros de la fase regular clasifican directo a Cuartos; del 5° al 12° pasan por el Play In.

**Puntaje y desempates:** partido ganado 2 puntos, perdido 1 punto, perdido por default 0 puntos (con 20-0 en contra). Los empates se resuelven por enfrentamientos directos (tabla reducida), luego diferencia de puntos y finalmente puntos a favor.

---

## ⛹ Equipos participantes

- COLÓN SF
- COLÓN SJ
- REGATAS SF
- ALUMNI
- U. Y PROGRESO "A"
- U. Y PROGRESO "B"
- ATL. FRANCK "A"
- ATL. FRANCK "B"
- ALIANZA
- KIMBERLEY
- SANTA ROSA
- CENTRAL RINCÓN

---

## ✨ Funcionalidades

- 📅 **Fixture completo** — Las 11 fechas de la fase regular con filtro por equipo
- 🏆 **Tabla de posiciones** — Calculada en vivo, con los desempates FIBA en cadena
- 🥇 **Fase final** — Play In, Cuartos, Semis, Final, puestos 5°-8° y reposicionamiento 9°-12°
- ✏️ **Panel de administración** — Carga de resultados de la fase regular y de la fase final, con soporte de partidos perdidos por default
- 🔄 **Tiempo real** — Los cambios se reflejan al instante vía Firestore
- 🔔 **Notificaciones push** — Aviso a los suscriptos cuando se carga un resultado
- 🌓 **Tema claro y oscuro** — Interfaz neumórfica con los colores de Unión y Progreso
- 📱 **PWA instalable** — Funciona offline, con navegación inferior en móvil

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework de UI |
| Vite | 7 | Bundler y servidor de desarrollo |
| Tailwind CSS | 4 | Utilidades de estilo |
| React Router DOM | 7 | Navegación entre páginas |
| Firebase Firestore | 12 | Base de datos en tiempo real |
| Firebase Authentication | 12 | Autenticación del administrador |
| Firebase Cloud Messaging | 12 | Notificaciones push |
| vite-plugin-pwa | 1 | Service worker y manifiesto |
| Fontsource | — | Bebas Neue y Barlow auto-alojadas |

### Sistema de diseño

La interfaz usa **neumorfismo** sobre los colores del club (azul `#000055`, rojo `#A90000`). Todos los tokens viven como variables CSS en `src/index.css`, bajo `:root` y `[data-theme="dark"]`; el `ThemeContext` solo cambia el atributo `data-theme` del `<html>`. Las animaciones son CSS puro —incluida la pelota 3D de meridianos— y respetan `prefers-reduced-motion`.

Tipografías: **Bebas Neue** para títulos y **Barlow / Barlow Condensed** para texto y marcadores.

---

## 📁 Estructura del proyecto

```
promocional-app/
├── public/
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── context/           # Context API (auth, etc.)
│   ├── data/              # Fixture y datos estáticos
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Páginas de la app
│   ├── services/          # Servicios de Firebase
│   ├── utils/             # Tabla de posiciones y cálculo del bracket
│   ├── App.jsx
│   └── main.jsx
├── scripts/dev/           # Verificaciones del fixture y de la fase final
├── .env                   # Variables de entorno (no incluido en el repo)
├── .env.example           # Ejemplo de variables de entorno
├── netlify.toml           # Configuración de deploy en Netlify
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 Instalación y uso local

### Prerrequisitos

- Node.js 18 o superior
- npm 9 o superior
- Una cuenta en [Firebase](https://firebase.google.com)

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/promocional-app.git
cd promocional-app
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Copiá el archivo de ejemplo y completá con tus credenciales de Firebase:

```bash
cp .env.example .env
```

Editá `.env` con los valores de tu proyecto en Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

4. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

La app va a estar disponible en `http://localhost:5173`

### Verificaciones

```bash
npm run check
```

Valida el fixture (11 fechas, 66 cruces únicos, todas en domingo), la tabla de posiciones con sus desempates y una simulación completa de la fase final.

```bash
npm run lint
```

---

## 📦 Build y deploy

### Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` con los archivos optimizados.

### Deploy en Netlify

El proyecto está configurado para deploy automático en Netlify. Cada `push` a la rama `main` dispara un nuevo deploy.

La configuración de build está en `netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔐 Acceso al panel de administración

El panel de administración está protegido por autenticación de Firebase. Solo los usuarios autorizados pueden cargar y modificar resultados. Las credenciales se configuran directamente desde la consola de Firebase Authentication.

---

## 📄 Licencia

Proyecto de uso privado para la Unión y Progreso de Santa Fe. Todos los derechos reservados.

---

## 👤 Autor

Desarrollado por **Piccoli** — Temporada 2026