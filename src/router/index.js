import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/test',
            name: 'test',
            component: () => import('@/components/test.vue'),
            meta: {requiresAuth: true}
        },
    ],
})

export default router