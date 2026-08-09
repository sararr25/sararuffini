"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_CONTENT = {
  brand_name: "Sara Ruffini",
  brand_href: "/index.html",
  nav_home: "Home",
  nav_home_href: "/index.html",
  nav_projects: "Projects",
  nav_projects_href: "/pages/projects",
  nav_about: "About",
  nav_about_href: "/pages/about/index.html",
  nav_contact: "Contact",
  nav_contact_href: "/pages/contact/index.html",
  brand_role: "VIDEO EDITOR - CONTENT CREATOR",
  footer_contact: "hello@sararuffini.com | +45 52 70 85 28 | Copenhagen",
};

const NAV_ITEMS = [
  { key: "home", textKey: "nav_home", hrefKey: "nav_home_href" },
  { key: "projects", textKey: "nav_projects", hrefKey: "nav_projects_href" },
  { key: "about", textKey: "nav_about", hrefKey: "nav_about_href" },
  { key: "contact", textKey: "nav_contact", hrefKey: "nav_contact_href" },
];

const LAB_LINK = "https://lab.sararuffini.com";

function activeSection(pageKey) {
  if (pageKey === "homepage") {
    return "home";
  }

  if (pageKey === "about" || pageKey === "contact") {
    return pageKey;
  }

  return "projects";
}

function Scribble() {
  return (
    <svg preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden="true">
      <path d="M0 5 Q 50 10 100 5" />
    </svg>
  );
}

function useGlobalContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    let isMounted = true;

    fetch("/content/global.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => {
        if (isMounted) {
          setContent({ ...DEFAULT_CONTENT, ...(data || {}) });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return content;
}

export function SiteNav({ pageKey }) {
  const content = useGlobalContent();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const section = useMemo(() => activeSection(pageKey), [pageKey]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 767) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <nav className={`shared-site-nav${open ? " mobile-open" : ""}`}>
      <a
        className="shared-site-nav__brand text-2xl font-black uppercase tracking-tight hover:text-[#39e6d0] transition-colors"
        href={content.brand_href || DEFAULT_CONTENT.brand_href}
      >
        {content.brand_name || DEFAULT_CONTENT.brand_name}
      </a>
      <div
        className="shared-site-nav__links hidden md:flex gap-8 lg:gap-12 font-bold text-sm uppercase tracking-wider items-center"
        id="primary-navigation"
        ref={menuRef}
      >
        {NAV_ITEMS.map((item) => {
          const active = item.key === section;
          return (
            <a
              className={`scribble-hover${active ? " active" : ""} relative inline-block transition-all`}
              href={content[item.hrefKey] || DEFAULT_CONTENT[item.hrefKey]}
              key={item.key}
              onClick={() => setOpen(false)}
            >
              {content[item.textKey] || DEFAULT_CONTENT[item.textKey]}
              <Scribble />
            </a>
          );
        })}
        <a
          className="shared-site-nav__lab"
          href={LAB_LINK}
          rel="noopener noreferrer"
          target="_blank"
        >
          &gt;_ LAB
        </a>
      </div>
      <button
        aria-label="Open menu"
        aria-controls="primary-navigation"
        aria-expanded={open}
        className="md:hidden text-3xl leading-none"
        ref={menuButtonRef}
        type="button"
        onClick={() => {
          if (window.innerWidth <= 767) {
            const willOpen = !open;
            setOpen(willOpen);
            if (willOpen) {
              window.requestAnimationFrame(() => menuRef.current?.querySelector("a")?.focus());
            }
          }
        }}
      >
        {open ? "✕" : "☰"}
      </button>
    </nav>
  );
}

export function SiteFooter() {
  const content = useGlobalContent();

  return (
    <footer className="shared-site-footer">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-4">
          <div>
            <h2>{content.brand_name || DEFAULT_CONTENT.brand_name}</h2>
            <p className="text-primary">{content.brand_role || DEFAULT_CONTENT.brand_role}</p>
          </div>
          <p className="text-gray-400" data-cms-text="footer_contact">
            {content.footer_contact || DEFAULT_CONTENT.footer_contact}
          </p>
        </div>
        <div className="flex flex-col md:items-end space-y-4">
          <div className="flex space-x-8 font-medium uppercase tracking-widest text-sm">
            {NAV_ITEMS.map((item) => (
              <a href={content[item.hrefKey] || DEFAULT_CONTENT[item.hrefKey]} key={item.key}>
                {content[item.textKey] || DEFAULT_CONTENT[item.textKey]}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
