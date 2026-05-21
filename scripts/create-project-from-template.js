const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const templateMap = {
  video: 'content/templates/video-template.json',
  graphics: 'content/templates/graphics-template.json',
  app: 'content/templates/app-template.json',
  photography: 'content/templates/photography-template.json',
  web: 'content/templates/web-template.json'
};

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

function normalizePayload(payload) {
  const out = Object.assign({}, payload);

  if (out.seo_title || out.seo_description || out.seo_image) {
    out.seo = {
      seo_title: out.seo_title || '',
      seo_description: out.seo_description || '',
      seo_image: out.seo_image || ''
    };
  }

  delete out.seo_title;
  delete out.seo_description;
  delete out.seo_image;
  delete out.template_name;

  return out;
}

function run() {
  const templateName = argValue('--template', '');
  const outputPathArg = argValue('--output', '');
  const force = hasFlag('--force');

  if (!templateName || !templateMap[templateName]) {
    throw new Error('Invalid template. Use --template video|graphics|app|photography|web');
  }

  if (!outputPathArg) {
    throw new Error('Missing output path. Example: --output content/pages/video-v3.json');
  }

  const templatePath = path.resolve(rootDir, templateMap[templateName]);
  const outputPath = path.resolve(rootDir, outputPathArg);

  if (fs.existsSync(outputPath) && !force) {
    throw new Error('Output file already exists. Use --force to overwrite.');
  }

  const templateRaw = fs.readFileSync(templatePath, 'utf8');
  const templateJson = JSON.parse(templateRaw);
  const normalized = normalizePayload(templateJson);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2) + '\n');

  const rel = outputPath.split(path.sep).join('/').replace(rootDir.split(path.sep).join('/') + '/', '');
  console.log(`Created project file from ${templateName} template: ${rel}`);
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
