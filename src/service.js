/**
 * API Service
 * Trello Clone 專用，根據 api_spec.md 統一封裝所有 RESTful 請求。
 * - 命名與參數設計遵循 camelCase，JSDoc 標註。
 * - 方便切換 baseURL，維護與擴展。
 * - 回傳格式皆為 axios promise。
 */
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://www.blueshot.com/api/'

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Board
/**
 * 取得所有看板
 * @returns {Promise}
 */
export function getBoards() {
  return api.get('boards')
}

/**
 * 取得單一看板
 * @param {string} id - 看板 ID
 * @returns {Promise}
 */
export function getBoard(id) {
  return api.get(`boards/${id}`)
}

/**
 * 新增看板
 * @param {object} data - 看板資料
 * @returns {Promise}
 */
export function createBoard(data) {
  return api.post('boards', data)
}

/**
 * 更新看板
 * @param {string} id - 看板 ID
 * @param {object} data - 看板資料
 * @returns {Promise}
 */
export function updateBoard(id, data) {
  return api.put(`boards/${id}`, data)
}

/**
 * 刪除看板
 * @param {string} id - 看板 ID
 * @returns {Promise}
 */
export function deleteBoard(id) {
  return api.delete(`boards/${id}`)
}

// List
/**
 * 取得看板中的所有清單
 * @param {string} boardId - 看板 ID
 * @returns {Promise}
 */
export function getLists(boardId) {
  return api.get(`boards/${boardId}/lists`)
}

/**
 * 取得單一清單
 * @param {string} id - 清單 ID
 * @returns {Promise}
 */
export function getList(id) {
  return api.get(`lists/${id}`)
}

/**
 * 新增清單
 * @param {string} boardId - 看板 ID
 * @param {object} data - 清單資料
 * @returns {Promise}
 */
export function createList(boardId, data) {
  return api.post(`boards/${boardId}/lists`, data)
}

/**
 * 更新清單
 * @param {string} id - 清單 ID
 * @param {object} data - 清單資料
 * @returns {Promise}
 */
export function updateList(id, data) {
  return api.put(`lists/${id}`, data)
}

/**
 * 刪除清單
 * @param {string} id - 清單 ID
 * @returns {Promise}
 */
export function deleteList(id) {
  return api.delete(`lists/${id}`)
}

// Card
/**
 * 取得清單中的所有卡片
 * @param {string} listId - 清單 ID
 * @returns {Promise}
 */
export function getCards(listId) {
  return api.get(`lists/${listId}/cards`)
}

/**
 * 取得單一卡片
 * @param {string} id - 卡片 ID
 * @returns {Promise}
 */
export function getCard(id) {
  return api.get(`cards/${id}`)
}

/**
 * 新增卡片
 * @param {string} listId - 清單 ID
 * @param {object} data - 卡片資料
 * @returns {Promise}
 */
export function createCard(listId, data) {
  return api.post(`lists/${listId}/cards`, data)
}

/**
 * 更新卡片
 * @param {string} id - 卡片 ID
 * @param {object} data - 卡片資料
 * @returns {Promise}
 */
export function updateCard(id, data) {
  return api.put(`cards/${id}`, data)
}

/**
 * 刪除卡片
 * @param {string} id - 卡片 ID
 * @returns {Promise}
 */
export function deleteCard(id) {
  return api.delete(`cards/${id}`)
}

// 通用（可依需求擴充）
export default {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
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
}
