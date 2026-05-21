const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

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

function slugify(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function assertValidSlug(slug, label) {
  if (!slug) {
    throw new Error(`${label} is required.`);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${label} must be kebab-case (example: socialmedia-portfolio).`);
  }
}

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.html', '.css', '.js', '.json', '.yml', '.yaml', '.md', '.txt'].includes(ext);
}

function walkFiles(dirPath, out) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  entries.forEach((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      return;
    }

    const abs = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(abs, out);
      return;
    }

    if (entry.isFile() && isTextFile(abs)) {
      out.push(abs);
    }
  });
}

function replaceAll(content, fromValue, toValue) {
  if (!fromValue || fromValue === toValue) {
    return { content, changed: false };
  }

  if (!content.includes(fromValue)) {
    return { content, changed: false };
  }

  return {
    content: content.split(fromValue).join(toValue),
    changed: true,
  };
}

function run() {
  const oldSlugRaw = argValue('--old-slug', '');
  const newSlugRaw = argValue('--new-slug', '');
  const pageName = argValue('--page-name', '');
  const dryRun = hasFlag('--dry-run');

  const oldSlug = slugify(oldSlugRaw);
  const newSlug = slugify(newSlugRaw);

  assertValidSlug(oldSlug, 'old-slug');
  assertValidSlug(newSlug, 'new-slug');

  if (oldSlug === newSlug) {
    throw new Error('old-slug and new-slug must be different.');
  }

  const oldPageDir = path.resolve(rootDir, 'pages', oldSlug);
  const newPageDir = path.resolve(rootDir, 'pages', newSlug);
  const oldPageJson = path.resolve(rootDir, 'content/pages', `${oldSlug}.json`);
  const newPageJson = path.resolve(rootDir, 'content/pages', `${newSlug}.json`);

  if (!fs.existsSync(oldPageDir)) {
    throw new Error(`Page folder not found: pages/${oldSlug}`);
  }

  if (!fs.existsSync(oldPageJson)) {
    throw new Error(`Page JSON not found: content/pages/${oldSlug}.json`);
  }

  if (fs.existsSync(newPageDir)) {
    throw new Error(`Target folder already exists: pages/${newSlug}`);
  }

  if (fs.existsSync(newPageJson)) {
    throw new Error(`Target JSON already exists: content/pages/${newSlug}.json`);
  }

  const files = [];
  walkFiles(rootDir, files);

  const replacements = [
    { from: `/pages/${oldSlug}/`, to: `/pages/${newSlug}/` },
    { from: `pages/${oldSlug}/`, to: `pages/${newSlug}/` },
    { from: `../${oldSlug}/`, to: `../${newSlug}/` },
    { from: `content/pages/${oldSlug}.json`, to: `content/pages/${newSlug}.json` },
    { from: `\"page_slug\": \"${oldSlug}\"`, to: `\"page_slug\": \"${newSlug}\"` },
  ];

  const changedFiles = [];

  files.forEach((filePath) => {
    const original = fs.readFileSync(filePath, 'utf8');
    let next = original;
    let changed = false;

    replacements.forEach((item) => {
      const result = replaceAll(next, item.from, item.to);
      next = result.content;
      if (result.changed) {
        changed = true;
      }
    });

    if (changed) {
      changedFiles.push(path.relative(rootDir, filePath));
      if (!dryRun) {
        fs.writeFileSync(filePath, next, 'utf8');
      }
    }
  });

  if (!dryRun) {
    fs.renameSync(oldPageDir, newPageDir);
    fs.renameSync(oldPageJson, newPageJson);

    const pageJsonRaw = fs.readFileSync(newPageJson, 'utf8');
    let pageJson;
    try {
      pageJson = JSON.parse(pageJsonRaw);
    } catch (_err) {
      throw new Error(`Failed to parse JSON after rename: content/pages/${newSlug}.json`);
    }

    pageJson.page_slug = newSlug;
    if (pageName && pageName.trim()) {
      pageJson.page_name = pageName.trim();
    }

    fs.writeFileSync(newPageJson, JSON.stringify(pageJson, null, 2) + '\n', 'utf8');
  }

  console.log('Rename page slug summary:');
  console.log(`- old slug: ${oldSlug}`);
  console.log(`- new slug: ${newSlug}`);
  if (pageName && pageName.trim()) {
    console.log(`- page name set: ${pageName.trim()}`);
  }
  console.log(`- text files updated: ${changedFiles.length}`);
  if (changedFiles.length) {
    changedFiles.slice(0, 20).forEach((file) => console.log(`  - ${file}`));
    if (changedFiles.length > 20) {
      console.log(`  - ...and ${changedFiles.length - 20} more`);
    }
  }

  if (dryRun) {
    console.log('Dry run: no files or folders were renamed.');
  } else {
    console.log(`- renamed folder: pages/${oldSlug} -> pages/${newSlug}`);
    console.log(`- renamed JSON: content/pages/${oldSlug}.json -> content/pages/${newSlug}.json`);
  }
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
