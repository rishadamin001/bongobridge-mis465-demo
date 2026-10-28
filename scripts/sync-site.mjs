import {cp,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(path.join(root,'docs'),{recursive:true});
await cp(path.join(root,'src'),path.join(root,'docs'),{recursive:true,force:true});
await writeFile(path.join(root,'docs','.nojekyll'),'');
console.log('Synchronized source into docs/ for the existing GitHub Pages site.');
