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
  const installBtn = document.getElementById('installBtn');
  const installUnsupported = document.getElementById('installUnsupported');

  // Si ya está instalada (standalone)
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');
  if (isStandalone && installUnsupported) {
    installUnsupported.textContent = 'Ya está instalada. En cualquier página toca Compartir y elige «Guardar en Sheets» o «Sheets».';
    installUnsupported.style.display = 'block';
  }

  // Botón nativo de instalación (Chrome Android)
  var installPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
    if (installUnsupported) installUnsupported.style.display = 'none';
  });
  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!installPrompt) return;
      installPrompt.prompt();
      installPrompt.userChoice.then(function (choice) {
        installPrompt = null;
        installBtn.style.display = 'none';
      });
    });
  }
  if (installUnsupported && !isStandalone && installBtn && installBtn.style.display !== 'block') {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      installUnsupported.textContent = 'En Safari: toca el botón Compartir (cuadrado con flecha) y elige «Añadir a la pantalla de inicio».';
    }
    installUnsupported.style.display = 'block';
  }

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

  function sendToSheet(url, title, onDone, options) {
    var scriptUrl = getScriptUrl();
    if (!scriptUrl) {
      onDone('Configura la URL del Web App arriba.', true);
      return;
    }
    var date = new Date().toISOString();
    var base = scriptUrl.split('?')[0];
    var returnUrl = window.location.origin + window.location.pathname;
    var target = base + '?url=' + encodeURIComponent(url) +
      '&title=' + encodeURIComponent(title || '') +
      '&date=' + encodeURIComponent(date) +
      '&returnUrl=' + encodeURIComponent(returnUrl);

    var closeAfter = options && options.closeAfter;
    if (closeAfter) {
      var iframe = document.createElement('iframe');
      iframe.setAttribute('style', 'position:absolute;width:0;height:0;border:0;visibility:hidden');
      iframe.src = target;
      document.body.appendChild(iframe);
      if (resultMessage) {
        resultMessage.textContent = 'Guardado. Cerrando…';
        resultMessage.className = 'result-msg';
      }
      setTimeout(function () {
        try {
          window.close();
        } catch (e) {}
      }, 2000);
      return;
    }
    window.location.href = target;
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

  var isShareMode = !!sharedUrl;
  var mainHeader = document.getElementById('mainHeader');
  var manualSection = document.getElementById('manualSection');
  var mainFooter = document.getElementById('mainFooter');
  var resultSubtext = document.getElementById('resultSubtext');
  var openConfigLink = document.getElementById('openConfigLink');

  function setShareOnlyView(show) {
    if (mainHeader) mainHeader.style.display = show ? 'none' : '';
    if (document.getElementById('installSection')) document.getElementById('installSection').style.display = show ? 'none' : '';
    if (document.getElementById('configSection')) document.getElementById('configSection').style.display = show ? 'none' : '';
    if (manualSection) manualSection.style.display = show ? 'none' : '';
    if (mainFooter) mainFooter.style.display = show ? 'none' : '';
    document.body.classList.toggle('share-result-view', show);
  }

  if (sharedUrl) {
    setShareOnlyView(true);
    resultSection.hidden = false;
    resultMessage.textContent = 'Guardando…';
    resultMessage.className = 'result-msg';
    if (resultSubtext) resultSubtext.style.display = 'none';
    if (openConfigLink) openConfigLink.style.display = 'none';

    sendToSheet(sharedUrl, sharedTitle, function (msg, isError) {
      showResult(msg, isError);
      if (resultSubtext) resultSubtext.style.display = 'none';
      if (openConfigLink) {
        openConfigLink.style.display = 'block';
        openConfigLink.href = './index.html';
      }
      if (!isError) {
        try { history.replaceState({}, document.title, window.location.pathname); } catch (e) {}
      }
    }, { closeAfter: true });
  }
})();
