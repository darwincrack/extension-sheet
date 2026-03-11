(function () {
  'use strict';

  const saveBtn = document.getElementById('saveBtn');
  const messageEl = document.getElementById('message');
  const optionsLink = document.getElementById('optionsLink');

  function showMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.className = 'message' + (isError ? ' error' : '');
  }

  function openOptions() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  }

  optionsLink.addEventListener('click', function (e) {
    e.preventDefault();
    openOptions();
  });

  saveBtn.addEventListener('click', async function () {
    const { scriptUrl } = await chrome.storage.sync.get('scriptUrl');
    if (!scriptUrl || !scriptUrl.trim()) {
      showMessage('Configura la URL en Opciones primero.', true);
      return;
    }

    showMessage('Guardando…');
    saveBtn.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        showMessage('No se pudo obtener la pestaña actual.', true);
        saveBtn.disabled = false;
        return;
      }

      const url = tab.url || '';
      const title = tab.title || '';
      const date = new Date().toISOString();

      const res = await fetch(scriptUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title, date })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Error ' + res.status);
      }

      showMessage('Guardado correctamente.');
    } catch (err) {
      showMessage(err.message || 'Error de red. Comprueba la URL.', true);
    } finally {
      saveBtn.disabled = false;
    }
  });

  // Al abrir el popup, comprobar si hay URL configurada
  chrome.storage.sync.get('scriptUrl', function (data) {
    if (!data.scriptUrl || !data.scriptUrl.trim()) {
      showMessage('Configura la URL en Opciones primero.', true);
    } else {
      messageEl.textContent = '';
    }
  });
})();
