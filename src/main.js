import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import { createRouter, createWebHistory } from 'vue-router'
import MainPage from './components/MainPage.vue'
import ForexInfo from './views/ForexInfo/ForexInfo.vue'
import Account from './views/Account.vue'

// const routes = [
//   { path: '/', component: MainPage },
//   { path: '/forex', component: ForexInfo },
//   { path: '/Account', component: Account }
// ]
// const router = createRouter({
//   history: createWebHistory(),
//   routes
// })

createApp(App).use(router).mount('#app')
