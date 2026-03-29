// ============================================
// 日本旅遊記帳 App 後端 API (Google Apps Script)
// ============================================

// 設定 Google Sheet 裡面存放設定資料的工作表名稱
const ITINERARY_SHEET_NAME = '行程表';
const ACCOUNTING_SHEET_NAME = '記帳';
// (可選) 存放上傳照片的 Google Drive 資料夾 ID，如果留白會存在根目錄
const DRIVE_FOLDER_ID = '';

/**
 * 處理 GET 請求：讀取並回傳行程表資料
 */
function doGet(e) {
  try {
    const type = e.parameter.type || 'itinerary';
    const sheetName = type === 'accounting' ? ACCOUNTING_SHEET_NAME : ITINERARY_SHEET_NAME;
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`找不到名稱為 "${sheetName}" 的工作表`);

    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // 取出標題列
    const responseData = data.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    return createJsonResponse({
      status: 'success',
      type: type,
      data: responseData
    });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, 400);
  }
}

/**
 * 處理 POST 請求：接收記帳新增資料與圖片上傳
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ACCOUNTING_SHEET_NAME);
    if (!sheet) throw new Error(`找不到名稱為 "${ACCOUNTING_SHEET_NAME}" 的工作表`);

    // 如果有圖片Base64，先處理圖片上傳
    let imageUrl = '';
    if (postData.imageBase64) {
      imageUrl = saveImageToDrive(postData.imageBase64, postData.imageName || 'receipt.jpg');
    }

    // 準備寫入 Row 的資料陣列
    // 依序為 ID(A), 紀錄時間(B), 購買項目(C), 金額(D), 誰付款(E), 付款方式(F), 購買地點(G), 是否退稅(H), 圖片(I), 幣別(J-擴充), 類別(K-擴充)
    const timestamp = new Date();
    const id = Utilities.getUuid();
    
    // 從 Payload 解構出前端欄位
    // 前端欄位：金額(amount), 幣別(currency), 類別(category), 購買項目(item), 付款人(payer), 
    // 付款方式(payMethod), 購買地點(location), 是否退稅(taxFree), 日期時間(recordDate)
    const { amount, currency, category, item, payer, payMethod, location, taxFree, recordDate } = postData;

    // 依照使用者需求格式 A~L 填入 (這裡我們自動擴充 J與K 放幣別與類別，且因使用者在B往右插入C為日期時間，故欄位全數右移)
    const newRow = [
      id,                                     // A: ID
      timestamp,                              // B: 紀錄時間 (系統填入的時間)
      recordDate || '',                       // C: 日期時間 (使用者自己填的記帳時間)
      item || '',                             // D: 購買項目
      amount || 0,                            // E: 金額
      payer || '',                            // F: 誰付款
      payMethod || '',                        // G: 付款方式
      location || '',                         // H: 購買地點
      taxFree ? '是' : '否',                     // I: 是否退稅
      imageUrl || '',                         // J: 圖片連結
      currency || 'JPY',                      // K: 幣別
      category || '其他'                        // L: 類別
    ];

    // 寫入 Google Sheet
    sheet.appendRow(newRow);

    return createJsonResponse({ status: 'success', message: 'Data saved successfully', id: id });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() }, 400);
  }
}

/**
 * 將 Base64 字串存入 Google Drive 並回傳檔案 URL
 */
function saveImageToDrive(base64Data, filename) {
  try {
    // 移除 base64 標頭 (如 data:image/jpeg;base64,)
    const base64String = base64Data.split(',')[1] || base64Data;
    const decodedBlob = Utilities.base64Decode(base64String);
    
    // 透過 MimeType 判斷 (預設 JPEG)
    let mimeType = MimeType.JPEG;
    if (base64Data.includes('image/png')) mimeType = MimeType.PNG;
    
    const blob = Utilities.newBlob(decodedBlob, mimeType, filename);
    
    let folder;
    if (DRIVE_FOLDER_ID) {
      folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    } else {
      folder = DriveApp.getRootFolder();
    }
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (err) {
    Logger.log('Image upload error: ' + err.toString());
    return '';
  }
}

/**
 * 建立 JSON Response 輔助函式 (解決 CORS 問題需加上 callback 但現代 WebApp API 只要回 ContentService.MimeType.JSON)
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 為了處理瀏覽器的 CORS 預檢請求 (Preflight request)，必須定義 doOptions
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}
