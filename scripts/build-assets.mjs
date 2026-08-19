// Regenerates every derivative the site actually serves, from the masters kept under
// asset-masters/. That directory deliberately sits outside public/, so Vite cannot copy
// the 50+ MB source files into the production site. Run this after adding or replacing
// artwork:
//
//     npm run assets
//
// The outputs are committed rather than produced during `vite build`, so a normal build
// (and anyone cloning to make a copy edit) never needs sharp or a native toolchain.
//
// Two rules shape the sizes below.
//
// 1. Nothing is emitted larger than the biggest box CSS can put it in, times the device
//    pixel ratio that box can plausibly meet. A 2400px-wide source behind a 118px card is
//    97% waste no encoder can recover.
// 2. AVIF first, WebP as the fallback. Every browser that can run this app takes WebP, so
//    the original PNG/JPEG never has to be a fallback and never has to ship.
//
// Quality is set per family, not globally: line art and flat colour survive aggression
// that photographs and page renders full of small text do not. `npm run assets -- --check`
// re-reads each output and prints its SSIM against the master so a bad setting is caught
// as a number rather than by eye.

import { execFileSync } from 'node:child_process';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const FORCE = process.argv.includes('--force');

sharp.cache(false);
sharp.concurrency(Math.max(1, (await import('node:os')).cpus().length - 1));

// ---------------------------------------------------------------- encoder settings
//
// `effort`/`cpuEffort` are at or near maximum throughout. This script runs by hand a
// few times a year, so trading a minute of encode time for bytes on every future page
// load is not a close call.
const AVIF = (quality) => ({
  quality,
  effort: 9,
  chromaSubsampling: '4:4:4', // 4:2:0 smears saturated edges — costly on line art and text
});
const WEBP = (quality) => ({ quality, effort: 6, smartSubsample: true });

// Photographic or painterly artwork, viewed large. 58 is the point where AVIF stops
// being distinguishable from the source at 1:1 on these particular images (see --check).
const ART = { avif: AVIF(58), webp: WEBP(82) };
// Thumbnails are never seen at 1:1, so they take more.
const THUMB = { avif: AVIF(50), webp: WEBP(78) };
// Page renders are mostly small black text on white. They look like they should need the
// most, and measure as needing the least: at q=50 they score SSIM 0.995 against the master
// (artwork at the same setting scores 0.95), because a page is large flat areas and a few
// hard edges. They are also shown downscaled — 1122px of render inside an 860px column —
// which hides what little the encoder does lose.
const PAGE = { avif: AVIF(50), webp: WEBP(82) };
// Video stills: photographic, shown at up to their native size.
const POSTER = { avif: AVIF(56), webp: WEBP(80) };
// Portraits, shown in a ~130px card. Faces tolerate less than landscapes do.
const PORTRAIT = { avif: AVIF(58), webp: WEBP(80) };
// Logos and line art: flat colour, hard edges, usually with alpha.
const FLAT = { avif: AVIF(60), webp: WEBP(88) };

// ------------------------------------------------------------------------- helpers

const listFiles = async (dir, pattern) => {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && pattern.test(e.name))
    .map((e) => join(dir, e.name))
    .sort();
};

const isStale = async (source, output) => {
  if (FORCE) return true;
  if (!existsSync(output)) return true;
  const [s, o] = await Promise.all([stat(source), stat(output)]);
  return s.mtimeMs > o.mtimeMs;
};

const stem = (file) => basename(file, extname(file));

let written = 0;
let skipped = 0;
let bytesOut = 0;
const report = [];

// Every path this run vouches for, so directories the script owns outright can be swept
// of anything left behind by an earlier set of sizes. Without this, changing a width list
// silently keeps shipping the old files: they stop being referenced but stay in the repo,
// and the next person reads the directory as the source of truth and believes them.
const produced = new Set();

// Every derivative that lands in public/, keyed by the logical group a component asks
// for. Written out at the end so srcset descriptors are read from the file that was
// actually encoded rather than from the number we hoped to encode — a portrait clamped
// by its long edge is not the width its filename suggests, and a wrong `w` makes the
// browser pick the wrong file.
const manifest = {};

