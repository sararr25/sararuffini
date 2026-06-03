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

  function resolvePageLinkPresets(target) {
    if (!target || typeof target !== 'object') {
      return;
    }

    if (Array.isArray(target)) {
      target.forEach(resolvePageLinkPresets);
      return;
    }

    Object.keys(target).forEach(function (key) {
      var value = target[key];
      if (value && typeof value === 'object') {
        resolvePageLinkPresets(value);
      }
    });

    Object.keys(target).forEach(function (key) {
      var value = target[key];
      if (typeof value !== 'string' || !value.trim()) {
        return;
      }

      if (/_href_page$/.test(key)) {
        var hrefKey = key.replace(/_page$/, '');
        var currentHref = typeof target[hrefKey] === 'string' ? target[hrefKey].trim() : '';
        if (!currentHref) {
          target[hrefKey] = value.trim();
        }
        return;
      }

      if (key === 'href_page') {
        var currentHrefRoot = typeof target.href === 'string' ? target.href.trim() : '';
        if (!currentHrefRoot) {
          target.href = value.trim();
        }
      }
    });
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
    var image = stripImageCrop(pageSeo.seo_image || allData.seo_image || globalSeoData.default_og_image || '');
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

  function isExternalHttpLink(href) {
    if (typeof href !== 'string' || !href.trim()) {
      return false;
    }

    var trimmed = href.trim();
    if (/^(#|mailto:|tel:|javascript:|data:)/i.test(trimmed)) {
      return false;
    }

    var resolved;
    try {
      resolved = new URL(trimmed, window.location.href);
    } catch (err) {
      return false;
    }

    if (!/^https?:$/i.test(resolved.protocol)) {
      return false;
    }

    return resolved.origin !== window.location.origin;
  }

  function applyAnchorTargetPolicy(anchor) {
    if (!anchor) {
      return;
    }

    var href = anchor.getAttribute('href') || '';
    var isExternal = isExternalHttpLink(href);

    if (isExternal) {
      anchor.setAttribute('target', '_blank');

      var rel = (anchor.getAttribute('rel') || '').trim();
      var relParts = rel ? rel.split(/\s+/) : [];
      if (relParts.indexOf('noopener') === -1) {
        relParts.push('noopener');
      }
      if (relParts.indexOf('noreferrer') === -1) {
        relParts.push('noreferrer');
      }
      anchor.setAttribute('rel', relParts.join(' ').trim());
      return;
    }

    if ((anchor.getAttribute('target') || '').toLowerCase() === '_blank') {
      anchor.removeAttribute('target');
    }

    var currentRel = (anchor.getAttribute('rel') || '').trim();
    if (!currentRel) {
      return;
    }

    var nextRel = currentRel
      .split(/\s+/)
      .filter(function (part) {
        var lower = part.toLowerCase();
        return lower !== 'noopener' && lower !== 'noreferrer';
      })
      .join(' ')
      .trim();

    if (nextRel) {
      anchor.setAttribute('rel', nextRel);
    } else {
      anchor.removeAttribute('rel');
    }
  }

  function applyLinkTargetPolicy(scope) {
    var root = scope && scope.querySelectorAll ? scope : document;
    root.querySelectorAll('a[href]').forEach(applyAnchorTargetPolicy);
  }

  function applyByAttribute(allData, dataAttribute, applyValue) {
    document.querySelectorAll('[' + dataAttribute + ']').forEach(function (node) {
      var key = node.getAttribute(dataAttribute);
      var value = getByPath(allData, key);
      if (typeof value === 'string') {
        applyValue(node, value, key);
      }
    });
  }

  function getSiblingCropPosition(allData, path) {
    var tokens = tokenizePath(path);
    if (!tokens.length || typeof tokens[tokens.length - 1] !== 'string') {
      return '';
    }

    tokens[tokens.length - 1] = tokens[tokens.length - 1] + '_crop_position';
    var value = tokens.reduce(function (acc, key) {
      if (acc === null || typeof acc === 'undefined') {
        return undefined;
      }
      return acc[key];
    }, allData);

    return typeof value === 'string' ? value : '';
  }

  function parseCropPosition(rawCrop) {
    if (typeof rawCrop !== 'string' || !rawCrop.trim()) {
      return null;
    }

    var match = rawCrop.trim().match(/^(\d{1,3}),(\d{1,3})(?:,(\d{1,3}))?(?:,(-?\d{1,3}))?$/);
    if (!match) {
      return null;
    }

    return {
      x: Math.max(0, Math.min(100, Number(match[1]))),
      y: Math.max(0, Math.min(100, Number(match[2]))),
      zoom: Math.max(100, Math.min(280, Number(match[3]) || 100)),
      rotate: Math.max(-180, Math.min(180, Number(match[4]) || 0))
    };
  }

  function parseImageCrop(rawUrl) {
    if (typeof rawUrl !== 'string') {
      return null;
    }

    var match = rawUrl.match(/#(?:.*&)?crop=(\d{1,3}),(\d{1,3})(?:,(\d{1,3}))?(?:,(-?\d{1,3}))?(?:&.*)?$/);
    if (!match) {
      return null;
    }

    var x = Math.max(0, Math.min(100, Number(match[1])));
    var y = Math.max(0, Math.min(100, Number(match[2])));
    return {
      x: x,
      y: y,
      zoom: Math.max(100, Math.min(280, Number(match[3]) || 100)),
      rotate: Math.max(-180, Math.min(180, Number(match[4]) || 0))
    };
  }

  function stripImageCrop(rawUrl) {
    if (typeof rawUrl !== 'string') {
      return rawUrl;
    }

    return rawUrl.replace(/#(?:.*&)?crop=\d{1,3},\d{1,3}(?:,\d{1,3})?(?:,-?\d{1,3})?(?:&.*)?$/, '');
  }

  function applyImageCrop(node, rawUrl, rawCrop) {
    var crop = parseCropPosition(rawCrop) || parseImageCrop(rawUrl);
    if (!crop) {
      return;
    }

    var position = crop.x + '% ' + crop.y + '%';
    if (node.tagName === 'IMG' || node.tagName === 'VIDEO') {
      node.style.objectPosition = position;
      node.style.transformOrigin = position;
      if (crop.zoom !== 100 || crop.rotate !== 0) {
        node.style.transform = 'scale(' + (crop.zoom / 100) + ') rotate(' + crop.rotate + 'deg)';
      }
    } else {
      node.style.backgroundPosition = position;
      node.style.backgroundSize = 'cover';
    }
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
        return 'https://www.instagram.com/' + instagramMatch[1] + '/' + instagramMatch[2] + '/embed?autoplay=1';
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

  function normalizeEmbedUrl(rawUrl) {
    if (typeof rawUrl !== 'string') {
      return '';
    }

    var trimmedUrl = rawUrl.trim();
    if (!trimmedUrl) {
      return '';
    }

    var parsedUrl;
    try {
      parsedUrl = new URL(trimmedUrl, window.location.origin);
    } catch (err) {
      return trimmedUrl;
    }

    var host = parsedUrl.hostname.replace(/^www\./, '').toLowerCase();
    var path = parsedUrl.pathname;

    if (host === 'youtube.com' || host.slice(-12) === '.youtube.com') {
      if (path.indexOf('/embed/') === 0) {
        return parsedUrl.toString();
      }

      var watchId = parsedUrl.searchParams.get('v');
      if (watchId) {
        return 'https://www.youtube.com/embed/' + watchId;
      }
    }

    if (host === 'youtu.be') {
      var shortId = path.replace(/^\//, '').split('/')[0];
      if (shortId) {
        return 'https://www.youtube.com/embed/' + shortId;
      }
    }

    if (host === 'vimeo.com' || host.slice(-10) === '.vimeo.com') {
      if (path.indexOf('/video/') === 0) {
        return parsedUrl.toString();
      }

      var vimeoIdMatch = path.match(/^\/(\d+)/);
      if (vimeoIdMatch) {
        return 'https://player.vimeo.com/video/' + vimeoIdMatch[1];
      }
    }

    return normalizeReelUrl(trimmedUrl);
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

  function applySelectorOverrides(allData) {
    if (!Array.isArray(allData.selector_overrides)) {
      return;
    }

    allData.selector_overrides.forEach(function (entry) {
      if (!entry || typeof entry.selector !== 'string') {
        return;
      }

      var selector = entry.selector.trim();
      var type = typeof entry.type === 'string' ? entry.type.trim().toLowerCase() : '';
      var value = typeof entry.value === 'string' ? entry.value : '';

      if (!selector || !type) {
        return;
      }

      var nodes;
      try {
        nodes = document.querySelectorAll(selector);
      } catch (err) {
        return;
      }

      nodes.forEach(function (node) {
        if (type === 'text') {
          node.textContent = value;
          return;
        }

        if (type === 'html') {
          node.innerHTML = value;
          return;
        }

        if (type === 'src') {
          node.setAttribute('src', stripImageCrop(value));
          applyImageCrop(node, value);
          return;
        }

        if (type === 'href') {
          node.setAttribute('href', value);
          return;
        }

        if (type === 'alt') {
          node.setAttribute('alt', value);
          return;
        }

        if (type === 'bg') {
          node.style.backgroundImage = 'url("' + stripImageCrop(value).replace(/"/g, '\\"') + '")';
          applyImageCrop(node, value);
          return;
        }

        if (type === 'append_html') {
          node.insertAdjacentHTML('beforeend', value);
          return;
        }

        if (type === 'prepend_html') {
          node.insertAdjacentHTML('afterbegin', value);
          return;
        }

        if (type === 'remove') {
          node.remove();
        }
      });
    });
  }

  function buildMediaBlockNode(item) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    var mediaKind = typeof item.media_kind === 'string' ? item.media_kind.trim().toLowerCase() : '';
    var mediaUploadImage = typeof item.media_upload_image === 'string' ? item.media_upload_image.trim() : '';
    var mediaUploadVideo = typeof item.media_upload_video === 'string' ? item.media_upload_video.trim() : '';
    var mediaUrl = typeof item.media_url === 'string' ? item.media_url.trim() : '';
    var embedHtml = typeof item.embed_html === 'string' ? item.embed_html.trim() : '';
    var className = typeof item.class_name === 'string' ? item.class_name.trim() : '';
    var altText = typeof item.alt_text === 'string' ? item.alt_text : '';
    var captionHtml = typeof item.caption_html === 'string' ? item.caption_html.trim() : '';
    var linkUrl = typeof item.link_url === 'string' ? item.link_url.trim() : '';

    var root = document.createElement('div');
    root.className = 'cms-media-block';
    if (className) {
      root.className += ' ' + className;
    }

    var mediaNode = null;

    if (mediaKind === 'image') {
      var imageSrc = mediaUploadImage || mediaUrl;
      if (!imageSrc) {
        return null;
      }

      mediaNode = document.createElement('img');
      mediaNode.setAttribute('src', stripImageCrop(imageSrc));
      applyImageCrop(mediaNode, imageSrc);
      mediaNode.setAttribute('loading', 'lazy');
      if (altText) {
        mediaNode.setAttribute('alt', altText);
      } else {
        mediaNode.setAttribute('alt', '');
      }
    }

    if (mediaKind === 'video') {
      var videoSrc = mediaUploadVideo || mediaUrl;
      if (!videoSrc) {
        return null;
      }

      mediaNode = document.createElement('video');
      mediaNode.setAttribute('src', videoSrc);
      mediaNode.setAttribute('controls', 'controls');
      mediaNode.setAttribute('playsinline', 'playsinline');
      mediaNode.setAttribute('preload', 'metadata');
    }

    if (mediaKind === 'embed') {
      if (embedHtml) {
        var embedWrapper = document.createElement('div');
        embedWrapper.innerHTML = embedHtml;
        mediaNode = embedWrapper;
      } else {
        var embedSrc = normalizeEmbedUrl(mediaUrl || mediaUploadVideo);
        if (!embedSrc) {
          return null;
        }

        mediaNode = document.createElement('iframe');
        mediaNode.setAttribute('src', embedSrc);
        mediaNode.setAttribute('allowfullscreen', 'allowfullscreen');
        mediaNode.setAttribute('loading', 'lazy');
        mediaNode.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        mediaNode.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
        mediaNode.setAttribute('title', altText || 'Embedded video');
      }
    }

    if (!mediaNode) {
      return null;
    }

    if (linkUrl) {
      var link = document.createElement('a');
      link.setAttribute('href', linkUrl);
      applyAnchorTargetPolicy(link);
      link.appendChild(mediaNode);
      root.appendChild(link);
    } else {
      root.appendChild(mediaNode);
    }

    if (captionHtml) {
      var caption = document.createElement('div');
      caption.className = 'cms-media-caption';
      caption.innerHTML = captionHtml;
      root.appendChild(caption);
    }

    return root;
  }

  function applyMediaBlocks(allData) {
    if (!Array.isArray(allData.media_blocks)) {
      return;
    }

    allData.media_blocks.forEach(function (item) {
      if (!item) {
        return;
      }

      var presetSelector = typeof item.target_selector === 'string' ? item.target_selector.trim() : '';
      var customSelector = typeof item.target_selector_custom === 'string' ? item.target_selector_custom.trim() : '';
      var targetSelector = customSelector || presetSelector;
      if (!targetSelector) {
        return;
      }

      var action = typeof item.action === 'string' ? item.action.trim().toLowerCase() : 'append';
      var targets;
      try {
        targets = document.querySelectorAll(targetSelector);
      } catch (err) {
        return;
      }

      if (!targets.length) {
        return;
      }

      if (action === 'remove') {
        targets.forEach(function (target) {
          target.remove();
        });
        return;
      }

      targets.forEach(function (target) {
        var node = buildMediaBlockNode(item);
        if (!node) {
          return;
        }

        if (action === 'replace') {
          target.innerHTML = '';
          target.appendChild(node);
          return;
        }

        if (action === 'prepend') {
          target.prepend(node);
          return;
        }

        target.appendChild(node);
      });
    });
  }

  function applyMediaSlotOverrides(allData) {
    document.querySelectorAll('[data-cms-media-container]').forEach(function (container) {
      var slot = container.getAttribute('data-cms-media-container');
      if (!slot) {
        return;
      }

      var mediaTypeKey = slot + '_media_type';
      var mediaType = typeof allData[mediaTypeKey] === 'string' ? allData[mediaTypeKey].trim().toLowerCase() : 'image';
      var imageNode = container.querySelector('[data-cms-media-image]');
      var videoNode = container.querySelector('[data-cms-media-video]');
      var embedNode = container.querySelector('[data-cms-media-embed]');

      var slotVideoUpload = allData[slot + '_video_upload'] && String(allData[slot + '_video_upload']).trim();
      var slotVideoUrl = allData[slot + '_video_url'] && String(allData[slot + '_video_url']).trim();
      var slotVideoSrc = slotVideoUpload || slotVideoUrl || '';
      var hasVideo = !!slotVideoSrc;
      var hasEmbed = !!(allData[slot + '_embed_url'] && String(allData[slot + '_embed_url']).trim());

      if (videoNode && hasVideo) {
        videoNode.setAttribute('src', slotVideoSrc);
      }

      var effectiveType = mediaType;
      if (effectiveType === 'video' && !hasVideo) {
        effectiveType = 'image';
      }
      if (effectiveType === 'embed' && !hasEmbed) {
        effectiveType = 'image';
      }

      if (imageNode) {
        imageNode.classList.toggle('hidden', effectiveType !== 'image');
      }

      if (videoNode) {
        videoNode.classList.toggle('hidden', effectiveType !== 'video');
      }

      if (embedNode) {
        embedNode.classList.toggle('hidden', effectiveType !== 'embed');
      }
    });
  }

  function setAnchorLabel(anchor, label) {
    if (typeof label !== 'string') {
      return;
    }

    var textNode = null;
    for (var i = 0; i < anchor.childNodes.length; i += 1) {
      var node = anchor.childNodes[i];
      if (node && node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim()) {
        textNode = node;
        break;
      }
    }

    if (!textNode) {
      textNode = document.createTextNode(' ');
      anchor.insertBefore(textNode, anchor.firstChild || null);
    }

    textNode.nodeValue = ' ' + label + ' ';
  }

  function routeTypeFromHref(href) {
    if (typeof href !== 'string' || !href.trim()) {
      return '';
    }

    var pathname = '';
    try {
      pathname = new URL(href, window.location.href).pathname;
    } catch (err) {
      return '';
    }

    if (/\/index\.html$/i.test(pathname) && !/\/pages\//i.test(pathname)) {
      return 'home';
    }
    if (/\/pages\/portfolio-main\/code\.html$/i.test(pathname)) {
      return 'projects';
    }
    if (/\/pages\/about\/index\.html$/i.test(pathname)) {
      return 'about';
    }
    if (/\/pages\/contact\/index\.html$/i.test(pathname)) {
      return 'contact';
    }

    return '';
  }

  function applyGlobalNavigation(allData) {
    var nav = {
      home: { label: allData.nav_home, href: allData.nav_home_href },
      projects: { label: allData.nav_projects, href: allData.nav_projects_href },
      about: { label: allData.nav_about, href: allData.nav_about_href },
      contact: { label: allData.nav_contact, href: allData.nav_contact_href }
    };

    document.querySelectorAll('.shared-site-nav a, .shared-site-footer a').forEach(function (anchor) {
      var route = routeTypeFromHref(anchor.getAttribute('href') || '');
      if (!route || !nav[route]) {
        return;
      }

      if (typeof nav[route].label === 'string') {
        setAnchorLabel(anchor, nav[route].label);
      }

      if (typeof nav[route].href === 'string' && nav[route].href.trim()) {
        anchor.setAttribute('href', nav[route].href.trim());
      }
    });

    var brandAnchor = document.querySelector('.shared-site-nav > a');
    if (brandAnchor) {
      if (typeof allData.brand_name === 'string') {
        brandAnchor.textContent = allData.brand_name;
      }
      if (typeof allData.brand_href === 'string' && allData.brand_href.trim()) {
        brandAnchor.setAttribute('href', allData.brand_href.trim());
      }
    }
  }

  function applyContent(data) {
    // Merge with global data
    var allData = Object.assign({}, globalData, data);
    applySeoMeta(allData, globalSeoData);
    resolvePageLinkPresets(allData);

    applyByAttribute(allData, 'data-cms-text', function (node, value) {
      node.textContent = value;
    });

    applyByAttribute(allData, 'data-cms-html', function (node, value) {
      node.innerHTML = value;
    });

    applyByAttribute(allData, 'data-cms-src', function (node, value, key) {
      node.setAttribute('src', stripImageCrop(value));
      applyImageCrop(node, value, getSiblingCropPosition(allData, key));
    });

    applyByAttribute(allData, 'data-cms-reel-src', function (node, value) {
      node.setAttribute('src', normalizeReelUrl(value));
    });

    applyByAttribute(allData, 'data-cms-alt', function (node, value) {
      node.setAttribute('alt', value);
    });

    applyByAttribute(allData, 'data-cms-bg', function (node, value, key) {
      node.style.backgroundImage = 'url("' + stripImageCrop(value).replace(/"/g, '\\"') + '")';
      applyImageCrop(node, value, getSiblingCropPosition(allData, key));
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

      if (!value) {
        if (iframe) {
          iframe.classList.add('hidden');
          iframe.removeAttribute('src');
        }
        video.classList.add('hidden');
        video.pause();
        video.removeAttribute('src');
        video.load();
        return;
      }

      if (isDirectVideoUrl(value)) {
        if (iframe) {
          iframe.classList.add('hidden');
          iframe.removeAttribute('src');
        }
        video.classList.remove('hidden');
        video.setAttribute('src', value);
        return;
      }

      video.classList.add('hidden');
      video.pause();
      video.removeAttribute('src');
      video.load();

      if (iframe) {
        iframe.classList.remove('hidden');
        iframe.setAttribute('src', normalizeReelUrl(value));
      }
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

    // Switch predefined media slots between image/video/embed where configured.
    applyMediaSlotOverrides(allData);

    // Apply dynamic media insertions/removals before final selector overrides.
    applyMediaBlocks(allData);

    // Last pass: optional direct selector overrides from CMS.
    applySelectorOverrides(allData);

    // Apply brand and nav labels/links globally from site settings.
    applyGlobalNavigation(allData);

    // Internal links stay in same tab, external links open in a new tab.
    applyLinkTargetPolicy(document);
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
