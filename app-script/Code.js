/**
 * Google Apps Script para recibir URL, título y fecha desde la extensión
 * y añadirlos como fila en la hoja activa.
 *
 * Instrucciones:
 * 1. Crea o abre una hoja de Google Sheets.
 * 2. Ve a Extensiones → Apps Script.
 * 3. Pega este código y guarda.
 * 4. Despliega como "Aplicación web":
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 5. Copia la URL de ejecución y pégala en la extensión (Opciones).
 *
 * La hoja puede tener encabezados en la primera fila, por ejemplo: URL | Título | Fecha
 */

function doPost(e) {
  try {
    var body = e.postData && e.postData.contents ? e.postData.contents : '{}';
    var data = JSON.parse(body);
    var url = data.url || '';
    var title = data.title || '';
    var date = data.date || new Date().toISOString();

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([url, title, date]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
