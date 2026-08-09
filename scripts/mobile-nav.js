(function () {
  var MOBILE_WIDTH = 767;
  var initializedNavs = new WeakSet();

  function isMobileViewport() {
    return window.innerWidth <= MOBILE_WIDTH;
  }

  function setupNav(nav) {
    if (initializedNavs.has(nav)) {
      return;
    }

    var button = nav.querySelector('button[aria-label="Open menu"]');
    var menu = nav.querySelector('div.hidden.md\\:flex');

    if (!button || !menu) {
      return;
    }

    initializedNavs.add(nav);

    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", menu.id || "primary-navigation");

    function closeMenu(restoreFocus) {
      nav.classList.remove("mobile-open");
      button.setAttribute("aria-expanded", "false");
      button.textContent = "☰";
      if (restoreFocus) {
        button.focus();
      }
    }

    button.addEventListener("click", function () {
      if (!isMobileViewport()) {
        return;
      }

      var willOpen = !nav.classList.contains("mobile-open");
      nav.classList.toggle("mobile-open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
      button.textContent = willOpen ? "✕" : "☰";
      if (willOpen) {
        window.requestAnimationFrame(function () {
          var firstLink = menu.querySelector("a");
          if (firstLink) {
            firstLink.focus();
          }
        });
      }
    });

    window.addEventListener("resize", function () {
      if (!isMobileViewport()) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu(nav.classList.contains("mobile-open"));
      }
    });

    var navLinks = menu.querySelectorAll("a");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (isMobileViewport()) {
          closeMenu();
        }
      });
    });
  }

  function initializeSharedNavs() {
    var navs = document.querySelectorAll(".shared-site-nav");
    navs.forEach(setupNav);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeSharedNavs();
  });

  document.addEventListener("shared-site-chrome:ready", function () {
    initializeSharedNavs();
  });
})();
