// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    //meta: { requiresGuest: true }
  },
  {
    path: '/travel-budget',
    name: 'TravelBudget',
    component: () => import('@/views/TravelBudget/index.vue'),
    //meta: { requiresAuth: true }
  },
  {
    path: '/travel/:id',
    name: 'TravelDetail',
    component: () => import('@/views/TravelBudget/components/TravelCard.vue'),
    //meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/travel-budget')
  } else {
    next()
  }
})

export default router
