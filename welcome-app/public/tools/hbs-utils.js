(function () {
  'use strict';

  /* ─────────────── Toast ─────────────── */
  function showToast(msg, duration) {
    duration = duration || 2800;
    var el = document.getElementById('hbs-toast');
    if (!el) { el = document.createElement('div'); el.id = 'hbs-toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, duration);
  }
  window.showToast = showToast;

  /* ─────────────── Clipboard ─────────────── */
  function copyCanvasToClipboard(canvas) {
    if (!navigator.clipboard || !window.ClipboardItem) { showToast('העתקה ללוח אינה נתמכת בדפדפן זה'); return Promise.resolve(); }
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          .then(function () { showToast('תמונה הועתקה ללוח ✓'); resolve(); })
          .catch(function () { showToast('העתקה ללוח נכשלה'); resolve(); });
      }, 'image/png');
    });
  }
  window.copyCanvasToClipboard = copyCanvasToClipboard;

  /* ─────────────── Dropdowns (localStorage) ─────────────── */
  function ddSave(id, open) { try { localStorage.setItem('hbs-dd-' + id, open ? '1' : '0'); } catch (e) { } }
  function ddLoad(id) { try { return localStorage.getItem('hbs-dd-' + id) === '1'; } catch (e) { return false; } }

  function initDropdowns() {
    document.querySelectorAll('.dropdown-toggle[id]').forEach(function (btn) {
      if (btn.dataset.hbsInit) return;
      btn.dataset.hbsInit = '1';
      var bodyId = btn.id.replace('Toggle', 'Body').replace('Btn', 'Body');
      var body = document.getElementById(bodyId);
      if (!body) return;
      if (ddLoad(btn.id)) { btn.classList.add('open'); body.classList.add('open'); }
      btn.addEventListener('click', function () {
        var isOpen = this.classList.toggle('open');
        body.classList.toggle('open', isOpen);
        ddSave(this.id, isOpen);
      });
    });
  }
  window.initDropdowns = initDropdowns;

  /* ─────────────── Export: toast + Ctrl+S ─────────────── */
  function initExport() {
    var exportBtns = Array.from(document.querySelectorAll('button')).filter(function (b) {
      return b.id === 'exportBtn' || b.id === 'export1080' || b.id === 'export1350' ||
        (b.textContent || '').indexOf('ייצוא') !== -1 || (b.textContent || '').indexOf('ייצא') !== -1;
    });

    exportBtns.forEach(function (btn, i) {
      if (btn.dataset.hbsExport) return;
      btn.dataset.hbsExport = '1';
      if (i === 0) { btn.dataset.shortcut = 'Ctrl+S'; btn.title = 'Ctrl + S'; }
      btn.addEventListener('click', function () {
        setTimeout(function () { showToast('PNG יוצא בהצלחה ✓'); }, 750);
      });
    });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        var btn = exportBtns[0];
        if (btn) btn.click();
      }
    });
  }

  /* ─────────────── Count badge helper ─────────────── */
  function updateCountBadge(toggleId, checkboxIds) {
    var total = checkboxIds.length;
    var checked = checkboxIds.filter(function (id) {
      var el = document.getElementById(id); return el && el.checked;
    }).length;
    var span = document.querySelector('#' + toggleId + ' span:first-child');
    if (span) {
      var base = span.dataset.baseText || span.textContent;
      span.dataset.baseText = base;
      span.textContent = base + ' (' + checked + '/' + total + ')';
    }
  }
  window.updateCountBadge = updateCountBadge;

  /* ─────────────── Theme sync (localStorage + storage event) ─────────────── */
  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('hbs-light');
    } else {
      document.documentElement.classList.remove('hbs-light');
    }
  }

  // Apply immediately on load (before DOMContentLoaded to avoid flash)
  try { applyTheme(localStorage.getItem('hbs-theme') || 'dark'); } catch (e) {}

  // React to parent toggling the theme (storage event fires in other contexts on same origin)
  window.addEventListener('storage', function (e) {
    if (e.key === 'hbs-theme') applyTheme(e.newValue || 'dark');
  });

  /* ─────────────── Init ─────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initDropdowns();
    initExport();
  });
})();
