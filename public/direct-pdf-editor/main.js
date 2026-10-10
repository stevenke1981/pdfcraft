// Direct PDF Editor Controller
import * as appModule from './app.js';
import { setupFormatDock, setupFindSheet } from './dock.js';
window.appModule = appModule;

import { editorMessages, localizeEditorUI } from './i18n.js';

// URL params and locale setup
const urlParams = new URLSearchParams(window.location.search);

const t = editorMessages.main;

function applyI18n() {
  localizeEditorUI(document);
  const editLabel = document.getElementById('editLabel');
  if (editLabel) editLabel.textContent = t.editAll;
}

// Menu helper
function buildMenu(anchor, cls) {
  const menu = document.createElement('div');
  menu.className = `ecmenu ${cls}`;
  const rect = anchor.getBoundingClientRect();
  const app = document.getElementById('text-editor-app');
  if (!app) return menu;
  if (rect.top > window.innerHeight / 2) {
    menu.style.bottom = `${window.innerHeight - rect.top + 6}px`;
  } else {
    menu.style.top = `${rect.bottom + 6}px`;
  }
  menu.style.left = `${Math.max(8, rect.left)}px`;
  menu.addEventListener('click', (e) => e.stopPropagation());
  app.appendChild(menu);
  const dismiss = (e) => {
    if (e.target === anchor || anchor.contains(e.target)) return;
    menu.remove();
    window.removeEventListener('click', dismiss);
  };
  window.setTimeout(() => window.addEventListener('click', dismiss), 0);
  return menu;
}

function menuItem(label, checked, onPick, icon) {
  const item = document.createElement('button');
  item.className = 'ecmenu-item';
  const mark = document.createElement('i');
  mark.className = checked ? 'ph ph-check' : 'ecmenu-blank';
  const text = document.createElement('span');
  text.textContent = label;
  if (icon) {
    const glyph = document.createElement('i');
    glyph.className = `ph ${icon} ecmenu-icon`;
    item.append(mark, glyph, text);
  } else {
    item.append(mark, text);
  }
  item.addEventListener('click', onPick);
  return item;
}

const SCOPES = [
  ['text', t.editText, 'ph-text-t'],
  ['image', t.editImages, 'ph-image'],
  ['shape', t.editShapes, 'ph-shapes'],
];

function setupEditMenu() {
  const editBtn = document.querySelector('#tools [data-tool="edit"]');
  const label = document.getElementById('editLabel');
  const scopeSel = document.getElementById('editScope');
  if (!editBtn || !label || !scopeSel) return;
  let picked = new Set(['all']);
  const apply = () => {
    const value = [...picked].join(',');
    if (!scopeSel.querySelector(`option[value="${value}"]`)) {
      const opt = document.createElement('option');
      opt.value = value;
      scopeSel.appendChild(opt);
    }
    scopeSel.value = value;
    scopeSel.dispatchEvent(new Event('change'));
    label.textContent = picked.has('all')
      ? (t.editAll)
      :
        SCOPES.filter(([k]) => picked.has(k))
          .map(([, label]) => label)
          .join(' + ');
  };
  let open = null;
  const caret = editBtn.querySelector('.editcaret');
  const markOpen = (isOpen) => caret?.classList.toggle('up', isOpen);
  editBtn.addEventListener('click', () => {
    if (open?.isConnected) {
      open.remove();
      open = null;
      markOpen(false);
      return;
    }
    const menu = buildMenu(editBtn, 'editmenu');
    open = menu;
    markOpen(true);
    const watch = new MutationObserver(() => {
      if (!menu.isConnected) {
        markOpen(false);
        watch.disconnect();
      }
    });
    const host = menu.parentElement;
    if (host) watch.observe(host, { childList: true });
    const rebuild = () => {
      menu.replaceChildren();
      menu.appendChild(
        menuItem(
          t.editAll,
          picked.has('all'),
          () => {
            picked = new Set(['all']);
            apply();
            rebuild();
          },
          'ph-selection-all'
        )
      );
      for (const [key, lbl, glyph] of SCOPES) {
        menu.appendChild(
          menuItem(
            lbl,
            picked.has(key),
            () => {
              if (picked.has('all')) picked.clear();
              if (picked.has(key)) picked.delete(key);
              else picked.add(key);
              if (picked.size === 0 || picked.size === SCOPES.length)
                picked = new Set(['all']);
              apply();
              rebuild();
            },
            glyph
          )
        );
      }
    };
    rebuild();
  });
}

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200, 400];

