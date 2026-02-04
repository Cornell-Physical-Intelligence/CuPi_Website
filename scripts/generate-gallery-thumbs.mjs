import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const ROOT = process.cwd();
const srcDir = path.join(ROOT, 'public', 'img', 'Gallery');
const outDir = path.join(srcDir, 'thumbs');
const widths = [640, 1280];
const quality = 72;

const isImage = (file) => /\.(png|jpe?g)$/i.test(file);

const buildThumb = async (inputPath, outputPath, width) => {
  await sharp(inputPath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
};

const run = async () => {
  await fs.mkdir(outDir, { recursive: true });

  const files = (await fs.readdir(srcDir))
    .filter(isImage)
    .filter((file) => file.toLowerCase() !== 'thumbs');

  for (const file of files) {
    const inputPath = path.join(srcDir, file);
    const base = file.replace(/\.[^.]+$/, '');
    for (const width of widths) {
      const outputPath = path.join(outDir, `${base}-${width}.webp`);
      await buildThumb(inputPath, outputPath, width);
    }
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
