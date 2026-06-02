"use client";

import { useEffect, useMemo, useRef } from "react";

export default function LegacyPage({ page }) {
  const rootRef = useRef(null);
  const scripts = useMemo(() => page.scripts, [page.scripts]);

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
      for (const script of scripts) {
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
  }, [page.route, scripts]);

  return (
    <div
      className={page.bodyClass}
      data-cms-page={page.pageKey}
      ref={rootRef}
      style={{ display: "contents" }}
      suppressHydrationWarning
    >
      {page.inlineStyles.map((style, index) => (
        <style dangerouslySetInnerHTML={{ __html: style }} key={index} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  );
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