/**
 * Emits one source at a set of sizes, in AVIF and WebP.
 *
 * `sizes` are caps, never upscales: a list like [640, 1280, 2560] against a 900px master
 * yields 640 and 900, and the duplicate collapses to one file. `by` decides what the cap
 * measures — 'width' for anything laid out by width (which srcset needs), 'longEdge' for
 * anything that has to fit inside a box, like the lightbox.
 */
const emit = async ({ source, outDir, name, sizes, quality, by = 'width', group }) => {
  const meta = await sharp(source, { limitInputPixels: false }).metadata();
  const measured = by === 'longEdge' ? Math.max(meta.width, meta.height) : meta.width;

  await mkdir(outDir, { recursive: true });

  const targets = [...new Set(sizes.map((s) => Math.min(s, measured)))].sort((a, b) => a - b);

  for (const target of targets) {
    for (const [format, options] of Object.entries(quality)) {
      const output = join(outDir, `${name}-${target}.${format}`);
      const relative = `/${output.replace(`${ROOT}/`, '').replace(/^public\//, '')}`;
      produced.add(output);

      let buffer;
      if (await isStale(source, output)) {
        const resize =
          by === 'longEdge'
            ? { width: target, height: target, fit: 'inside' }
            : { width: target };

        buffer = await sharp(source, { limitInputPixels: false })
          .resize({ ...resize, withoutEnlargement: true, kernel: 'lanczos3' })
          [format === 'avif' ? 'avif' : 'webp'](options)
          .toBuffer();

        await writeFile(output, buffer);
        written += 1;
        bytesOut += buffer.length;
      } else {
        skipped += 1;
        buffer = await sharp(output).toBuffer();
      }

      const out = await sharp(buffer).metadata();
      if (group) {
        manifest[group] ??= {};
        manifest[group][name] ??= { avif: [], webp: [] };
        const list = manifest[group][name][format];
        // A rerun re-reads existing files, so replace rather than append.
        const existing = list.findIndex((e) => e.src === relative);
        const entry = { src: relative, w: out.width, h: out.height };
        if (existing >= 0) list[existing] = entry;
        else list.push(entry);
        list.sort((a, b) => a.w - b.w);
      }

      report.push({
        output: output.replace(`${ROOT}/`, ''),
        bytes: buffer.length,
        source,
        width: out.width,
      });
    }
  }
};

// ------------------------------------------------------------------------- ssim
//
// Structural similarity against the master, computed on luma at the derivative's own
// resolution (the master is resampled to match first, so this scores the encoder rather
// than the resize). 8x8 windows, the usual constants.
//
// Read it as a relative signal, not a grade. SSIM is harshest on exactly what a lossy
// encoder is supposed to discard: the pencil tooth and paper grain across the flat areas
// of the concept art score around 0.93 while being pixel-for-pixel indistinguishable from
// the master at 1:1, and the report pages — large flat fields and hard type, the thing
// that intuitively seems hardest — sail past 0.99. What the number is good for is catching
// a setting that has moved: compare a file against its own previous score, and treat a
// sudden drop as the thing to go and look at.
const ssim = async (masterPath, derivativePath) => {
  const target = await sharp(derivativePath).metadata();
  const toGray = (input) =>
    sharp(input, { limitInputPixels: false })
      .resize(target.width, target.height, { fit: 'fill', kernel: 'lanczos3' })
      .flatten({ background: '#ffffff' })
      .greyscale()
      .raw()
      .toBuffer();

  const [a, b] = await Promise.all([toGray(masterPath), toGray(derivativePath)]);
  const { width, height } = target;
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;
  const win = 8;
  let total = 0;
  let windows = 0;

  for (let y = 0; y + win <= height; y += win) {
    for (let x = 0; x + win <= width; x += win) {
      let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
      for (let j = 0; j < win; j++) {
        for (let i = 0; i < win; i++) {
          const idx = (y + j) * width + (x + i);
          const va = a[idx];
          const vb = b[idx];
          sa += va; sb += vb; saa += va * va; sbb += vb * vb; sab += va * vb;
        }
      }
      const n = win * win;
      const ma = sa / n;
      const mb = sb / n;
      const va = saa / n - ma * ma;
      const vb = sbb / n - mb * mb;
      const cab = sab / n - ma * mb;
      total +=
        ((2 * ma * mb + C1) * (2 * cab + C2)) /
        ((ma * ma + mb * mb + C1) * (va + vb + C2));
      windows += 1;
    }
  }
  return windows ? total / windows : 1;
};

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

