/**
 * Trello Clone 專用，根據 api_spec.md 統一封裝所有 RESTful 請求。
 * - 命名與參數設計遵循 camelCase，JSDoc 標註。
 * - 方便切換 baseURL，維護與擴展。
 * - 回傳格式皆為 axios promise。
 */
import axios from 'axios'

// 從環境變數取得 API 基礎 URL
const DEFAULT_BASE_URL = 'http://localhost:8080/'
const baseURL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL

// 建立一個動態檢測 API 連線的函數
const checkApiEndpoints = async () => {
  // 嘗試 8080-8089 的埠號
  const ports = [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089]
  const hosts = ['localhost', '127.0.0.1'] // 嘗試不同的主機名
  
  for (const host of hosts) {
    for (const port of ports) {
      try {
        // 使用簡單的 fetch 請求，僅檢查能否連線而不依賴回應內容
        const response = await fetch(`http://${host}:${port}/api`, { 
          method: 'GET',
          cache: 'no-cache',
          headers: { 'Accept': 'application/json' },
          // 設定較短的超時時間，以加快檢測速度
          signal: AbortSignal.timeout(500)
        })
        
        // 只要請求成功，就視為該埠號可用
        if (response.ok) {
          console.log(`發現 API 伺服器在 ${host}:${port}`)
          return `http://${host}:${port}/`
        } else {
          console.log(`${host}:${port} 連線成功但回應錯誤: ${response.status}`)
        }
      } catch (error) {
        // 如果是超時錯誤，不顯示錯誤堆疊
        if (error.name === 'AbortError') {
          console.log(`${host}:${port} 連線超時`)
        } else {
          console.log(`${host}:${port} 連線失敗`)
        }
      }
    }
  }
  
  // 如果都找不到，返回預設值
  console.warn('無法找到可用的 API 端點，使用預設值')
  return baseURL
}

// 先創建一個使用預設 URL 的 axios 實例
let api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// 添加請求攔截器，自動添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('trello_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 初始化函數，可選用於動態更新 baseURL
export const initApi = async () => {
  try {
    console.log('初始化 API，目前 baseURL:', baseURL)
    const detectedBaseUrl = await checkApiEndpoints()
    console.log('檢測到的 API URL:', detectedBaseUrl)
    
    // 如果檢測到的 URL 與當前不同，則重新創建 api 實例
    if (detectedBaseUrl !== api.defaults.baseURL) {
      console.log(`更新 API 基礎 URL 為: ${detectedBaseUrl}`)
      api = axios.create({
        baseURL: detectedBaseUrl,
        timeout: 10000,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      // 重新添加請求攔截器
      api.interceptors.request.use(config => {
        const token = localStorage.getItem('trello_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      })
    }
    
    return api
  } catch (error) {
    console.error('初始化 API 失敗', error)
    return api // 返回原始實例作為備用
  }
}

// 健康檢查
export function healthCheck() {
  return api.get('api')
}

// Auth
export function login(data) {
  return api.post('auth/login', data)
}

// Board
export function getBoards() {
  return api.get('boards')
}

export function getBoard(id) {
  return api.get(`boards/${id}`)
}

export function createBoard(data) {
  return api.post('boards', data)
}

export function updateBoard(id, data) {
  return api.put(`boards/${id}`, data)
}

export function deleteBoard(id) {
  return api.delete(`boards/${id}`)
}

/**
 * 重設看板為預設狀態
 * @param {number} boardId
 */
export function resetBoard(boardId) {
  return api.post(`boards/${boardId}/reset`)
}

// List
export function getLists(boardId) {
  return api.get(`boards/${boardId}/lists`)
}

export function getList(id) {
  return api.get(`lists/${id}`)
}

export function createList(boardId, listData) {
  return api.post(`boards/${boardId}/lists`, listData)
}

export function updateList(id, data) {
  return api.put(`lists/${id}`, data)
}

export function deleteList(id) {
  return api.delete(`lists/${id}`)
}

// Card
export function getCards(listId) {
  return api.get(`lists/${listId}/cards`)
}

export function getCard(id) {
  return api.get(`cards/${id}`)
}

export function createCard(listId, cardData) {
  return api.post(`lists/${listId}/cards`, cardData)
}

export function updateCard(id, data) {
  return api.put(`cards/${id}`, data)
}

export function deleteCard(id) {
  return api.delete(`cards/${id}`)
}

export default {
  login,
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  resetBoard,
  getLists,
  getList,
  createList,
  updateList,
  deleteList,
  getCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  initApi,
  healthCheck
}
