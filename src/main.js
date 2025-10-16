import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './index.css'
import { useTheme } from './composables/useTheme'

// Import pages
import Home from './pages/Home.vue'
import Cabinet from './pages/Cabinet.vue'
import Dashboard from './pages/Dashboard.vue'
import Friends from './pages/Friends.vue'
import Profile from './pages/Profile.vue'
import FriendCabinet from './pages/FriendCabinet.vue'
import Login from './pages/Login.vue'

// Router configuration
const routes = [
  { path: '/', component: Home, meta: { requiresAuth: true } },
  { path: '/cabinet', component: Cabinet, meta: { requiresAuth: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/friends', component: Friends, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/friend-cabinet', component: FriendCabinet, meta: { requiresAuth: true } },
  { path: '/login', component: Login, meta: { requiresAuth: false } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route protection
router.beforeEach(async (to, from, next) => {
  const { api } = await import('@/api/client')
  
  try {
    const user = await api.auth.me()
    
    if (to.meta.requiresAuth && !user) {
      next('/login')
    } else if (to.path === '/login' && user) {
      next('/')
    } else {
      next()
    }
  } catch (error) {
    if (to.meta.requiresAuth) {
      next('/login')
    } else {
      next()
    }
  }
})

// Initialize theme before creating app
const { loadUser } = useTheme()

// Create app
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme and load user
app.mount('#app')

// Load user theme after app is mounted
loadUser()
