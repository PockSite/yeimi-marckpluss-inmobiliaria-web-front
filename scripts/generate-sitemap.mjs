/**
 * Genera public/sitemap.xml con las páginas estáticas del sitio y una entrada
 * por cada inmueble publicado en la API de Domus.
 *
 *   node scripts/generate-sitemap.mjs
 *
 * El script NO forma parte de `ng build`: el sitemap se versiona en el
 * repositorio para que el despliegue no dependa de la disponibilidad de la API.
 * Ejecútalo cuando el catálogo cambie de forma relevante y confirma el archivo.
 *
 * Si la API no responde, el sitemap existente se conserva intacto y el script
 * termina con código 1 sin escribir nada.
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const OUTPUT = resolve(ROOT, 'public', 'sitemap.xml');

export const SITE_ORIGIN = 'https://www.marckplussinmobiliaria.com';
const DOMUS_API = 'https://marckplussdomus.pocksite.com/api/v1/domus/';
const REQUEST_TIMEOUT_MS = 30000;

/** Páginas estáticas servidas fuera de la SPA, en orden de prioridad. */
export const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' }
];

/** Escapa los cinco caracteres que XML no admite en texto ni en atributos. */
export function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Normaliza la fecha de Domus (`YYYY-MM-DD HH:mm:ss`, hora de Colombia) al
 * formato W3C que admite `<lastmod>`. Devuelve null si no es interpretable.
 */
export function toLastmod(value) {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return `${year}-${month}-${day}`;
}

/** Construye el XML del sitemap a partir de las entradas ya normalizadas. */
export function buildSitemap(entries) {
  const urls = entries
    .map(entry => {
      const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
      if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urls}\n` +
    '</urlset>\n'
  );
}

async function fetchProperties() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(DOMUS_API, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Domus respondió ${response.status} ${response.statusText}`);
    }
    const payload = await response.json();
    if (!Array.isArray(payload?.data)) {
      throw new Error('La respuesta de Domus no contiene un arreglo "data"');
    }
    return payload.data;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  const properties = await fetchProperties();

  const seen = new Set();
  const propertyEntries = [];
  for (const property of properties) {
    const code = property?.codpro;
    if (code === undefined || code === null || `${code}`.trim() === '') continue;
    const loc = `${SITE_ORIGIN}/propiedad/${encodeURIComponent(code)}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    propertyEntries.push({
      loc,
      lastmod: toLastmod(property.updated_at) ?? today,
      changefreq: 'weekly',
      priority: '0.8'
    });
  }

  propertyEntries.sort((a, b) => a.loc.localeCompare(b.loc));

  const entries = [
    ...STATIC_PAGES.map(page => ({
      loc: `${SITE_ORIGIN}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority
    })),
    ...propertyEntries
  ];

  const xml = buildSitemap(entries);
  const previous = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : '';
  writeFileSync(OUTPUT, xml, 'utf8');

  console.log(
    `sitemap.xml ${previous ? 'actualizado' : 'creado'}: ` +
      `${entries.length} URL (${STATIC_PAGES.length} estáticas, ${propertyEntries.length} inmuebles)`
  );
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (invokedDirectly) {
  main().catch(error => {
    console.error(`No se pudo generar el sitemap: ${error.message}`);
    console.error('El archivo public/sitemap.xml existente NO fue modificado.');
    process.exit(1);
  });
}
