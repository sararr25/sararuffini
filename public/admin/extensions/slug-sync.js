/*
 * Adds a small helper button that syncs page slug fields from page titles.
 */
(function () {
  function slugify(value) {
    if (typeof value !== 'string') return '';

    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function getCollectionName() {
    var parts = window.location.hash.split('/');
    var index = parts.indexOf('collections');
    return index >= 0 ? parts[index + 1] : '';
  }

  function findFieldInput(fieldName) {
    var candidates = [
      'input[name="' + fieldName + '"]',
      'textarea[name="' + fieldName + '"]',
      '[data-slate-editor="true"][name="' + fieldName + '"]'
    ];

    for (var i = 0; i < candidates.length; i += 1) {
      var node = document.querySelector(candidates[i]);
      if (node) return node;
    }

    return null;
  }

  function getCollectionFieldMap() {
    var collection = getCollectionName();

    if (collection === 'project_pages_entries') {
      return { title: 'entry_title', slug: 'slug' };
    }

    if (collection === 'project_pages') {
      return { title: 'page_name', slug: 'page_slug' };
    }

    if (findFieldInput('page_name') && findFieldInput('page_slug')) {
      return { title: 'page_name', slug: 'page_slug' };
    }

    return null;
  }

  function setInputValue(input, value) {
    var prototype = input instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    var nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value');
    if (nativeSetter && nativeSetter.set) {
      nativeSetter.set.call(input, value);
    } else {
      input.value = value;
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setStatusText(host, message) {
    var status = host.querySelector('[data-slug-sync-status]');
    if (status) status.textContent = message;
  }

  function buildControls(slugInput, titleInput) {
    if (!slugInput || !titleInput || slugInput.dataset.slugSyncReady === 'true') return;

    slugInput.dataset.slugSyncReady = 'true';
    var wrapper = slugInput.closest('div');
    if (!wrapper) return;

    var controls = document.createElement('div');
    controls.setAttribute('data-slug-sync-controls', 'true');
    controls.style.display = 'flex';
    controls.style.flexDirection = 'column';
    controls.style.gap = '8px';
    controls.style.marginTop = '8px';

    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Aggiorna link dal nome pagina';
    button.style.alignSelf = 'flex-start';
    button.style.background = '#111111';
    button.style.color = '#ffffff';
    button.style.border = '0';
    button.style.borderRadius = '6px';
    button.style.padding = '6px 10px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '12px';
    button.style.fontWeight = '700';

    var status = document.createElement('small');
    status.setAttribute('data-slug-sync-status', 'true');
    status.style.color = '#4b5563';
    status.textContent = 'Se cambi il nome pagina, puoi riallineare lo slug con questo pulsante.';

    controls.appendChild(button);
    controls.appendChild(status);
    wrapper.appendChild(controls);

    var lastAutoSlug = slugify(titleInput.value || '');

    function syncSlugFromTitle(force) {
      var nextSlug = slugify(titleInput.value || '');
      if (!nextSlug) {
        setStatusText(controls, 'Inserisci un nome pagina valido per generare lo slug.');
        return;
      }

      var currentSlug = (slugInput.value || '').trim();
      var shouldAutoSync = force || !currentSlug || currentSlug !== nextSlug || currentSlug === lastAutoSlug;
      if (!shouldAutoSync) return;

      setInputValue(slugInput, nextSlug);
      lastAutoSlug = nextSlug;
      setStatusText(controls, (force ? 'Slug aggiornato' : 'Slug sincronizzato automaticamente') + ' dal nome pagina: ' + nextSlug + '. Assicurati che la rotta corrispondente esista.');
    }

    titleInput.addEventListener('input', function () {
      syncSlugFromTitle(false);
    });

    slugInput.addEventListener('input', function () {
      var value = (slugInput.value || '').trim();
      if (value && value !== lastAutoSlug) {
        setStatusText(controls, 'Slug manuale attivo. Premi il pulsante per riallinearlo al nome pagina.');
      }
    });

    button.addEventListener('click', function () {
      syncSlugFromTitle(true);
    });

    syncSlugFromTitle(false);
  }

  function wireEditorEnhancements() {
    var fieldMap = getCollectionFieldMap();
    if (!fieldMap) return;

    buildControls(findFieldInput(fieldMap.slug), findFieldInput(fieldMap.title));
  }

  var observer = new MutationObserver(wireEditorEnhancements);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', wireEditorEnhancements);
  window.addEventListener('load', wireEditorEnhancements);
  setInterval(wireEditorEnhancements, 1200);
})();
