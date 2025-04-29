# CodeIgniter 3 作為 Trello Clone API 的最佳選擇

## 選擇理由

| 項目         | 純 PHP 自己寫 | CodeIgniter 3 (CI3) |
|--------------|--------------|---------------------|
| 開發速度     | 慢，重複造輪子 | 快，功能齊全         |
| 結構         | 易亂，難維護   | MVC 清楚，易擴充      |
| 安全性       | 要自己顧      | 內建防護（CSRF、SQL Injection）|
| 資料庫操作   | 手刻 SQL      | Query Builder 易用   |
| 路由         | if 判斷 URL   | Router 自動分類      |
| 會員登入/驗證| 自己組邏輯    | Auth middleware 快速擴充 |
| 文件         | 無            | 官方文件完整，範例多  |
| 學習曲線     | 超低          | 輕量易學，MVC 概念   |
| 部署         | 簡單          | 超簡單，上傳即用      |

## 適合情境
- 主機僅支援 PHP/MySQL（如 Bluehost 虛擬主機）
- 需要快速開發、功能明確（登入、CRUD、通知）
- 預算有限、小型或中型專案
- 前端已用 Vue3，專注後端 API 即可

## CodeIgniter 3 實作建議

### 1. 資料表 SQL
```sql
-- 使用者表
CREATE TABLE `users` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 通知表
CREATE TABLE `notifications` (
  `id` INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT(11) UNSIGNED NOT NULL,
  `content` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 2. Controller 範例（application/controllers/Api.php）
```php
<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Api extends CI_Controller {
  public function __construct() {
    parent::__construct();
    $this->load->model('User_model');
    $this->load->model('Notification_model');
    $this->load->helper('url');
    $this->load->helper('security');
  }

  // 登入功能
  public function login() {
    $email = $this->input->post('email', TRUE);
    $password = $this->input->post('password', TRUE);
    $user = $this->User_model->get_user_by_email($email);
    if ($user && password_verify($password, $user->password)) {
      $token = bin2hex(random_bytes(16));
      $this->User_model->update_token($user->id, $token);
      echo json_encode(['token' => $token]);
    } else {
      http_response_code(401);
      echo json_encode(['error' => '帳號或密碼錯誤']);
    }
  }

  // 取得通知列表
  public function notifications() {
    $token = $this->input->get_request_header('Authorization', TRUE);
    $user = $this->User_model->get_user_by_token($token);
    if (!$user) {
      http_response_code(401);
      echo json_encode(['error' => '未授權']);
      return;
    }
    $notifications = $this->Notification_model->get_notifications_by_user($user->id);
    echo json_encode($notifications);
  }
}
```

### 3. Model 範例
#### application/models/User_model.php
```php
<?php
class User_model extends CI_Model {
  public function get_user_by_email($email) {
    return $this->db->get_where('users', ['email' => $email])->row();
  }
  public function get_user_by_token($token) {
    return $this->db->get_where('users', ['token' => $token])->row();
  }
  public function update_token($user_id, $token) {
    return $this->db->update('users', ['token' => $token], ['id' => $user_id]);
  }
}
```

#### application/models/Notification_model.php
```php
<?php
class Notification_model extends CI_Model {
  public function get_notifications_by_user($user_id) {
    $this->db->where('user_id', $user_id);
    $this->db->order_by('created_at', 'DESC');
    return $this->db->get('notifications')->result();
  }
}
```

### 4. 路由設定（application/config/routes.php）
```php
$route['api/login'] = 'api/login';
$route['api/notifications'] = 'api/notifications';
```

### 5. 小提醒
- 密碼請用 `password_hash()` 儲存，驗證用 `password_verify()`
- Token 用 `random_bytes()` 產生即可
- 前端請在 header 帶上 `Authorization: Bearer {token}`
- API 回傳格式統一 JSON
- 部署只需上傳到 Bluehost `public_html`，無需額外設定

---

## 總結
- CodeIgniter 3 是小型/中型 API 專案的最佳選擇，開發快、結構佳、部署無痛。
- 適合你這種 Trello Clone + 登入 + 通知功能需求，特別是在 Bluehost 這類僅支援 PHP/MySQL 的主機環境。
- 比純 PHP 更安全、可維護，比 Laravel 輕量，文件/範例資源豐富。

如需更多範本、CI3 進階用法、或遇到部署問題，請隨時查閱本文件或詢問協作者！
