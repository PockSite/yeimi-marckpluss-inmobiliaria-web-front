/**
 * Verifica contra un despliegue real los endpoints públicos y los archivos
 * legibles por máquina: código de estado, tipo de contenido, cabecera Vary y
 * negociación de markdown (acceptmarkdown.com).
 *
 *   npm run verify:endpoints                       # produccion
 *   npm run verify:endpoints -- https://mi-preview.vercel.app
 *
 * Termina con código 1 si alguna comprobación falla.
 */

const DEFAULT_ORIGIN = 'https://www.marckplussinmobiliaria.com';
const origin = (process.argv[2] || DEFAULT_ORIGIN).replace(/\/+$/, '');
const MARKDOWN_TYPE = /^text\/markdown\b/;
const TIMEOUT_MS = 20000;

/** Comprobaciones declarativas: cada una describe una petición y lo que se espera. */
const CHECKS = [
  { name: 'portada HTML', path: '/', expect: { status: 200, type: /^text\/html/, vary: true, body: /Marckpluss/ } },
  { name: 'portada markdown', path: '/', accept: 'text/markdown', expect: { status: 200, type: MARKDOWN_TYPE, vary: true, body: /^# Marckpluss/ } },
  { name: 'about HTML', path: '/about', expect: { status: 200, type: /^text\/html/, vary: true, body: /Sobre nosotros/ } },
  { name: 'about markdown', path: '/about', accept: 'text/markdown', expect: { status: 200, type: MARKDOWN_TYPE, vary: true } },
  { name: 'contact HTML', path: '/contact', expect: { status: 200, type: /^text\/html/, vary: true, body: /marckpluss@gmail\.com/ } },
  { name: 'contact markdown', path: '/contact', accept: 'text/markdown', expect: { status: 200, type: MARKDOWN_TYPE, vary: true } },
  { name: 'privacy HTML', path: '/privacy', expect: { status: 200, type: /^text\/html/, vary: true, body: /Ley 1581 de 2012/ } },
  { name: 'privacy markdown', path: '/privacy', accept: 'text/markdown', expect: { status: 200, type: MARKDOWN_TYPE, vary: true } },
  { name: 'robots.txt', path: '/robots.txt', expect: { status: 200, type: /^text\/plain/, body: /Sitemap: / } },
  { name: 'sitemap.xml', path: '/sitemap.xml', expect: { status: 200, type: /xml/, body: /<urlset/ } },
  { name: 'llms.txt', path: '/llms.txt', expect: { status: 200, body: /^# Marckpluss Inmobiliaria/ } },
  { name: 'agents.md', path: '/agents.md', expect: { status: 200, type: MARKDOWN_TYPE, body: /Instrucciones para agentes/ } },
  { name: 'index.md directo', path: '/index.md', expect: { status: 200, type: MARKDOWN_TYPE } },
  { name: 'ficha de inmueble (SPA)', path: '/propiedad/5550', expect: { status: 200, type: /^text\/html/ } },
  { name: '404 real', path: '/some-path-that-does-not-exist', expect: { status: 404, body: /sitemap\.xml/ } },
  { name: '404 markdown', path: '/otra-ruta-inexistente', accept: 'text/markdown', expect: { status: 404, type: MARKDOWN_TYPE, body: /llms\.txt/ } },
  { name: '404 anidado', path: '/nivel/uno/dos', expect: { status: 404 } }
];

async function runCheck(check) {
  const url = `${origin}${check.path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: check.accept ? { Accept: check.accept } : {},
      redirect: 'follow',
      signal: controller.signal
    });
    const body = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const vary = response.headers.get('vary') || '';
    const problems = [];

    if (check.expect.status && response.status !== check.expect.status) {
      problems.push(`estado ${response.status}, se esperaba ${check.expect.status}`);
    }
    if (check.expect.type && !check.expect.type.test(contentType)) {
      problems.push(`content-type "${contentType}" no coincide con ${check.expect.type}`);
    }
    if (check.expect.vary && !/\baccept\b/i.test(vary)) {
      problems.push(`Vary "${vary || 'ausente'}" no incluye Accept`);
    }
    if (check.expect.body && !check.expect.body.test(body.trim())) {
      problems.push(`el cuerpo no coincide con ${check.expect.body}`);
    }

    return { check, url, ok: problems.length === 0, problems, status: response.status, contentType, vary };
  } catch (error) {
    return { check, url, ok: false, problems: [`la petición falló: ${error.message}`] };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const check of CHECKS) {
  results.push(await runCheck(check));
}

console.log(`Verificando ${origin}\n`);
for (const result of results) {
  const label = `${result.ok ? 'OK  ' : 'FALL'} ${result.check.name}`.padEnd(34);
  const accept = result.check.accept ? ` [Accept: ${result.check.accept}]` : '';
  console.log(`${label} ${result.check.path}${accept}`);
  if (!result.ok) {
    for (const problem of result.problems) console.log(`       ↳ ${problem}`);
  }
}

const failed = results.filter(result => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
process.exit(failed.length === 0 ? 0 : 1);
