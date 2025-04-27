# Vue Trello Clone (Vue 3 + Vite)

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## 下一步待辦（回台北後建議繼續進行）

### 1. 元件搬遷與重構
- 將原 Vue2 專案的主要元件（Board、Card、CardDetail、UiItemForm 等）搬移到 `src/components`、`src/views`
- 搬移時同步升級語法為 Vue 3（優先 `<script setup>` 與 Composition API）
- 調整 v-model、事件、slot、emit、props 等為 Vue 3 標準
- 移除/替換 Vue 2 已棄用 API

### 2. 狀態管理與資料流
- 原本 Vuex 狀態搬遷到 Pinia（`src/stores`）
- 將任務、清單、卡片等資料管理邏輯集中於 Pinia Store

### 3. 路由與頁面
- 完善 `src/router/index.js`，根據需求新增多頁面（如卡片詳情、設定等）

### 4. Element Plus UI 套件整合
- 將原有按鈕、彈窗、表單等元件改用 Element Plus 元件
- 調整樣式與互動，確保一致性

### 5. API/資料串接
- 若有 axios/fetch 資料存取，集中到 `src/services` 或 `src/apis`
- 測試本地資料流與 API 串接

### 6. 全站樣式搬遷
- 將原 SCSS/CSS 主題搬移到新專案
- 若有全域變數，建議放在 `src/assets/styles` 並於 main.js 匯入

### 7. 功能測試與優化
- 每搬一個模組就局部測試，確保主流程可用
- 逐步優化元件結構與效能

### 8. 其他建議
- 加入 ESLint + Prettier，保持程式碼一致性
- README 補充專案架構、啟動指令、遷移注意事項

---

## 啟動專案
```bash
npm install
npm run dev
```

---

**祝順利完成 Vue 3 翻新！如有任何問題歡迎隨時詢問。**
