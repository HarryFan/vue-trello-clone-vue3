import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/',
    name: 'Board',
    component: () => import('@/views/BoardView.vue'),
    meta: { requiresAuth: true }
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

// 路由守衛
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
