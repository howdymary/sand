import { access, lstat, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const checkDist = process.argv.includes('--dist');
const base = checkDist ? path.join(root, 'dist') : root;
const errors = [];
let checkedReferences = 0;

function fail(message) {
  errors.push(message);
}

async function filesUnder(target) {
  let stat;
  try { stat = await lstat(target); } catch {
    fail(`Missing required path: ${path.relative(root, target)}`);
    return [];
  }
  if (stat.isSymbolicLink()) {
    fail(`Pages artifacts must not contain symbolic links: ${path.relative(root, target)}`);
    return [];
  }
  if (stat.isFile()) return [target];
  if (!stat.isDirectory()) {
    fail(`Unsupported filesystem entry: ${path.relative(root, target)}`);
    return [];
  }
  const children = await Promise.all((await readdir(target)).map(name => filesUnder(path.join(target, name))));
  return children.flat();
}

async function localReference(owner, reference, { runtime = false } = {}) {
  const ref = reference.trim();
  if (!ref || ref.startsWith('#') || /^(?:data:|mailto:|tel:)/i.test(ref)) return;
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(ref)) {
    if (runtime) fail(`External runtime dependency in ${path.relative(base, owner)}: ${ref}`);
    return;
  }
  if (ref.startsWith('/')) {
    fail(`Root-relative URL would break project Pages: ${path.relative(base, owner)} → ${ref}`);
    return;
  }
  let decoded;
  try { decoded = decodeURIComponent(ref.split(/[?#]/)[0]); } catch {
    fail(`Malformed URL in ${path.relative(base, owner)}: ${ref}`);
    return;
  }
  const target = path.resolve(path.dirname(owner), decoded);
  if (path.relative(base, target).startsWith('..')) {
    fail(`Asset escapes the published directory: ${path.relative(base, owner)} → ${ref}`);
    return;
  }
  checkedReferences++;
  try { await access(target); } catch {
    fail(`Broken local reference: ${path.relative(base, owner)} → ${ref}`);
  }
}

const inputs = ['index.html', 'styles.css', 'src'];
const files = (await Promise.all(inputs.map(entry => filesUnder(path.join(base, entry))))).flat();
try {
  await access(path.join(base, 'assets'));
  files.push(...await filesUnder(path.join(base, 'assets')));
} catch { /* An asset directory is optional for this SVG-based site. */ }

for (const file of files) {
  if (!/\.(?:html|css|js|mjs)$/i.test(file)) continue;
  const source = await readFile(file, 'utf8');
  if (/\.html$/i.test(file)) {
    for (const match of source.matchAll(/<([a-z][\w:-]*)\b[^>]*>/gi)) {
      const tag = match[1].toLowerCase();
      const markup = match[0];
      for (const attr of markup.matchAll(/\b(src|href)\s*=\s*["']([^"']+)["']/gi)) {
        const runtime = attr[1].toLowerCase() === 'src' || (tag === 'link' && /\brel\s*=\s*["'](?:stylesheet|preload|modulepreload)["']/i.test(markup));
        await localReference(file, attr[2], { runtime });
      }
    }
  }
  if (/\.css$/i.test(file)) {
    for (const match of source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)|@import\s+["']([^"']+)["']/gi)) {
      await localReference(file, match[1] || match[2], { runtime: true });
    }
  }
  if (/\.(?:js|mjs)$/i.test(file)) {
    for (const match of source.matchAll(/['"]\.\/assets\/hardware\/([\w.-]+\.(?:webp|png|jpg))['"]/g)) {
      await localReference(path.join(base, 'index.html'), './assets/hardware/' + match[1], { runtime: true });
    }
  }
  if (path.basename(file) === 'scene.js') {
    for (const match of source.matchAll(/(?:hardwareImage|photoDetail)\('([^']+)'/g)) {
      await localReference(path.join(base, 'index.html'), './assets/hardware/' + match[1], { runtime: true });
    }
  }
  if (/\.(?:js|mjs)$/i.test(file)) {
    for (const match of source.matchAll(/\b(?:import|export)\s*(?:[\w*$,\s{}]+?\s*from\s*)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g)) {
      const ref = match[1] || match[2];
      if (!/^(?:\.{1,2}\/|\/|[a-z][a-z\d+.-]*:)/i.test(ref)) {
        fail(`Bare module import needs a bundler: ${path.relative(base, file)} → ${ref}`);
      } else await localReference(file, ref, { runtime: true });
    }
  }
}

try {
  const { chapters, components } = await import(pathToFileURL(path.join(base, 'src/content.js')).href);
  if (!Array.isArray(chapters) || !chapters.length) fail('Chapter content must contain a nonempty chapters array.');
  if (!components || typeof components !== 'object') fail('Component content must define the components map.');
  const { essay } = await import(pathToFileURL(path.join(base, 'src/essay.js')).href);
  if (essay.sections.length !== chapters.length) fail('Every visual chapter needs a paired essay section.');
  for (const [index, section] of essay.sections.entries()) {
    if (section.chapter !== index || section.id !== chapters[index]?.id) fail(`Essay/visual chapter mismatch at section ${index}.`);
    if (!section.title || !section.paragraphs?.length) fail(`Empty essay section ${section.id}.`);
  }
  const ids = new Set();
  for (const [index, chapter] of (chapters || []).entries()) {
    if (!chapter.id || ids.has(chapter.id)) fail(`Missing or duplicate chapter id at index ${index}.`);
    ids.add(chapter.id);
    if (!chapter.title) fail(`Missing chapter title: ${chapter.id || index}`);
    for (const id of chapter.componentIds || []) {
      if (!Object.hasOwn(components || {}, id)) fail(`Chapter ${chapter.id} refers to unknown component ${id}.`);
    }
  }
  for (const [id, component] of Object.entries(components || {})) {
    if (!component.name || !component.description) fail(`Component ${id} needs a name and explanation.`);
    if (!Number.isInteger(component.chapter) || component.chapter < 0 || component.chapter >= chapters.length) {
      fail(`Component ${id} has an invalid chapter destination.`);
    }
  }
} catch (error) {
  fail(`Could not validate chapter/component content: ${error.message}`);
}

if (checkDist) {
  try { await access(path.join(base, '.nojekyll')); } catch { fail('Built artifact is missing .nojekyll.'); }
  try {
    await access(path.join(base, 'docs/source-essay.md'));
    fail('Private editorial notes must not be included in the deployment artifact.');
  } catch { /* Private source notes are not part of the delivered essay and walkthrough. */ }
  for (const file of files) {
    const relative = path.relative(base, file);
    try {
      const [built, original] = await Promise.all([readFile(file), readFile(path.join(root, relative))]);
      if (!built.equals(original)) fail(`Build is stale or changed file contents: ${relative}`);
    } catch (error) {
      fail(`Could not compare built artifact ${relative}: ${error.message}`);
    }
  }
}

if (errors.length) {
  console.error(`Static integrity check failed (${errors.length}):\n${errors.map(message => `  • ${message}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Verified ${checkDist ? 'deployment artifact' : 'site sources'}: ${files.length} files, ${checkedReferences} local references, essay/visual pairings, chapter/component links, and no external runtime assets.`);
}
