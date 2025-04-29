# 會員登入與通知功能規劃書

## 🎯 目的
- 實現多用戶分離資料，確保個人資料安全。
- 提供登入、註冊、登出等基本會員功能。
- 實現個人化任務到期通知，提升用戶體驗。
- 為未來權限管理、即時推播等功能打基礎。

## 📋 現有結構參考（snapshot.json 摘要）
- 看板、清單、卡片皆以物件陣列儲存於本地（localStorage）。
- 主要檔案：stores/board.js（Pinia 管理 lists）、components/UiItemForm.vue（卡片表單）、stores/index.js（全域狀態 user）。
- 目前 user 狀態為 null，尚未有完整會員資料結構。

## 🛠️ 功能規劃

### 1. 資料結構調整
- 新增 users 陣列，每位會員包含：
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "password": "hashed_string",
    "name": "用戶名稱",
    "createdAt": "2025-04-29T14:00:00Z"
  }
  ```
- 每個 board/list/card 增加 userId 欄位，關聯資料歸屬。
- 每個 card 增加 deadline 欄位（任務截止時間）。

### 2. 前端功能
- 新增會員登入/註冊頁面（components/Login.vue, Register.vue）。
- Pinia 全域狀態 user，登入後儲存當前用戶資料。
- 登入後，僅顯示/操作屬於該 userId 的資料。
- 登出時清除 user 狀態。
- 新增通知模組，統一管理 Notification API 權限與推播。

### 3. 通知功能設計
- 每隔固定秒數（如 30 秒）自動檢查當前登入用戶的所有卡片。
- 根據 deadline 欄位，找出 X 分鐘內即將到期的任務。
- 若有即將到期任務，利用 Notification API 發送本地通知。
- 首次使用時自動請求 Notification 權限。
- 僅通知屬於當前 userId 的卡片。
- 未來可擴充為後端推播（如 FCM、Web Push）。

### 4. 資料存取與權限
- 所有 CRUD 操作前，驗證 user 狀態。
- 新增/修改/刪除資料時，自動帶入當前 userId。
- 只允許操作自己 userId 的 board/list/card。

### 5. 密碼安全
- 註冊時前端用 bcrypt.js 加鹽雜湊密碼（如不連後端）。
- 登入時比對雜湊值，不存明碼。

### 6. API/資料流（如未用後端，則全在 localStorage）
- 註冊：檢查 email 唯一性，新增 user。
- 登入：比對 email+password，成功後儲存 user 狀態。
- CRUD：所有資料操作均需驗證 user 狀態。
- 通知：僅檢查當前登入者的資料。

### 7. UI/UX
- Header 顯示登入狀態、用戶名稱、登出按鈕。
- 未登入時導向登入頁，僅可註冊/登入。
- 通知權限未開啟時，主動提示用戶。

## 🔒 權限與安全
- 僅允許本人操作個人資料。
- 密碼雜湊（前端處理，低安全性，僅適合 Demo/練習）。
- 通知僅推播屬於本人任務。

## 🔮 未來擴充
- 可無痛切換至後端 API（如 Google Sheet、Apps Script、Firebase）。
- 支援第三方登入（Google OAuth）。
- 權限細分（如管理員、一般用戶）。
- 後端推播通知、即時多端同步。

---

> 本規劃書以現有前端結構為基礎，強調模組化、可重用、簡潔一致。如需調整細節或新增流程圖、資料表設計，請再告知。
