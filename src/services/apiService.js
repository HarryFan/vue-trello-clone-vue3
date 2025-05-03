/**
 * API Service
 * Trello Clone 專用，根據 api_spec.md 統一封裝所有 RESTful 請求。
 * - 命名與參數設計遵循 camelCase，JSDoc 標註。
 * - 方便切換 baseURL，維護與擴展。
 * - 回傳格式皆為 axios promise。
 */
import axios from 'axios'

// 這裡將 baseURL 改為本機 CI4 API 位置
const baseURL = 'http://localhost:8080/'

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

// List
export function getLists(boardId) {
  return api.get(`boards/${boardId}/lists`)
}
export function getList(id) {
  return api.get(`lists/${id}`)
}
export function createList(boardId, data) {
  return api.post(`boards/${boardId}/lists`, data)
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
export function createCard(listId, data) {
  return api.post(`lists/${listId}/cards`, data)
}
export function updateCard(id, data) {
  return api.put(`cards/${id}`, data)
}
export function deleteCard(id) {
  return api.delete(`cards/${id}`)
}

// 健康檢查
/**
 * 呼叫後端 API 健康檢查
 * @returns {Promise}
 */
export function healthCheck() {
  return api.get('api')
}

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
  healthCheck,
}
