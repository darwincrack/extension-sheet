(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {});
  }

  const SCRIPT_URL_KEY = 'sheetsScriptUrl';

  const scriptUrlInput = document.getElementById('scriptUrl');
  const saveConfigBtn = document.getElementById('saveConfigBtn');
  const configSavedEl = document.getElementById('configSaved');
  const resultSection = document.getElementById('resultSection');
  const resultMessage = document.getElementById('resultMessage');
  const manualUrlInput = document.getElementById('manualUrl');
  const manualTitleInput = document.getElementById('manualTitle');
  const manualSaveBtn = document.getElementById('manualSaveBtn');

  function getScriptUrl() {
    return (localStorage.getItem(SCRIPT_URL_KEY) || '').trim();
  }

  function showConfigSaved(msg) {
    configSavedEl.textContent = msg;
    configSavedEl.className = 'saved-msg visible';
    setTimeout(function () {
      configSavedEl.className = 'saved-msg';
    }, 3000);
  }

  function showResult(message, isError) {
    resultMessage.textContent = message;
    resultMessage.className = 'result-msg' + (isError ? ' error' : '');
    resultSection.hidden = false;
  }

  function hideResult() {
    resultSection.hidden = true;
  }

  function sendToSheet(url, title, onDone) {
    var scriptUrl = getScriptUrl();
    if (!scriptUrl) {
      onDone('Configura la URL del Web App arriba.', true);
      return;
    }
    var date = new Date().toISOString();
    var payload = JSON.stringify({ url: url, title: title || '', date: date });

    fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    })
      .then(function (res) {
        if (!res.ok) return res.text().then(function (t) { throw new Error(t || 'Error ' + res.status); });
        return res.json();
      })
      .then(function (data) {
        if (data && data.ok) {
          onDone('Guardado en tu hoja correctamente.', false);
        } else {
          onDone((data && data.error) || 'Error desconocido', true);
        }
      })
      .catch(function (err) {
        onDone(err.message || 'Error de red. Comprueba la URL.', true);
      });
  }

  // Cargar URL guardada
  var saved = getScriptUrl();
  if (saved) scriptUrlInput.value = saved;

  saveConfigBtn.addEventListener('click', function () {
    var url = (scriptUrlInput.value || '').trim();
    localStorage.setItem(SCRIPT_URL_KEY, url);
    showConfigSaved(url ? 'URL guardada.' : 'URL borrada.');
  });

  manualSaveBtn.addEventListener('click', function () {
    var url = (manualUrlInput.value || '').trim();
    if (!url) {
      showResult('Escribe o pega una URL.', true);
      return;
    }
    var title = (manualTitleInput.value || '').trim();
    manualSaveBtn.disabled = true;
    showResult('Guardando…');
    sendToSheet(url, title, function (msg, isError) {
      showResult(msg, isError);
      manualSaveBtn.disabled = false;
      if (!isError) {
        manualUrlInput.value = '';
        manualTitleInput.value = '';
      }
    });
  });

  // Procesar parámetros de compartir (Share Target)
  function getQueryParams() {
    var q = window.location.search.slice(1);
    if (!q) return {};
    var out = {};
    q.split('&').forEach(function (pair) {
      var i = pair.indexOf('=');
      var k = i >= 0 ? decodeURIComponent(pair.slice(0, i).replace(/\+/g, ' ')) : decodeURIComponent(pair.replace(/\+/g, ' '));
      var v = i >= 0 ? decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' ')) : '';
      out[k] = v;
    });
    return out;
  }

  var params = getQueryParams();
  var sharedUrl = params.url || params.text || '';
  var sharedTitle = params.title || '';

  // Si text parece una URL y no hay url, usarlo como url
  if (!sharedUrl && params.text && /^https?:\/\//i.test(params.text)) {
    sharedUrl = params.text;
  }

  if (sharedUrl) {
    resultSection.hidden = false;
    resultMessage.textContent = 'Guardando…';
    resultMessage.className = 'result-msg';

    sendToSheet(sharedUrl, sharedTitle, function (msg, isError) {
      showResult(msg, isError);
      if (!isError) {
        try { history.replaceState({}, document.title, window.location.pathname); } catch (e) {}
      }
    });
  }
})();
