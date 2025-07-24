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
            path: '/account/detail/:currency', // 나중에 통화별 id 나 코드 받아서 넘겨야함 ex) /account/:currency
            name: 'AccountDetail',
            component: () => import('@/views/Account/AccountDetail.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/exchange/reservation', // 나중에 통화별 id 나 코드 받아서 넘겨야함 ex) /account/:currency
            name: 'ReservationExchange',
            component: () => import('@/views/CurrentExchange/ReservationExchange.vue'),
            meta: {requiresAuth: true}
        }
    ],
})

export default router