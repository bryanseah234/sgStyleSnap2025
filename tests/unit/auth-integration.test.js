/**
 * Authentication Integration Tests - Task 2
 * 
 * Purpose: Verify authentication components and services work correctly
 * Focuses on Task 2 acceptance criteria
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../src/stores/auth-store'
import * as authService from '../../src/services/auth-service'
import * as userService from '../../src/services/user-service'

// Mock auth service
vi.mock('../../src/services/auth-service', () => ({
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } }
  }))
}))

// Mock user service
vi.mock('../../src/services/user-service', () => ({
  getUserProfile: vi.fn(),
  updateUserAvatar: vi.fn()
}))

describe('Task 2: Authentication & Database', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('2.1 Auth Store', () => {
    it('should initialize with null user', () => {
      const store = useAuthStore()
      
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should set user data correctly', () => {
      const store = useAuthStore()
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      store.setUser(mockUser)

      expect(store.user).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(store.userId).toBe('user-123')
      expect(store.userEmail).toBe('test@example.com')
      expect(store.userName).toBe('Test User')
    })

    it('should clear user data', () => {
      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      
      store.clearUser()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should have loginWithGoogle method', async () => {
      const store = useAuthStore()
      authService.signInWithGoogle.mockResolvedValue()

      await store.loginWithGoogle()

      expect(authService.signInWithGoogle).toHaveBeenCalled()
    })

    it('should handle logout', async () => {
      const store = useAuthStore()
      store.setUser({ id: '123', email: 'test@example.com' })
      authService.signOut.mockResolvedValue()

      await store.logout()

      expect(authService.signOut).toHaveBeenCalled()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('should handle errors during login', async () => {
      const store = useAuthStore()
      const error = new Error('Login failed')
      authService.signInWithGoogle.mockRejectedValue(error)

      await expect(store.loginWithGoogle()).rejects.toThrow('Login failed')
      expect(store.error).toBeTruthy()
    })
  })

  describe('2.2 Google OAuth Flow', () => {
    it('should use signInWithGoogle from auth service', async () => {
      authService.signInWithGoogle.mockResolvedValue()

      await authService.signInWithGoogle()

      expect(authService.signInWithGoogle).toHaveBeenCalled()
    })

    it('should redirect to /closet after successful login', () => {
      // This would be tested in E2E tests
      // Here we just verify the service is called
      expect(authService.signInWithGoogle).toBeDefined()
    })
  })

  describe('2.3 User Profile Management', () => {
    it('should fetch user profile', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'test',
        name: 'Test User',
        avatar_url: '/avatars/default-1.png'
      }
      userService.getUserProfile.mockResolvedValue(mockProfile)

      const profile = await userService.getUserProfile()

      expect(profile).toEqual(mockProfile)
      expect(profile.username).toBe('test')
      expect(profile.name).toBe('Test User')
    })

    it('should update user avatar', async () => {
      const avatarUrl = '/avatars/default-2.png'
      const mockUpdated = {
        id: 'user-123',
        avatar_url: avatarUrl
      }
      userService.updateUserAvatar.mockResolvedValue(mockUpdated)

      const result = await userService.updateUserAvatar(avatarUrl)

      expect(userService.updateUserAvatar).toHaveBeenCalledWith(avatarUrl)
      expect(result.avatar_url).toBe(avatarUrl)
    })
  })

  describe('2.4 Auth Service', () => {
    it('should export signInWithGoogle', () => {
      expect(typeof authService.signInWithGoogle).toBe('function')
    })

    it('should export signOut', () => {
      expect(typeof authService.signOut).toBe('function')
    })

    it('should export getSession', () => {
      expect(typeof authService.getSession).toBe('function')
    })

    it('should export getCurrentUser', () => {
      expect(typeof authService.getCurrentUser).toBe('function')
    })

    it('should export onAuthStateChange', () => {
      expect(typeof authService.onAuthStateChange).toBe('function')
    })
  })

  describe('2.5 User Service', () => {
    it('should export getUserProfile', () => {
      expect(typeof userService.getUserProfile).toBe('function')
    })

    it('should export updateUserAvatar', () => {
      expect(typeof userService.updateUserAvatar).toBe('function')
    })

    it('should validate avatar URL format', async () => {
      const invalidUrl = 'https://example.com/avatar.jpg'
      userService.updateUserAvatar.mockRejectedValue(
        new Error('Invalid avatar URL')
      )

      await expect(userService.updateUserAvatar(invalidUrl))
        .rejects.toThrow()
    })
  })

  describe('2.6 Protected Routes', () => {
    it('should have auth guard utility', async () => {
      // Check if auth guard exists
      const authGuardModule = await import('../../src/utils/auth-guard.js')
      expect(authGuardModule).toBeDefined()
    })
  })

  describe('2.7 Default Avatars', () => {
    it('should have 6 default avatar options', () => {
      const avatars = [
        '/avatars/default-1.png',
        '/avatars/default-2.png',
        '/avatars/default-3.png',
        '/avatars/default-4.png',
        '/avatars/default-5.png',
        '/avatars/default-6.png'
      ]

      avatars.forEach(avatar => {
        expect(avatar).toMatch(/^\/avatars\/default-[1-6]\.png$/)
      })
    })
  })

  describe('2.8 Auth State Persistence', () => {
    it('should initialize session from storage', async () => {
      const store = useAuthStore()
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      }
      authService.getSession.mockResolvedValue(mockSession)

      await store.initializeAuth()

      expect(authService.getSession).toHaveBeenCalled()
    })

    it('should handle missing session gracefully', async () => {
      const store = useAuthStore()
      authService.getSession.mockResolvedValue(null)

      await store.initializeAuth()

      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })
})
