import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root,name),'utf8');
const html = await read('index.html');
const styleFiles = ['styles.css','src/scene.css','src/teardown.css','src/hardware-renderer.css'];
const embeddedHardware = {};
for (const name of await readdir(path.join(root,'assets/hardware'))) {
  if (!/\.(?:webp|png|jpg)$/i.test(name)) continue;
  const bytes = await readFile(path.join(root,'assets/hardware',name));
  const type = name.endsWith('.webp')?'webp':name.endsWith('.jpg')?'jpeg':'png';
  embeddedHardware[name] = `data:image/${type};base64,${bytes.toString('base64')}`;
}

// Keep module boundaries intact, including the locally hosted 3D library.
const moduleSources = {};
const imports = /\b(?:import|export)\s*(?:[\w*$,\s{}]+?\s*from\s*)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;
async function collect(name) {
  if (Object.hasOwn(moduleSources,name)) return;
  const source = await read(name);
  moduleSources[name] = source;
  for (const match of source.matchAll(imports)) {
    const specifier = (match[1] || match[2]).split(/[?#]/)[0];
    if (!specifier.startsWith('.')) throw new Error(`Nonlocal preview import: ${specifier}`);
    await collect(path.posix.normalize(path.posix.join(path.posix.dirname(name),specifier)));
  }
}
await collect('src/app.js');
const styles = (await Promise.all(styleFiles.map(read))).join('\n');

async function bootstrap(assetMap,moduleSources) {
  const assetModule=URL.createObjectURL(new Blob(['export default '+JSON.stringify(assetMap)],{type:'text/javascript'}));
  const moduleURLs=new Map();
  const localImports=/\b(?:import|export)\s*(?:[\w*$,\s{}]+?\s*from\s*)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;
  function resolveModule(owner,specifier) {
    const pieces=owner.split('/'); pieces.pop();
    for (const piece of specifier.split(/[?#]/)[0].split('/')) {
      if (piece==='..') pieces.pop(); else if (piece!=='.') pieces.push(piece);
    }
    return pieces.join('/');
  }
  function moduleURL(name) {
    if (moduleURLs.has(name)) return moduleURLs.get(name);
    let source=moduleSources[name];
    source=source.replace(localImports,(match,first,second)=>{
      const specifier=first||second;
      return match.replace(specifier,moduleURL(resolveModule(name,specifier)));
    });
    const original=source;
    source=source.replace('href="./assets/hardware/${file}"','href="${embeddedHardware[file]}"');
    source=source.replace(/(['"])\.\/assets\/hardware\/([\w.-]+\.(?:webp|png|jpg))\1/g,(_match,_quote,file)=>'embeddedHardware['+JSON.stringify(file)+']');
    if (source!==original) source='import embeddedHardware from "'+assetModule+'";\n'+source;
    const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    moduleURLs.set(name,url);
    return url;
  }
  await import(moduleURL('src/app.js'));
}

const javascript=`(${bootstrap.toString()})(${JSON.stringify(embeddedHardware)},${JSON.stringify(moduleSources)});`.replace(/<\/script/gi,'<\\/script');
const document=html
  .replace(/\s*<link rel="stylesheet" href="\.\/(?:styles\.css|src\/scene\.css|src\/teardown\.css|src\/hardware-renderer\.css)(?:\?v=[^"]+)?" \/>/g,'')
  .replace(/<script type="module" src="\.\/src\/app\.js(?:\?v=[^"]+)?"><\/script>/,()=>`<style>\n${styles}\n</style>\n<script type="module">\n${javascript}\n</script>`);
await writeFile(path.join(root,'preview.html'),document);
console.log('Built portable preview with embedded modules, hardware assets, and the continuous 3D walkthrough.');
