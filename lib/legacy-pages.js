import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const ROUTES = [
  { route: "/", file: "index.html" },
  { route: "/index.html", file: "index.html" },
  { route: "/workspace.html", file: "workspace.html" },
  { route: "/pages/homepage/code.html", file: "pages/homepage/code.html" },
  { route: "/pages/projects", file: "pages/projects/code.html" },
  { route: "/pages/projects/code.html", file: "pages/projects/code.html" },
  { route: "/pages/portfolio-main/code.html", file: "pages/projects/code.html" },
  { route: "/pages/about/index.html", file: "pages/about/index.html" },
  { route: "/pages/contact/index.html", file: "pages/contact/index.html" },
  { route: "/pages/socialmedia-portfolio/index.html", file: "pages/socialmedia-portfolio/index.html" },
  { route: "/pages/graphics/index.html", file: "pages/graphics/index.html" },
  { route: "/pages/weber-grillinspiration/index.html", file: "pages/weber-grillinspiration/index.html" },
  { route: "/pages/video-v1/index.html", file: "pages/video-v1/index.html" },
  { route: "/pages/video-v2/index.html", file: "pages/video-v2/index.html" },
  { route: "/pages/app-v1/index.html", file: "pages/app-v1/index.html" },
  { route: "/pages/app-v2/index.html", file: "pages/app-v2/index.html" },
  { route: "/pages/app-showcase/index.html", file: "pages/app-showcase/index.html" },
  { route: "/pages/cocktail-photography/index.html", file: "pages/cocktail-photography/index.html" },
  { route: "/pages/shooting-cocktails/index.html", file: "pages/shooting-cocktails/index.html" },
  { route: "/pages/neon-vibes-web/index.html", file: "pages/neon-vibes-web/index.html" },
  { route: "/pages/webpage-portfolio/index.html", file: "pages/webpage-portfolio/index.html" },
  { route: "/pages/coming-soon/index.html", file: "pages/coming-soon/index.html" },
];

const ROUTE_BY_PATH = new Map(ROUTES.map((entry) => [entry.route, entry]));

export function getLegacyRoutes() {
  return ROUTES;
}

export function getRouteFromSegments(segments = []) {
  if (!segments.length) {
    return "/";
  }

  return `/pages/${segments.join("/")}`;
}

export function getLegacyPageByRoute(route) {
  const entry = ROUTE_BY_PATH.get(route);

  if (!entry) {
    return null;
  }

  return readLegacyPage(entry);
}

export function getLegacyMetadata(route) {
  const page = getLegacyPageByRoute(route);
  if (!page) {
    return {};
  }

  return {
    title: page.title || "Sara Ruffini",
  };
}

function readLegacyPage(entry) {
  const absolutePath = path.join(ROOT, entry.file);
  const source = fs.readFileSync(absolutePath, "utf8");
  const title = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const bodyMatch = source.match(/<body\b([^>]*)>([\s\S]*?)<\/body>/i);

  if (!bodyMatch) {
    throw new Error(`No body tag found in ${entry.file}`);
  }

  const bodyAttrs = bodyMatch[1];
  const inlineStyles = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
  const bodyClass = getAttribute(bodyAttrs, "class") || "";
  const pageKey = getAttribute(bodyAttrs, "data-cms-page") || slugFromFile(entry.file);
  let html = bodyMatch[2];

  html = normalizeRelativeUrls(html, entry.file);

  const scripts = [];
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, inlineCode) => {
    const src = getAttribute(attrs, "src");

    scripts.push({
      src: src ? normalizeUrl(src, entry.file) : "",
      code: src ? "" : inlineCode,
      attrs,
    });

    return "";
  });

  return {
    route: entry.route,
    file: entry.file,
    title,
    bodyClass,
    pageKey,
    html,
    inlineStyles,
    scripts,
  };
}

function getAttribute(attrs, name) {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = attrs.match(re);
  return match ? match[2] || match[3] || match[4] || "" : "";
}

function normalizeRelativeUrls(html, file) {
  return html.replace(/(^|[\s<])(src|href|poster)\s*=\s*("([^"]*)"|'([^']*)')/gi, (full, prefix, attr, quoted, doubleValue, singleValue) => {
    const value = doubleValue ?? singleValue ?? "";
    const quote = quoted.startsWith("'") ? "'" : "\"";
    return `${prefix}${attr}=${quote}${normalizeUrl(value, file)}${quote}`;
  });
}

function normalizeUrl(value, file) {
  if (!value || /^(?:https?:|mailto:|tel:|data:|blob:|#|\/\/)/i.test(value)) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  const dirname = path.posix.dirname(file).replace(/^\.$/, "");
  const basePath = dirname ? `/${dirname}/` : "/";
  const url = new URL(value, `https://legacy.local${basePath}`);
  return `${url.pathname}${url.search}${url.hash}`;
}

function slugFromFile(file) {
  if (file === "index.html") {
    return "homepage";
  }

  if (!file.includes("/")) {
    return file.replace(/\.html$/i, "");
  }

  return file.split("/").at(-2) || "homepage";
}
