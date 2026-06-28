import { createApp } from 'vue'
import App from '@/App.vue'
const app = createApp(App)

import router from '@/router.js'
app.use(router)

import '@/global.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
app.mount('#app')
