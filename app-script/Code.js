/**
 * Google Apps Script para recibir URL, título y fecha desde la extensión
 * y añadirlos como fila en la hoja activa.
 *
 * - doPost(e): usado por la extensión de Chrome/Edge (JSON en el body).
 * - doGet(e): usado por la PWA en el móvil (parámetros en la URL, evita CORS).
 *
 * Instrucciones:
 * 1. Crea o abre una hoja de Google Sheets.
 * 2. Ve a Extensiones → Apps Script.
 * 3. Pega este código y guarda.
 * 4. Despliega como "Aplicación web":
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 5. Copia la URL de ejecución y pégala en la extensión (Opciones) y en la PWA.
 *
 * La hoja puede tener encabezados en la primera fila, por ejemplo: URL | Título | Fecha
 */

function appendRowFromData(url, title, date) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([url || '', title || '', date || new Date().toISOString()]);
}

function doPost(e) {
  try {
    var body = e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(body);
    var url = data.url || '';
    var title = data.title || '';
    var date = data.date || new Date().toISOString();
    appendRowFromData(url, title, date);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Para la PWA (móvil): recibe url, title, date y opcionalmente returnUrl por GET.
 * Escribe la fila y devuelve HTML con mensaje y enlace para volver.
 */
function doGet(e) {
  var params = e.parameter || {};
  var url = params.url || '';
  var title = params.title || '';
  var date = params.date || new Date().toISOString();
  var returnUrl = params.returnUrl || '';
  var errorMsg = '';
  try {
    appendRowFromData(url, title, date);
  } catch (err) {
    errorMsg = err.toString();
  }
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
  html += '<style>body{font-family:sans-serif;padding:2rem;text-align:center;} a{color:#1a73e8;} .err{color:#c5221f;}</style></head><body>';
  if (errorMsg) {
    html += '<p class="err">Error: ' + errorMsg.replace(/</g, '&lt;') + '</p>';
  } else {
    html += '<p><strong>Guardado en tu hoja</strong></p>';
  }
  if (returnUrl) {
    html += '<p><a href="' + returnUrl.replace(/"/g, '&quot;') + '">Volver a la app</a></p>';
  }
  html += '</body></html>';
  return HtmlService.createHtmlOutput(html);
}

