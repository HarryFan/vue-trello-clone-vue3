# Trello Clone API 建議書

## 目標
設計一組 RESTful API，供前端 Vue 應用與後端（PHP+MySQL）溝通，資料結構參考 snapshot.json。

---

## 物件結構

### Board（看板）
```json
{
  "id": 1,
  "title": "範例看板",
  "lists": [ ... ]
}
```

### List（清單）
```json
{
  "id": 101,
  "boardId": 1,
  "title": "待辦事項",
  "cards": [ ... ]
}
```

### Card（卡片）
```json
{
  "id": 1001,
  "listId": 101,
  "title": "寫 API 規格",
  "description": "詳細說明...",
  "order": 1
}
```

---

## API 規劃

### Board（看板）
| 動作     | Method | 路徑                  | 說明           |
|----------|--------|-----------------------|----------------|
| 取得全部 | GET    | /api/boards           | 取得所有看板   |
| 取得單一 | GET    | /api/boards/{id}      | 取得單一看板   |
| 新增     | POST   | /api/boards           | 新增看板       |
| 更新     | PUT    | /api/boards/{id}      | 修改看板       |
| 刪除     | DELETE | /api/boards/{id}      | 刪除看板       |

### List（清單）
| 動作     | Method | 路徑                              | 說明           |
|----------|--------|-----------------------------------|----------------|
| 取得全部 | GET    | /api/boards/{boardId}/lists       | 取得看板下所有清單 |
| 取得單一 | GET    | /api/lists/{id}                   | 取得單一清單   |
| 新增     | POST   | /api/boards/{boardId}/lists       | 新增清單       |
| 更新     | PUT    | /api/lists/{id}                   | 修改清單       |
| 刪除     | DELETE | /api/lists/{id}                   | 刪除清單       |

### Card（卡片）
| 動作     | Method | 路徑                              | 說明           |
|----------|--------|-----------------------------------|----------------|
| 取得全部 | GET    | /api/lists/{listId}/cards         | 取得清單下所有卡片 |
| 取得單一 | GET    | /api/cards/{id}                   | 取得單一卡片   |
| 新增     | POST   | /api/lists/{listId}/cards         | 新增卡片       |
| 更新     | PUT    | /api/cards/{id}                   | 修改卡片       |
| 刪除     | DELETE | /api/cards/{id}                   | 刪除卡片       |

---

## 請求與回應格式

### 新增清單（POST /api/boards/{boardId}/lists）
**Request Body**
```json
{
  "title": "進行中"
}
```
**Response**
```json
{
  "success": true,
  "data": {
    "id": 102,
    "boardId": 1,
    "title": "進行中",
    "cards": []
  }
}
```

### 刪除卡片（DELETE /api/cards/{id}）
**Response**
```json
{
  "success": true
}
```

---

## 通用規範
- 所有 API 回傳格式統一為 JSON。
- 新增、更新時，回傳完整物件內容（含 id）。
- 失敗時，回傳 success: false 並附上 message。
- 所有寫入動作（POST/PUT/DELETE）都要驗證參數與權限。
- 跨域存取（CORS）允許前端網域。

---

## 資料表設計建議（MySQL 範例）

### boards
| 欄位        | 型別         | 屬性           | 說明        |
|-------------|--------------|----------------|-------------|
| id          | INT          | PK, AUTO_INCREMENT | 主鍵        |
| title       | VARCHAR(255) | NOT NULL       | 看板名稱    |
| created_at  | DATETIME     | DEFAULT CURRENT_TIMESTAMP | 建立時間 |
| updated_at  | DATETIME     | ON UPDATE CURRENT_TIMESTAMP | 更新時間 |

### lists
| 欄位        | 型別         | 屬性           | 說明        |
|-------------|--------------|----------------|-------------|
| id          | INT          | PK, AUTO_INCREMENT | 主鍵        |
| board_id    | INT          | FK             | 所屬看板 id  |
| title       | VARCHAR(255) | NOT NULL       | 清單名稱    |
| position    | INT          |                | 排序用      |
| created_at  | DATETIME     | DEFAULT CURRENT_TIMESTAMP | 建立時間 |
| updated_at  | DATETIME     | ON UPDATE CURRENT_TIMESTAMP | 更新時間 |

### cards
| 欄位        | 型別         | 屬性           | 說明        |
|-------------|--------------|----------------|-------------|
| id          | INT          | PK, AUTO_INCREMENT | 主鍵        |
| list_id     | INT          | FK             | 所屬清單 id  |
| title       | VARCHAR(255) | NOT NULL       | 卡片標題    |
| description | TEXT         |                | 卡片描述    |
| `order`     | INT          |                | 排序用      |
| created_at  | DATETIME     | DEFAULT CURRENT_TIMESTAMP | 建立時間 |
| updated_at  | DATETIME     | ON UPDATE CURRENT_TIMESTAMP | 更新時間 |

#### 補充說明
- `FK` = 外鍵，建議加上外鍵約束。
- `position`/`order` 欄位用於前端拖曳排序。
- 可依需求增加 `user_id`、權限等欄位。
- 欄位名稱、型別與前端結構需保持一致。

---

## 備註
- 欄位名稱、結構請與前端 snapshot.json 保持一致。
- 有特殊欄位或額外需求請補充。
