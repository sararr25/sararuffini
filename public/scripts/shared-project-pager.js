(function () {
  var SCRIPT_URL = document.currentScript && document.currentScript.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("../../scripts/shared-project-pager.js", window.location.href);

  var PAGE_CONTENT_BASE = new URL("../content/pages/", SCRIPT_URL);

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderLink(direction, content) {
    var isNext = direction === "next";
    var href = content[direction + "_project_href"] || "#";
    var label = content[direction + "_project_label"] || (isNext ? "Next Project" : "Previous Project");
    var title = content[direction + "_project_title"] || "";
    var icon = isNext ? "arrow_forward" : "arrow_back";

    return [
      '<a class="shared-project-pager__link shared-project-pager__link--' + direction + '" href="' + escapeHtml(href) + '">',
      isNext ? '' : '<span class="material-icons shared-project-pager__icon" aria-hidden="true">' + icon + '</span>',
      '<span class="shared-project-pager__meta">',
      '<span class="shared-project-pager__eyebrow">' + escapeHtml(label) + '</span>',
      '<span class="shared-project-pager__title">' + escapeHtml(title) + '</span>',
      '</span>',
      isNext ? '<span class="material-icons shared-project-pager__icon" aria-hidden="true">' + icon + '</span>' : '',
      '</a>'
    ].join('');
  }

  function renderPager(node, content) {
    if (!content.prev_project_href && !content.next_project_href) {
      node.remove();
      return;
    }

    node.innerHTML = [
      content.prev_project_href ? renderLink("prev", content) : '',
      content.next_project_href ? renderLink("next", content) : ''
    ].join('');
  }

  function loadPager() {
    var body = document.body;
    var pageKey = body && body.dataset ? body.dataset.cmsPage : "";
    var pagerNodes = document.querySelectorAll("[data-shared-project-pager]");

    if (!pageKey || !pagerNodes.length || !window.fetch) {
      return;
    }

    var pageUrl = new URL(pageKey + ".json", PAGE_CONTENT_BASE);
    window.fetch(pageUrl.toString())
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load pager content");
        }
        return response.json();
      })
      .then(function (content) {
        pagerNodes.forEach(function (node) {
          renderPager(node, content || {});
        });
      })
      .catch(function () {
        pagerNodes.forEach(function (node) {
          node.remove();
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPager);
  } else {
    loadPager();
  }
})();