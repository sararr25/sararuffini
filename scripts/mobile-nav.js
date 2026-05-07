(function () {
  var MOBILE_WIDTH = 767;

  function isMobileViewport() {
    return window.innerWidth <= MOBILE_WIDTH;
  }

  function setupNav(nav) {
    var button = nav.querySelector('button[aria-label="Open menu"]');
    var menu = nav.querySelector('div.hidden.md\\:flex');

    if (!button || !menu) {
      return;
    }

    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-haspopup", "true");

    function closeMenu() {
      nav.classList.remove("mobile-open");
      button.setAttribute("aria-expanded", "false");
      button.textContent = "☰";
    }

    button.addEventListener("click", function () {
      if (!isMobileViewport()) {
        return;
      }

      var willOpen = !nav.classList.contains("mobile-open");
      nav.classList.toggle("mobile-open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
      button.textContent = willOpen ? "✕" : "☰";
    });

    window.addEventListener("resize", function () {
      if (!isMobileViewport()) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
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

  document.addEventListener("DOMContentLoaded", function () {
    var navs = document.querySelectorAll(".shared-site-nav");
    navs.forEach(setupNav);
  });
})();
