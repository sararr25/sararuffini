"use client";

import { useEffect, useMemo, useRef } from "react";
import { SiteFooter, SiteNav } from "./SiteChrome";

const CHROME_MARKER_RE = /<!--NEXT_CHROME_(NAV|FOOTER)-->/g;

export default function LegacyPage({ page }) {
  const rootRef = useRef(null);
  const parts = useMemo(() => splitChrome(page.html), [page.html]);

  useEffect(() => {
    const previousClass = document.body.className;
    const previousPage = document.body.getAttribute("data-cms-page");

    document.body.className = page.bodyClass;
    document.body.setAttribute("data-cms-page", page.pageKey);

    return () => {
      document.body.className = previousClass;
      if (previousPage) {
        document.body.setAttribute("data-cms-page", previousPage);
      } else {
        document.body.removeAttribute("data-cms-page");
      }
    };
  }, [page.bodyClass, page.pageKey]);

  useEffect(() => {
    let cancelled = false;
    const appendedScripts = [];

    async function runScripts() {
      for (const script of page.scripts) {
        if (cancelled) {
          return;
        }

        await appendScript(script, appendedScripts);
      }
    }

    runScripts();

    return () => {
      cancelled = true;
      appendedScripts.forEach((script) => script.remove());
    };
  }, [page.route, page.scripts]);

  return (
    <div className={page.bodyClass} data-cms-page={page.pageKey} ref={rootRef} suppressHydrationWarning>
      {page.inlineStyles.map((style, index) => (
        <style dangerouslySetInnerHTML={{ __html: style }} key={index} />
      ))}
      {parts.map((part, index) => {
        if (part.type === "nav") {
          return <SiteNav key={`${index}-nav`} pageKey={page.pageKey} />;
        }

        if (part.type === "footer") {
          return <SiteFooter key={`${index}-footer`} />;
        }

        return <div dangerouslySetInnerHTML={{ __html: part.html }} key={`${index}-html`} />;
      })}
    </div>
  );
}

function splitChrome(html) {
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = CHROME_MARKER_RE.exec(html))) {
    if (match.index > lastIndex) {
      parts.push({ type: "html", html: html.slice(lastIndex, match.index) });
    }

    parts.push({ type: match[1].toLowerCase() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < html.length) {
    parts.push({ type: "html", html: html.slice(lastIndex) });
  }

  return parts.filter((part) => part.type !== "html" || part.html.trim());
}

function appendScript(script, appendedScripts) {
  return new Promise((resolve) => {
    const node = document.createElement("script");
    node.async = false;

    if (script.src) {
      node.src = script.src;
      node.onload = () => resolve();
      node.onerror = () => resolve();
    } else {
      node.text = script.code || "";
    }

    appendedScripts.push(node);
    document.body.appendChild(node);

    if (!script.src) {
      resolve();
    }
  });
}
