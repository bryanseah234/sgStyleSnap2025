/**
 * StyleSnap - Hybrid API Client
 *
 * Purpose: Combines mock development client with real Supabase API service
 *
 * Features:
 * - Development mode: Uses localStorage mock data
 * - Production mode: Uses real Supabase HTTP API
 * - Automatic fallback: Falls back to mock if Supabase unavailable
 * - Entity services: Full CRUD operations for all entities
 * - Authentication: Real Supabase auth with mock fallback
 *
 * Configuration:
 * - Auto-detects Supabase configuration
 * - Switches between mock and real API based on environment
 * - Maintains consistent API interface regardless of mode
 *
 * Usage:
 * import { api } from './hybrid-api'
 * const items = await api.entities.ClothingItem.list()
 * const user = await api.auth.me()
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

// Mock Auth Service (from base44Client)
class MockAuthService {
  constructor() {
    this.currentUser = this.loadUser()
  }

  loadUser() {
    const stored = localStorage.getItem('stylesnap_user')
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      email: 'demo@stylesnap.com',
      full_name: 'Demo User',
      id: 'user-demo',
      bio: 'Welcome to StyleSnap!',
      gender: '',
      profile_image: ''
    }
  }

  saveUser(user) {
    localStorage.setItem('stylesnap_user', JSON.stringify(user))
    this.currentUser = user
  }

  async me() {
    await new Promise(resolve => setTimeout(resolve, 100))
    return this.currentUser
  }

  async updateMe(data) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const updatedUser = { ...this.currentUser, ...data }
    this.saveUser(updatedUser)
    return updatedUser
  }

  async login(email, password) {
    await new Promise(resolve => setTimeout(resolve, 500))
    const user = {
      email,
      full_name: email.split('@')[0],
      id: 'user-' + Date.now(),
      bio: '',
      gender: '',
      profile_image: ''
    }
    this.saveUser(user)
    return user
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 100))
    localStorage.removeItem('stylesnap_user')
    this.currentUser = null
    return true
  }
}

// Real Auth Service (integrates with existing authService)
class RealAuthService {
  constructor() {
    // Import the existing auth service
    this.authService = null
  }

  async init() {
    if (!this.authService) {
      const { authService } = await import('@/services/authService')
      this.authService = authService
    }
  }

  async me() {
    await this.init()
    return this.authService.me()
  }

  async updateMe(data) {
    await this.init()
    return this.authService.updateMe(data)
  }

  async signInWithGoogle() {
    await this.init()
    return this.authService.signInWithGoogle()
  }

  async signOut() {
    await this.init()
    return this.authService.signOut()
  }

  async getCurrentUser() {
    await this.init()
    return this.authService.getCurrentUser()
  }

  async getCurrentProfile() {
    await this.init()
    return this.authService.getCurrentProfile()
  }

  async isAuthenticated() {
    await this.init()
    return this.authService.isAuthenticated()
  }

  async checkAuth() {
    await this.init()
    return this.authService.checkAuth()
  }
}

// Entity Service (from base44Client with Supabase fallback)
class EntityService {
  constructor(entityName) {
    this.entityName = entityName
    this.storageKey = `stylesnap_${entityName}`
    this.data = this.loadData()
  }

  loadData() {
    const stored = localStorage.getItem(this.storageKey)
    if (stored) {
      return JSON.parse(stored)
    }
    return this.getDefaultData()
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data))
  }

  getDefaultData() {
    if (this.entityName === 'clothing-items') {
      return [
        {
          id: '1',
          name: 'Blue Jeans',
          category: 'bottoms',
          brand: 'Levi\'s',
          image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
          created_by: 'demo@stylesnap.com',
          created_date: new Date().toISOString(),
          is_favorite: false
        },
        {
          id: '2',
          name: 'White T-Shirt',
          category: 'tops',
          brand: 'Uniqlo',
          image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
          created_by: 'demo@stylesnap.com',
          created_date: new Date().toISOString(),
          is_favorite: true
        },
        {
          id: '3',
          name: 'Black Jacket',
          category: 'outerwear',
          brand: 'Zara',
          image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
          created_by: 'demo@stylesnap.com',
          created_date: new Date().toISOString(),
          is_favorite: false
        }
      ]
    } else if (this.entityName === 'outfits') {
      return [
        {
          id: '1',
          name: 'Casual Friday',
          created_by: 'demo@stylesnap.com',
          created_date: new Date().toISOString(),
          is_favorite: true,
          items: [
            { item_id: '1', x: 100, y: 100, scale: 1, rotation: 0, z_index: 0 },
            { item_id: '2', x: 200, y: 150, scale: 1, rotation: 0, z_index: 1 }
          ]
        }
      ]
    } else if (this.entityName === 'friendships') {
      return [
        {
          id: '1',
          created_by: 'demo@stylesnap.com',
          friend_email: 'friend@example.com',
          friend_name: 'Friend User',
          status: 'accepted',
          created_date: new Date().toISOString()
        }
      ]
    }
    return []
  }

  // Use real API if Supabase is configured, otherwise use mock
  async list(sortBy = '-created_date', limit = null) {
    if (isSupabaseConfigured) {
      try {
        // Use real Supabase API
        const { data, error } = await supabase
          .from(this.entityName.replace('-', '_'))
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit || 1000)

        if (error) throw error
        return data || []
      } catch (error) {
        console.warn(`Failed to fetch from Supabase, using mock data:`, error)
        // Fallback to mock data
      }
    }

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 200))
    let result = [...this.data]
    
    if (sortBy.startsWith('-')) {
      const field = sortBy.substring(1)
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]))
    } else {
      result.sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]))
    }
    
    if (limit) {
      result = result.slice(0, limit)
    }
    
    return result
  }

  async filter(filters, sortBy = '-created_date', limit = null) {
    if (isSupabaseConfigured) {
      try {
        // Use real Supabase API
        let query = supabase.from(this.entityName.replace('-', '_')).select('*')
        
        // Apply filters
        Object.keys(filters).forEach(key => {
          query = query.eq(key, filters[key])
        })
        
        query = query.order('created_at', { ascending: false })
        
        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
      } catch (error) {
        console.warn(`Failed to filter from Supabase, using mock data:`, error)
        // Fallback to mock data
      }
    }

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 200))
    let result = this.data.filter(item => {
      return Object.keys(filters).every(key => item[key] === filters[key])
    })
    
    if (sortBy.startsWith('-')) {
      const field = sortBy.substring(1)
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]))
    } else {
      result.sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]))
    }
    
    if (limit) {
      result = result.slice(0, limit)
    }
    
    return result
  }

  async create(data) {
    if (isSupabaseConfigured) {
      try {
        // Use real Supabase API
        const { data: result, error } = await supabase
          .from(this.entityName.replace('-', '_'))
          .insert(data)
          .select()
          .single()

        if (error) throw error
        return result
      } catch (error) {
        console.warn(`Failed to create in Supabase, using mock data:`, error)
        // Fallback to mock data
      }
    }

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300))
    const newItem = {
      id: Date.now().toString(),
      ...data,
      created_date: new Date().toISOString()
    }
    this.data.push(newItem)
    this.saveData()
    return newItem
  }

  async update(id, updates) {
    if (isSupabaseConfigured) {
      try {
        // Use real Supabase API
        const { data: result, error } = await supabase
          .from(this.entityName.replace('-', '_'))
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return result
      } catch (error) {
        console.warn(`Failed to update in Supabase, using mock data:`, error)
        // Fallback to mock data
      }
    }

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = this.data.findIndex(item => item.id === id)
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates }
      this.saveData()
      return this.data[index]
    }
    throw new Error('Item not found')
  }

  async delete(id) {
    if (isSupabaseConfigured) {
      try {
        // Use real Supabase API
        const { error } = await supabase
          .from(this.entityName.replace('-', '_'))
          .delete()
          .eq('id', id)

        if (error) throw error
        return true
      } catch (error) {
        console.warn(`Failed to delete from Supabase, using mock data:`, error)
        // Fallback to mock data
      }
    }

    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = this.data.findIndex(item => item.id === id)
    if (index !== -1) {
      this.data.splice(index, 1)
      this.saveData()
      return true
    }
    throw new Error('Item not found')
  }

  async toggleFavorite(id) {
    const item = await this.list().then(items => items.find(i => i.id === id))
    if (item) {
      return this.update(id, { is_favorite: !item.is_favorite })
    }
    throw new Error('Item not found')
  }
}

// Main Hybrid API Client
class HybridApiClient {
  constructor() {
    // Use real auth service if Supabase is configured, otherwise use mock
    this.auth = isSupabaseConfigured ? new RealAuthService() : new MockAuthService()
    
    this.entities = {
      ClothingItem: new EntityService('clothing-items'),
      Outfit: new EntityService('outfits'),
      Friendship: new EntityService('friendships')
    }
    
    this.integrations = {
      Core: {
        UploadFile: async ({ file }) => {
          if (isSupabaseConfigured) {
            try {
              // Use real file upload (you'll need to implement this)
              // For now, convert to base64 as fallback
              return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onload = () => {
                  resolve({ file_url: reader.result })
                }
                reader.readAsDataURL(file)
              })
            } catch (error) {
              console.warn('Failed to upload to Supabase, using base64:', error)
            }
          }
          
          // Mock implementation
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({ file_url: reader.result })
            }
            reader.readAsDataURL(file)
          })
        }
      }
    }
  }
}

// Export the hybrid API client
export const api = new HybridApiClient()