// ------------------------------------------------------------------------- video
//
// ffmpeg is the one tool here that is not an npm dependency. It is only needed when a clip
// changes, so a missing binary is a skip with a note rather than a failure — the images,
// which is what the pipeline is mostly for, still build.
const CLIP_WIDTH = 960;
const CLIP_CRF = 30;

const hasFfmpeg = () => {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const encodeClips = async () => {
  const sourceDir = join(ROOT, 'asset-masters/media');
  const outDir = join(ROOT, 'public/media');
  const masters = await listFiles(sourceDir, /\.mp4$/i);
  if (masters.length === 0) return;

  if (!hasFfmpeg()) {
    console.log('  ffmpeg not found — skipping clip re-encode (images are unaffected)');
    return;
  }

  for (const source of masters) {
    const output = join(outDir, `${stem(source)}-${CLIP_WIDTH}.mp4`);
    produced.add(output);
    if (!(await isStale(source, output))) {
      skipped += 1;
      continue;
    }
    execFileSync(
      'ffmpeg',
      [
        '-v', 'error', '-y',
        '-i', source,
        '-c:v', 'libx264',
        '-crf', String(CLIP_CRF),
        '-preset', 'slow',
        '-pix_fmt', 'yuv420p',
        // The clips are muted and looping; an audio track would be bytes nobody hears.
        '-an',
        // Moves the index to the front so playback can start before the file finishes.
        '-movflags', '+faststart',
        '-vf', `scale='min(${CLIP_WIDTH},iw)':-2`,
        output,
      ],
      { stdio: 'pipe' }
    );
    const { size } = await stat(output);
    written += 1;
    bytesOut += size;
    console.log(`  clip ${basename(output)} ${kb(size)}`);
  }
};

// ------------------------------------------------------------------------- jobs

const run = async () => {
  // --- Gallery -------------------------------------------------------------------
  // Two roles from one master. The grid tile is at most a third of the viewport, so it
  // tops out at 1280 for a 2x desktop; the lightbox fills 90vw/85vh, which on a tall
  // 2x display is ~2560 device px, and that is the only reason a >1280 file exists.
  const galleryMasters = await listFiles(
    join(ROOT, 'asset-masters/img/Gallery'),
    /\.(png|jpe?g)$/i,
  );
  for (const source of galleryMasters) {
    await emit({
      source,
      outDir: join(ROOT, 'public/img/Gallery/thumbs'),
      name: stem(source),
      sizes: [640, 960, 1280],
      quality: THUMB,
      group: 'galleryThumb',
    });
    await emit({
      source,
      outDir: join(ROOT, 'public/img/Gallery/full'),
      name: stem(source),
      sizes: [1600, 2560],
      quality: ART,
      by: 'longEdge',
      group: 'galleryFull',
    });
  }

  // --- Video posters --------------------------------------------------------------
  // The still is what every visitor pays for; the clip only downloads on hover. These
  // were shipping as PNG, which for photographic frames is close to worst case.
  for (const source of await listFiles(join(ROOT, 'asset-masters/media'), /\.png$/i)) {
    await emit({
      source,
      outDir: join(ROOT, 'public/media'),
      name: stem(source),
      sizes: [640, 1080],
      quality: POSTER,
      group: 'poster',
    });
  }

  // --- Report page renders --------------------------------------------------------
  // The viewer caps a page at 860 CSS px. 1122 is the master's own width and stays the
  // top tier: re-rendering the PDF larger is the only way past it, and 1122 already
  // covers a 2x display at ~1.3x linear.
  const reportMastersDir = join(ROOT, 'asset-masters/img/Reports');
  if (existsSync(reportMastersDir)) {
    const folders = (await readdir(reportMastersDir, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => join(reportMastersDir, e.name));
    for (const folder of folders) {
      for (const source of await listFiles(folder, /^p\d+\.webp$/i)) {
        await emit({
          source,
          outDir: join(ROOT, 'public/img/Reports', basename(folder)),
          name: stem(source),
          sizes: [860, 1122],
          quality: PAGE,
          group: `report:${basename(folder)}`,
        });
      }
    }
  }

  // --- Roster portraits -----------------------------------------------------------
  // Cards are 96-135 CSS px wide. 480 covers that to 4x; the 600x680 masters stay in
  // the repo as the crop of record but stop being served.
  // These stay under src/ rather than moving to public/, so Vite keeps content-hashing
  // them: swapping a headshot has to change its URL or caches serve the old face. They
  // are therefore reached by import.meta.glob, not by the manifest.
  const peopleDir = join(ROOT, 'src/assets/people');
  for (const source of await listFiles(peopleDir, /^[A-Za-z]+\.webp$/)) {
    await emit({
      source,
      outDir: join(peopleDir, 'sized'),
      name: stem(source),
      sizes: [160, 240, 320, 480],
      quality: PORTRAIT,
    });
  }

  // --- One-off page art -----------------------------------------------------------
  const singles = [
    {
      file: 'asset-masters/img/HexapodLegWireframe.png',
      outDir: 'public/img',
      sizes: [800, 1600],
      quality: FLAT,
    },
    {
      file: 'asset-masters/img/CrabOnBeach.webp',
      outDir: 'public/img',
      sizes: [380, 760],
      quality: ART,
    },
    {
      file: 'asset-masters/icons/CUGeoData_Logo.png',
      outDir: 'public/icons',
      sizes: [493, 985],
      quality: FLAT,
    },
    {
      file: 'asset-masters/icons/Modovolo_Logo.png',
      outDir: 'public/icons',
      sizes: [280, 500],
      quality: FLAT,
    },
  ];
  for (const { file, outDir, sizes, quality } of singles) {
    const source = join(ROOT, file);
    if (!existsSync(source)) continue;
    await emit({
      source,
      outDir: join(ROOT, outDir),
      name: stem(source),
      sizes,
      quality,
      group: 'art',
    });
  }

  // --- Hover clips ----------------------------------------------------------------
  // The tiles are at most 480 CSS px wide, so 960 covers a 2x display and anything above
  // that is bytes no screen resolves. CRF 30 was picked by measuring rather than by feel:
  // across the four clips it lands at 41-50% of the original for a mean SSIM of 0.976-0.986
  // against it, and the result is then drawn at half its encoded width, where what the
  // encoder did give up stops being resolvable at all.
  //
  // The originals stay in the repo, unserved, exactly as the gallery PNGs do — re-encoding
  // an already-compressed clip is lossy twice over, so the next pass has to start here.
  await encodeClips();

  // ------------------------------------------------------------- sweep stale files
  // Only directories that contain nothing but this script's output. Anywhere derivatives
  // sit next to their master — public/media, public/icons — is left alone.
  const owned = [
    join(ROOT, 'public/img/Gallery/thumbs'),
    join(ROOT, 'public/img/Gallery/full'),
    join(ROOT, 'src/assets/people/sized'),
  ];
  for (const dir of owned) {
    for (const file of await listFiles(dir, /\.(avif|webp)$/i)) {
      if (produced.has(file)) continue;
      await rm(file);
      console.log(`  removed stale ${file.replace(`${ROOT}/`, '')}`);
    }
  }

  // --------------------------------------------------------------- write manifest
  const manifestPath = join(ROOT, 'src/data/generated/images.json');
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`manifest -> ${manifestPath.replace(`${ROOT}/`, '')}`);

  // --------------------------------------------------------------------- summary
  console.log(`\nwrote ${written} file(s), ${kb(bytesOut)} total; ${skipped} already current`);

  if (!CHECK) {
    console.log('re-run with --check to score each output against its master');
    return;
  }

  console.log('\nSSIM vs master, lowest first (see the note above — grainy artwork sits');
  console.log('around 0.93 and still matches at 1:1; watch for changes, not absolutes):\n');
  const worst = [];
  for (const entry of report) {
    const score = await ssim(entry.source, join(ROOT, entry.output));
    worst.push({ ...entry, score });
  }
  worst.sort((a, b) => a.score - b.score);
  for (const entry of worst.slice(0, 25)) {
    console.log(`  ${entry.score.toFixed(4)}  ${kb(entry.bytes).padStart(7)}  ${entry.output}`);
  }
  const mean = worst.reduce((a, e) => a + e.score, 0) / (worst.length || 1);
  console.log(`\nmean SSIM ${mean.toFixed(4)} across ${worst.length} outputs`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
