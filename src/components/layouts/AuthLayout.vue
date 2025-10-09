<!--
  AuthLayout Component - StyleSnap
  
  Purpose: Layout for authentication pages (login, signup) - minimal layout without navigation
  
  Features:
  - Centered content area
  - Logo/branding
  - Simple, clean design for auth flows
  
  Usage:
  <AuthLayout>
    <LoginForm />
  </AuthLayout>
  
  Reference: docs/design/mobile-mockups/01-login.png for login screen design
-->

<template>
  <div class="auth-layout">
    <div class="auth-container">
      <!-- Logo and Branding -->
      <div class="auth-header">
        <div class="logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="logo-icon"
          >
            <path
              d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
            />
            <line
              x1="7"
              y1="7"
              x2="7.01"
              y2="7"
            />
          </svg>
          <h1 class="logo-text">
            StyleSnap
          </h1>
        </div>
        <p class="tagline">
          Your Digital Fashion Companion
        </p>
      </div>

      <!-- Auth Content (slot for login/register forms) -->
      <div class="auth-content">
        <slot />
      </div>

      <!-- Footer -->
      <div class="auth-footer">
        <p>
          &copy; 2025 StyleSnap. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// No complex logic needed - this is a presentational component
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 2.5rem;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #667eea;
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.tagline {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
}

.auth-content {
  margin-bottom: 1.5rem;
}

.auth-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.auth-footer p {
  color: #a0aec0;
  font-size: 0.85rem;
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
  .auth-container {
    padding: 2rem 1.5rem;
  }

  .logo-text {
    font-size: 1.75rem;
  }

  .logo-icon {
    width: 2rem;
    height: 2rem;
  }
}
</style>
