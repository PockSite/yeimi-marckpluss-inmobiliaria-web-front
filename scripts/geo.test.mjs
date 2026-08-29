/**
 * Pruebas de los artefactos de SEO/GEO que se sirven como archivos estáticos:
 * metadatos y JSON-LD de la portada, páginas de confianza, llms.txt, agents.md,
 * robots.txt, sitemap.xml, la página 404 y las reglas de enrutamiento.
 *
 *   npm run test:geo
 *
 * No requiere navegador ni dependencias externas: usa el runner de Node.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSitemap, escapeXml, toLastmod, SITE_ORIGIN, STATIC_PAGES } from './generate-sitemap.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => readFileSync(resolve(ROOT, relativePath), 'utf8');

const ORIGIN = 'https://www.marckplussinmobiliaria.com';

/** Escapa una cadena para usarla como literal dentro de una expresión regular. */
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Elimina scripts, estilos y comentarios: lo que queda es marcado real. */
function stripNonMarkup(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

/** Texto visible aproximado de un documento HTML, como lo vería un rastreador sin JS. */
function htmlToText(html) {
  return stripNonMarkup(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Devuelve el contenido del primer <script type="application/ld+json"> del documento. */
function extractJsonLd(html) {
  const match = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  return match ? JSON.parse(match[1]) : null;
}

const TRUST_PAGES = ['public/about.html', 'public/contact.html', 'public/privacy.html'];
const MARKDOWN_MIRRORS = [
  'public/index.md',
  'public/about.md',
  'public/contact.md',
  'public/privacy.md',
  'public/404.md'
];

// ---------------------------------------------------------------------------
// Portada: metadatos, JSON-LD y contenido sin JavaScript
// ---------------------------------------------------------------------------

test('index.html declara los cuatro metadatos de identidad', () => {
  const html = read('src/index.html');

  assert.match(html, /<html lang="es">/, 'falta lang en <html>');
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/www\.marckplussinmobiliaria\.com\/">/,
    'falta la URL canónica'
  );
  assert.match(html, /<meta property="og:type" content="website">/, 'falta og:type');
  assert.match(
    html,
    /<meta property="og:image" content="https:\/\/www\.marckplussinmobiliaria\.com\/[^"]+">/,
    'falta og:image absoluta'
  );
  assert.match(html, /<meta name="description"\s+content="[^"]{80,}">/, 'falta meta description');
});

test('index.html expone contenido legible sin ejecutar JavaScript', () => {
  const html = read('src/index.html');

  const appRoot = stripNonMarkup(html).match(/<app-root>([\s\S]*?)<\/app-root>/);
  assert.ok(appRoot, 'el contenido inicial debe vivir dentro del elemento app-root');

  const text = htmlToText(appRoot[1]);
  assert.ok(
    text.length >= 500,
    `el contenido sin JS debe superar 500 caracteres, tiene ${text.length}`
  );
  assert.match(appRoot[1], /<h1[^>]*>/, 'el contenido inicial debe incluir un H1');
  assert.match(text, /Marckpluss/, 'el contenido inicial debe nombrar la marca');
});

test('index.html nunca oculta de forma permanente el contenido inicial', () => {
  const html = read('src/index.html');
  const styles = html.match(/<style>([\s\S]*?)<\/style>/);
  assert.ok(styles, 'se espera el bloque de estilos del contenido inicial');
  const css = styles[1];

  // Ocultarlo sin vuelta atrás sí sería cloaking: nunca se permite.
  assert.doesNotMatch(css, /\.mp-boot[^{]*\{[^}]*display\s*:\s*none/i);
  assert.doesNotMatch(css, /\.mp-boot[^{]*\{[^}]*visibility\s*:\s*hidden/i);

  // El bloque arranca en opacity 0 para no parpadear cuando Angular es rápido;
  // esto solo es admisible si una animación lo devuelve a opacity 1 y la deja
  // fijada. Se comprueba toda esa cadena.
  const base = css.match(/\.mp-boot\s*\{([^}]*)\}/);
  assert.ok(base, 'falta la regla base .mp-boot');

  if (/opacity\s*:\s*0\s*[;}]/.test(base[1])) {
    const animation = base[1].match(/animation\s*:\s*([^;]+)/);
    assert.ok(animation, '.mp-boot empieza en opacity 0 pero no declara animation');

    const shorthand = animation[1];
    const name = shorthand.trim().split(/\s+/)[0];
    assert.match(shorthand, /\bforwards\b/, 'la animación debe fijar el estado final (forwards)');

    const keyframes = css.match(new RegExp(`@keyframes\\s+${name}\\s*\\{([\\s\\S]*?)\\}\\s*\\}`));
    assert.ok(keyframes, `faltan los @keyframes ${name}`);
    assert.match(keyframes[1], /opacity\s*:\s*1/, `${name} debe terminar en opacity 1`);

    // En el atajo `animation`, duración y retardo son los tokens de tiempo.
    const seconds = shorthand
      .trim()
      .split(/\s+/)
      .filter(token => /^\d*\.?\d+m?s$/.test(token))
      .map(token => (token.endsWith('ms') ? Number.parseFloat(token) / 1000 : Number.parseFloat(token)));

    assert.ok(seconds.length > 0, 'la animación de revelado no declara tiempos');
    assert.ok(
      seconds.every(value => value <= 5),
      `el retardo del contenido inicial no puede superar los 5 s (${seconds.join(', ')})`
    );
  }

  // El bloque de movimiento reducido no puede anular la animación: dejaría el
  // contenido en opacity 0 para siempre.
  const reducedMotion = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n    \}/);
  if (reducedMotion) {
    assert.doesNotMatch(
      reducedMotion[1],
      /\.mp-boot\s*\{[^}]*animation\s*:\s*none/i,
      'con movimiento reducido la animación de revelado no puede anularse'
    );
  }
});

