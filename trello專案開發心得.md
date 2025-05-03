---
title: 'Trello 專案開發心得與技術總結'
publishDate: '2025-05-03'
description: '這篇文章總結了我在開發仿 Trello 專案過程中使用的核心功能、技術棧及開發心得。'
author: 'Vue & CodeIgniter 開發者'
image:
  url: '/assets/trello-clone.jpg'
  alt: 'Trello Clone 專案截圖'
tags: ["vue", "codeigniter", "前後端分離", "看板系統", "通知功能"]
---

# Trello 專案開發心得與技術總結

## 核心功能實現

### 1. 看板管理系統
- 建立多個看板 (Board)
- 在看板內建立多個清單 (List)
- 在清單內建立可拖曳的任務卡片 (Card)
- 卡片支援標題、描述、截止日期等資訊

### 2. 拖放功能
- 實現卡片在不同清單間的拖放
- 實現清單在看板內的排序
- 自動同步拖放後的新順序至後端

### 3. 通知系統
- 瀏覽器原生通知 (Notification API)
- 應用內通知提醒
- 即將到期任務提醒
- 電子郵件通知 (後端實作，待部署測試)

### 4. 使用者管理
- 註冊與登入系統
- JWT 身分驗證
- 使用者偏好設定

## 使用的技術棧

### 前端技術
- **Vue.js 3** - 使用 Composition API 建構響應式 UI
- **Pinia** - 新一代狀態管理工具，取代 Vuex
- **Vue Router** - 處理前端路由
- **vue3-dnd** - 實現拖放功能的套件
- **Font Awesome** - 提供圖標資源
- **Vite** - 現代前端構建工具，提供更快的開發體驗
- **Notification API** - 瀏覽器原生通知功能

### 後端技術
- **CodeIgniter 4** - PHP 框架，處理 API 請求
- **MySQL/MariaDB** - 關聯式資料庫
- **JWT** - JSON Web Token 實現身分驗證
- **RESTful API** - 設計並實現符合 REST 架構的 API

## 開發心得

### 前後端分離架構的優勢
實作前後端分離架構讓我們能夠同時開發兩端，不互相阻塞。前端專注於使用者體驗，後端專注於業務邏輯與資料存取，大幅提升開發效率。

### Vue 3 Composition API 的強大
使用 Vue 3 的 Composition API 讓程式碼更具可讀性和可維護性。相較於 Options API，邏輯更加內聚，易於重用和測試。

```js
// Composition API 範例
import { ref, computed, watch } from 'vue'

export default {
  setup() {
    const cards = ref([])
    const totalCards = computed(() => cards.value.length)
    
    watch(cards, (newCards) => {
      console.log('卡片狀態已更新')
    })
    
    function addCard(card) {
      cards.value.push(card)
    }
    
    return { cards, totalCards, addCard }
  }
}
```

### 拖放功能實現的挑戰
實作拖放功能是本專案最具挑戰性的部分之一。需要處理複雜的事件監聽、元素位置計算和後端同步，同時確保使用者體驗流暢。

### 通知系統的多層次設計
為了確保使用者不會錯過重要提醒，我們設計了多層次的通知系統：
- 頁面內顯示的通知卡片作為最基本的提醒
- 瀏覽器原生通知作為使用者離開頁面時的提醒
- 電子郵件通知作為離線提醒的最後防線

### 本地開發與部署的差異
本機環境難以測試某些功能，特別是電子郵件發送功能。這突顯了開發環境與生產環境差異的重要性，以及需要建立更完整的測試環境的需求。

## 未來優化方向

1. **即時通訊**: 導入 WebSocket 或 Firebase 等技術，實現即時通知和協作
2. **豐富的通知類型**: 增加更多通知類型，如評論提醒、提及等
3. **行動裝置支援**: 優化行動裝置使用體驗，可能考慮開發原生應用
4. **整合第三方服務**: 與 GitHub、Google Calendar 等服務整合
5. **更豐富的卡片功能**: 添加標籤、附件、清單等功能

## 總結

這個專案不僅幫助我們深入理解了現代前後端開發技術，也讓我們體會到專案管理工具的設計思維。透過實作各種功能，我們學習了如何平衡技術實現與使用者體驗的需求，以及如何在開發過程中解決各種挑戰。

在技術選擇上，Vue 3 + CodeIgniter 4 的組合證明了其高效性和靈活性，適合中小型專案的快速開發。未來若需要擴展更多功能，這個架構也有足夠的彈性支援成長。
