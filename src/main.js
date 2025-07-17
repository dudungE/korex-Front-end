import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import MainPage from './components/MainPage.vue'
import ForexInfo from './views/ForexInfo/ForexInfo.vue'

const routes = [
  { path: '/', component: MainPage },
  { path: '/forex', component: ForexInfo }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
