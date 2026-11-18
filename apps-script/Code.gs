const SHEET_NAME = 'Upiti';
const SHEET_ID = 'DUOTIM_SPREADSHEET_ID';
const COLUMNS = ['Vreme prijema', 'Ime i prezime', 'Telefon', 'Poruka', 'Konfiguracija'];

function setupUpiti() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Pokrenite setupUpiti iz Apps Script projekta vezanog za Google tabelu.');
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  if (!sheet.getLastRow()) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  } else if (sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0].join('|') !== COLUMNS.join('|')) {
    throw new Error('List Upiti već postoji sa drugačijim zaglavljem.');
  }
  PropertiesService.getScriptProperties().setProperty(SHEET_ID, spreadsheet.getId());
}

function doPost(e) {
  const raw = e && e.postData && e.postData.contents;
  if (typeof raw !== 'string' || raw.length > 24000) return json_({ok: false});
  let data;
  try { data = JSON.parse(raw); } catch (error) { return json_({ok: false}); }
  if (!data || typeof data !== 'object' || data.web) return json_({ok: false});

  const name = typeof data.ime === 'string' ? data.ime.trim() : '';
  const phone = typeof data.telefon === 'string' ? data.telefon.trim() : '';
  const message = typeof data.poruka === 'string' ? data.poruka.trim() : '';
  const items = Array.isArray(data.stavke) ? JSON.stringify(data.stavke) : '';
  if (!name || name.length > 150 || !phone || phone.length > 40 ||
      !/^[+\d() ./\-]{5,40}$/.test(phone) || phone.replace(/\D/g, '').length < 5 ||
      message.length > 8000 || items.length > 12000) return json_({ok: false});

  const id = PropertiesService.getScriptProperties().getProperty(SHEET_ID);
  if (!id) return json_({ok: false});
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return json_({ok: false});
  try {
    const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
    if (!sheet) return json_({ok: false});
    sheet.appendRow([new Date(), cellText_(name), cellText_(phone), cellText_(message), cellText_(items)]);
    SpreadsheetApp.flush();
    return json_({ok: true});
  } catch (error) {
    return json_({ok: false});
  } finally {
    lock.releaseLock();
  }
}

function cellText_(value) {
  return value ? "'" + value : '';
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
