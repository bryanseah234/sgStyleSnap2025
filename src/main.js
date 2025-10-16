import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './index.css'

// Import pages
import Home from './pages/Home.vue'
import Cabinet from './pages/Cabinet.vue'
import Dashboard from './pages/Dashboard.vue'
import Friends from './pages/Friends.vue'
import Profile from './pages/Profile.vue'
import FriendCabinet from './pages/FriendCabinet.vue'

// Router configuration
const routes = [
  { path: '/', component: Home },
  { path: '/cabinet', component: Cabinet },
  { path: '/dashboard', component: Dashboard },
  { path: '/friends', component: Friends },
  { path: '/profile', component: Profile },
  { path: '/friend-cabinet', component: FriendCabinet }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create app
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
