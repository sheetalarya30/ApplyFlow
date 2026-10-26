# ApplyFlow — Google Sheets Integration Guide

This guide explains how to connect ApplyFlow to a real Google Sheet using **Google Apps Script**.

---

## 5-Minute Setup Steps

### 1. Create a Google Sheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Rename the spreadsheet to **ApplyFlow — Placement Applications**.

### 2. Open Apps Script Editor
1. In your Google Sheet menu, click **Extensions** &rarr; **Apps Script**.
2. A new tab will open with a code editor.

### 3. Paste the Code
1. Delete any existing sample code inside the editor.
2. Copy the entire contents of `Code.gs` from this directory.
3. Paste it into the Apps Script editor.
4. Click the **Save** (disk) icon at the top.

### 4. Deploy as a Web App
1. In the top right corner, click **Deploy** &rarr; **New deployment**.
2. In the modal that appears, click the **Gear icon (Select type)** &rarr; choose **Web app**.
3. Fill in the fields:
   - **Description**: `ApplyFlow Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial: must be Anyone so your browser can send applications data)*
4. Click **Deploy**.
5. Google will ask you to authorize permissions:
   - Click **Authorize access**.
   - Choose your Google account.
   - Click **Advanced** (at the bottom) &rarr; **Go to Untitled project (unsafe)** &rarr; click **Allow**.
6. Copy the **Web app URL** (starts with `https://script.google.com/macros/s/...`).

### 5. Connect to ApplyFlow
1. Open ApplyFlow in your browser.
2. Go to **Google Sheets Export** in the sidebar.
3. Paste your Web App URL into the input field and click **Save URL**.
4. Click **Sync to Google Sheets**!
5. Open your Google Sheet to see all your applications, interview dates, and statuses synced in real-time.

---

## Testing & Verification
- You can test your Web App URL by pasting it into any browser address bar. It will return:
  ```json
  {"status":"ok","message":"ApplyFlow Google Apps Script Webhook is active and ready to receive POST sync requests."}
  ```
- If you ever update the script in Google Apps Script, remember to click **Deploy** &rarr; **Manage deployments** &rarr; **Edit** &rarr; **New version** &rarr; **Deploy**.
