/**
 * Trello Clone 專用，根據 api_spec.md 統一封裝所有 RESTful 請求。
 * - 命名與參數設計遵循 camelCase，JSDoc 標註。
 * - 方便切換 baseURL，維護與擴展。
 * - 回傳格式皆為 axios promise。
 */
import axios from 'axios'

// 從環境變數取得 API 基礎 URL
const DEFAULT_BASE_URL = 'http://localhost:8085/'
const baseURL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL

// 先創建一個使用預設 URL 的 axios 實例
let api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: false, // 改為 false 避免 CORS 憑證問題
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

// 初始化函數，直接使用環境變數中的 URL
export const initApi = async () => {
  try {
    console.log('初始化 API，使用 baseURL:', baseURL)
    return api
  } catch (error) {
    console.error('初始化 API 失敗', error)
    return api
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
