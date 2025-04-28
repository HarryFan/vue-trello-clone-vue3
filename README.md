# Vue Trello Clone (Vue 3 + Vite)

本專案為 Vue 2 Trello 任務管理板的 Vue 3 + Vite 全新重構版，UI 為自訂 UI 元素，狀態管理改用 Pinia，所有資料皆支援 localStorage 持久化。

> 本專案最終能實現 Trello 風格的拖曳排序（Drag and Drop），關鍵在於未採用 Element Plus 官方 UI 排版元件，而是改用客製化 UI 元素與自訂元件結構，確保
> vue3-dnd、vue3-draggable-next 等拖曳套件能無縫整合、互動順暢。此設計大幅提升拖曳體驗與兼容性。

---

## 快速啟動

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

**感謝參與本專案開發！如需協助或有新想法，歡迎隨時交流。**
