/**
 * Auth Store Unit Tests
 * Tests authentication state management via Pinia store.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock heavy dependencies before importing the store
vi.mock('@/services/authService', () => ({
  authService: {
    isSupabaseConfigured: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
    getCurrentProfile: vi.fn(),
    createUserProfile: vi.fn(),
    updateProfile: vi.fn(),
    setupAuthListener: vi.fn()
  }
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null })
    }))
  },
  isSupabaseConfigured: false,
  clearSupabaseSession: vi.fn()
}))

vi.mock('@/services/session-service', () => ({
  storeUserSession: vi.fn(),
  clearActiveSession: vi.fn(),
  removeUserSession: vi.fn()
}))

vi.mock('@/services/edgeFunctionSyncService', () => ({
  edgeFunctionSyncService: {
    waitForUserSync: vi.fn().mockResolvedValue({ success: false, synced: false })
  }
}))

vi.mock('@/utils/log-sanitizer', () => ({
  sanitizeEmail: (e) => e,
  sanitizeUser: (u) => u,
  sanitizeUrl: (u) => u,
  safeLog: vi.fn(),
  safeError: vi.fn(),
  safeWarn: vi.fn()
}))

import { useAuthStore } from '@/stores/auth-store'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have null user initially', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })

    it('should not be authenticated initially', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should have no error initially', () => {
      const store = useAuthStore()
      expect(store.error).toBeNull()
    })
  })

  describe('setUser', () => {
    it('should set user and mark authenticated', () => {
      const store = useAuthStore()
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      store.setUser(mockUser)

      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should clear user when set to null', () => {
      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      store.setUser(null)

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('clearUser', () => {
    it('should reset all auth state', () => {
      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      store.clearUser()

      expect(store.user).toBeNull()
      expect(store.profile).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('loginWithGoogle', () => {
    it('should call signInWithGoogle when Supabase is configured', async () => {
      const { authService } = await import('@/services/authService')
      authService.isSupabaseConfigured = true
      authService.signInWithGoogle.mockResolvedValue(undefined)

      const store = useAuthStore()
      await store.loginWithGoogle()

      expect(authService.signInWithGoogle).toHaveBeenCalled()
    })

    it('should use mock login when Supabase is not configured', async () => {
      const { authService } = await import('@/services/authService')
      authService.isSupabaseConfigured = false

      const store = useAuthStore()
      await store.loginWithGoogle()

      // Mock login sets a dev user
      expect(store.user).not.toBeNull()
      expect(store.isAuthenticated).toBe(true)
    })

    it('should set loading false after login', async () => {
      const { authService } = await import('@/services/authService')
      authService.isSupabaseConfigured = false

      const store = useAuthStore()
      await store.loginWithGoogle()

      expect(store.loading).toBe(false)
    })

    it('should handle login errors', async () => {
      const { authService } = await import('@/services/authService')
      authService.isSupabaseConfigured = true
      authService.signInWithGoogle.mockRejectedValue(new Error('OAuth failed'))

      const store = useAuthStore()
      await expect(store.loginWithGoogle()).rejects.toThrow('OAuth failed')
      expect(store.error).toBe('OAuth failed')
      expect(store.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should call signOut and clear user', async () => {
      const { authService } = await import('@/services/authService')
      authService.signOut.mockResolvedValue(undefined)

      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      await store.logout()

      expect(authService.signOut).toHaveBeenCalled()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should clear user even if signOut throws', async () => {
      const { authService } = await import('@/services/authService')
      authService.signOut.mockRejectedValue(new Error('Logout failed'))

      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      await expect(store.logout()).rejects.toThrow('Logout failed')

      expect(store.user).toBeNull()
    })
  })

  describe('Getters', () => {
    it('should compute userId correctly', () => {
      const store = useAuthStore()
      expect(store.userId).toBeNull()

      store.setUser({ id: 'user-123', email: 'test@example.com' })
      expect(store.userId).toBe('user-123')
    })

    it('should compute userEmail correctly', () => {
      const store = useAuthStore()
      expect(store.userEmail).toBeNull()

      store.setUser({ id: '123', email: 'test@example.com' })
      expect(store.userEmail).toBe('test@example.com')
    })

    it('should compute userName from metadata', () => {
      const store = useAuthStore()
      store.setUser({
        id: '123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      })
      expect(store.userName).toBe('Test User')
    })

    it('should fall back to email for userName when no metadata', () => {
      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      expect(store.userName).toBe('test@example.com')
    })
  })

  describe('fetchUserProfile', () => {
    it('should return null when not authenticated', async () => {
      const store = useAuthStore()
      const result = await store.fetchUserProfile()
      expect(result).toBeUndefined()
    })

    it('should fetch and set profile when authenticated', async () => {
      const { authService } = await import('@/services/authService')
      const mockProfile = { id: 'user-123', username: 'testuser', email: 'test@example.com' }
      authService.getCurrentProfile.mockResolvedValue(mockProfile)

      const store = useAuthStore()
      store.setUser({ id: 'user-123', email: 'test@example.com' })
      const result = await store.fetchUserProfile()

      expect(store.profile).toEqual(mockProfile)
      expect(result).toEqual(mockProfile)
    })

    it('should return null on profile fetch error without throwing', async () => {
      const { authService } = await import('@/services/authService')
      authService.getCurrentProfile.mockRejectedValue(new Error('Not found'))

      const store = useAuthStore()
      store.setUser({ id: 'user-123', email: 'test@example.com' })
      const result = await store.fetchUserProfile()

      expect(result).toBeNull()
    })
  })
})