function fitPage() {
  const stage = document.getElementById('stage');
  const wrap = document.getElementById('pageWrap');
  if (!stage || !wrap || !appModule) return;
  const z = appModule.getZoom();
  const pw = wrap.offsetWidth / z;
  const ph = wrap.offsetHeight / z;
  if (pw <= 0 || ph <= 0) return;
  appModule.setZoom(
    Math.min((stage.clientWidth - 48) / pw, (stage.clientHeight - 48) / ph)
  );
}

function setupZoomMenu() {
  const btn = document.getElementById('zoomMenuBtn');
  const zoomLabel = document.getElementById('zoomLabel');
  if (!btn || !zoomLabel) return;
  let open = null;
  btn.addEventListener('click', () => {
    if (open?.isConnected) {
      open.remove();
      open = null;
      return;
    }
    const current = parseInt(zoomLabel.textContent ?? '', 10);
    const menu = buildMenu(btn, 'zoommenu');
    open = menu;
    for (const pct of ZOOM_PRESETS) {
      menu.appendChild(
        menuItem(`${pct}%`, current === pct, () => {
          appModule.setZoom(pct / 100);
          menu.remove();
        })
      );
    }
    menu.appendChild(document.createElement('hr'));
    menu.appendChild(
      menuItem(t.fitPage, false, () => {
        fitPage();
        menu.remove();
      }, 'ph-arrows-out')
    );
    menu.appendChild(
      menuItem(t.fitWidth, false, () => {
        document.getElementById('zoomFit')?.click();
        menu.remove();
      }, 'ph-arrows-out-line-horizontal')
    );
  });
}

function setupBarCollapse() {
  const viewbar = document.getElementById('viewbar');
  const collapse = document.getElementById('vbCollapse');
  const restore = document.getElementById('vbRestore');
  if (!viewbar || !collapse || !restore) return;
  collapse.addEventListener('click', () => {
    viewbar.setAttribute('hidden', '');
    restore.removeAttribute('hidden');
  });
  restore.addEventListener('click', () => {
    viewbar.removeAttribute('hidden');
    restore.setAttribute('hidden', '');
  });
}

function relocateAddText() {
  const addTextBtn = document.querySelector('#tools [data-tool="addText"]');
  const editBtn = document.querySelector('#tools [data-tool="edit"]');
  const findBtn = document.getElementById('find');
  if (!addTextBtn || !editBtn || !findBtn?.parentElement) return;
  addTextBtn.replaceChildren();
  const icon = document.createElement('i');
  icon.className = 'ph ph-text-t';
  addTextBtn.appendChild(icon);
  addTextBtn.classList.add('btn', 'icon');
  addTextBtn.title = t.addText;
  findBtn.parentElement.insertBefore(addTextBtn, findBtn);
  const sync = () =>
    addTextBtn.classList.toggle('on', !editBtn.classList.contains('on'));
  new MutationObserver(sync).observe(editBtn, {
    attributes: true,
    attributeFilter: ['class'],
  });
  sync();
}

