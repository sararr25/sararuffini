(function () {
  function tokenizePath(path) {
    if (typeof path !== 'string' || !path.trim()) {
      return [];
    }

    var tokens = [];
    path.split('.').forEach(function (part) {
      var re = /([^\[\]]+)|\[(\d+)\]/g;
      var match;
      while ((match = re.exec(part)) !== null) {
        if (match[1]) {
          tokens.push(match[1]);
        } else if (typeof match[2] !== 'undefined') {
          tokens.push(Number(match[2]));
        }
      }
    });

    return tokens;
  }

  function getByPath(obj, path) {
    var tokens = tokenizePath(path);
    return tokens.reduce(function (acc, key) {
      if (acc === null || typeof acc === 'undefined') {
        return undefined;
      }
      return acc[key];
    }, obj);
  }

  function toAbsoluteUrl(rawUrl) {
    if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return '';
    }

    try {
      return new URL(rawUrl, window.location.origin).toString();
    } catch (err) {
      return rawUrl;
    }
  }

  function upsertMetaTag(attributeName, attributeValue, content) {
    if (typeof content !== 'string' || !content.trim()) {
      return;
    }

    var selector = 'meta[' + attributeName + '="' + attributeValue + '"]';
    var node = document.head.querySelector(selector);
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(attributeName, attributeValue);
      document.head.appendChild(node);
    }
    node.setAttribute('content', content.trim());
  }

  function applySeoMeta(allData, globalSeoData) {
    var pageSeo = allData && allData.seo ? allData.seo : {};
    var title = pageSeo.seo_title || allData.seo_title || globalSeoData.site_title || document.title;
    var description = pageSeo.seo_description || allData.seo_description || globalSeoData.site_description || '';
    var image = pageSeo.seo_image || allData.seo_image || globalSeoData.default_og_image || '';
    var twitterHandle = globalSeoData.twitter_handle || '';

    if (typeof title === 'string' && title.trim()) {
      document.title = title.trim();
    }

    upsertMetaTag('name', 'description', description);

    upsertMetaTag('property', 'og:type', 'website');
    upsertMetaTag('property', 'og:title', title || '');
    upsertMetaTag('property', 'og:description', description || '');
    upsertMetaTag('property', 'og:url', window.location.href);
    if (image) {
      upsertMetaTag('property', 'og:image', toAbsoluteUrl(image));
    }

    upsertMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    upsertMetaTag('name', 'twitter:title', title || '');
    upsertMetaTag('name', 'twitter:description', description || '');
    if (image) {
      upsertMetaTag('name', 'twitter:image', toAbsoluteUrl(image));
    }
    if (twitterHandle) {
      upsertMetaTag('name', 'twitter:site', twitterHandle);
    }
  }

  function applyByAttribute(allData, dataAttribute, applyValue) {
    document.querySelectorAll('[' + dataAttribute + ']').forEach(function (node) {
      var key = node.getAttribute(dataAttribute);
      var value = getByPath(allData, key);
      if (typeof value === 'string') {
        applyValue(node, value);
      }
    });
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

  function isDirectVideoUrl(rawUrl) {
    if (typeof rawUrl !== 'string') {
      return false;
    }

    var trimmedUrl = rawUrl.trim().toLowerCase();
    if (!trimmedUrl) {
      return false;
    }

    return /\.(mp4|webm|mov|m4v)(\?.*)?$/.test(trimmedUrl);
  }

  var globalData = {};
  var globalSeoData = {};

  function getPhoneItems(allData) {
    if (Array.isArray(allData.phones) && allData.phones.length) {
      return allData.phones;
    }

    // Backward compatibility for legacy socialmedia JSON shape.
    var legacyPhones = [];
    for (var i = 1; i <= 4; i += 1) {
      var reelKey = 'phone' + i + '_reel_url';
      var captionKey = 'phone' + i + '_caption';
      if (typeof allData[reelKey] === 'string' || typeof allData[captionKey] === 'string') {
        legacyPhones.push({
          phone_video_url: typeof allData[reelKey] === 'string' ? allData[reelKey] : '',
          phone_caption: typeof allData[captionKey] === 'string' ? allData[captionKey] : ''
        });
      }
    }

    return legacyPhones;
  }

  function applyContent(data) {
    // Merge with global data
    var allData = Object.assign({}, globalData, data);
    applySeoMeta(allData, globalSeoData);

    applyByAttribute(allData, 'data-cms-text', function (node, value) {
      node.textContent = value;
    });

    applyByAttribute(allData, 'data-cms-html', function (node, value) {
      node.innerHTML = value;
    });

    applyByAttribute(allData, 'data-cms-src', function (node, value) {
      node.setAttribute('src', value);
    });

    applyByAttribute(allData, 'data-cms-reel-src', function (node, value) {
      node.setAttribute('src', normalizeReelUrl(value));
    });

    applyByAttribute(allData, 'data-cms-alt', function (node, value) {
      node.setAttribute('alt', value);
    });

    applyByAttribute(allData, 'data-cms-bg', function (node, value) {
      node.style.backgroundImage = 'url("' + value.replace(/"/g, '\\"') + '")';
    });

    applyByAttribute(allData, 'data-cms-href', function (node, value) {
      node.setAttribute('href', value);
    });

    applyByAttribute(allData, 'data-cms-title', function (node, value) {
      node.setAttribute('title', value);
    });

    applyByAttribute(allData, 'data-cms-video-src', function (node, value) {
      if (value.trim()) {
        node.setAttribute('src', value);
      }
    });

    var phoneItems = getPhoneItems(allData);

    document.querySelectorAll('[data-phone-index]').forEach(function (container) {
      var index = Number(container.getAttribute('data-phone-index'));
      var item = phoneItems && phoneItems[index] ? phoneItems[index] : null;
      var value = item && typeof item.phone_video_url === 'string' ? item.phone_video_url.trim() : '';
      var iframe = container.querySelector('iframe[data-cms-phone-field="phone_video_url"]');
      var video = container.querySelector('video[data-cms-phone-field="phone_video_url"]');

      if (!video) {
        return;
      }

      if (iframe) {
        iframe.classList.add('hidden');
        iframe.removeAttribute('src');
      }

      if (!value || !isDirectVideoUrl(value)) {
        video.classList.add('hidden');
        video.pause();
        video.removeAttribute('src');
        video.load();
        return;
      }

      video.classList.remove('hidden');
      video.setAttribute('src', value);
    });

    document.querySelectorAll('[data-cms-phone-index]').forEach(function (node) {
      var field = node.getAttribute('data-cms-phone-field');
      if (field === 'phone_video_url') {
        return;
      }

      var index = node.getAttribute('data-cms-phone-index');
      if (phoneItems && phoneItems[index] && field) {
        var value = phoneItems[index][field];
        if (typeof value === 'string') {
          node.textContent = value;
        }
      }
    });
  }

  function init() {
    var page = document.body && document.body.dataset ? document.body.dataset.cmsPage : '';

    // Load global settings first.
    Promise.all([
      fetch('/content/global.json', { cache: 'no-store' })
        .then(function (response) {
          return response.ok ? response.json() : {};
        })
        .catch(function () {
          return {};
        }),
      fetch('/content/global-seo.json', { cache: 'no-store' })
        .then(function (response) {
          return response.ok ? response.json() : {};
        })
        .catch(function () {
          return {};
        })
    ]).then(function (results) {
      globalData = results[0] || {};
      globalSeoData = results[1] || {};

      // Load page-specific content after globals to avoid race conditions.
      if (!page) {
        applyContent({});
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
    });
  }

  init();
})();
