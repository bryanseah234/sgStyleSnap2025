/**
 * Vitest Test Setup
 * Global test configuration and mocks
 */

import { vi, beforeAll } from 'vitest'

// Set up test environment variables before all tests
beforeAll(() => {
  // For unit tests: use mock values
  // For integration tests: these will be overridden by actual .env values
  // Integration tests use TestTransaction helpers from tests/helpers/db-transactions.js
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
  vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', 'test-cloud')
  vi.stubEnv('VITE_VAPID_PUBLIC_KEY', 'test-vapid-key')
})

// Mock Supabase client for unit tests
global.mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis()
  })),
  auth: {
    getUser: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn()
  }
}

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
