# Vue Trello Clone (Vue 3 + Vite)

本專案為 Vue 2 Trello 任務管理板的 Vue 3 + Vite 全新重構版，UI 採用 Element Plus，狀態管理改用 Pinia，所有資料皆支援 localStorage 持久化。

---

## 快速啟動
```bash
npm install
npm run dev
```

---

## 近期進度與開發備忘
- 已完成主要元件遷移（BoardView、Card、CardDetail、UiItemForm）
- 狀態管理已改為 Pinia，lists/task 支援 localStorage
- 表單新增/編輯整合為 UiItemForm，支援圖片上傳
- 路由預設進入主看板（/），歡迎頁移至 /welcome
- 新增 snapshot.py 腳本，可自動產生 snapshot.json，方便查詢現有組件/函式
- 最新快照已 commit，回台北後可繼續開發

### 開發建議
- 參考 snapshot.json，避免幻想不存在的 API
- 如需查詢現有 props、emits、store actions，直接檢索 snapshot.json
- 若有新元件/資料流，建議同步更新 snapshot
- 建議持續優化 UI/UX、加強表單驗證、完善圖片管理
- 可考慮導入 ESLint/Prettier 維持風格一致

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

## 下一步待辦（回台北後建議繼續進行）
- 持續測試所有功能，特別是表單與圖片處理
- 優化 UI/UX，調整 Element Plus 元件細節
- 增加單元測試、自動化快照
- 文件補充與整理（含 snapshot 使用說明）

---

## 參考資源
- [Element Plus 官方元件與圖示總覽](https://element-plus.org/en-US/component/overview.html)
- [Font Awesome 官方圖示查詢](https://fontawesome.com/icons/)
- [vue3-dnd 拖曳元件官方文件](https://www.vue3-dnd.com/guide/)

---

## 當前困難與待解決
- 無法在 Vue3 + Vite 中正確 import `vuedraggable`，持續出現 `plugin:vite:import-analysis` 錯誤
- 已嘗試指定 dist 路徑、調整 `vite.config.js`、安裝 commonjs 插件、改用其他拖曳套件，仍未解決
- 明日回來接續時，可參考 Vue2 版本之實作邏輯：
  `/Users/gangshuanfan/Documents/github/vue-trello-clone`

---

**如需協助或有新想法，歡迎隨時留言！**
