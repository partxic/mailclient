import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/view/Login.vue')
        },
        {
            path: '/client',
            name: 'client',
            component: () => import('@/view/Client.vue')
        }
    ]
})
