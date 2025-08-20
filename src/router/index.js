import {createRouter, createWebHistory} from 'vue-router'
import SignupPage from '@/views/auth/SignUpForm.vue'
import LoginPages from '@/views/auth/LoginPages.vue'
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
            path: '/rate-lookup',
            name: 'RateLookup',
            component: () => import('@/views/ExchangeInfo/RateLookup.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/rate-calculator',
            name: 'RateCalculator',
            component: () => import('@/views/ExchangeInfo/Calculator.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/rate-alert',
            name: 'RateAlert',
            component: () => import('@/views/ExchangeInfo/RateAlert.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/rate-chart',
            name: 'RateChart',
            component: () => import('@/views/ExchangeInfo/RateChart.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/exchange',
            name: 'Exchange',
            component: () => import('@/views/CurrentExchange/CurrentExchange.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/remittance',
            name: 'Remittance',
            component: () => import('@/views/Remittance/Remittance.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/account',
            name: 'Account',
            component: () => import('@/views/Account/AccountView.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/ForeignTransfer',
            name: 'ForeignTransfer',
            component: () => import('@/views/ForeignTransfer/views/TransferRepuest/TransferRequest.vue'),
            // meta: {requiresAuth: true}
        },
        {
            path: '/account/detail/:currency', // 나중에 통화별 id 나 코드 받아서 넘겨야함 ex) /account/:currency
            name: 'AccountDetail',
            component: () => import('@/views/Account/AccountDetail.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/exchange/reservation',
            name: 'ReservationExchange',
            component: () => import('@/views/CurrentExchange/ReservationExchange.vue'),
            //meta: {requiresAuth: true}
        },
        {
            path: '/login',
            name: 'LoginPages',
            component: LoginPages
        },
        {
            path: '/signup/terms',
            name: 'TermsOfService',
            component: () => import('@/views/auth/TermsOfService.vue')
        },
        {
            path: '/sign-up',
            name: 'SignUpForm',
            component: SignupPage
        },
        {
            path: '/find-id',
            name: 'FindId',
            component: () => import('@/views/auth/FindId.vue')
        },
        {
            path: '/reset-password',
            name: 'ResetPassword',
            component: () => import('@/views/auth/ResetPassword.vue')
        },
        {
            path: '/mypage',
            name: 'MyPage',
            component: () => import('@/views/MyPage.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/recipients/post',
            name: 'RecipientsPost',
            component: () => import('@/views/ForeignTransfer/views/Recipients/PostRecipients.vue'),
        },
        {
            path: '/recipients/put',
            name: 'RecipientsPut',
            component: () => import('@/views/ForeignTransfer/views/Recipients/PutRecipients.vue'),
        },
        {
            path: '/recipients',
            name: 'recipients',
            component: () => import('@/views/ForeignTransfer/views/Recipients/GetRecipients.vue'),
        },
        {
            path: '/ForeignTransfer/list',
            name: 'ForeignTransferList',
            component: () => import('@/views/ForeignTransfer/views/TransferList/TransferList.vue'),
        },
        {
            path: '/ForeignTransfer/info',
            name: 'ForeignTransferInfo',
            component: () => import('@/views/ForeignTransfer/views/TransferRepuest/information.vue'),
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