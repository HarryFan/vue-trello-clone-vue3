import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Board',
    component: () => import('@/views/BoardView.vue')
  },
  {
    path: '/welcome',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
