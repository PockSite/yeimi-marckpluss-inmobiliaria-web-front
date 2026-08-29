# AGENTS.md — Yeimi Inmobiliaria / Marckpluss (Angular 16)

## Commands

| Action | Command |
|--------|---------|
| Dev server (Angular) | `npm start` → `http://localhost:4200/` |
| Backend (chatbot) | `npm run backend` (prod) / `npm run backend:dev` (nodemon) |
| Build | `npm run build` → `dist/my-landing` |
| Tests (componentes) | `npm test` (Karma/Jasmine, opens browser) |
| Tests (SEO/GEO) | `npm run test:geo` (Node test runner, sin navegador) |
| Sitemap | `npm run sitemap` (regenera `public/sitemap.xml` desde Domus) |
| Verificar despliegue | `npm run verify:endpoints [origin]` |
| Docker build | `docker build .` (uses Bun for Angular build + Nginx) |

- No lint/format tools configured. Do not add without asking.
- Uses `package-lock.json` and `bun.lock` — either npm or bun works for install.

## Architecture

Single-page Angular 16 app (`"type": "module"` in package.json) with an embedded Express/OpenAI chatbot backend.

```
src/app/
  core/            → DomusService, WhatsappService, models
  chatbot/         → ChatbotComponent + ChatService + models
  myprofile/       → Hero/portada con CTA y filtros
  habilidades/     → Grid paginado de propiedades (Domus API)
  cursos/          → Carrusel automático de propiedades
  individual-card/ → Detalle de propiedad
  states/          → Estadísticas animadas
  tech/            → Valores de empresa
  aboutme/         → Sobre nosotros
  contact/         → Formulario (FormSubmit.co)
  header/          → Sidebar lateral
  header-top/      → Navegación superior con scroll detection
  footer/          → Pie de página
  projects/        → Portafolio (comentado en template)
  experiences/     → Experiencia laboral (comentado en template)
```

- Root module: `src/app/app.module.ts`
- Routing: `src/app/app-routing.module.ts` (route `""` → `MyprofileComponent`, `propiedad/:id` → `IndividualCardComponent`)
- External APIs: `src/environments/environment.ts` (chatbotApiUrl, domusApiUrl, whatsappNumber)

## Capa SEO / GEO (estática, fuera de la SPA)

```
public/            → copiado tal cual a la raíz del build (angular.json assets)
  robots.txt         referencia al sitemap
  sitemap.xml        192 URL (4 estáticas + fichas de inmueble), generado
  llms.txt           índice llmstxt.org con sección "cuándo usar este sitio"
  agents.md          instrucciones públicas para agentes
  about|contact|privacy.html   páginas de confianza (500+ caracteres)
  404.html           página 404 con punteros a /sitemap.xml y /llms.txt
  *.md               espejos markdown para negociación de contenido
  marckpluss-docs.css estilos compartidos por las páginas estáticas
scripts/
  generate-sitemap.mjs  regenera public/sitemap.xml desde la API de Domus
  geo.test.mjs          pruebas de todo lo anterior + simulación de rutas
  verify-endpoints.mjs  verificación contra un despliegue real
vercel.json        enrutamiento: negociación markdown, URL limpias, SPA y 404 real
```

- `src/index.html` incluye canonical, Open Graph/Twitter, JSON-LD (`@graph` con Organization/RealEstateAgent + WebSite + WebPage) y un bloque previo al arranque dentro de `<app-root>`. Angular borra ese bloque al bootstrapear, así que sirve de pantalla de carga con identidad de marca y, a la vez, de contenido legible sin JavaScript. Debe superar 500 caracteres de texto y **nunca** ocultarse con CSS.
- `vercel.json` define las rutas: la negociación markdown va antes de la fase `filesystem`; después van las URL limpias, la reescritura de `/propiedad/:id` y el catch-all con `status: 404`. Vercel mezcla estas rutas **antes** del `/(.*) → /index.html` del preset de Angular, que es lo que eliminaba los 404 falsos.
- `nginx.conf` replica las mismas reglas para el despliegue con Docker.
- **Al añadir una ruta nueva a la SPA hay que declararla también en `vercel.json` y en `nginx.conf`**, o devolverá 404.

## Backend (app.js)

Express server on `PORT` (default 3000) exposing `POST /api/chat`. Uses OpenAI Assistants API with thread persistence per userId in memory. Requires `.env` with `OPENAI_API_KEY` and `ASSISTANT_ID`. Note: `cors` is imported in app.js but not listed in `package.json` — may need `npm install cors` if missing.

## Key conventions

- Component-per-folder: `.component.ts`, `.html`, `.css`, `.spec.ts`
- Global styles in `src/styles.css`; component CSS uses `styleUrls` (ViewEncapsulation default)
- Responsive breakpoints: 1024px, 890px, 640px, 480px
- CSS uses CSS custom properties for theming (`--color-main`, `--color-second`, `--color-title`, `--color-main2`, `--color-text2`)
- Fonts via Google Fonts CDN (Playfair Display, Montserrat/Inter)
- Icons via Font Awesome CDN
- Hero height controlled via `heroHeightVh` variable in TypeScript, passed as `--hero-height` CSS custom property

## Deployment

- Frontend: Vercel (proyecto `yeimi-marckpluss-inmobiliaria-web-front`, preset Angular, sin overrides de build) o Docker (Bun build → Nginx)
- Backend: separate deploy (PockSite proxy at `marckplussopenai.pocksite.com`)
- Enrutamiento: `vercel.json` en Vercel, `nginx.conf` en Docker. Ninguno de los dos usa ya un fallback global a `index.html`: las rutas desconocidas devuelven 404 real.

## Existing instruction files

- `.github/copilot-instructions.md` — detailed Copilot guidance (keep in sync)

## Gotchas

- `app.js` imports `cors` but it may not be in `package.json` dependencies
- `environment.ts` export is misspelled as `enviroment` (missing 'n')
- No SSR despite README mentioning it — this is a standard Angular browser build. Las fichas `/propiedad/:id` siguen siendo HTML vacío para rastreadores sin JS; solo la portada y las páginas estáticas tienen contenido en el HTML crudo.
- La negociación de markdown se resuelve con reglas estáticas de `vercel.json`, así que no interpreta q-values: `Accept: text/markdown;q=0.1` recibe markdown igual. Para q-values reales haría falta una función serverless.
- `projects/` and `experiences/` components exist but are commented out in `myprofile.component.html`
- Angular 16 uses `zone.js` ~0.13, not the newer signal-based reactivity
