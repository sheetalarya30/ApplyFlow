/**
 * ====================================================================
 * ApplyFlow — Google Sheets Export & Sync Webhook
 * ====================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (create a new sheet or open existing).
 * 2. Click Extensions -> Apps Script.
 * 3. Delete any default code in Code.gs, paste this entire file, and click Save (Floppy icon).
 * 4. Click 'Deploy' -> 'New deployment'.
 * 5. Click the Gear icon next to 'Select type' and choose 'Web app'.
 * 6. Set Description: "ApplyFlow Webhook".
 * 7. Set 'Execute as': 'Me' (your email).
 * 8. Set 'Who has access': 'Anyone' (IMPORTANT: Must be Anyone so ApplyFlow frontend can post).
 * 9. Click 'Deploy', authorize permissions, and copy the 'Web app URL'.
 * 10. Paste the Web App URL into ApplyFlow's Google Sheets Export page or .env!
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "ApplyFlow Google Apps Script Webhook is active and ready to receive POST sync requests."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "No POST data received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(rawData);
    var applications = payload.applications || [];
    var userEmail = payload.userEmail || "Student User";

    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      // If deployed as standalone script, create a new spreadsheet or get first one
      spreadsheet = SpreadsheetApp.create("ApplyFlow — Placement Applications");
    }

    var sheetName = "Applications";
    var sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    // Clear previous contents to perform a fresh sync
    sheet.clear();

    // Define table headers
    var headers = [
      "Company Name",
      "Job Role",
      "Job Type",
      "Status",
      "Application Date",
      "Assessment Date (OA)",
      "Interview Date",
      "Location",
      "Salary / Stipend",
      "Job Posting URL",
      "Notes & Prep Details",
      "Last Updated"
    ];

    sheet.appendRow(headers);

    // Style Header Row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#4F46E5"); // Brand Indigo
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);

    // Populate data rows
    if (applications.length > 0) {
      var rows = applications.map(function(app) {
        return [
          app.company_name || "",
          app.job_role || "",
          app.job_type || "Full-time",
          app.status || "Applied",
          app.application_date || "",
          app.assessment_date || "—",
          app.interview_date || "—",
          app.location || "—",
          app.salary || "—",
          app.job_url || "",
          app.notes || "",
          new Date().toLocaleDateString()
        ];
      });

      var dataRange = sheet.getRange(2, 1, rows.length, headers.length);
      dataRange.setValues(rows);
      dataRange.setFontSize(10);
      dataRange.setVerticalAlignment("middle");
    }

    // Auto-fit columns for clean appearance
    for (var col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      count: applications.length,
      sheetUrl: spreadsheet.getUrl(),
      message: "Successfully synchronized " + applications.length + " job applications to Google Sheets!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
