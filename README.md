# Vue Trello Clone (Vue 3 + Vite)

本專案為 Vue 2 Trello 任務管理板的 Vue 3 + Vite 全新重構版，UI 為自訂 UI 元素，狀態管理改用 Pinia，所有資料皆支援 localStorage 持久化。

> 本專案最終能實現 Trello 風格的拖曳排序（Drag and Drop），關鍵在於未採用 Element Plus 官方 UI 排版元件，而是改用客製化 UI 元素與自訂元件結構，確保
> vue3-dnd、vue3-draggable-next 等拖曳套件能無縫整合、互動順暢。此設計大幅提升拖曳體驗與兼容性。

---

## 快速啟動

> **請使用 Node.js 18 以上版本**

```bash
npm install
npm run dev
```

---

## 專案開發狀態

- ✅ 已完成主要功能開發，專案進入維護/優化階段。
- ✅ 支援卡片任務 CRUD、拖曳排序、截止日提醒、圖片上傳。
- ✅ 表單驗證與 UX 提升，錯誤提示明確。
- ✅ snapshot.py 自動產生 snapshot.json，完整記錄 API 結構（含 JSDoc、inputs/outputs）。
- ✅ 主要元件皆有 JSDoc 註解，方便自動化與維護。

---

## 如何查詢 API/元件結構

- 執行 `python3 snapshot.py` 可自動產生/更新 snapshot.json。
- snapshot.json 內含所有 Vue/JS 檔案的 props、emits、functions（含 JSDoc、參數、回傳型別）。
- 可用於自動產生文件、API 對照、快速檢索現有功能。

---

## 專案架構簡介

- `src/views/BoardView.vue`：主看板頁
- `src/components/UiItemForm.vue`：新增/編輯卡片表單
- `src/components/Card.vue`：卡片展示與操作
- `src/components/CardDetail.vue`：卡片詳情彈窗
- `src/stores/board.js`：Pinia 狀態管理
- `src/router/index.js`：路由設定
- `snapshot.py`、`snapshot.json`：網站快照工具與快照資料

---

## 部署資料夾命名建議

部署到 Bluehost 時，請將專案資料夾命名如下，方便協作與維護：

```
public_html/
  ├── backend/    # CodeIgniter 3 API 專案（原 codeigniter-trello-api）
  └── frontend/   # React/Vue 前端專案（build 後靜態檔案）
```

- `backend/`：放置 API 與 PHP 程式。
- `frontend/`：放置 React/Vue build 後的靜態網頁。
- 前端 `.env.production` 的 API 路徑請設為 `/backend/`。
- 上傳到 Bluehost 時，將原本的專案資料夾重新命名即可，不影響程式內容運作。

此命名方式有助於團隊協作、維護與路徑辨識，建議所有協作者遵循。

---

## 部署到 Bluehost 實用教學

### 1. CodeIgniter 3 API 專案部署（PHP/MySQL）

1. **確認 Bluehost 支援 PHP 7.x（或相容版本）**
   - 登入 Bluehost 控制台，檢查 PHP 版本（建議 PHP 7.3~7.4）。

2. **上傳專案檔案**
   - 將 `codeigniter-trello-api` 專案所有檔案（包含 `application`、`system`、`index.php`、`database.sql` 等）上傳到 Bluehost 的 `public_html/trello-api/` 目錄（可自訂子資料夾）。

3. **設定資料庫**
   - 在 Bluehost 後台建立 MySQL 資料庫與帳號。
   - 匯入 `database.sql`（用 phpMyAdmin 或 Bluehost 提供的匯入工具）。

4. **設定連線資訊**
   - 編輯 `application/config/database.php`，填入你的 MySQL 資料庫名稱、帳號、密碼。

5. **調整 index.php 路徑**
   - 若放在子目錄，需確認 `index.php` 內的 `$system_path`、`$application_folder` 設定正確。
   - 例：`$application_folder = 'application';`

6. **設定 .htaccess（可選）**
   - 讓網址不帶 `index.php`，在 `public_html/trello-api/` 建立 `.htaccess`：
     ```
     RewriteEngine on
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^(.*)$ index.php/$1 [L]
     ```

7. **測試 API**
   - 用 Postman 或瀏覽器測試 `https://你的網域/trello-api/api/boards` 等 API 路徑。

### 2. Vue3 前端專案部署（靜態網頁）

1. **打包前端專案**
   - 在本機專案目錄執行：
     ```
     npm run build
     ```
   - 產生 `dist/` 目錄（Vite 預設）。

2. **上傳靜態檔案**
   - 將 `dist/` 內所有檔案，上傳到 Bluehost 的 `public_html/` 或你想要的子資料夾（如 `public_html/trello/`）。

3. **API 連線設定**
   - 確認 `.env.production` 內的 `VITE_API_BASE_URL` 指向你的 API 路徑，例如：
     ```
     VITE_API_BASE_URL=https://你的網域/trello-api/
     ```
   - 若前端與 API 不同子目錄，請確保 CORS 設定允許跨域（CI3 預設允許 GET/POST，必要時可加 CORS header）。

4. **測試前端網站**
   - 直接瀏覽 `https://你的網域/` 或 `https://你的網域/trello/`，確認能正常呼叫 API。

### 3. 常見問題與建議

- **API 路徑建議**：API 放在 `/trello-api/`，靜態前端放根目錄或 `/trello/`，可避免路徑衝突。
- **安全建議**：資料庫帳密請勿公開，建議設定目錄權限。
- **CORS 問題**：如遇跨域問題，可在 CI3 Controller 加上：
  ```php
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: Authorization, Content-Type');
  ```
- **SEO**：靜態前端可直接用 Bluehost 靜態空間，無需 Node.js server。

---

## 技術棧與設計原則

- 前端框架：Vue 3 (`vue@^3.5.13`)
- 構建工具：Vite (`vite@^6.3.1`)
- 狀態管理：Pinia (`pinia@^3.0.2`)
- 路由：Vue Router (`vue-router@^4.5.1`)
- UI/元件庫：Element Plus（如有）、自訂模組
- 拖曳互動：vue3-dnd (`vue3-dnd@^2.1.0`)、vue3-draggable-next、vue3-smooth-dnd
- 圖示：Font Awesome (`@fortawesome/vue-fontawesome`、`free-solid-svg-icons`)
- 樣式：Sass（`sass-embedded`）
- 打包/插件：@vitejs/plugin-vue、@rollup/plugin-commonjs
- 設計系統：模組化、現代、風格統一（依 Airbnb JS Style Guide）
- 文件：JSDoc + Markdown，強調清晰、簡潔、可追溯

> 依 package.json 實際依賴版本同步維護

---

## 參考資源

- [Font Awesome 圖示](https://fontawesome.com/icons/)
- [vue3-dnd 拖曳](https://www.vue3-dnd.com/guide/)

---

## 聯絡方式

- Email: harry750110@gmail.com
- LinkedIn: [范綱栓](https://www.linkedin.com/in/%E7%B6%B1%E6%A0%93-%E8%8C%AF-810868219/)

---

**感謝參與本專案開發！如需協助或有新想法，歡迎隨時交流。**
