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
            path: '/forex',
            name: 'Forex',
            component: () => import('@/views/ForexInfo/ForexInfo.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/forex/exchange',
            name: 'ForexExchange',
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