import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import MainPage from './components/MainPage.vue'
import Forex from './components/Forex.vue'

const routes = [
  { path: '/', component: MainPage },
  { path: '/forex', component: Forex }
]
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

createApp(App).use(router).mount('#app')
