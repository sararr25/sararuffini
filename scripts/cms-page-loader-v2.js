/**
 * CMS Page Loader v2 - Simplified block-based system
 * Loads CMS data and applies to HTML elements with data-cms-* attributes
 */
(function() {
  'use strict';

  // ============ UTILITY FUNCTIONS ============

  function log(msg, data) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[CMS Loader]', msg, data || '');
    }
  }

  function getByPath(obj, path) {
    if (!path || typeof path !== 'string') return undefined;
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  }

  function getSiblingCropPosition(allData, path) {
    if (!path || typeof path !== 'string') return '';
    const parts = path.split('.');
    if (!parts.length) return '';
    parts[parts.length - 1] = `${parts[parts.length - 1]}_crop_position`;
    const value = parts.reduce((curr, prop) => curr?.[prop], allData);
    return value || '';
  }

  function normalizeCropValue(value) {
    const x = Math.max(0, Math.min(100, Number(value?.x)));
    const y = Math.max(0, Math.min(100, Number(value?.y)));
    const zoom = Math.max(1, Math.min(3, Number(value?.zoom) || 1));
    return {
      x: Number.isFinite(x) ? x : 50,
      y: Number.isFinite(y) ? y : 50,
      zoom: Math.round(zoom * 100),
      rotate: Math.max(-180, Math.min(180, Number(value?.rotate) || 0)),
    };
  }

  function parseCropPosition(rawCrop) {
    if (rawCrop && typeof rawCrop === 'object' && !Array.isArray(rawCrop)) {
      return normalizeCropValue(rawCrop);
    }

    if (typeof rawCrop !== 'string' || !rawCrop.trim()) return null;
    const match = rawCrop.trim().match(/^(\d{1,3}),(\d{1,3})(?:,(\d{1,3}))?(?:,(-?\d{1,3}))?$/);
    if (!match) return null;
    return {
      x: Math.max(0, Math.min(100, Number(match[1]))),
      y: Math.max(0, Math.min(100, Number(match[2]))),
      zoom: Math.max(100, Math.min(280, Number(match[3]) || 100)),
      rotate: Math.max(-180, Math.min(180, Number(match[4]) || 0)),
    };
  }

  function parseImageCrop(rawUrl) {
    if (typeof rawUrl !== 'string') return null;
    const match = rawUrl.match(/#(?:.*&)?crop=(\d{1,3}),(\d{1,3})(?:,(\d{1,3}))?(?:,(-?\d{1,3}))?(?:&.*)?$/);
    if (!match) return null;
    return {
      x: Math.max(0, Math.min(100, Number(match[1]))),
      y: Math.max(0, Math.min(100, Number(match[2]))),
      zoom: Math.max(100, Math.min(280, Number(match[3]) || 100)),
      rotate: Math.max(-180, Math.min(180, Number(match[4]) || 0)),
    };
  }

  function stripImageCrop(rawUrl) {
    if (typeof rawUrl !== 'string') return rawUrl;
    return rawUrl.replace(/#(?:.*&)?crop=\d{1,3},\d{1,3}(?:,\d{1,3})?(?:,-?\d{1,3})?(?:&.*)?$/, '');
  }

  function applyImageCrop(node, rawUrl, rawCrop) {
    const crop = parseCropPosition(rawCrop) || parseImageCrop(rawUrl);
    if (!crop) return;

    const position = `${crop.x}% ${crop.y}%`;
    if (node.tagName === 'IMG' || node.tagName === 'VIDEO') {
      node.style.objectPosition = position;
      node.style.transformOrigin = position;
      if (crop.zoom !== 100 || crop.rotate !== 0) {
        node.style.transform = `scale(${crop.zoom / 100}) rotate(${crop.rotate}deg)`;
      }
    } else {
      node.style.backgroundPosition = position;
      node.style.backgroundSize = 'cover';
    }
  }

  function resolvePageLinkPresets(target) {
    if (!target || typeof target !== 'object') return;

    if (Array.isArray(target)) {
      target.forEach(resolvePageLinkPresets);
      return;
    }

    Object.keys(target).forEach(key => {
      const value = target[key];
      if (value && typeof value === 'object') {
        resolvePageLinkPresets(value);
      }
    });

    Object.keys(target).forEach(key => {
      const value = target[key];
      if (typeof value !== 'string' || !value.trim()) return;

      if (/_href_page$/.test(key)) {
        const hrefKey = key.replace(/_page$/, '');
        const currentHref = typeof target[hrefKey] === 'string' ? target[hrefKey].trim() : '';
        if (!currentHref) {
          target[hrefKey] = value.trim();
        }
        return;
      }

      if (key === 'href_page') {
        const currentHref = typeof target.href === 'string' ? target.href.trim() : '';
        if (!currentHref) {
          target.href = value.trim();
        }
      }
    });
  }

  function normalizeEmbedUrl(url) {
    if (!url || typeof url !== 'string') return '';
    url = url.trim();
    if (!url) return '';

    try {
      const urlObj = new URL(url, window.location.origin);
      const host = urlObj.hostname.replace(/^www\./, '').toLowerCase();

      // YouTube
      if (host.includes('youtube.com') || host === 'youtu.be') {
        let videoId = urlObj.searchParams.get('v');
        if (!videoId && host === 'youtu.be') {
          videoId = urlObj.pathname.split('/')[1];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
      }

      // Vimeo
      if (host.includes('vimeo.com')) {
        const match = urlObj.pathname.match(/\/(\d+)/);
        if (match) return `https://player.vimeo.com/video/${match[1]}`;
      }

      // Instagram
      if (host.includes('instagram.com')) {
        if (urlObj.pathname.match(/\/(reel|p|tv)\/([^/?#]+)/)) {
          const match = urlObj.pathname.match(/\/(reel|p|tv)\/([^/?#]+)/);
          return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
        }
      }

      return url;
    } catch (e) {
      return url;
    }
  }

  function isEmbedUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const normalizedUrl = normalizeEmbedUrl(url);
    return normalizedUrl.includes('embed') || normalizedUrl.includes('youtube') || normalizedUrl.includes('vimeo') || normalizedUrl.includes('instagram');
  }

  function isExternalHttpLink(href) {
    if (typeof href !== 'string' || !href.trim()) return false;

    const trimmed = href.trim();
    if (/^(#|mailto:|tel:|javascript:|data:)/i.test(trimmed)) return false;

    let parsed;
    try {
      parsed = new URL(trimmed, window.location.href);
    } catch (_e) {
      return false;
    }

    if (!/^https?:$/i.test(parsed.protocol)) return false;
    return parsed.origin !== window.location.origin;
  }

  function applyAnchorTargetPolicy(anchor) {
    if (!anchor) return;

    const href = anchor.getAttribute('href') || '';
    const isExternal = isExternalHttpLink(href);

    if (isExternal) {
      anchor.setAttribute('target', '_blank');

      const rel = (anchor.getAttribute('rel') || '').trim();
      const relParts = rel ? rel.split(/\s+/) : [];
      if (!relParts.includes('noopener')) relParts.push('noopener');
      if (!relParts.includes('noreferrer')) relParts.push('noreferrer');
      anchor.setAttribute('rel', relParts.join(' ').trim());
      return;
    }

    if ((anchor.getAttribute('target') || '').toLowerCase() === '_blank') {
      anchor.removeAttribute('target');
    }

    const relValue = (anchor.getAttribute('rel') || '').trim();
    if (!relValue) return;

    const nextRel = relValue
      .split(/\s+/)
      .filter(part => {
        const lower = part.toLowerCase();
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
    const root = scope && scope.querySelectorAll ? scope : document;
    root.querySelectorAll('a[href]').forEach(applyAnchorTargetPolicy);
  }

  function withAutoplay(url) {
    if (!url || typeof url !== 'string') return '';
    try {
      const parsed = new URL(url, window.location.origin);
      parsed.searchParams.set('autoplay', '1');
      if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
        // Muted autoplay is more reliable across mobile browsers.
        if (!parsed.searchParams.has('mute')) parsed.searchParams.set('mute', '1');
      }
      return parsed.toString();
    } catch (e) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}autoplay=1`;
    }
  }

  // ============ DATA APPLICATION ============

  function applyTextData(allData) {
    document.querySelectorAll('[data-cms-text]').forEach(el => {
      const key = el.getAttribute('data-cms-text');
      const value = getByPath(allData, key);
      if (typeof value === 'string') {
        el.textContent = value;
      }
    });
  }

  function applyHtmlData(allData) {
    document.querySelectorAll('[data-cms-html]').forEach(el => {
      const key = el.getAttribute('data-cms-html');
      const value = getByPath(allData, key);
      if (typeof value === 'string') {
        el.innerHTML = value;
      }
    });
  }

  function applyBackgroundImage(allData) {
    document.querySelectorAll('[data-cms-bg]').forEach(el => {
      const key = el.getAttribute('data-cms-bg');
      const value = getByPath(allData, key);
      if (typeof value === 'string') {
        if (value.trim()) {
          el.style.backgroundImage = `url('${stripImageCrop(value.trim())}')`;
          applyImageCrop(el, value, getSiblingCropPosition(allData, key));
        } else {
          el.style.backgroundImage = 'none';
        }
      }
    });
  }

  function applyHref(allData) {
    document.querySelectorAll('[data-cms-href]').forEach(el => {
      const key = el.getAttribute('data-cms-href');
      const value = getByPath(allData, key);
      if (typeof value === 'string') {
        el.setAttribute('href', value.trim());
      }
    });
  }

  function normalizeListItem(item) {
    if (typeof item === 'string') return item.trim();
    if (item && typeof item === 'object') {
      return String(item.label || item.value || item.item || item.name || '').trim();
    }
    return '';
  }

  function getStructuredListItems(allData, key) {
    const value = getByPath(allData, key);
    if (Array.isArray(value)) {
      return value.map(normalizeListItem).filter(Boolean);
    }

    if (key === 'spec_deliverables') {
      const items = [];
      for (let index = 1; index <= 8; index += 1) {
        const item = allData[`spec_deliverable_${index}`];
        if (typeof item === 'string' && item.trim()) items.push(item.trim());
      }
      if (items.length) return items;
      const legacyValue = typeof allData.spec_deliverables_value === 'string' ? allData.spec_deliverables_value : '';
      return legacyValue.split(',').map(item => item.trim()).filter(Boolean);
    }

    if (key === 'spec_tools') {
      const legacyValue = typeof allData.spec_tools_value === 'string' ? allData.spec_tools_value : '';
      return legacyValue.split(',').map(item => item.trim()).filter(Boolean);
    }

    return [];
  }

  function applyStructuredLists(allData) {
    document.querySelectorAll('[data-cms-list]').forEach(node => {
      const key = node.getAttribute('data-cms-list');
      const items = getStructuredListItems(allData, key);
      if (!items.length) return;

      if (node.tagName === 'UL' || node.tagName === 'OL') {
        node.innerHTML = '';
        items.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          node.appendChild(li);
        });
        return;
      }

      node.textContent = items.join(', ');
    });
  }

  function setAnchorLabel(anchor, label) {
    if (typeof label !== 'string') return;

    let textNode = null;
    for (let i = 0; i < anchor.childNodes.length; i += 1) {
      const node = anchor.childNodes[i];
      if (node && node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim()) {
        textNode = node;
        break;
      }
    }

    if (!textNode) {
      textNode = document.createTextNode(' ');
      anchor.insertBefore(textNode, anchor.firstChild || null);
    }

    textNode.nodeValue = ` ${label} `;
  }

  function routeTypeFromHref(href) {
    if (typeof href !== 'string' || !href.trim()) return '';

    let pathname = '';
    try {
      pathname = new URL(href, window.location.href).pathname;
    } catch (_err) {
      return '';
    }

    if (/\/index\.html$/i.test(pathname) && !/\/pages\//i.test(pathname)) return 'home';
    if (/\/pages\/(?:projects(?:\/code\.html)?|portfolio-main\/code\.html)$/i.test(pathname)) return 'projects';
    if (/\/pages\/about\/index\.html$/i.test(pathname)) return 'about';
    if (/\/pages\/contact\/index\.html$/i.test(pathname)) return 'contact';
    return '';
  }

  function applyGlobalNavigation(allData) {
    const nav = {
      home: { label: allData.nav_home, href: allData.nav_home_href },
      projects: { label: allData.nav_projects, href: allData.nav_projects_href },
      about: { label: allData.nav_about, href: allData.nav_about_href },
      contact: { label: allData.nav_contact, href: allData.nav_contact_href }
    };

    document.querySelectorAll('.shared-site-nav a, .shared-site-footer a').forEach(anchor => {
      const route = routeTypeFromHref(anchor.getAttribute('href') || '');
      if (!route || !nav[route]) return;

      if (typeof nav[route].label === 'string') {
        setAnchorLabel(anchor, nav[route].label);
      }

      if (typeof nav[route].href === 'string' && nav[route].href.trim()) {
        anchor.setAttribute('href', nav[route].href.trim());
      }
    });

    const brandAnchor = document.querySelector('.shared-site-nav > a');
    if (brandAnchor) {
      if (typeof allData.brand_name === 'string') {
        brandAnchor.textContent = allData.brand_name;
      }
      if (typeof allData.brand_href === 'string' && allData.brand_href.trim()) {
        brandAnchor.setAttribute('href', allData.brand_href.trim());
      }
    }
  }

  function applySelectorOverrides(allData) {
    if (!Array.isArray(allData.selector_overrides)) return;

    allData.selector_overrides.forEach(entry => {
      if (!entry || typeof entry.selector !== 'string') return;

      const selector = entry.selector.trim();
      const type = typeof entry.type === 'string' ? entry.type.trim().toLowerCase() : '';
      const value = typeof entry.value === 'string' ? entry.value : '';

      if (!selector || !type) return;

      let nodes;
      try {
        nodes = document.querySelectorAll(selector);
      } catch (_err) {
        return;
      }

      nodes.forEach(node => {
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
          node.style.backgroundImage = value ? `url('${value.replace(/'/g, "\\'")}')` : 'none';
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

  function applySectionData(allData) {
    const sectionNames = ['hero_section', 'intro_section', 'specs_section', 'closing_section'];

    sectionNames.forEach(sectionName => {
      const sectionData = allData[sectionName];
      if (!sectionData || typeof sectionData !== 'object') return;

      Object.entries(sectionData).forEach(([key, value]) => {
        if (allData[key] === undefined || allData[key] === null || allData[key] === '') {
          allData[key] = value;
        }
      });
    });
  }

  // ============ PROJECTS SYSTEM (BLOCK EDITOR) ============

  function applyProjectsData(allData) {
    if (!Array.isArray(allData.projects)) return;

    allData.projects.forEach((project, index) => {
      const projectNum = index + 1;
      const prefix = `project_${projectNum}`;
      
      // Create project object in allData for backward compatibility
      allData[`${prefix}_badge`] = typeof project.badge === 'string' ? project.badge : '';
      allData[`${prefix}_title`] = typeof project.title === 'string' ? project.title : '';
      allData[`${prefix}_text`] = typeof project.description === 'string' ? project.description : '';
      allData[`${prefix}_meta`] = typeof project.meta === 'string' ? project.meta : '';
      allData[`${prefix}_media_type`] = typeof project.media_type === 'string' ? project.media_type : '';
      allData[`${prefix}_media_url`] = typeof project.media_url === 'string' ? project.media_url : '';
      allData[`${prefix}_media_upload`] = typeof project.media_upload === 'string' ? project.media_upload : '';
      allData[`${prefix}_image_crop_position`] = project.image_crop_position || '';

      // Apply tags
      if (Array.isArray(project.tags)) {
        project.tags.forEach((tag, tagIdx) => {
          const normalizedTag = typeof tag === 'string' ? tag : (tag && typeof tag === 'object' && typeof tag.tag === 'string' ? tag.tag : '');
          allData[`${prefix}_tag_${tagIdx + 1}`] = normalizedTag;
        });
      }

      // Apply award note if exists
      if (typeof project.award_note === 'string') {
        allData[`${prefix}_award_note`] = project.award_note;
      }
    });
  }

  // ============ MEDIA BLOCKS ============

  function applyMediaContainers(allData) {
    document.querySelectorAll('[data-cms-media-container]').forEach(container => {
      const containerName = container.getAttribute('data-cms-media-container');
      const mediaType = getByPath(allData, `${containerName}_media_type`) || 'image';
      const mediaUrl = getByPath(allData, `${containerName}_media_url`) || '';
      const mediaUpload = getByPath(allData, `${containerName}_media_upload`) || '';
      const mediaCrop = getByPath(allData, `${containerName}_image_crop_position`) || getByPath(allData, `${containerName}_media_crop_position`) || '';

      const imageNode = container.querySelector('[data-cms-media-image]') || container.querySelector('img');
      const videoNode = container.querySelector('[data-cms-media-video]') || container.querySelector('[data-cms-video-src]') || container.querySelector('video');
      let embedNode = container.querySelector('[data-cms-media-embed]') || container.querySelector('[data-cms-reel-src]') || container.querySelector('iframe');

      // Determine which URL to use
      const sourceUrl = mediaUpload || mediaUrl;
      if (!sourceUrl) return;

      // Handle based on type
      if (mediaType === 'embed') {
        const embedUrl = normalizeEmbedUrl(sourceUrl);
        if (!embedNode) {
          embedNode = document.createElement('iframe');
          embedNode.className = 'absolute inset-0 w-full h-full border-0 hidden';
          embedNode.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
          embedNode.setAttribute('allowfullscreen', '');
          container.appendChild(embedNode);
        }

        if (embedNode) {
          embedNode.src = embedUrl;
          embedNode.classList.remove('hidden');
          imageNode?.classList.add('hidden');
          videoNode?.classList.add('hidden');
        }
      } else if (mediaType === 'video') {
        if (videoNode) {
          videoNode.src = sourceUrl;
          videoNode.classList.remove('hidden');
          videoNode.setAttribute('playsinline', '');
          if (!videoNode.hasAttribute('controls')) {
            videoNode.setAttribute('controls', '');
          }
          imageNode?.classList.add('hidden');
          embedNode?.classList.add('hidden');
        }
      } else {
        // Default to image
        if (imageNode) {
          const imageUrl = stripImageCrop(sourceUrl);
          if (imageNode.tagName === 'IMG') {
            imageNode.setAttribute('src', imageUrl);
          } else {
            imageNode.style.backgroundImage = `url('${imageUrl}')`;
          }
          applyImageCrop(imageNode, sourceUrl, mediaCrop);
          imageNode.classList.remove('hidden');
          videoNode?.classList.add('hidden');
          embedNode?.classList.add('hidden');
        }
      }
    });
  }

  function bindMediaPlayButtons() {
    document.querySelectorAll('[data-cms-media-container]').forEach(container => {
      const playBtn = container.querySelector('button');
      if (!playBtn || playBtn.dataset.cmsPlayBound === 'true') return;
      playBtn.dataset.cmsPlayBound = 'true';

      playBtn.addEventListener('click', event => {
        event.preventDefault();

        const video = container.querySelector('[data-cms-media-video]:not(.hidden)');
        if (video) {
          video.play().catch(() => {});
          playBtn.classList.add('hidden');
          playBtn.style.pointerEvents = 'none';
          return;
        }

        const iframe = container.querySelector('[data-cms-media-embed]:not(.hidden)');
        if (iframe) {
          const currentSrc = iframe.getAttribute('src') || '';
          if (currentSrc) {
            iframe.setAttribute('src', withAutoplay(currentSrc));
          }
          playBtn.classList.add('hidden');
          playBtn.style.pointerEvents = 'none';
        }
      });
    });
  }

  // ============ SEO ============

  function applySeoMeta(allData, globalSeoData) {
    const pageSeo = allData.seo || {};
    const title = pageSeo.seo_title || globalSeoData?.site_title || document.title;
    const description = pageSeo.seo_description || globalSeoData?.site_description || '';
    const image = stripImageCrop(pageSeo.seo_image || globalSeoData?.default_og_image || '');

    if (title) document.title = title;

    const upsertMeta = (attr, attrVal, content) => {
      if (!content) return;
      let meta = document.head.querySelector(`meta[${attr}="${attrVal}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    if (image) upsertMeta('property', 'og:image', image);
  }

  // ============ MAIN INIT ============

  async function init() {
    try {
      const pageName = document.body.getAttribute('data-cms-page');
      if (!pageName) {
        log('No data-cms-page attribute found');
        return;
      }

      // Load global data
      const [globalData, globalSeo, pageData] = await Promise.all([
        fetch('/content/global.json').then(r => r.json()).catch(() => ({})),
        fetch('/content/global-seo.json').then(r => r.json()).catch(() => ({})),
        fetch(`/content/pages/${pageName}.json`).then(r => r.json()).catch(() => ({}))
      ]);

      const allData = { ...globalData, ...pageData };
      resolvePageLinkPresets(allData);

      log(`Loaded page: ${pageName}`, allData);

      // Apply data
      applySectionData(allData);
      applyProjectsData(allData);
      applyTextData(allData);
      applyHtmlData(allData);
      applyBackgroundImage(allData);
      applyHref(allData);
      applyStructuredLists(allData);
      applyMediaContainers(allData);
      bindMediaPlayButtons();
      applySelectorOverrides(allData);
      applyGlobalNavigation(allData);
      applyLinkTargetPolicy(document);
      applySeoMeta(allData, globalSeo);

      log('Data applied successfully');
    } catch (error) {
      console.error('[CMS Loader] Error:', error);
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