test('el JSON-LD de la portada describe la organización con contacto y dirección', () => {
  const jsonLd = extractJsonLd(read('src/index.html'));
  assert.ok(jsonLd, 'la portada debe incluir un bloque JSON-LD');
  assert.ok(Array.isArray(jsonLd['@graph']), 'se espera un @graph');

  const types = node => (Array.isArray(node['@type']) ? node['@type'] : [node['@type']]);
  const org = jsonLd['@graph'].find(node => types(node).includes('Organization'));
  assert.ok(org, 'falta el nodo Organization');

  assert.equal(org.name, 'Marckpluss Inmobiliaria');
  assert.equal(org.url, `${ORIGIN}/`);
  assert.ok(org.description.length > 60, 'la descripción de la organización es demasiado corta');

  assert.equal(org.address['@type'], 'PostalAddress');
  assert.equal(org.address.addressLocality, 'Bogotá');
  assert.equal(org.address.addressCountry, 'CO');

  assert.ok(Array.isArray(org.contactPoint) && org.contactPoint.length > 0, 'falta contactPoint');
  for (const point of org.contactPoint) {
    assert.equal(point['@type'], 'ContactPoint');
    assert.ok(point.contactType, 'cada contactPoint necesita contactType');
    assert.ok(point.email || point.telephone, 'cada contactPoint necesita email o teléfono');
  }
  assert.ok(
    org.contactPoint.some(point => point.email === 'marckpluss@gmail.com'),
    'ningún contactPoint publica el correo'
  );

  assert.ok(Array.isArray(org.sameAs) && org.sameAs.length >= 3, 'faltan perfiles en sameAs');

  const site = jsonLd['@graph'].find(node => types(node).includes('WebSite'));
  assert.ok(site, 'falta el nodo WebSite');
  assert.equal(site.publisher['@id'], org['@id']);
});

test('el JSON-LD de la portada es JSON estricto y sin valores vacíos', () => {
  const raw = read('src/index.html').match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  )[1];
  const parsed = JSON.parse(raw);

  const walk = node => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        assert.notEqual(value, '', `la clave "${key}" del JSON-LD está vacía`);
        assert.notEqual(value, null, `la clave "${key}" del JSON-LD es null`);
        walk(value);
      }
    }
  };
  walk(parsed);
});

// ---------------------------------------------------------------------------
// Páginas de confianza
// ---------------------------------------------------------------------------

