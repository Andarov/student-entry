// Bu kodni har bir viloyatning Google Apps Script loyihasiga kiritasiz.
// U tashqi saytdan kelgan so'rovlarni qabul qilib, Sheets'ga yozadi.

function doPost(e) {
  try {
    // Tashqi saytdan kelgan ma'lumotlarni o'qish
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    let result = {};
    if (action === "save") {
      result = saveStudentsToSheet(payload.data);
    } else if (action === "update") {
      result = updateStudentsBulk(payload.data);
    } else if (action === "search") {
      result = searchStudentByFilter(payload.nameQuery, payload.tuman, payload.school);
    }

    // CORS xatoliklarini oldini olish uchun JSON formatida javob berish
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Barcha ruxsatlar xatoliklarini oldini olish uchun OPTIONS so'roviga xam javob (Gar garchi text/plain ishlatsak xam, ehtiyot shart)
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}


// --- AVVALGI FUNKSIYALAR (Qayta ishlangan variantlari) ---

function searchStudentByFilter(nameQuery, tuman, school) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("O'quvchi");
    const data = sheet.getDataRange().getValues();
    const results = [];
    const nQ = nameQuery ? nameQuery.toLowerCase() : "";
    for (let i = 1; i < data.length; i++) {
      const sTuman = String(data[i][11] || "");
      const sSchool = String(data[i][12] || "");
      const sName = String(data[i][2] || "").toLowerCase();
      if (tuman && sTuman !== tuman) continue;
      if (school && sSchool !== school) continue;
      if (nQ && !sName.includes(nQ)) continue;
      if (!tuman && !school && !nQ) continue;
      results.push({
        rowIndex: i + 1,
        student: {
          name: data[i][2], direction: data[i][3], tel1: data[i][4],
          tel2: data[i][5], form: data[i][6], passport: data[i][7],
          birthDate: data[i][8] instanceof Date ? data[i][8].toISOString().split('T')[0] : data[i][8],
          jshshir: data[i][9], score: data[i][10], tuman: sTuman,
          school: sSchool, tgUser: data[i][13], operator: data[i][14], status: data[i][15]
        }
      });
    }
    return { success: true, results: results };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function saveStudentsToSheet(students) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("O'quvchi");
    const rows = students.map(s => [
      s.name, s.direction, s.tel1, s.tel2, s.form, s.passport, 
      s.birthDate, s.jshshir, s.score, s.tuman, s.school, s.tgUser, s.operator, 
      s.isConfirmed ? "Tasdiqlandi" : "Yangi", new Date()
    ]);
    sheet.getRange(sheet.getLastRow() + 1, 3, rows.length, rows[0].length).setValues(rows);
    return { success: true };
  } catch (e) { return { success: false, error: e.toString() }; }
}

function updateStudentsBulk(students) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("O'quvchi");
    students.forEach(item => {
      const s = item.student;
      const rowData = [
        s.name, s.direction, s.tel1, s.tel2, s.form, s.passport,
        s.birthDate, s.jshshir, s.score, s.tuman, s.school, s.tgUser, s.operator,
        s.isConfirmed ? "Tasdiqlandi" : "Tahrirlangan", new Date()
      ];
      sheet.getRange(item.rowIndex, 3, 1, rowData.length).setValues([rowData]);
    });
    return { success: true };
  } catch (e) { return { success: false, error: e.toString() }; }
}
