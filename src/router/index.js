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
            path: '/Account',
            name: 'Account',
            component: () => import('@/views/Account.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/login',
            name: 'LoginPages',
            component: () => import('@/views/LoginPages.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/sign-up',
            name: 'SignUpForm',
            component: () => import('@/views/SignUpForm.vue'),
            meta: {requiresAuth: true}
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
        }
    ],
})

export default router