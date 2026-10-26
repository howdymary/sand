import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root,name),'utf8');
const html = await read('index.html');
const styleFiles = ['styles.css','src/scene.css','src/teardown.css'];
const sourceFiles = ['src/content.js','src/essay.js','src/teardown.js','src/organization.js','src/scene.js','src/app.js'];
const embeddedHardware = {};
for (const name of await readdir(path.join(root,'assets/hardware'))) {
  if (!/\.(?:webp|png|jpg)$/i.test(name)) continue;
  const bytes = await readFile(path.join(root,'assets/hardware',name));
  const type = name.endsWith('.webp')?'webp':name.endsWith('.jpg')?'jpeg':'png';
  embeddedHardware[name] = `data:image/${type};base64,${bytes.toString('base64')}`;
}
const styles = (await Promise.all(styleFiles.map(read))).join('\n');
const sources = (await Promise.all(sourceFiles.map(read))).map(source => source
  .replace(/^import .*;\s*$/gm,'')
  .replace(/^export\s+/gm,'')
  .replace('href="./assets/hardware/${file}"','href="${embeddedHardware[file]}"')
  .replace(/(['"])\.\/assets\/hardware\/([\w.-]+\.(?:webp|png|jpg))\1/g,(_match,_quote,name) => `embeddedHardware[${JSON.stringify(name)}]`));
const javascript = (`const embeddedHardware = ${JSON.stringify(embeddedHardware)};\n` + sources.join('\n\n')).replace(/<\/script/gi,'<\\/script');
const document = html
  .replace(/\s*<link rel="stylesheet" href="\.\/(?:styles\.css|src\/scene\.css|src\/teardown\.css)(?:\?v=[^"]+)?" \/>/g,'')
  .replace(/<script type="module" src="\.\/src\/app\.js(?:\?v=[^"]+)?"><\/script>/,`<style>\n${styles}\n</style>\n<script type="module">\n${javascript}\n</script>`);
await writeFile(path.join(root,'preview.html'),document);
console.log('Built portable preview with embedded essay, scroll-controlled hardware sequence, and photographs.');
