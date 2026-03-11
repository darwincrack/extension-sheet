# Guardar pestaña en Sheets

Extensión para Chrome/Edge que guarda la URL y el título de la pestaña actual en una hoja de Google Sheets. Incluye una PWA para guardar enlaces desde el móvil en el mismo documento.

## Contenido

- **Extensión** (raíz del repo): popup, opciones, mismo flujo que siempre.
- **PWA** (carpeta `web/`): para móvil; usar **Compartir** → esta app y guardar en la misma hoja.

## Extensión (Chrome / Edge)

1. Carga la carpeta del proyecto como extensión descomprimida (Modo desarrollador → Cargar descomprimida).
2. Configura la URL del Web App de Google Apps Script en las opciones de la extensión (ver instrucciones dentro de Opciones).
3. En cualquier pestaña, haz clic en el icono de la extensión y pulsa «Guardar esta pestaña en Sheets».

## PWA para móvil (misma hoja)

La PWA permite guardar enlaces desde el móvil en la **misma hoja** que la extensión.

### Publicar en GitHub Pages

1. Sube el repositorio a GitHub (si aún no está).
2. En el repo: **Settings** → **Pages**.
3. En **Source** elige **Deploy from a branch**.
4. **Branch**: `main` (o `master`), carpeta **/ (root)**.
5. Guarda. La página quedará en `https://<usuario>.github.io/<repo>/`.

La PWA se sirve desde la carpeta `web/`. Debes configurar GitHub Pages para que la raíz del sitio sea el repo **o** que la raída sea la carpeta `web/`.

**Opción A – Repo como raíz del sitio**  
Si publicas desde la raíz del repo, la URL de la PWA será:

`https://<usuario>.github.io/<nombre-repo>/web/`

Abre esa URL en el móvil la primera vez.

**Opción B – Solo la carpeta web**  
Si quieres una URL más corta, puedes usar un repo que solo contenga la carpeta `web` (por ejemplo un repo llamado `guardar-sheets-pwa`) y publicar desde la raíz; entonces la URL sería:

`https://<usuario>.github.io/guardar-sheets-pwa/`

### Uso en el móvil

1. Abre en el móvil la URL de la PWA (la que hayas configurado en Pages).
2. **Primera vez**: en «Configuración», pega la **misma URL del Web App** que usas en la extensión y pulsa «Guardar URL».
3. (Opcional) Añade la página a la pantalla de inicio: en Chrome, menú → **Añadir a la pantalla de inicio** / **Instalar app**.
4. Para guardar un enlace:
   - **Con Compartir**: en cualquier página, pulsa **Compartir** → elige **Guardar en Sheets** (o el nombre de la app). Se abrirá la PWA y guardará la URL y el título en tu hoja.
   - **A mano**: abre la PWA, pega URL y título en el formulario «Guardar enlace a mano» y pulsa «Guardar en hoja».

La PWA usa la misma URL del Apps Script que la extensión, así que todos los enlaces (escritorio y móvil) se guardan en la misma hoja.

## Estructura del repo

```
extension-sheet/
├── manifest.json, popup.html, popup.js, options.html, options.js, styles.css
├── app-script/
│   └── Code.js          # Script para Google Sheets (copiar en Apps Script)
├── web/                 # PWA para móvil
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── manifest.json
│   └── sw.js
└── README.md
```

## Requisitos

- Una hoja de Google Sheets con el script desplegado como **Aplicación web** (ver instrucciones en Opciones de la extensión).
- Misma URL del Web App en la extensión y en la PWA.

## Iconos de la PWA (opcional)

Para mejorar “Añadir a la pantalla de inicio”, puedes añadir en `web/` iconos PNG (por ejemplo `icon-192.png` e `icon-512.png`) y referenciarlos en `web/manifest.json` en la clave `"icons"`.
