import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFiles = ['site.json', 'press.json', 'releases.json', 'shows.json', 'videos.json', 'news.json'];

function collectUrls(value, urls = new Set()) {
  if (typeof value === 'string' && /^https:\/\//i.test(value)) urls.add(value);
  if (Array.isArray(value)) value.forEach((item) => collectUrls(item, urls));
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    Object.values(value).forEach((item) => collectUrls(item, urls));
  }
  return urls;
}

async function request(url, method) {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
    headers: { 'user-agent': 'NeonRevolutionLinkChecker/1.0 (+website maintenance)' }
  });
  await response.body?.cancel();
  return response.status;
}

async function check(url) {
  try {
    let status = await request(url, 'HEAD');
    if (status === 405 || status >= 500) status = await request(url, 'GET');
    return { url, status, ok: status < 500 };
  } catch (error) {
    return { url, status: null, ok: false, error: error.message };
  }
}

const documents = await Promise.all(dataFiles.map(async (file) => (
  JSON.parse(await readFile(path.join(root, 'src', 'data', file), 'utf8'))
)));
const urls = [...documents.reduce((set, document) => collectUrls(document, set), new Set())].sort();
const results = [];

for (let index = 0; index < urls.length; index += 5) {
  results.push(...await Promise.all(urls.slice(index, index + 5).map(check)));
}

for (const result of results) {
  console.log(`${result.ok ? 'OK' : 'FAIL'} ${result.status ?? '-'} ${result.url}${result.error ? ` (${result.error})` : ''}`);
}

const failures = results.filter((result) => !result.ok);
if (failures.length) {
  console.error(`\n${failures.length} of ${results.length} external links could not be verified.`);
  process.exitCode = 1;
} else {
  console.log(`\nVerified ${results.length} external links.`);
}
