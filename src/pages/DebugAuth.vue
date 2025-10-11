<!--
  Debug Auth Page - StyleSnap
  
  Purpose: Debug authentication configuration
  This page helps troubleshoot OAuth issues by showing:
  - Environment variables status
  - Supabase client status
  - Current URL and redirect configuration
-->

<template>
  <div class="debug-page">
    <div class="debug-container">
      <h1>🔧 Authentication Debug</h1>
      
      <section class="debug-section">
        <h2>Environment Variables</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">VITE_SUPABASE_URL:</span>
            <span :class="['value', supabaseUrl ? 'success' : 'error']">
              {{ supabaseUrl || '❌ NOT SET' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">VITE_SUPABASE_ANON_KEY:</span>
            <span :class="['value', supabaseAnonKey ? 'success' : 'error']">
              {{ supabaseAnonKey ? '✅ SET (' + supabaseAnonKey.substring(0, 20) + '...)' : '❌ NOT SET' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">VITE_GOOGLE_CLIENT_ID:</span>
            <span :class="['value', googleClientId ? 'success' : 'error']">
              {{ googleClientId || '❌ NOT SET' }}
            </span>
          </div>
        </div>
      </section>

      <section class="debug-section">
        <h2>Supabase Client Status</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Client Initialized:</span>
            <span :class="['value', isConfigured ? 'success' : 'error']">
              {{ isConfigured ? '✅ YES' : '❌ NO' }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">Auth Available:</span>
            <span :class="['value', hasAuth ? 'success' : 'error']">
              {{ hasAuth ? '✅ YES' : '❌ NO' }}
            </span>
          </div>
        </div>
      </section>

      <section class="debug-section">
        <h2>URL Configuration</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Current Origin:</span>
            <span class="value mono">{{ currentOrigin }}</span>
          </div>
          <div class="info-item">
            <span class="label">Redirect URL:</span>
            <span class="value mono">{{ redirectUrl }}</span>
          </div>
          <div class="info-item">
            <span class="label">Supabase Callback:</span>
            <span class="value mono">{{ callbackUrl }}</span>
          </div>
        </div>
      </section>

      <section class="debug-section">
        <h2>Authentication Test</h2>
        <div class="test-controls">
          <Button
            variant="primary"
            :loading="isLoading"
            :disabled="!isConfigured || isLoading"
            @click="testGoogleAuth"
          >
            Test Google OAuth
          </Button>
          
          <Button
            variant="secondary"
            @click="checkSession"
          >
            Check Current Session
          </Button>
        </div>
        
        <div v-if="testResult" class="test-result" :class="testResult.type">
          <strong>{{ testResult.type === 'error' ? '❌' : '✅' }} {{ testResult.title }}</strong>
          <pre>{{ testResult.message }}</pre>
        </div>
        
        <div v-if="sessionInfo" class="test-result info">
          <strong>📋 Session Info</strong>
          <pre>{{ sessionInfo }}</pre>
        </div>
      </section>

      <section class="debug-section">
        <h2>🔗 Required Configuration</h2>
        <div class="config-instructions">
          <h3>Google Cloud Console</h3>
          <p>Add these to Authorized redirect URIs:</p>
          <code>{{ callbackUrl }}</code>
          <code>{{ currentOrigin }}</code>
          
          <h3>Supabase Dashboard</h3>
          <p>Add these to Redirect URLs:</p>
          <code>{{ currentOrigin }}</code>
          
          <h3>Environment Variables (.env.local)</h3>
          <code>VITE_SUPABASE_URL={{ supabaseUrl || 'YOUR_SUPABASE_URL' }}</code>
          <code>VITE_SUPABASE_ANON_KEY={{ supabaseAnonKey ? '***' : 'YOUR_ANON_KEY' }}</code>
          <code>VITE_GOOGLE_CLIENT_ID={{ googleClientId || 'YOUR_CLIENT_ID' }}</code>
        </div>
      </section>

      <div class="actions">
        <router-link to="/login" class="link-button">← Back to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase, isSupabaseConfigured } from '../config/supabase'
import Button from '../components/ui/Button.vue'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Status
const isConfigured = ref(isSupabaseConfigured)
const hasAuth = computed(() => supabase && supabase.auth)

// URLs
const currentOrigin = window.location.origin
const redirectUrl = `${currentOrigin}/closet`
const callbackUrl = supabaseUrl ? `${supabaseUrl}/auth/v1/callback` : 'NOT CONFIGURED'

// Test results
const isLoading = ref(false)
const testResult = ref(null)
const sessionInfo = ref(null)

onMounted(async () => {
  console.log('🔍 Debug page loaded')
  console.log('Environment:', {
    supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    googleClientId,
    isConfigured: isConfigured.value,
    hasAuth: hasAuth.value
  })
})

async function testGoogleAuth() {
  testResult.value = null
  isLoading.value = true
  
  try {
    console.log('🧪 Testing Google OAuth...')
    
    if (!supabase || !supabase.auth) {
      throw new Error('Supabase client is not initialized')
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    
    console.log('OAuth response:', { data, error })
    
    if (error) {
      testResult.value = {
        type: 'error',
        title: 'OAuth Error',
        message: JSON.stringify(error, null, 2)
      }
    } else if (data?.url) {
      testResult.value = {
        type: 'success',
        title: 'Redirect URL Generated',
        message: `Redirecting to:\n${data.url}`
      }
      
      // Redirect after 2 seconds to show the URL
      setTimeout(() => {
        window.location.href = data.url
      }, 2000)
    } else {
      testResult.value = {
        type: 'error',
        title: 'No Redirect URL',
        message: 'OAuth call succeeded but no redirect URL was returned'
      }
    }
  } catch (error) {
    console.error('Test failed:', error)
    testResult.value = {
      type: 'error',
      title: 'Test Failed',
      message: error.message || String(error)
    }
  } finally {
    isLoading.value = false
  }
}

async function checkSession() {
  sessionInfo.value = null
  
  try {
    if (!supabase || !supabase.auth) {
      sessionInfo.value = 'Supabase client is not initialized'
      return
    }
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      sessionInfo.value = `Error: ${error.message}`
    } else if (session) {
      sessionInfo.value = JSON.stringify({
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name
        },
        expires_at: new Date(session.expires_at * 1000).toISOString()
      }, null, 2)
    } else {
      sessionInfo.value = 'No active session'
    }
  } catch (error) {
    sessionInfo.value = `Error: ${error.message}`
  }
}
</script>

<style scoped>
.debug-page {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 2rem;
}

.debug-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
}

.debug-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.debug-section:last-of-type {
  border-bottom: none;
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #4b5563;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.label {
  font-weight: 600;
  color: #6b7280;
  min-width: 200px;
}

.value {
  flex: 1;
  font-family: monospace;
  font-size: 0.875rem;
}

.value.success {
  color: #059669;
}

.value.error {
  color: #dc2626;
}

.value.mono {
  color: #1f2937;
  word-break: break-all;
}

.test-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.test-result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
}

.test-result.error {
  background: #fef2f2;
  border-color: #dc2626;
  color: #991b1b;
}

.test-result.success {
  background: #f0fdf4;
  border-color: #059669;
  color: #065f46;
}

.test-result.info {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1e40af;
}

.test-result pre {
  margin-top: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
}

.config-instructions {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.config-instructions p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.5rem 0;
}

.config-instructions code {
  display: block;
  background: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  font-family: monospace;
  font-size: 0.875rem;
  margin: 0.5rem 0;
  word-break: break-all;
}

.actions {
  margin-top: 2rem;
  text-align: center;
}

.link-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: background 0.2s;
}

.link-button:hover {
  background: #5a67d8;
}
</style>
