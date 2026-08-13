import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const widths = [480, 960, 1440];
const supported = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  }));
  return files.flat();
}

export async function optimizeImages(inputDirectory, outputDirectory) {
  const manifest = {};
  for (const input of await walk(inputDirectory)) {
    const extension = path.extname(input).toLowerCase();
    if (!supported.has(extension)) continue;
    const relative = path.relative(inputDirectory, input).replaceAll('\\', '/');
    const publicPath = `/assets/${relative}`;
    const metadata = await sharp(input, { animated: true }).metadata();
    if (!metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) continue;
    const output = path.join(outputDirectory, relative);
    await mkdir(path.dirname(output), { recursive: true });
    const pipeline = sharp(input).rotate();
    const optimized = extension === '.webp'
      ? await pipeline.webp({ quality: 82, effort: 5, smartSubsample: true }).toBuffer()
      : extension === '.png'
        ? await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
        : await pipeline.jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    if (optimized.length < (await stat(input)).size) await writeFile(output, optimized);

    const variants = [];
    for (const width of widths.filter((value) => value < metadata.width)) {
      const variantRelative = relative.replace(/\.[^.]+$/, `-${width}w.webp`);
      const variantOutput = path.join(outputDirectory, variantRelative);
      await mkdir(path.dirname(variantOutput), { recursive: true });
      await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 5, smartSubsample: true }).toFile(variantOutput);
      variants.push({ width, path: `/assets/${variantRelative}` });
    }
    manifest[publicPath] = { width: metadata.width, height: metadata.height, variants };
  }
  return manifest;
}

export async function imageSavings(inputDirectory, outputDirectory) {
  let inputBytes = 0;
  let outputBytes = 0;
  for (const input of await walk(inputDirectory)) {
    if (!supported.has(path.extname(input).toLowerCase())) continue;
    inputBytes += (await stat(input)).size;
    const output = path.join(outputDirectory, path.relative(inputDirectory, input));
    outputBytes += (await stat(output)).size;
  }
  return { inputBytes, outputBytes };
}

export async function generateBrandImages(assetsDirectory, publicDirectory, outputDirectory) {
  const emblem = path.join(assetsDirectory, 'sygnet-neon.webp');
  await Promise.all([
    sharp(emblem).resize(48, 48, { fit: 'cover' }).webp({ quality: 86, effort: 5 }).toFile(path.join(outputDirectory, 'assets/favicon-48.webp')),
    sharp(emblem).resize(180, 180, { fit: 'cover' }).png({ compressionLevel: 9 }).toFile(path.join(outputDirectory, 'assets/apple-touch-icon-180.png')),
    sharp(emblem).resize(192, 192, { fit: 'cover' }).webp({ quality: 86, effort: 5 }).toFile(path.join(outputDirectory, 'assets/icon-192.webp')),
    sharp(emblem).resize(512, 512, { fit: 'cover' }).webp({ quality: 84, effort: 5 }).toFile(path.join(outputDirectory, 'assets/icon-512.webp')),
    sharp(path.join(publicDirectory, 'og.png')).jpeg({ quality: 86, progressive: true, mozjpeg: true }).toFile(path.join(outputDirectory, 'og.jpg'))
  ]);
}
