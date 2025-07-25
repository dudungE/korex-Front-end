import {createRouter, createWebHistory} from 'vue-router'
import SignupPage from '@/views/SignUpForm.vue'
import LoginPages from '@/views/LoginPages.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'MainPage',
            component: () => import('@/components/MainPage.vue')
        },
        {
            path: '/forex',
            name: 'Forex',
            component: () => import('@/views/ForexInfo/ForexInfo.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/Account',
            name: 'Account',
            component: () => import('@/views/Account.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/login',
            name: 'LoginPages',
            component: LoginPages
        },
        {
            path: '/sign-up',
            name: 'SignUpForm',
            component: SignupPage
        },
        {
            path: '/find-id',
            name: 'FindId',
            component: () => import('@/views/FindId.vue')
        },
        {
            path: '/reset-password',
            name: 'ResetPassword',
            component: () => import('@/views/ResetPassword.vue')
        },
        {
            path: '/mypage',
            name: 'MyPage',
            component: () => import('@/views/MyPage.vue'),
            meta: {requiresAuth: true}
        },
    ],
})

// 🔒 인증 가드 설정
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 인증 상태 확인 (액세스 토큰이 없어도 리프레시 토큰으로 복구 시도)
    const token = authStore.getToken()
    if (!authStore.isAuthenticated) {
        if (token) {
            // 토큰은 있지만 store의 인증 상태가 false인 경우 (페이지 새로고침 등)
            console.log('🔄 액세스 토큰 있음, 인증 상태 재확인 중...')
        } else {
            // 액세스 토큰 없음, 리프레시 토큰으로 복구 시도
            console.log('🔄 액세스 토큰 없음, 리프레시 토큰으로 복구 시도 중...')
        }
        await authStore.checkAuthStatus()
    }

    const isAuthenticated = authStore.isAuthenticated

    console.log(`🔍 Route Guard - Going to: ${to.path}, Authenticated: ${isAuthenticated}`)

    // 인증이 필요한 페이지 체크
    if (to.meta.requiresAuth && !isAuthenticated) {
        console.log('❌ 인증 필요, 로그인 페이지로 리다이렉트')
        next('/login')
    } else if (to.path === '/login' && isAuthenticated) {
        // 이미 로그인되어 있으면 홈페이지로 리다이렉트
        console.log('✅ 이미 로그인됨, 홈으로 리다이렉트')
        next('/')
    } else {
        // 정상적으로 진행
        console.log('✅ Route guard 통과')
        next()
    }
})

export default router