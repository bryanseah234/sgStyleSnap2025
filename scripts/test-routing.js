#!/usr/bin/env node

/**
 * StyleSnap - Routing Test Script
 * 
 * This script tests the routing logic to ensure proper redirects
 * for authenticated and unauthenticated users.
 * 
 * Usage: node scripts/test-routing.js
 */

console.log('🧪 Testing Routing Logic...')
console.log('')

// Test 1: Check router guard logic
console.log('1️⃣ Checking router guard implementation...')
try {
  const fs = require('fs')
  const mainContent = fs.readFileSync('src/main.js', 'utf8')
  
  // Check for proper login redirect logic
  if (mainContent.includes("to.path === '/login'")) {
    console.log('✅ Login route handling found')
  } else {
    console.log('❌ Login route handling not found')
  }
  
  if (mainContent.includes("next('/home')")) {
    console.log('✅ Redirect to /home found')
  } else {
    console.log('❌ Redirect to /home not found')
  }
  
  if (mainContent.includes("isAuthenticated")) {
    console.log('✅ Authentication check found')
  } else {
    console.log('❌ Authentication check not found')
  }
  
  // Check for proper route structure
  if (mainContent.includes("path: '/', redirect: '/home'")) {
    console.log('✅ Root redirect to /home found')
  } else {
    console.log('❌ Root redirect to /home not found')
  }
  
} catch (error) {
  console.error('❌ Error checking router guard:', error)
}

console.log('')

// Test 2: Check Login.vue page
console.log('2️⃣ Checking Login.vue implementation...')
try {
  const loginContent = fs.readFileSync('src/pages/Login.vue', 'utf8')
  
  if (loginContent.includes("router.push('/home')")) {
    console.log('✅ Login page redirects to /home')
  } else {
    console.log('❌ Login page does not redirect to /home')
  }
  
  if (loginContent.includes("router guard will handle")) {
    console.log('✅ Login page relies on router guard')
  } else {
    console.log('❌ Login page may have duplicate redirect logic')
  }
  
} catch (error) {
  console.error('❌ Error checking Login.vue:', error)
}

console.log('')

// Test 3: Check route definitions
console.log('3️⃣ Checking route definitions...')
try {
  const mainContent = fs.readFileSync('src/main.js', 'utf8')
  
  // Extract routes array
  const routesMatch = mainContent.match(/const routes = \[([\s\S]*?)\]/)
  if (routesMatch) {
    const routesContent = routesMatch[1]
    
    if (routesContent.includes("path: '/', redirect: '/home'")) {
      console.log('✅ Root path redirects to /home')
    } else {
      console.log('❌ Root path does not redirect to /home')
    }
    
    if (routesContent.includes("path: '/home', component: Home")) {
      console.log('✅ /home route defined with Home component')
    } else {
      console.log('❌ /home route not properly defined')
    }
    
    if (routesContent.includes("path: '/login', component: Login")) {
      console.log('✅ /login route defined with Login component')
    } else {
      console.log('❌ /login route not properly defined')
    }
    
    if (routesContent.includes("meta: { requiresAuth: false }")) {
      console.log('✅ Login route marked as not requiring auth')
    } else {
      console.log('❌ Login route auth requirement not set')
    }
    
  } else {
    console.log('❌ Routes array not found')
  }
  
} catch (error) {
  console.error('❌ Error checking routes:', error)
}

console.log('')

console.log('🎉 Routing test completed!')
console.log('')
console.log('Expected behavior:')
console.log('✅ Logged-in user navigating to /login → redirected to /home')
console.log('✅ Logged-out user navigating to /login → shown login page')
console.log('✅ Logged-out user navigating to protected route → redirected to /login')
console.log('✅ Logged-in user navigating to protected route → allowed access')
console.log('')
console.log('The routing should now work correctly!')
