(function () {
  function getByPath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      return acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined;
    }, obj);
  }

  function normalizeReelUrl(rawUrl) {
    if (typeof rawUrl !== 'string') {
      return rawUrl;
    }

    var trimmedUrl = rawUrl.trim();
    if (!trimmedUrl) {
      return trimmedUrl;
    }

    var parsedUrl;
    try {
      parsedUrl = new URL(trimmedUrl, window.location.origin);
    } catch (err) {
      return trimmedUrl;
    }

    var host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();
    var path = parsedUrl.pathname;

    if (host === 'instagram.com' || host.slice(-14) === '.instagram.com') {
      if (path.indexOf('/embed/') !== -1 || /\/embed\/?$/.test(path)) {
        return parsedUrl.toString();
      }

      var instagramMatch = path.match(/\/(reel|p|tv)\/([^/?#]+)/);
      if (instagramMatch) {
        return 'https://www.instagram.com/' + instagramMatch[1] + '/' + instagramMatch[2] + '/embed';
      }
    }

    if (host === 'tiktok.com' || host.slice(-11) === '.tiktok.com') {
      if (path.indexOf('/embed/') !== -1) {
        return parsedUrl.toString();
      }

      var tiktokMatch = path.match(/\/video\/(\d+)/);
      if (tiktokMatch) {
        return 'https://www.tiktok.com/embed/v2/' + tiktokMatch[1];
      }
    }

    return parsedUrl.toString();
  }

  function applyContent(data) {
    document.querySelectorAll('[data-cms-text]').forEach(function (node) {
      var key = node.getAttribute('data-cms-text');
      var value = getByPath(data, key);
      if (typeof value === 'string') {
        node.textContent = value;
      }
    });

    document.querySelectorAll('[data-cms-html]').forEach(function (node) {
      var key = node.getAttribute('data-cms-html');
      var value = getByPath(data, key);
      if (typeof value === 'string') {
        node.innerHTML = value;
      }
    });

    document.querySelectorAll('[data-cms-src]').forEach(function (node) {
      var key = node.getAttribute('data-cms-src');
      var value = getByPath(data, key);
      if (typeof value === 'string') {
        node.setAttribute('src', value);
      }
    });

    document.querySelectorAll('[data-cms-reel-src]').forEach(function (node) {
      var key = node.getAttribute('data-cms-reel-src');
      var value = getByPath(data, key);
      if (typeof value === 'string') {
        node.setAttribute('src', normalizeReelUrl(value));
      }
    });

    document.querySelectorAll('[data-cms-alt]').forEach(function (node) {
      var key = node.getAttribute('data-cms-alt');
      var value = getByPath(data, key);
      if (typeof value === 'string') {
        node.setAttribute('alt', value);
      }
    });

    document.querySelectorAll('[data-cms-bg]').forEach(function (node) {
      var key = node.getAttribute('data-cms-bg');
      var value = getByPath(data, key);
      if (typeof value === 'string') {
        node.style.backgroundImage = 'url("' + value.replace(/"/g, '\\"') + '")';
      }
    });

    document.querySelectorAll('[data-cms-href]').forEach(function (node) {
      var key = node.getAttribute('data-cms-href');
      var value = getByPath(data, key);
      if (typeof value === 'string') {
        node.setAttribute('href', value);
      }
    });

    document.querySelectorAll('[data-cms-title]').forEach(function (node) {
      var key = node.getAttribute('data-cms-title');
      var value = getByPath(data, key);
      if (typeof value === 'string') {
        node.setAttribute('title', value);
      }
    });
  }

  function init() {
    var page = document.body && document.body.dataset ? document.body.dataset.cmsPage : '';
    if (!page) {
      return;
    }

    fetch('/content/pages/' + page + '.json', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('No CMS content for page ' + page);
        }
        return response.json();
      })
      .then(applyContent)
      .catch(function () {
        // Silent fallback to hardcoded HTML defaults.
      });
  }

  init();
})();
