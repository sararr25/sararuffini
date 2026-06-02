const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.resolve(__dirname, '..');

function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function walkFiles(dir, collected) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, collected);
      return;
    }
    collected.push(fullPath);
  });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function isImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.avif'].includes(ext);
}

async function createVariants(inputPath, outputDir, quality) {
  const metadata = await sharp(inputPath).metadata();
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const relDir = path.dirname(path.relative(path.resolve(rootDir, 'assets/media'), inputPath));
  const outDir = path.join(outputDir, relDir);
  ensureDir(outDir);

  const targets = [
    { suffix: 'thumb', width: 480 },
    { suffix: 'medium', width: 960 },
    { suffix: 'full', width: 1600 }
  ];

  const variants = [];

  for (const target of targets) {
    const width = metadata.width ? Math.min(metadata.width, target.width) : target.width;
    const outFile = path.join(outDir, `${baseName}.${target.suffix}.webp`);

    await sharp(inputPath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(outFile);

    const outStats = fs.statSync(outFile);
    variants.push({
      name: target.suffix,
      width,
      file: toPosix(path.relative(rootDir, outFile)),
      bytes: outStats.size
    });
  }

  return {
    original: toPosix(path.relative(rootDir, inputPath)),
    original_bytes: fs.statSync(inputPath).size,
    variants
  };
}

async function run() {
  const inputArg = argValue('--input', 'assets/media');
  const outputArg = argValue('--output', 'assets/media/optimized');
  const qualityArg = Number(argValue('--quality', '80'));

  const inputDir = path.resolve(rootDir, inputArg);
  const outputDir = path.resolve(rootDir, outputArg);

  if (!fs.existsSync(inputDir)) {
    throw new Error(`Input folder not found: ${inputDir}`);
  }

  ensureDir(outputDir);

  const allFiles = [];
  walkFiles(inputDir, allFiles);

  const imageFiles = allFiles.filter((filePath) => {
    if (!isImage(filePath)) {
      return false;
    }

    const rel = toPosix(path.relative(rootDir, filePath));
    const outRel = toPosix(path.relative(rootDir, outputDir));
    return !rel.startsWith(`${outRel}/`);
  });

  const manifest = {
    generated_at: new Date().toISOString(),
    quality: qualityArg,
    input: toPosix(path.relative(rootDir, inputDir)),
    output: toPosix(path.relative(rootDir, outputDir)),
    images: []
  };

  for (const imagePath of imageFiles) {
    const item = await createVariants(imagePath, outputDir, qualityArg);
    manifest.images.push(item);
  }

  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`Optimized ${manifest.images.length} images.`);
  console.log(`Manifest: ${toPosix(path.relative(rootDir, manifestPath))}`);
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
