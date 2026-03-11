(function () {
  'use strict';

  const scriptUrlInput = document.getElementById('scriptUrl');
  const saveBtn = document.getElementById('saveOptions');
  const savedMsg = document.getElementById('savedMsg');

  chrome.storage.sync.get('scriptUrl', function (data) {
    if (data.scriptUrl) {
      scriptUrlInput.value = data.scriptUrl;
    }
  });

  saveBtn.addEventListener('click', function () {
    const url = (scriptUrlInput.value || '').trim();
    chrome.storage.sync.set({ scriptUrl: url }, function () {
      savedMsg.style.display = 'block';
      savedMsg.textContent = url ? 'URL guardada correctamente.' : 'URL borrada.';
      setTimeout(function () {
        savedMsg.style.display = 'none';
      }, 3000);
    });
  });

  const copyCodeBtn = document.getElementById('copyCodeBtn');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', function () {
      const codeEl = document.getElementById('scriptCode');
      if (!codeEl) return;
      const code = codeEl.textContent;
      navigator.clipboard.writeText(code).then(function () {
        copyCodeBtn.textContent = '¡Copiado!';
        setTimeout(function () {
          copyCodeBtn.textContent = 'Copiar código';
        }, 2000);
      }).catch(function () {
        copyCodeBtn.textContent = 'Selecciona y copia a mano';
        setTimeout(function () {
          copyCodeBtn.textContent = 'Copiar código';
        }, 2000);
      });
    });
  }
})();
