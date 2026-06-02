(function () {
  var SCRIPT_URL = document.currentScript && document.currentScript.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("../../scripts/shared-site-chrome.js", window.location.href);

  var GLOBAL_CONTENT_URL = new URL("../content/global.json", SCRIPT_URL);
  var DEFAULT_CONTENT = {
    brand_name: "Sara Ruffini",
    brand_href: "/index.html",
    nav_home: "Home",
    nav_home_href: "/index.html",
    nav_projects: "Projects",
    nav_projects_href: "/pages/portfolio-main/code.html",
    nav_about: "About",
    nav_about_href: "/pages/about/index.html",
    nav_contact: "Contact",
    nav_contact_href: "/pages/contact/index.html",
    brand_role: "VIDEO EDITOR - CONTENT CREATOR",
    footer_contact: "sararuffini@gmail.com | +45 52 70 85 28 | Copenhagen"
  };

  var NAV_ITEMS = [
    { key: "home", textKey: "nav_home", hrefKey: "nav_home_href" },
    { key: "projects", textKey: "nav_projects", hrefKey: "nav_projects_href" },
    { key: "about", textKey: "nav_about", hrefKey: "nav_about_href" },
    { key: "contact", textKey: "nav_contact", hrefKey: "nav_contact_href" }
  ];

  function getActiveSection(pageKey) {
    if (pageKey === "homepage") {
      return "home";
    }

    if (pageKey === "about" || pageKey === "contact") {
      return pageKey;
    }

    return "projects";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderNavLink(item, content, activeSection) {
    var label = escapeHtml(content[item.textKey] || DEFAULT_CONTENT[item.textKey]);
    var href = escapeHtml(content[item.hrefKey] || DEFAULT_CONTENT[item.hrefKey]);
    var isActive = item.key === activeSection;
    var activeClass = isActive ? " active" : "";

    return [
      '<a class="scribble-hover' + activeClass + ' relative inline-block transition-all" href="' + href + '">',
      label,
      '<svg preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden="true">',
      '<path d="M0 5 Q 50 10 100 5"></path>',
      '</svg>',
      '</a>'
    ].join("");
  }

  function renderNav(nav, content, activeSection) {
    nav.innerHTML = [
      '<a class="shared-site-nav__brand text-2xl font-black uppercase tracking-tight hover:text-[#39e6d0] transition-colors" href="' + escapeHtml(content.brand_href || DEFAULT_CONTENT.brand_href) + '">',
      escapeHtml(content.brand_name || DEFAULT_CONTENT.brand_name),
      '</a>',
      '<div class="shared-site-nav__links hidden md:flex gap-8 lg:gap-12 font-bold text-sm uppercase tracking-wider items-center">',
      NAV_ITEMS.map(function (item) {
        return renderNavLink(item, content, activeSection);
      }).join(""),
      '</div>',
      '<button aria-label="Open menu" class="md:hidden text-3xl leading-none" type="button">☰</button>'
    ].join("");
  }

  function renderFooter(footer, content) {
    footer.innerHTML = [
      '<div class="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">',
      '<div class="space-y-4">',
      '<div>',
      '<h2>' + escapeHtml(content.brand_name || DEFAULT_CONTENT.brand_name) + '</h2>',
      '<p class="text-primary">' + escapeHtml(content.brand_role || DEFAULT_CONTENT.brand_role) + '</p>',
      '</div>',
      '<p class="text-gray-400" data-cms-text="footer_contact">' + escapeHtml(content.footer_contact || DEFAULT_CONTENT.footer_contact) + '</p>',
      '</div>',
      '<div class="flex flex-col md:items-end space-y-4">',
      '<div class="flex space-x-8 font-medium uppercase tracking-widest text-sm">',
      NAV_ITEMS.map(function (item) {
        return '<a href="' + escapeHtml(content[item.hrefKey] || DEFAULT_CONTENT[item.hrefKey]) + '">' + escapeHtml(content[item.textKey] || DEFAULT_CONTENT[item.textKey]) + '</a>';
      }).join(""),
      '</div>',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderChrome(content) {
    var pageKey = document.body && document.body.dataset ? document.body.dataset.cmsPage || "" : "";
    var activeSection = getActiveSection(pageKey);
    var navs = document.querySelectorAll(".shared-site-nav[data-shared-chrome]");
    var footers = document.querySelectorAll(".shared-site-footer[data-shared-chrome]");

    navs.forEach(function (nav) {
      renderNav(nav, content, activeSection);
    });

    footers.forEach(function (footer) {
      renderFooter(footer, content);
    });

    document.dispatchEvent(new CustomEvent("shared-site-chrome:ready"));
  }

  function loadContent() {
    if (!window.fetch) {
      renderChrome(DEFAULT_CONTENT);
      return;
    }

    window.fetch(GLOBAL_CONTENT_URL.toString())
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load global content");
        }

        return response.json();
      })
      .then(function (content) {
        renderChrome(Object.assign({}, DEFAULT_CONTENT, content || {}));
      })
      .catch(function () {
        renderChrome(DEFAULT_CONTENT);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadContent);
  } else {
    loadContent();
  }
})();