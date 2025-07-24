import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'MainPage',
            component: () => import('@/components/MainPage.vue'),
            meta: {requiresAuth: true}
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
        }
    ],
})

export default router