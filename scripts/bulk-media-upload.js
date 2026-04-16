const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const mediaRoot = path.join(rootDir, 'assets/media');

function argValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function isMedia(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return [
    '.jpg', '.jpeg', '.png', '.webp', '.tiff', '.avif',
    '.mp4', '.mov', '.webm', '.m4v', '.gif'
  ].includes(ext);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function uniqueTargetPath(targetDir, fileName) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);

  let candidate = path.join(targetDir, fileName);
  let index = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(targetDir, `${base}-${index}${ext}`);
    index += 1;
  }
  return candidate;
}

function listFiles(sourceDir) {
  return fs.readdirSync(sourceDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(sourceDir, entry.name));
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function run() {
  const sourceArg = argValue('--source', '');
  const quality = argValue('--quality', '80');
  const shouldOptimize = !hasFlag('--no-optimize');

  if (!sourceArg) {
    throw new Error('Missing source folder. Use --source /absolute/or/relative/path');
  }

  const sourceDir = path.resolve(rootDir, sourceArg);
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source folder not found: ${sourceDir}`);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const targetDir = path.join(mediaRoot, 'uploads', stamp);
  ensureDir(targetDir);

  const files = listFiles(sourceDir).filter(isMedia);

  if (!files.length) {
    console.log('No supported media files found in source folder.');
    return;
  }

  const copied = [];
  files.forEach((filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const base = path.basename(filePath, ext);
    const cleanName = `${sanitizeName(base)}${ext}`;
    const outPath = uniqueTargetPath(targetDir, cleanName);

    fs.copyFileSync(filePath, outPath);
    copied.push(outPath);
  });

  console.log(`Copied ${copied.length} media files to ${toPosix(path.relative(rootDir, targetDir))}.`);

  if (shouldOptimize) {
    const optimizeScript = path.join(rootDir, 'scripts', 'optimize-images.js');
    const result = spawnSync(process.execPath, [optimizeScript, '--input', toPosix(path.relative(rootDir, targetDir)), '--quality', quality], {
      cwd: rootDir,
      stdio: 'inherit'
    });

    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  }
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
