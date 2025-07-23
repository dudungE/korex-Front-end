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
            path: '/international',
            name: 'International',
            component: () => import('@/views/Remit/views/International.vue'),
            meta: {requiresAuth: true}
        }
    ],
})

export default router