for (const page of TRUST_PAGES) {
  test(`${page} tiene contenido y metadatos suficientes`, () => {
    const html = read(page);
    const text = htmlToText(html);

    assert.ok(text.length >= 500, `${page} necesita 500+ caracteres, tiene ${text.length}`);
    assert.match(html, /<html lang="es">/);
    assert.match(html, /<h1[^>]*>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/www\.marckplussinmobiliaria\.com\/[a-z]+">/);
    assert.match(html, /<meta property="og:type" content="website">/);
    assert.match(html, /<meta property="og:image" content="https:\/\/[^"]+">/);
    assert.match(html, /<meta name="description"\s+content="[^"]{80,}">/);
    assert.ok(extractJsonLd(html), `${page} debe incluir JSON-LD`);
  });
}

test('las páginas de confianza publican los datos de contacto reales', () => {
  const contact = read('public/contact.html');
  assert.match(contact, /marckpluss@gmail\.com/);
  assert.match(contact, /\+57 320 479 5284/);
  assert.match(contact, /wa\.me\/573204795284/);
  assert.match(contact, /Bogotá, Colombia/);
});

test('la política de privacidad describe responsable, finalidad y derechos', () => {
  const text = htmlToText(read('public/privacy.html'));
  assert.match(text, /Ley 1581 de 2012/);
  assert.match(text, /Responsable del tratamiento/);
  assert.match(text, /Tus derechos/);
  assert.match(text, /marckpluss@gmail\.com/);
});

// ---------------------------------------------------------------------------
// Página 404
// ---------------------------------------------------------------------------

test('la página 404 apunta a los recursos para agentes y no se indexa', () => {
  const html = read('public/404.html');
  assert.match(html, /<meta name="robots" content="noindex, follow">/);
  assert.match(html, /href="\/sitemap\.xml"/);
  assert.match(html, /href="\/llms\.txt"/);
  assert.match(htmlToText(html), /404/);
});

test('la variante markdown del 404 apunta al sitemap y a llms.txt', () => {
  const md = read('public/404.md');
  assert.match(md, /^# 404/m);
  assert.match(md, new RegExp(escapeRegExp(`${ORIGIN}/sitemap.xml`)));
  assert.match(md, new RegExp(escapeRegExp(`${ORIGIN}/llms.txt`)));
});

// ---------------------------------------------------------------------------
// llms.txt (llmstxt.org) y agents.md
// ---------------------------------------------------------------------------

test('llms.txt respeta la estructura de llmstxt.org', () => {
  const lines = read('public/llms.txt').split('\n');

  assert.match(lines[0], /^# .+/, 'la primera línea debe ser un H1');

  const firstNonEmptyAfterTitle = lines.slice(1).find(line => line.trim() !== '');
  assert.match(firstNonEmptyAfterTitle, /^> /, 'tras el H1 debe ir un blockquote de resumen');

  const firstH2Index = lines.findIndex(line => /^## /.test(line));
  assert.ok(firstH2Index > 0, 'debe haber al menos una sección H2');

  const infoBlock = lines.slice(1, firstH2Index);
  assert.ok(
    !infoBlock.some(line => /^#{1,6} /.test(line)),
    'el bloque libre previo al primer H2 no puede contener encabezados'
  );

  // Cada sección H2 es una lista de enlaces markdown.
  const sections = [];
  let current = null;
  for (const line of lines.slice(firstH2Index)) {
    if (/^## /.test(line)) {
      current = { title: line.slice(3).trim(), items: [] };
      sections.push(current);
    } else if (current && /^- /.test(line)) {
      current.items.push(line);
    }
  }

  assert.ok(sections.length >= 2, 'se esperan varias secciones H2');
  for (const section of sections) {
    assert.ok(section.items.length > 0, `la sección "${section.title}" no tiene enlaces`);
    for (const item of section.items) {
      assert.match(
        item,
        /^- \[[^\]]+\]\(https?:\/\/[^)]+\)(: .+)?$/,
        `el ítem no sigue el formato "- [name](url): notes": ${item}`
      );
    }
  }
});

test('llms.txt incluye una sección de cuándo usar el sitio', () => {
  const content = read('public/llms.txt');
  const heading = content.match(/^## .*(cuándo usar|when to use).*$/im);
  assert.ok(heading, 'falta la sección "cuándo usar / when to use"');

  const section = content.slice(content.indexOf(heading[0]));
  const body = section.slice(0, section.indexOf('\n## ', 1));
  assert.ok(body.length > 400, 'la guía de uso es demasiado breve para servir de instrucción');
  assert.match(body, /consignar|vender|arrendar/i);
  assert.match(body, /catálogo/i);
});

test('llms.txt publica identidad y canales de contacto verificables', () => {
  const content = read('public/llms.txt');
  assert.match(content, /marckpluss@gmail\.com/);
  assert.match(content, /\+57 320 479 5284/);
  assert.match(content, new RegExp(escapeRegExp(ORIGIN)));
});

test('agents.md documenta casos de uso, límites y reglas de citación', () => {
  const content = read('public/agents.md');
  assert.match(content, /^# /m);
  assert.match(content, /Cuándo recurrir a este sitio/);
  assert.match(content, /Cuándo NO usar este sitio/);
  assert.match(content, /Reglas de citación/);
  assert.match(content, /\/propiedad\/\{codpro\}/);
  assert.ok(content.length > 1500, 'agents.md es demasiado breve');
});

// ---------------------------------------------------------------------------
// robots.txt y sitemap.xml
// ---------------------------------------------------------------------------

test('robots.txt permite el rastreo y declara el sitemap', () => {
  const content = read('public/robots.txt');
  assert.match(content, /^User-agent: \*$/m);
  assert.match(content, /^Allow: \/$/m);
  assert.match(content, new RegExp(`^Sitemap: ${escapeRegExp(`${ORIGIN}/sitemap.xml`)}$`, 'm'));
  assert.doesNotMatch(content, /^Disallow: \/$/m, 'robots.txt no debe bloquear el sitio entero');
});

test('sitemap.xml es válido, absoluto y con lastmod', () => {
  const xml = read('public/sitemap.xml');

  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.match(xml, /<\/urlset>\s*$/);

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.ok(locs.length > 0, 'el sitemap está vacío');
  assert.ok(locs.length <= 50000, 'un sitemap admite como máximo 50 000 URL');
  assert.ok(Buffer.byteLength(xml) < 50 * 1024 * 1024, 'el sitemap supera 50 MB');

  assert.equal(new Set(locs).size, locs.length, 'hay URL duplicadas en el sitemap');
  for (const loc of locs) {
    assert.ok(loc.startsWith(`${ORIGIN}/`), `URL no absoluta o de otro dominio: ${loc}`);
    assert.doesNotMatch(loc, /[<>"']/, `URL sin escapar: ${loc}`);
  }

  const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);
  assert.equal(lastmods.length, locs.length, 'toda URL debe tener lastmod');
  for (const lastmod of lastmods) {
    assert.match(lastmod, /^\d{4}-\d{2}-\d{2}$/, `lastmod inválido: ${lastmod}`);
  }

  for (const page of STATIC_PAGES) {
    assert.ok(locs.includes(`${ORIGIN}${page.path}`), `el sitemap no incluye ${page.path}`);
  }
  assert.ok(
    locs.some(loc => /\/propiedad\/\d+$/.test(loc)),
    'el sitemap no incluye fichas de inmueble'
  );
});

test('el generador de sitemap normaliza fechas y escapa XML', () => {
  assert.equal(SITE_ORIGIN, ORIGIN);
  assert.equal(toLastmod('2026-08-28 18:01:06'), '2026-08-28');
  assert.equal(toLastmod('2021-11-02'), '2021-11-02');
  assert.equal(toLastmod(''), null);
  assert.equal(toLastmod(null), null);
  assert.equal(toLastmod('sin fecha'), null);

  assert.equal(escapeXml('a & b'), 'a &amp; b');
  assert.equal(escapeXml('<x>'), '&lt;x&gt;');

  const xml = buildSitemap([{ loc: `${ORIGIN}/a?b=1&c=2`, lastmod: '2026-01-01' }]);
  assert.match(xml, /<loc>https:\/\/www\.marckplussinmobiliaria\.com\/a\?b=1&amp;c=2<\/loc>/);
  assert.match(xml, /<lastmod>2026-01-01<\/lastmod>/);
});

// ---------------------------------------------------------------------------
// Espejos markdown
// ---------------------------------------------------------------------------

for (const mirror of MARKDOWN_MIRRORS) {
  test(`${mirror} existe y empieza por un H1`, () => {
    assert.ok(existsSync(resolve(ROOT, mirror)), `falta ${mirror}`);
    const content = read(mirror);
    assert.match(content.split('\n')[0], /^# .+/);
    assert.ok(content.length > 200, `${mirror} es demasiado breve`);
  });
}

test('cada página HTML negociable declara su alternativa markdown', () => {
  const pairs = [
    ['src/index.html', '/index.md'],
    ['public/about.html', '/about.md'],
    ['public/contact.html', '/contact.md'],
    ['public/privacy.html', '/privacy.md'],
    ['public/404.html', '/404.md']
  ];
  for (const [page, markdown] of pairs) {
    const html = read(page);
    assert.match(
      html,
      new RegExp(escapeRegExp(`<link rel="alternate" type="text/markdown" href="${ORIGIN}${markdown}">`)),
      `${page} no declara <link rel="alternate" type="text/markdown">`
    );
  }
});

// ---------------------------------------------------------------------------
// Enrutamiento en Vercel
// ---------------------------------------------------------------------------

test('vercel.json define las rutas de la SPA y un 404 real', () => {
  const config = JSON.parse(read('vercel.json'));
  const routes = config.routes;
  assert.ok(Array.isArray(routes), 'vercel.json debe declarar routes');

  const filesystemIndex = routes.findIndex(route => route.handle === 'filesystem');
  assert.ok(filesystemIndex > 0, 'falta la fase { "handle": "filesystem" }');
  assert.equal(
    routes.filter(route => route.handle === 'filesystem').length,
    1,
    'la fase filesystem solo puede declararse una vez'
  );

  const afterFilesystem = routes.slice(filesystemIndex + 1);

  const spa = afterFilesystem.find(route => route.src === '/propiedad/[^/]+/?');
  assert.ok(spa, 'falta la reescritura de /propiedad/:id hacia la SPA');
  assert.equal(spa.dest, '/index.html');

  const catchAll = afterFilesystem.filter(route => route.src === '/(.*)' && route.status === 404);
  assert.ok(catchAll.length >= 1, 'falta el catch-all que devuelve 404');
  assert.ok(
    catchAll.some(route => route.dest === '/404.html'),
    'el catch-all debe servir /404.html'
  );

  // El 404 tiene que ir después de las rutas conocidas, nunca antes.
  const lastKnownRoute = afterFilesystem.reduce(
    (last, route, index) => (route.dest && route.status === undefined ? index : last),
    -1
  );
  const firstCatchAll = afterFilesystem.findIndex(route => route.status === 404);
  assert.ok(firstCatchAll > lastKnownRoute, 'el catch-all 404 debe ir al final');
});

test('vercel.json reescribe las URL limpias de las páginas de confianza', () => {
  const routes = JSON.parse(read('vercel.json')).routes;
  const filesystemIndex = routes.findIndex(route => route.handle === 'filesystem');
  const afterFilesystem = routes.slice(filesystemIndex + 1);

  for (const page of ['about', 'contact', 'privacy']) {
    const route = afterFilesystem.find(candidate => candidate.src === `/${page}/?`);
    assert.ok(route, `falta la ruta limpia /${page}`);
    assert.equal(route.dest, `/${page}.html`);
  }
});

test('vercel.json negocia markdown y declara Vary: Accept', () => {
  const routes = JSON.parse(read('vercel.json')).routes;
  const filesystemIndex = routes.findIndex(route => route.handle === 'filesystem');

  const acceptsMarkdown = route =>
    Array.isArray(route.has) &&
    route.has.some(
      condition =>
        condition.type === 'header' &&
        condition.key.toLowerCase() === 'accept' &&
        /text\/markdown/.test(condition.value)
    );

  const negotiated = routes.slice(0, filesystemIndex).filter(acceptsMarkdown);
  const negotiatedDests = negotiated.map(route => route.dest);
  for (const dest of ['/index.md', '/about.md', '/contact.md', '/privacy.md']) {
    assert.ok(negotiatedDests.includes(dest), `falta la negociación hacia ${dest}`);
  }

  for (const route of negotiated) {
    assert.equal(route.headers['Content-Type'], 'text/markdown; charset=utf-8');
    assert.equal(route.headers.Vary, 'Accept, Accept-Encoding');
  }

  // La variante HTML también tiene que anunciar Vary: Accept.
  const varyRoutes = routes.filter(route => route.continue && route.headers?.Vary);
  assert.ok(varyRoutes.length >= 2, 'faltan cabeceras Vary para las variantes HTML');
  for (const route of varyRoutes) {
    assert.match(route.headers.Vary, /\bAccept\b/);
    assert.match(route.headers.Vary, /\bAccept-Encoding\b/);
  }
  assert.ok(
    varyRoutes.some(route => route.src === '/(index\\.html)?'),
    'la portada HTML debe declarar Vary: Accept'
  );

  // El 404 negociado también responde markdown.
  const markdown404 = routes.find(
    route => route.status === 404 && acceptsMarkdown(route) && route.dest === '/404.md'
  );
  assert.ok(markdown404, 'el 404 debe tener variante markdown');
  assert.equal(markdown404.headers['Content-Type'], 'text/markdown; charset=utf-8');
});

// ---------------------------------------------------------------------------
// Simulación del enrutamiento de Vercel sobre el build real
// ---------------------------------------------------------------------------

/**
 * Reproduce el orden de rutas que `mergeRoutes` de @vercel/routing-utils
 * produce al combinar las rutas de vercel.json con las `defaultRoutes` del
 * preset de Angular: dentro de cada fase, primero las del usuario y después las
 * del builder. Así comprobamos que el catch-all `/(.*) -> /index.html` del
 * preset queda tapado por nuestras reglas.
 */
const ANGULAR_PRESET_ROUTES = [{ handle: 'filesystem' }, { src: '/(.*)', dest: '/index.html' }];

function mergeWithPreset(userRoutes) {
  const phaseOf = routes => {
    const phases = new Map([[null, []]]);
    let current = null;
    for (const route of routes) {
      if (route.handle) {
        current = route.handle;
        if (!phases.has(current)) phases.set(current, []);
      } else {
        phases.get(current).push(route);
      }
    }
    return phases;
  };

  const userPhases = phaseOf(userRoutes);
  const presetPhases = phaseOf(ANGULAR_PRESET_ROUTES);
  const handles = [...new Set([null, ...userPhases.keys(), ...presetPhases.keys()])];

  const merged = [];
  for (const handle of handles) {
    if (handle !== null) merged.push({ handle });
    merged.push(...(userPhases.get(handle) || []));
    merged.push(...(presetPhases.get(handle) || []));
  }
  return merged;
}

/** Resuelve una petición contra la tabla de rutas y el conjunto de archivos del build. */
function resolveRequest(routes, files, { path, accept = 'text/html' }) {
  let currentPath = path;
  let status = 200;
  const headers = {};
  let phase = null;
  let servedFromFilesystem = false;

  const matches = route => {
    if (route.handle) return false;
    if (!new RegExp(`^${route.src}$`).test(currentPath)) return false;
    if (route.has) {
      const satisfied = route.has.every(condition => {
        if (condition.type !== 'header' || condition.key.toLowerCase() !== 'accept') return false;
        return new RegExp(`^${condition.value}$`).test(accept);
      });
      if (!satisfied) return false;
    }
    return true;
  };

  for (const route of routes) {
    if (route.handle) {
      // Fin de la fase previa: se intenta servir desde el sistema de archivos.
      if (route.handle === 'filesystem') {
        const candidate = currentPath.endsWith('/') ? `${currentPath}index.html` : currentPath;
        if (files.has(candidate)) {
          currentPath = candidate;
          servedFromFilesystem = true;
          break;
        }
      }
      phase = route.handle;
      continue;
    }
    if (!matches(route)) continue;

    Object.assign(headers, route.headers || {});
    if (route.status) status = route.status;
    if (route.dest) currentPath = route.dest;
    if (!route.continue && route.dest) {
      if (phase !== null) {
        servedFromFilesystem = files.has(currentPath);
        break;
      }
      // En la fase previa el destino se resuelve en la fase de filesystem.
    }
    if (!route.continue && route.status && !route.dest) break;
  }

  return { path: currentPath, status, headers, found: servedFromFilesystem || files.has(currentPath) };
}

function buildFileSet() {
  const distDir = resolve(ROOT, 'dist', 'my-landing');
  if (!existsSync(distDir)) return null;
  const files = new Set();
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const child = resolve(dir, entry.name);
      if (entry.isDirectory()) walk(child, `${prefix}${entry.name}/`);
      else files.add(`/${prefix}${entry.name}`);
    }
  };
  walk(distDir, '');
  return files;
}

test('el enrutamiento resuelve cada caso sobre el build real', { skip: buildFileSet() ? false : 'ejecuta `npm run build` antes' }, () => {
  const files = buildFileSet();
  const routes = mergeWithPreset(JSON.parse(read('vercel.json')).routes);

  const cases = [
    { path: '/', expect: { status: 200, path: '/index.html' } },
    { path: '/', accept: 'text/markdown', expect: { status: 200, path: '/index.md' } },
    { path: '/about', expect: { status: 200, path: '/about.html' } },
    { path: '/about', accept: 'text/markdown', expect: { status: 200, path: '/about.md' } },
    { path: '/contact', expect: { status: 200, path: '/contact.html' } },
    { path: '/privacy', expect: { status: 200, path: '/privacy.html' } },
    { path: '/propiedad/5550', expect: { status: 200, path: '/index.html' } },
    { path: '/propiedad/4012/', expect: { status: 200, path: '/index.html' } },
    { path: '/robots.txt', expect: { status: 200, path: '/robots.txt' } },
    { path: '/sitemap.xml', expect: { status: 200, path: '/sitemap.xml' } },
    { path: '/llms.txt', expect: { status: 200, path: '/llms.txt' } },
    { path: '/agents.md', expect: { status: 200, path: '/agents.md' } },
    { path: '/assets/images/logorojo.png', expect: { status: 200, path: '/assets/images/logorojo.png' } },
    { path: '/marckpluss-docs.css', expect: { status: 200, path: '/marckpluss-docs.css' } },
    { path: '/some-path-that-does-not-exist', expect: { status: 404, path: '/404.html' } },
    { path: '/nivel/uno/dos', expect: { status: 404, path: '/404.html' } },
    { path: '/propiedad', expect: { status: 404, path: '/404.html' } },
    { path: '/propiedad/5550/extra', expect: { status: 404, path: '/404.html' } },
    { path: '/inexistente.json', expect: { status: 404, path: '/404.html' } },
    { path: '/no-existe', accept: 'text/markdown', expect: { status: 404, path: '/404.md' } }
  ];

  for (const testCase of cases) {
    const result = resolveRequest(routes, files, testCase);
    const label = `${testCase.path}${testCase.accept ? ` [${testCase.accept}]` : ''}`;
    assert.equal(result.status, testCase.expect.status, `${label}: estado inesperado`);
    assert.equal(result.path, testCase.expect.path, `${label}: destino inesperado`);
    assert.ok(result.found, `${label}: el destino ${result.path} no existe en el build`);
  }
});

test('las respuestas negociables declaran Vary: Accept en la simulación', { skip: buildFileSet() ? false : 'ejecuta `npm run build` antes' }, () => {
  const files = buildFileSet();
  const routes = mergeWithPreset(JSON.parse(read('vercel.json')).routes);

  for (const path of ['/', '/about', '/contact', '/privacy']) {
    for (const accept of ['text/html', 'text/markdown']) {
      const result = resolveRequest(routes, files, { path, accept });
      assert.match(
        result.headers.Vary || '',
        /\bAccept\b/,
        `${path} [${accept}] no declara Vary: Accept`
      );
    }
  }

  const markdownHome = resolveRequest(routes, files, { path: '/', accept: 'text/markdown' });
  assert.equal(markdownHome.headers['Content-Type'], 'text/markdown; charset=utf-8');
});

// ---------------------------------------------------------------------------
// Configuración de build y despliegue con Docker
// ---------------------------------------------------------------------------

test('angular.json copia public/ a la raíz del build', () => {
  const angular = JSON.parse(read('angular.json'));
  const targets = ['build', 'test'];

  for (const target of targets) {
    const assets = angular.projects['my-landing'].architect[target].options.assets;
    const publicAsset = assets.find(asset => typeof asset === 'object' && asset.input === 'public');
    assert.ok(publicAsset, `el target ${target} no copia public/`);
    assert.equal(publicAsset.glob, '**/*');
    assert.equal(publicAsset.output, '/');
  }
});

test('nginx.conf devuelve 404 real y solo enruta la SPA en /propiedad/:id', () => {
  const conf = read('nginx.conf');

  assert.doesNotMatch(
    conf,
    /try_files\s+\$uri\s+\$uri\/\s+\/index\.html\s*;/,
    'el fallback global a index.html reintroduce los 404 falsos'
  );
  assert.match(conf, /location\s+\/\s*\{[^}]*try_files\s+\$uri\s+\$uri\/\s+=404\s*;/);
  assert.match(conf, /location\s+~\s+\^\/propiedad\/\[\^\/\]\+\/\?\$\s*\{[^}]*try_files\s+\/index\.html/);
  assert.match(conf, /error_page\s+404\s+\/404\.html\s*;/);
  assert.match(conf, /text\/markdown/);
  assert.match(conf, /Vary "Accept, Accept-Encoding"/);
});
