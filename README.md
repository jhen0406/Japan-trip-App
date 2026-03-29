# 🇯🇵 日本旅遊規劃與記帳 App (Japan Trip App)

這是一個專為日本旅行設計的 Mobile-first 網頁應用程式 (PWA ready)。採用 Angular 19 與 Tailwind CSS v3 開發，並搭配 Google Apps Script (GAS) 作為輕量後端，直接將您的行程與花費記錄儲存在您的專屬 Google 雲端硬碟 (Sheets & Drive) 中。

---

## 🎨 專屬主題色彩
本專案採用 Material Design 3 暖玫瑰／陶瓷紅色系：
- **主要色 (Primary)**: `#8D4C4C` (陶瓷玫瑰紅)
- **次要色 (Secondary)**: `#8B502A` (暖棕橙)
- **點綴色 (Active/Accent)**: `#FFB284` (奶橙色，用於導覽列 active 狀態)
- **背景 (Background/Surface)**: `#FFF8F6` (奶白)
- **文字 (On-background)**: `#4D2821` (深咖啡)

---

## 🚀 系統安裝與環境建置

### 1. 前端專案啟動
請確保您的電腦已安裝 [Node.js](https://nodejs.org/)。
1. 開啟終端機，進入專案資料夾：
   ```bash
   cd "Japan trip App"
   ```
2. 安裝依賴套件：
   ```bash
   npm install
   ```
3. 啟動本機開發伺服器：
   ```bash
   npm start
   ```
4. 網頁將運行於 `http://localhost:4200`，建議開啟瀏覽器開發者工具 (F12) 並切換為 **手機版面 (例如 iPhone 14 Pro)** 來獲得最佳體驗。

---

## 📊 Google Sheets (資料庫) 準備指南

為了讓您的 App 開始讀取資料與記帳，請在 Google Drive 中建立一個新的「Google 試算表」。

### 工作表一：行程表
請將第一頁下方的工作表標籤命名為 **`行程表`**，並在第一列 (A1~J1) 填寫以下標題：
| 日期 | 行程天數 | 時間 | 地點 | 備註 | 地圖搜尋字詞 | 交通工具 | 交通時間 | 照片連結 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 11/20 | D1 | 10:00 | 福岡機場抵達 | 領行李與買網卡 | 福岡機場國際線 | | | |
| 11/20 | D1 | 12:00 | 博多車站午餐 | 吃拉麵！道地豬骨湯底 | 博多車站 | 地下鐵綠線 | 15分 | https://... |
| 11/20 | D1 | 13:30 | 搭乘由布院之森 | 使用JR Pass | | JR特急 | 2.5小時 | |

> 💡 **欄位說明：**
> - **備註**：景點介紹或注意事項，點擊行程卡片展開後顯示
> - **照片連結**：該地點的圖片 URL（建議使用 Google Drive 公開連結或 Unsplash），展開卡片時顯示於頂部


### 工作表二：記帳
請新增第二頁工作表，命名為 **`記帳`**，並在第一列 (A1~I1) 填寫以下標題：
| ID | 時間 | 日期時間 | 金額 | 幣別 | 類別 | 購買項目 | 付款人 | 付款方式 | 備註與地點 | 圖片連結 | 免稅 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |

#### ✨ 這裡提供 3 筆**假資料**讓您可以複製貼上測試記帳歷史預覽功能：
| ID | 時間 | 日期時間 | 金額 | 幣別 | 類別 | 購買項目 | 付款人 | 付款方式 | 備註與地點 | 圖片連結 | 免稅 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TX001 | 2026/03/15 12:30:00 | | 2500 | JPY | 飲食 | 一蘭拉麵 | 共同負擔 | 現金 | 分店：太宰府表參道 | | FALSE |
| TX002 | 2026/03/15 15:45:00 | | 12800 | JPY | 購物 | 藥妝與零食 | 我 | 信用卡(富邦J卡) | 唐吉訶德熊本店 | | TRUE |
| TX003 | 2026/03/15 19:10:00 | 2026/03/14 20:00 | 1500 | TWD | 交通 | 網路 eSIM | 旅伴 | 電子支付(LinePay) | Klook | | FALSE |

---

## ⚙️ Google Apps Script (後端 API) 部署指南

1. 在您的 Google 試算表中，點擊上方選單的 **擴充功能 > Apps Script**。
2. 左側選擇 `程式碼.gs`，將本專案中 `gas-backend/Code.gs` 的所有程式碼複製並**完全覆蓋**貼上。
   *(如果您想將上傳的記帳收據統整到特定資料夾，請更改程式碼第一行的 `DRIVE_FOLDER_ID`，否則預設會存在雲端硬碟根目錄)*
3. 點擊頂部藍色 **部署 > 新增部署作業**。
4. 點擊齒輪圖示，選擇 **網頁應用程式 (Web App)**。
5. **執行身分**：選擇 `我 (您的信箱)`。
6. **誰可以存取**：必須選擇 `所有人 (Anyone)`。
7. 點擊「部署」，並授予 Google 權限（可能會出現「未經驗證的應用程式」警告，請點選「進階 > 繼續前往」）。
8. 複製產生的 **網頁應用程式網址 (URL)**，長得像 `https://script.google.com/macros/s/AKfycb.../exec`。

### 連接您的專案
回到本機程式碼，開啟 `src/environments/environment.ts` 與 `src/environments/environment.development.ts` 檔案，尋找 `googleAppScriptUrl` 欄位並貼上您剛才獲得的網址：
```typescript
export const environment = {
  production: false, // development.ts 為 true
  googleAppScriptUrl: 'https://script.google.com/macros/s/這裡貼上您的全新API網址/exec'
};
```
按下儲存後，您的前端專案將會自動重新編譯，成功連接到您的表單！

---

## 🌐 GitHub Pages 自動部署

本專案已設定 GitHub Actions，每次推送到 `main` 分支時會自動建置並部署到 GitHub Pages。

### 1. 設定 Repository Secrets

前往 GitHub Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**，新增以下兩個 Secret：

| Secret 名稱 | 對應欄位 | 範例來源 |
| :--- | :--- | :--- |
| `GOOGLE_APP_SCRIPT_URL` | `googleAppScriptUrl` | GAS 部署後的 Web App URL |
| `OPEN_WEATHER_API_KEY` | `openWeatherApiKey` | OpenWeatherMap API Key |

> ⚠️ **注意**：Secret 值請參考 `src/environments/environment.example.ts` 的欄位說明，絕對不要將真實 key 直接寫進程式碼並 commit。

### 2. 啟用 GitHub Pages

前往 Repository → **Settings** → **Pages**，將 **Source** 設定為 **GitHub Actions**。

### 3. 觸發部署

- **自動**：推送任何 commit 到 `main` 分支即會自動觸發。
- **手動**：前往 **Actions** → 選擇 **Deploy to GitHub Pages** → 點擊 **Run workflow**。

### 4. 確認部署結果

部署完成後，網站會發佈在：
```
https://<你的 GitHub 帳號>.github.io/<Repository 名稱>/
```

---

## ❓ 常見問題QA

**Q1：關於「百寶箱資訊」，如果我要修改是要直接提供檔案還是自己改？**
A：**皆可！** 如果您自己熟悉 HTML，可以打開 `src/app/features/information/information.ts` 檔案，裡面有一個 `sections` 陣列，您可以直接在裡面增減帶有 HTML 標籤的文字。
如果您覺得麻煩，**隨時可以將您整理好的 Word、截圖或是純文字丟給我（AI）**，我會幫您直接轉換成漂亮排版的手風琴列表格式，並自動更新到專案中！

**Q2：天氣預報可以看未來的嗎？**
A：可以！最新的更新中，我們已經為天氣模組加上了 **「即時天氣」** 與 **「五天預報」** 的切換頁籤，採用 OpenWeatherMap 的即時 API 取得熊本與福岡的完整氣象資料。

**Q3：部署到 GitHub Pages 後 API 還會動嗎？**
A：會！只要 GitHub Repository Secrets 設定正確，CI/CD 建置時會自動將 key 注入到 `environment.ts`，產出的靜態檔案會帶有正確的設定。Google Apps Script 的 CORS 設定為「所有人」，所以從任何網域都能存取。

**Q4：為什麼我更新了 `Code.gs` 程式碼，但測試後卻沒有生效？**
A：對於 Google Apps Script 來說，**「只按儲存」是不會更新 API endpoint 的**。每次修改程式碼後，請務必點擊右上角「部署 (Deploy)」 > 「管理部署作業 (Manage deployments)」，點擊目前發佈項目旁邊的「鉛筆圖示 (編輯)」，將「版本 (Version)」下拉選單改成 **「新版本 (New version)」**，最後按下「部署」。這樣才能讓新版程式碼生效，且免去修改前端網址的麻煩！