function setupDocPanel() {
  const btn = document.getElementById('docInfoBtn');
  const app = document.getElementById('text-editor-app');
  if (!btn || !app) return;
  let overlay = null;
  const close = () => {
    overlay?.remove();
    overlay = null;
  };
  btn.addEventListener('click', () => {
    if (overlay) {
      close();
      return;
    }
    const desc = appModule.getDocDescription?.();
    if (!desc?.meta) return;
    overlay = document.createElement('div');
    overlay.id = 'docModalOverlay';
    overlay.addEventListener('click', close);
    const modal = document.createElement('div');
    modal.id = 'docModal';
    modal.addEventListener('click', (e) => e.stopPropagation());
    const head = document.createElement('div');
    head.className = 'docmodal-head';
    const title = document.createElement('span');
    title.textContent = t.docInfo;
    const x = document.createElement('button');
    x.className = 'btn icon';
    x.title = t.close;
    x.setAttribute('aria-label', t.close);
    const xi = document.createElement('i');
    xi.className = 'ph ph-x';
    x.appendChild(xi);
    x.addEventListener('click', close);
    head.append(title, x);
    modal.appendChild(head);
    overlay.appendChild(modal);
    app.appendChild(overlay);
  });
}

function setupInspectorToggle() {
  const inspector = document.getElementById('inspector');
  const toggleInspector = document.getElementById('toggleInspector');
  if (inspector && toggleInspector) {
    toggleInspector.classList.add('on');
    toggleInspector.addEventListener('click', () => {
      inspector.classList.toggle('collapsed');
      toggleInspector.classList.toggle(
        'on',
        !inspector.classList.contains('collapsed')
      );
    });
    if (window.matchMedia('(max-width: 768px)').matches) {
      toggleInspector.classList.remove('on');
      setupFormatDock();
      setupFindSheet();
    }
  }
}

function setupFindToggle() {
  const findBtn = document.getElementById('find');
  const findbar = document.getElementById('findbar');
  if (findBtn && findbar) {
    findBtn.title = t.find;
    const sync = () => findBtn.classList.toggle('on', !findbar.hidden);
    new MutationObserver(sync).observe(findbar, {
      attributes: true,
      attributeFilter: ['hidden'],
    });
    sync();
  }
}

// Exit and File Input
function setupExitAndFileInput() {
  const exitBtn = document.getElementById('exitEditor');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'PDFCRAFT_EXIT_EDITOR' }, '*');
      }
    });
  }

  const fileInput = document.getElementById('file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const f = e.target.files?.[0];
      if (f) {
        appModule.openFile(f);
      }
    });
  }
}

// PostMessage Communication with Next.js Host
function setupHostBridge() {
  const applyTheme = (isDark) => {
    const app = document.getElementById('text-editor-app');
    if (isDark) {
      document.documentElement.classList.add('dark');
      app?.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      app?.classList.remove('dark');
    }
  };

  // Initial theme detection from URL param or media query
  const themeParam = urlParams.get('theme');
  if (themeParam === 'dark') {
    applyTheme(true);
  } else if (themeParam === 'light') {
    applyTheme(false);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme(true);
  }

  window.addEventListener('message', async (event) => {
    const { type, payload } = event.data || {};
    if (type === 'PDFCRAFT_THEME_CHANGE') {
      applyTheme(Boolean(payload?.isDark));
      return;
    }
    if (type === 'PDFCRAFT_LOAD_PDF' && payload) {
      try {
        console.log('[DirectEditor] Received PDF payload from parent:', payload);
        let fileObj = null;
        const fileName = payload.name || 'document.pdf';
        if (payload instanceof File) {
          fileObj = payload;
        } else if (payload instanceof Blob) {
          fileObj = new File([payload], fileName, { type: 'application/pdf' });
        } else if (payload instanceof ArrayBuffer) {
          fileObj = new File([payload], fileName, { type: 'application/pdf' });
        } else if (payload.buffer instanceof ArrayBuffer) {
          fileObj = new File([payload.buffer], fileName, { type: 'application/pdf' });
        } else if (payload.buffer) {
          fileObj = new File([payload.buffer], fileName, { type: 'application/pdf' });
        }
        if (fileObj) {
          const ready = await appModule.engineReady;
          console.log('[DirectEditor] Engine ready status:', ready, 'opening file:', fileObj.name, fileObj.size);
          await appModule.openFile(fileObj);
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'PDFCRAFT_LOADED_SUCCESS', name: fileObj.name }, '*');
          }
        }
      } catch (err) {
        console.error('[DirectEditor] Failed to open PDF from parent message:', err);
      }
    }
  });

  // Notify parent we are ready
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'PDFCRAFT_EDITOR_READY' }, '*');
  }
}

