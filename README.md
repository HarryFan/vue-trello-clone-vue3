# Vue Trello Clone (Vue 3 + Vite)

## 專案概述

這是一個模仿 Trello 的任務管理系統，使用 Vue 3 + Vite 開發，支援完整的任務管理功能、拖曳排序、截止日期提醒等功能。前端採用現代化的組件架構和設計模式，實現了高度互動性和良好的用戶體驗。

## 已完成功能

### 1. 核心功能

- **用戶管理**
  - 用戶註冊與登入：支援電子郵件和密碼登入
  - 身份驗證：使用 JWT token 進行 API 認證
  - 使用者基本資料顯示

- **任務管理**
  - 看板系統：支援建立及管理多個任務看板
  - 清單管理：在看板內建立多個清單（如「待辦」、「進行中」、「完成」）
  - 卡片操作：創建、編輯、刪除任務卡片，支援標題、描述和截止日期
  - 拖曳排序：支援清單間的卡片拖曳，及清單內卡片順序調整
  - 任務詳情：點擊卡片顯示詳細資訊和可進行的操作

- **通知系統**
  - 即時提醒：任務接近截止日期時自動提醒
  - 頁面內通知：直接在頁面中顯示提醒訊息
  - 瀏覽器通知：支援瀏覽器原生推送通知（需用戶授權）
  - 通知偏好：用戶可設定通知方式和時間

- **時間管理**
  - 截止日期設定：為任務設定準確到分鐘的截止時間
  - 視覺化提示：即將到期和已逾期任務有明確的視覺標記
  - 倒數計時：顯示距離截止時間的剩餘時間

- **資料持久化**
  - 本地儲存：使用 localStorage 保存部分數據，確保刷新頁面後數據不丟失
  - 遠端同步：與後端 API 同步所有操作，確保數據一致性

### 2. 使用者體驗優化

- **響應式設計**
  - 適應不同設備尺寸，從手機到桌面電腦都有良好的顯示效果
  - 流暢的動畫過渡和互動反饋

- **錯誤處理**
  - 友好的錯誤提示和引導
  - 網絡錯誤自動重試和離線模式支援

- **性能優化**
  - 高效的組件渲染和狀態管理
  - 延遲加載和資源優化

- **無障礙支援**
  - 適當的顏色對比度
  - 鍵盤導航支援
  - 螢幕閱讀器兼容的標記

### 3. 特色功能

- **卡片狀態視覺化**
  - 不同的視覺指示器顯示任務狀態（即將到期、已過期、已完成）
  - 清晰的時間顯示和排版

- **多種互動方式**
  - 拖放操作：直觀調整任務優先順序和狀態
  - 內容編輯：便捷的表單和輸入控制

- **通知與提醒系統**
  - 多層次的通知機制，確保用戶不會錯過重要任務
  - 符合人體工學的通知設計和交互流程

## API 規格

### 1. 用戶（Users）
- **登入**：
  - `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "password" }`
  - Response: `{ "id": 1, "email": "user@example.com", "name": "User Name", "token": "jwt_token" }`

### 2. 通知（Notifications）
- **取得即將到期任務**：
  - `GET /api/notifications/upcoming`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Response: 
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1001,
          "title": "寫 API 規格",
          "description": "任務詳細描述",
          "list_title": "待辦",
          "deadline": "2025-04-30T23:59:59"
        }
      ]
    }
    ```

### 3. Boards（看板）
- **建立看板**：
  - `POST /boards`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Body: `{ "title": "新看板名稱", "user_id": 1 }`
  - Response: `{ "id": 2, "title": "新看板名稱", "user_id": 1, ... }`
- **取得所有看板**：
  - `GET /boards?user_id=1`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Response: `[ { "id": 2, "title": "新看板名稱", "user_id": 1, ... }, ... ]`

### 4. Lists（清單）
- **建立清單**：
  - `POST /boards/{boardId}/lists`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Body: `{ "title": "待辦", "position": 0 }`
  - Response: `{ "id": 4, "board_id": 2, "title": "待辦", ... }`
- **取得看板下所有清單**：
  - `GET /boards/{boardId}/lists`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Response: `[ { "id": 4, "board_id": 2, "title": "待辦", ... }, ... ]`
- **刪除清單**：
  - `DELETE /lists/{listId}`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Response: `{ "id": "4" }`

### 5. Cards（卡片）
- **建立卡片**：
  - `POST /lists/{listId}/cards`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Body: `{ "title": "卡片標題", "description": "卡片描述", "position": 0, "deadline": "2025-05-10", "images": ["base64..."] }`
  - Response: `{ "id": 7, "list_id": 4, "title": "卡片標題", ... }`
- **取得清單下所有卡片**：
  - `GET /lists/{listId}/cards`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Response: `[ { "id": 7, "list_id": 4, "title": "卡片標題", ... }, ... ]`
- **更新卡片**：
  - `PUT /cards/{cardId}`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Body: `{ "title": "新標題", "description": "新描述", "deadline": "2025-05-15" }`
  - Response: `{ "id": 7, "list_id": 4, "title": "新標題", ... }`
- **刪除卡片**：
  - `DELETE /cards/{cardId}`
  - Headers: `{ "Authorization": "Bearer jwt_token" }`
  - Response: `{ "id": "7" }`

## 專案架構

主要組件和文件：

- `src/views/BoardView.vue`：主看板頁面，整合所有功能
- `src/components/UiItemForm.vue`：卡片新增/編輯表單
- `src/components/Card.vue`：卡片展示與操作
- `src/components/CardDetail.vue`：卡片詳情彈窗
- `src/services/notificationService.js`：通知服務
- `src/services/apiService.js`：API 服務
- `src/stores/board.js`：Pinia 狀態管理
- `src/stores/auth.js`：認證狀態管理
- `src/router/index.js`：路由配置
- `src/assets/styles`：全局樣式表

## 快速開始

> **請使用 Node.js 18 以上版本**

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 構建生產環境版本
npm run build
```

## 技術棧

- 前端框架：Vue 3 (`vue@^3.5.13`)
- 構建工具：Vite (`vite@^6.3.1`)
- 狀態管理：Pinia (`pinia@^3.0.2`)
- 路由：Vue Router (`vue-router@^4.5.1`)
- 拖曳互動：vue3-dnd (`vue3-dnd@^2.1.0`)、vue3-draggable-next
- 圖示：Font Awesome
- 樣式：Sass
- 設計原則：模組化、現代簡約、可重用性

## 聯絡方式

- Email: harry750110@gmail.com
- LinkedIn: [范綱栓](https://www.linkedin.com/in/%E7%B6%B1%E6%A0%93-%E8%8C%AF-810868219/)
