# Vue Trello Clone 開發技術指南

## 專案背景與目標

本專案旨在以 Vue 3 + Vite 重構經典 Trello 任務管理板，追求現代、簡潔、可維護的前端架構，並強調元件 API 文件的自動化與一致性。

## 開發歷程與設計思維

### 1. 初始選型：Element Plus 的優缺點
- 專案初期選用 Element Plus 作為 UI 元件庫，快速搭建表單、彈窗、按鈕等基礎介面。
- 優點：開發速度快、元件豐富。
- 缺點：高度封裝導致自訂拖曳（Drag and Drop）難以與 vue3-dnd 等第三方套件深度整合。

### 2. 遭遇瓶頸：拖曳排序的挑戰
- Trello 式任務管理板的靈魂在於「卡片/欄位可自由拖曳排序」。
- Element Plus 的 Grid、Card 等元件結構複雜，DOM 層級深，導致拖曳套件無法正常偵測目標、觸發事件。
- 多次嘗試調整 slot、ref 綁定、事件代理，仍遇到拖曳失效、UI 跳動等問題。

### 3. 轉念重構：回歸客製化 UI
- 決定移除 Element Plus 主要排版元件，僅保留部分基礎樣式輔助。
- 以原生 HTML + SCSS +自訂 Vue 元件重構卡片、列表、彈窗等 UI。
- 重新設計 DOM 結構，確保每個拖曳目標都是獨立、扁平、可被 vue3-dnd 等套件正確識別。

### 4. 拖曳功能終於順利實現
- 採用 vue3-dnd、vue3-draggable-next 等套件，直接操作自訂元件，拖曳流暢、事件可控。
- 拖曳時可即時更新資料、動畫不卡頓，UI/UX 大幅提升。
- 也因此元件 API 更加單純、易於維護。

## 關鍵技術選型
- Vue 3 + Vite：現代化開發體驗，熱更新快，組件語法簡潔。
- Pinia：輕量狀態管理，易於模組化。
- vue3-dnd、vue3-draggable-next：專為 Vue 3 設計的拖曳解決方案。
- Font Awesome：圖示豐富，易於自訂。
- SCSS：彈性樣式管理，支援主題與變數。

## API 文件自動化
- 開發 snapshot.py 腳本，掃描所有 Vue/JS 檔案，解析 JSDoc、props、emits、functions，產生 snapshot.json。
- snapshot.json 可作為 API 對照表、文件自動產生依據，方便團隊協作與維護。

## 心得與建議
- UI 框架雖然提升開發速度，但遇到高度自訂需求（如 Trello 拖曳排序）時，適時回歸客製化 UI 能帶來更佳可控性與維護性。
- 建議新專案可先評估核心互動需求，再決定 UI 框架深度。
- 文件自動化（如 snapshot.py）能大幅降低溝通成本，提升開發效率。

---

如需參考原始碼、API 結構，請見 snapshot.json 及各 Vue 元件註解。歡迎有興趣者 fork、討論、共創！
