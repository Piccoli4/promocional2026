# 🏀 Promocional 2026 - Torneo de Básquet

Aplicación web para la gestión de resultados y tabla de posiciones del Torneo Promocional 2026 de básquet, organizado por la Unión y Progreso de Santa Fe.

---

## 📋 Descripción

Sistema web que permite visualizar el fixture completo, cargar resultados de partidos y consultar la tabla de posiciones actualizada en tiempo real. El torneo cuenta con 12 equipos disputando una fase clasificatoria de 11 fechas en formato todos contra todos (round-robin).

---

## ⚽ Equipos participantes

- COLÓN SJ
- COLÓN SF
- ALUMNI
- REGATAS SF
- U. Y PROGRESO "A"
- U. Y PROGRESO "B"
- KIMBERLEY
- ARROYO LEYES
- ATL. FRANCK
- ALIANZA
- SANTA ROSA
- CENTRAL RINCÓN

---

## ✨ Funcionalidades

- 📅 **Fixture completo** — Visualización de los partidos de las 11 fechas de la fase clasificatoria
- 🏆 **Tabla de posiciones** — Calculada automáticamente a partir de los resultados cargados
- ✏️ **Panel de administración** — Interfaz protegida para la carga de resultados por parte de los organizadores
- 🔄 **Actualización en tiempo real** — Los cambios se reflejan instantáneamente gracias a Firestore
- 📱 **Diseño responsive** — Adaptado para su uso en celulares, tablets y escritorio

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18+ | Framework de UI |
| Vite | 5+ | Bundler y servidor de desarrollo |
| Firebase Firestore | 10+ | Base de datos en tiempo real |
| Firebase Authentication | 10+ | Autenticación del administrador |
| Tailwind CSS | 3+ | Estilos y diseño |
| React Router DOM | 6+ | Navegación entre páginas |

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
│   ├── utils/             # Funciones auxiliares
│   ├── App.jsx
│   └── main.jsx
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