// Save Callback
function setupSaveCallback() {
  if (typeof appModule.setOnSaved === 'function') {
    appModule.setOnSaved((kb, fileName) => {
      console.log('[DirectEditor] File saved:', fileName, kb, 'KB');
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'PDFCRAFT_SAVE_SUCCESS',
          fileName: fileName || 'edited-document.pdf',
          sizeKb: kb
        }, '*');
      }
    });
  }
}

// Preload bundled Chinese font (Noto Sans SC) for universal CJK editing support
async function loadBundledChineseFont() {
  try {
    const res = await fetch('/fonts/NotoSansSC-Regular.ttf');
    if (!res.ok) {
      console.warn('[DirectEditor] Bundled Chinese font not found (HTTP ' + res.status + ')');
      return;
    }
    const fontBuf = await res.arrayBuffer();
    const bytes = new Uint8Array(fontBuf);
    const PE = window.PdfEngine;
    if (!PE?.localFonts) {
      console.warn('[DirectEditor] PdfEngine.localFonts not ready yet');
      return;
    }
    const families = [
      'Noto Sans SC',
      'Noto Sans CJK SC',
      'Microsoft YaHei',
      'Microsoft YaHei UI',
      'SimSun',
      'SimHei',
      'PingFang SC',
      'Hiragino Sans GB',
      'Songti SC',
      'STHeiti',
      'KaiTi',
      'FangSong',
    ];
    for (const fam of families) {
      for (const sk of ['', '|00', '|10', '|01', '|11']) {
        if (!PE.localFonts.has(fam + sk) || fam.startsWith('Noto Sans')) {
          PE.localFonts.set(fam + sk, bytes);
        }
      }
    }
    console.log(
      '[DirectEditor] Bundled Chinese font (Noto Sans SC) successfully mounted into PdfEngine!'
    );

    // Update fFamily select box with friendly Chinese font names
    const sel = document.getElementById('fFamily');
    if (sel) {
      const cur = sel.value;
      const PREFERRED = [
        ['Noto Sans SC', t.fontNoto],
        ['Microsoft YaHei', t.fontYaHei],
        ['SimSun', t.fontSimSun],
        ['SimHei', t.fontSimHei],
        ['KaiTi', t.fontKaiTi],
        ['Helvetica', 'Helvetica'],
        ['Arial', 'Arial'],
        ['Times New Roman', 'Times New Roman'],
        ['Georgia', 'Georgia'],
        ['Courier New', 'Courier New'],
      ];
      const existingVals = new Set(PREFERRED.map(([v]) => v));
      const existingOpts = Array.from(sel.options)
        .map((o) => o.value)
        .filter((v) => !existingVals.has(v));
      sel.replaceChildren();
      for (const [val, label] of PREFERRED) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = label;
        sel.appendChild(opt);
      }
      for (const val of existingOpts) {
        const opt = document.createElement('option');
        opt.value = opt.textContent = val;
        sel.appendChild(opt);
      }
      if (cur) sel.value = cur;
    }
  } catch (err) {
    console.warn('[DirectEditor] Error loading bundled Chinese font:', err);
  }
}

// Initialize on DOM Ready
async function init() {
  console.log('[DirectEditor] Initializing controller...');
  applyI18n();
  relocateAddText();
  setupDocPanel();
  setupEditMenu();
  setupZoomMenu();
  setupBarCollapse();
  setupInspectorToggle();
  setupFindToggle();
  setupExitAndFileInput();
  setupSaveCallback();
  setupHostBridge();

  try {
    const ready = await appModule.engineReady;
    console.log('[DirectEditor] WASM engine status:', ready);
    await loadBundledChineseFont();
  } catch (e) {
    console.error('[DirectEditor] WASM engine initialization error:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
