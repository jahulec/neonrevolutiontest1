import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['.pages.yml', '.github/workflows/deploy-pages.yml', '.github/workflows/content-maintenance.yml'];
const parsed = {};
for (const file of files) {
  try { parsed[file] = parse(await readFile(path.join(root, file), 'utf8')); }
  catch (error) { throw new Error(`${file}: invalid YAML: ${error.message}`); }
}

const cms = parsed['.pages.yml'];
const contentNames = new Set(cms.content?.map((item) => item.name));
for (const required of ['shows', 'news', 'releases', 'videos', 'gallery', 'press', 'site']) {
  if (!contentNames.has(required)) throw new Error(`.pages.yml: missing CMS section ${required}`);
}
const actionWorkflows = [
  ...(cms.actions ?? []).map((action) => action.workflow),
  ...(cms.media?.actions ?? []).map((action) => action.workflow)
];
for (const workflow of actionWorkflows) {
  if (!files.includes(`.github/workflows/${workflow}`)) throw new Error(`.pages.yml: action workflow does not exist: ${workflow}`);
}
if (!parsed['.github/workflows/deploy-pages.yml']?.jobs?.build) throw new Error('deploy-pages.yml: build job missing');
if (!parsed['.github/workflows/content-maintenance.yml']?.jobs?.maintain) throw new Error('content-maintenance.yml: maintain job missing');
console.log('CMS and workflow YAML configuration passed.');
