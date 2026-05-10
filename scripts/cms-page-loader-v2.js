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

  // ============ DATA APPLICATION ============

  function applyTextData(allData) {
    document.querySelectorAll('[data-cms-text]').forEach(el => {
      const key = el.getAttribute('data-cms-text');
      const value = getByPath(allData, key);
      if (typeof value === 'string' && value.trim()) {
        el.textContent = value.trim();
      }
    });
  }

  function applyHtmlData(allData) {
    document.querySelectorAll('[data-cms-html]').forEach(el => {
      const key = el.getAttribute('data-cms-html');
      const value = getByPath(allData, key);
      if (typeof value === 'string' && value.trim()) {
        el.innerHTML = value.trim();
      }
    });
  }

  function applyBackgroundImage(allData) {
    document.querySelectorAll('[data-cms-bg]').forEach(el => {
      const key = el.getAttribute('data-cms-bg');
      const value = getByPath(allData, key);
      if (typeof value === 'string' && value.trim()) {
        el.style.backgroundImage = `url('${value.trim()}')`;
      }
    });
  }

  function applyHref(allData) {
    document.querySelectorAll('[data-cms-href]').forEach(el => {
      const key = el.getAttribute('data-cms-href');
      const value = getByPath(allData, key);
      if (typeof value === 'string' && value.trim()) {
        el.setAttribute('href', value.trim());
      }
    });
  }

  // ============ PROJECTS SYSTEM (BLOCK EDITOR) ============

  function applyProjectsData(allData) {
    if (!Array.isArray(allData.projects)) return;

    allData.projects.forEach((project, index) => {
      const projectNum = index + 1;
      const prefix = `project_${projectNum}`;
      
      // Create project object in allData for backward compatibility
      allData[`${prefix}_badge`] = project.badge;
      allData[`${prefix}_title`] = project.title;
      allData[`${prefix}_text`] = project.description;
      allData[`${prefix}_media_type`] = project.media_type;
      allData[`${prefix}_media_url`] = project.media_url;
      allData[`${prefix}_media_upload`] = project.media_upload;

      // Apply tags
      if (Array.isArray(project.tags)) {
        project.tags.forEach((tag, tagIdx) => {
          allData[`${prefix}_tag_${tagIdx + 1}`] = tag;
        });
      }

      // Apply award note if exists
      if (project.award_note) {
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

      // Determine which URL to use
      const sourceUrl = mediaUpload || mediaUrl;
      if (!sourceUrl) return;

      // Handle based on type
      if (mediaType === 'embed') {
        const embedUrl = normalizeEmbedUrl(sourceUrl);
        const iframe = container.querySelector('[data-cms-media-embed]');
        if (iframe) {
          iframe.src = embedUrl;
          iframe.classList.remove('hidden');
          container.querySelector('[data-cms-media-image]')?.classList.add('hidden');
          container.querySelector('[data-cms-media-video]')?.classList.add('hidden');
        }
      } else if (mediaType === 'video') {
        const video = container.querySelector('[data-cms-media-video]');
        if (video) {
          video.src = sourceUrl;
          video.classList.remove('hidden');
          container.querySelector('[data-cms-media-image]')?.classList.add('hidden');
          container.querySelector('[data-cms-media-embed]')?.classList.add('hidden');
        }
      } else {
        // Default to image
        const imgEl = container.querySelector('[data-cms-media-image]');
        if (imgEl) {
          imgEl.style.backgroundImage = `url('${sourceUrl}')`;
          imgEl.classList.remove('hidden');
          container.querySelector('[data-cms-media-video]')?.classList.add('hidden');
          container.querySelector('[data-cms-media-embed]')?.classList.add('hidden');
        }
      }
    });
  }

  // ============ SEO ============

  function applySeoMeta(allData, globalSeoData) {
    const pageSeo = allData.seo || {};
    const title = pageSeo.seo_title || globalSeoData?.site_title || document.title;
    const description = pageSeo.seo_description || globalSeoData?.site_description || '';
    const image = pageSeo.seo_image || globalSeoData?.default_og_image || '';

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

      log(`Loaded page: ${pageName}`, allData);

      // Apply data
      applyProjectsData(allData);
      applyTextData(allData);
      applyHtmlData(allData);
      applyBackgroundImage(allData);
      applyHref(allData);
      applyMediaContainers(allData);
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
