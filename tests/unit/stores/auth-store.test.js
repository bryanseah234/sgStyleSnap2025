/**
 * Auth Store Unit Tests - StyleSnap
 * 
 * Purpose: Comprehensive tests for authentication state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth-store'

// Mock auth service
vi.mock('@/services/auth-service', () => ({
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
  getSession: vi.fn(),
  refreshSession: vi.fn(),
  onAuthStateChange: vi.fn()
}))

// Mock Supabase config
vi.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}))

describe('Auth Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    // Reset all mocks before each test
    vi.clearAllMocks()
    const { supabase } = await import('@/config/supabase')
    supabase.from.mockClear()
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

    it('should not be loading initially', () => {
      const store = useAuthStore()
      
      expect(store.loading).toBe(false)
    })

    it('should have no error initially', () => {
      const store = useAuthStore()
      
      expect(store.error).toBeNull()
    })
  })

  describe('setUser', () => {
    it('should set user data', () => {
      const store = useAuthStore()
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          name: 'Test User'
        }
      }

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

  describe('loginWithGoogle', () => {
    it('should call Supabase OAuth with Google provider', async () => {
      const { signInWithGoogle } = await import('@/services/auth-service')
      signInWithGoogle.mockResolvedValue({ error: null })
      
      const store = useAuthStore()
      await store.loginWithGoogle()

      expect(signInWithGoogle).toHaveBeenCalled()
    })

    it('should set loading state during login', async () => {
      const { signInWithGoogle } = await import('@/services/auth-service')
      signInWithGoogle.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      )
      
      const store = useAuthStore()
      const promise = store.loginWithGoogle()
      expect(store.loading).toBe(true)

      await promise
      expect(store.loading).toBe(false)
    })

    it('should handle login errors', async () => {
      const { signInWithGoogle } = await import('@/services/auth-service')
      signInWithGoogle.mockRejectedValue(new Error('OAuth failed'))
      
      const store = useAuthStore()
      await expect(store.loginWithGoogle()).rejects.toThrow('OAuth failed')
      expect(store.error).toBeTruthy()
      expect(store.loading).toBe(false)
    })

    it('should clear previous errors before login', async () => {
      const { signInWithGoogle } = await import('@/services/auth-service')
      signInWithGoogle.mockResolvedValue({ error: null })
      
      const store = useAuthStore()
      store.error = 'Previous error'
      await store.loginWithGoogle()

      expect(store.error).toBeNull()
    })
  })

  describe('logout', () => {
    it('should call Supabase signOut', async () => {
      const { signOut } = await import('@/services/auth-service')
      signOut.mockResolvedValue()
      
      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      await store.logout()

      expect(signOut).toHaveBeenCalled()
    })

    it('should clear user data on logout', async () => {
      const { signOut } = await import('@/services/auth-service')
      signOut.mockResolvedValue()
      
      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      await store.logout()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should handle logout errors', async () => {
      const { signOut } = await import('@/services/auth-service')
      signOut.mockRejectedValue(new Error('Logout failed'))
      
      const store = useAuthStore()
      await expect(store.logout()).rejects.toThrow('Logout failed')
    })

    it('should set loading state during logout', async () => {
      const { signOut } = await import('@/services/auth-service')
      signOut.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(), 100))
      )
      
      const store = useAuthStore()
      const promise = store.logout()
      expect(store.loading).toBe(true)

      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchUserProfile', () => {
    it('should fetch user profile from database', async () => {
      const { supabase } = await import('@/config/supabase')
      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        name: 'Test User',
        avatar_url: 'avatar-1.png'
      }
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
      })
      
      const store = useAuthStore()
      store.setUser({ id: 'user-123', email: 'test@example.com' })
      await store.fetchUserProfile()

      expect(store.profile).toEqual(mockProfile)
    })

    it('should handle profile fetch errors', async () => {
      const { supabase } = await import('@/config/supabase')
      const mockError = new Error('Profile not found')
      
      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: mockError })
      })
      
      const store = useAuthStore()
      store.setUser({ id: 'user-123', email: 'test@example.com' })
      await expect(store.fetchUserProfile()).rejects.toThrow('Profile not found')
    })

    it('should not fetch profile if not authenticated', async () => {
      const { supabase } = await import('@/config/supabase')
      
      const store = useAuthStore()
      await store.fetchUserProfile()

      expect(supabase.from).not.toHaveBeenCalled()
    })
  })

  describe('Getters', () => {
    it('should compute isAuthenticated correctly', () => {
      const store = useAuthStore()

      expect(store.isAuthenticated).toBe(false)

      store.setUser({ id: '123', email: 'test@example.com' })
      expect(store.isAuthenticated).toBe(true)

      store.setUser(null)
      expect(store.isAuthenticated).toBe(false)
    })

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
  })

  describe('Auth State Persistence', () => {
    it('should initialize session on store creation', async () => {
      const { getSession } = await import('@/services/auth-service')
      getSession.mockResolvedValue({
        user: { id: '123', email: 'test@example.com' }
      })

      const store = useAuthStore()
      await store.initializeSession()

      expect(getSession).toHaveBeenCalled()
    })

    it('should set up auth state change listener', async () => {
      const { onAuthStateChange } = await import('@/services/auth-service')
      onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      })

      const store = useAuthStore()
      store.setupAuthListener()

      expect(onAuthStateChange).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should clear error on successful operation', async () => {
      const { signInWithGoogle } = await import('@/services/auth-service')
      signInWithGoogle.mockResolvedValue({ error: null })
      
      const store = useAuthStore()
      store.error = 'Previous error'
      await store.loginWithGoogle()

      expect(store.error).toBeNull()
    })

    it('should set error on failed operation', async () => {
      const { signInWithGoogle } = await import('@/services/auth-service')
      signInWithGoogle.mockRejectedValue(new Error('Operation failed'))
      
      const store = useAuthStore()
      await expect(store.loginWithGoogle()).rejects.toThrow()
      expect(store.error).toBeTruthy()
    })
  })
})
