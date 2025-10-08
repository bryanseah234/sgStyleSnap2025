/**
 * API Endpoints Integration Tests - StyleSnap
 * 
 * Purpose: Integration tests for all API endpoints
 * Uses Supabase client to test actual database operations and RLS policies
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Test database connection
const TEST_SUPABASE_URL = import.meta.env.VITE_TEST_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const TEST_SUPABASE_KEY = import.meta.env.VITE_TEST_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase
let testUserId
let testUser2Id
let testItemId
let testFriendshipId

describe('API Endpoints Integration Tests', () => {
  beforeEach(async () => {
    supabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_KEY)
    
    // Create test users
    const { data: user1 } = await supabase.auth.signUp({
      email: `test1-${Date.now()}@example.com`,
      password: 'testpassword123'
    })
    testUserId = user1?.user?.id
    
    const { data: user2 } = await supabase.auth.signUp({
      email: `test2-${Date.now()}@example.com`,
      password: 'testpassword123'
    })
    testUser2Id = user2?.user?.id
  })
  
  afterEach(async () => {
    // Clean up test data
    if (testItemId) {
      await supabase.from('clothes').delete().eq('id', testItemId)
    }
    if (testFriendshipId) {
      await supabase.from('friendships').delete().eq('id', testFriendshipId)
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId)
    }
    if (testUser2Id) {
      await supabase.auth.admin.deleteUser(testUser2Id)
    }
  })

  describe('Closet CRUD API', () => {
    it('should create clothing item', async () => {
      const { data, error } = await supabase
        .from('clothes')
        .insert({
          user_id: testUserId,
          name: 'Test Shirt',
          category: 'top',
          clothing_type: 't-shirt',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.name).toBe('Test Shirt')
      expect(data.category).toBe('top')
      expect(data.user_id).toBe(testUserId)
      
      testItemId = data.id
    })

    it('should get item by ID', async () => {
      // First create an item
      const { data: created } = await supabase
        .from('clothes')
        .insert({
          user_id: testUserId,
          name: 'Test Item',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()
      
      testItemId = created.id

      // Then fetch it
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('id', testItemId)
        .single()

      expect(error).toBeNull()
      expect(data.id).toBe(testItemId)
      expect(data.name).toBe('Test Item')
    })

    it('should update clothing item', async () => {
      // Create item
      const { data: created } = await supabase
        .from('clothes')
        .insert({
          user_id: testUserId,
          name: 'Original Name',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()
      
      testItemId = created.id

      // Update it
      const { data, error } = await supabase
        .from('clothes')
        .update({ name: 'Updated Name' })
        .eq('id', testItemId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.name).toBe('Updated Name')
    })

    it('should delete clothing item', async () => {
      // Create item
      const { data: created } = await supabase
        .from('clothes')
        .insert({
          user_id: testUserId,
          name: 'To Delete',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()
      
      const itemId = created.id

      // Delete it
      const { error } = await supabase
        .from('clothes')
        .delete()
        .eq('id', itemId)

      expect(error).toBeNull()

      // Verify it's deleted
      const { data } = await supabase
        .from('clothes')
        .select()
        .eq('id', itemId)

      expect(data).toHaveLength(0)
    })

    it('should get user\'s items', async () => {
      // Create multiple items
      await supabase.from('clothes').insert([
        { user_id: testUserId, name: 'Item 1', category: 'top', privacy: 'private', source: 'upload' },
        { user_id: testUserId, name: 'Item 2', category: 'bottom', privacy: 'friends', source: 'upload' }
      ])

      // Get all user's items
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('user_id', testUserId)

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThanOrEqual(2)
    })

    it('should enforce RLS - cannot view other user\'s private items', async () => {
      // Create private item for user1
      const { data: privateItem } = await supabase
        .from('clothes')
        .insert({
          user_id: testUserId,
          name: 'Private Item',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()

      testItemId = privateItem.id

      // Sign in as user2
      await supabase.auth.signInWithPassword({
        email: `test2@example.com`,
        password: 'testpassword123'
      })

      // Try to access user1's private item
      const { data, error } = await supabase
        .from('clothes')
        .select()
        .eq('id', testItemId)

      // Should not return the item
      expect(data).toHaveLength(0)
    })

    it('should allow viewing friend\'s items with friends privacy', async () => {
      // Create friendship
      await supabase.from('friendships').insert({
        user_id: testUserId,
        friend_id: testUser2Id,
        status: 'accepted'
      })

      // Create friends-only item for user1
      const { data: friendItem } = await supabase
        .from('clothes')
        .insert({
          user_id: testUserId,
          name: 'Friends Item',
          category: 'top',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      testItemId = friendItem.id

      // Sign in as user2 (friend)
      await supabase.auth.signInWithPassword({
        email: `test2@example.com`,
        password: 'testpassword123'
      })

      // Should be able to see friend's item
      const { data, error } = await supabase
        .from('clothes')
        .select()
        .eq('id', testItemId)

      expect(error).toBeNull()
      expect(data.length).toBe(1)
    })
  })

  describe('Friends API', () => {
    it('should send friend request', async () => {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: testUserId,
          friend_id: testUser2Id,
          status: 'pending'
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.status).toBe('pending')
      expect(data.user_id).toBe(testUserId)
      expect(data.friend_id).toBe(testUser2Id)
      
      testFriendshipId = data.id
    })

    it('should accept friend request', async () => {
      // Create pending request
      const { data: request } = await supabase
        .from('friendships')
        .insert({
          user_id: testUserId,
          friend_id: testUser2Id,
          status: 'pending'
        })
        .select()
        .single()

      testFriendshipId = request.id

      // Accept request
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', testFriendshipId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.status).toBe('accepted')
    })

    it('should reject friend request', async () => {
      // Create pending request
      const { data: request } = await supabase
        .from('friendships')
        .insert({
          user_id: testUserId,
          friend_id: testUser2Id,
          status: 'pending'
        })
        .select()
        .single()

      testFriendshipId = request.id

      // Reject request
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', testFriendshipId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.status).toBe('rejected')
    })

    it('should get friends list', async () => {
      // Create accepted friendship
      await supabase.from('friendships').insert({
        user_id: testUserId,
        friend_id: testUser2Id,
        status: 'accepted'
      })

      // Get friends
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', testUserId)
        .eq('status', 'accepted')

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThanOrEqual(1)
    })

    it('should prevent duplicate friend requests', async () => {
      // Create first request
      await supabase.from('friendships').insert({
        user_id: testUserId,
        friend_id: testUser2Id,
        status: 'pending'
      })

      // Try to create duplicate
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: testUserId,
          friend_id: testUser2Id,
          status: 'pending'
        })

      // Should fail due to unique constraint
      expect(error).not.toBeNull()
    })
  })

  describe('Suggestions API', () => {
    let testSuggestionId

    it('should create outfit suggestion', async () => {
      // Create test items first
      const { data: item1 } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser2Id,
          name: 'Shirt',
          category: 'top',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      const { data: item2 } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser2Id,
          name: 'Pants',
          category: 'bottom',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      // Create suggestion
      const { data, error } = await supabase
        .from('outfit_suggestions')
        .insert({
          from_user_id: testUserId,
          to_user_id: testUser2Id,
          item_ids: [item1.id, item2.id],
          note: 'This would look great!'
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.from_user_id).toBe(testUserId)
      expect(data.to_user_id).toBe(testUser2Id)
      expect(data.item_ids).toHaveLength(2)
      
      testSuggestionId = data.id
    })

    it('should get user\'s suggestions', async () => {
      const { data, error } = await supabase
        .from('outfit_suggestions')
        .select('*')
        .eq('to_user_id', testUser2Id)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should mark suggestion as viewed', async () => {
      // Create suggestion
      const { data: suggestion } = await supabase
        .from('outfit_suggestions')
        .insert({
          from_user_id: testUserId,
          to_user_id: testUser2Id,
          item_ids: [],
          viewed: false
        })
        .select()
        .single()

      // Mark as viewed
      const { data, error } = await supabase
        .from('outfit_suggestions')
        .update({ viewed: true })
        .eq('id', suggestion.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.viewed).toBe(true)
    })
  })

  describe('Likes API', () => {
    it('should like an item', async () => {
      // Create item
      const { data: item } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser2Id,
          name: 'Likeable Item',
          category: 'top',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      // Like it
      const { data, error } = await supabase
        .from('likes')
        .insert({
          user_id: testUserId,
          item_id: item.id
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.user_id).toBe(testUserId)
      expect(data.item_id).toBe(item.id)
    })

    it('should unlike an item', async () => {
      // Create item and like
      const { data: item } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser2Id,
          name: 'Item',
          category: 'top',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      await supabase.from('likes').insert({
        user_id: testUserId,
        item_id: item.id
      })

      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', testUserId)
        .eq('item_id', item.id)

      expect(error).toBeNull()
    })

    it('should get item like count', async () => {
      // Create item
      const { data: item } = await supabase
        .from('clothes')
        .insert({
          user_id: testUserId,
          name: 'Popular Item',
          category: 'top',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      // Add multiple likes
      await supabase.from('likes').insert([
        { user_id: testUser2Id, item_id: item.id }
      ])

      // Get count
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('item_id', item.id)

      expect(error).toBeNull()
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Analytics API', () => {
    it('should get closet statistics', async () => {
      // Create test items
      await supabase.from('clothes').insert([
        { user_id: testUserId, name: 'Item 1', category: 'top', privacy: 'private', source: 'upload' },
        { user_id: testUserId, name: 'Item 2', category: 'bottom', privacy: 'private', source: 'upload' },
        { user_id: testUserId, name: 'Item 3', category: 'top', privacy: 'private', source: 'catalog' }
      ])

      // Get stats
      const { data, error } = await supabase
        .from('clothes')
        .select('category, source', { count: 'exact' })
        .eq('user_id', testUserId)

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThanOrEqual(3)
    })

    it('should track item usage in outfit history', async () => {
      // Create item
      const { data: item } = await supabase
        .from('clothes')
        .insert({
          user_id: testUserId,
          name: 'Tracked Item',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()

      // Record outfit
      await supabase.from('outfit_history').insert({
        user_id: testUserId,
        item_ids: [item.id],
        worn_date: new Date().toISOString()
      })

      // Check history
      const { data, error } = await supabase
        .from('outfit_history')
        .select('*')
        .eq('user_id', testUserId)
        .contains('item_ids', [item.id])

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThanOrEqual(1)
    })
  })
})

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
// TODO: Import Supabase test client
// TODO: Import API service functions

describe('API Endpoints Integration Tests', () => {
  // TODO: Set up test database connection
  // TODO: Create test users
  
  beforeAll(async () => {
    // TODO: Initialize test database
    // TODO: Run migrations
  })
  
  afterAll(async () => {
    // TODO: Clean up test database
  })
  
  beforeEach(async () => {
    // TODO: Reset test data
  })
  
  describe('Closet Items API', () => {
    // TODO: Test GET /api/closet
    // TODO: Test POST /api/closet
    // TODO: Test PUT /api/closet/:id
    // TODO: Test DELETE /api/closet/:id
    // TODO: Test RLS policies
  })
  
  describe('Friends API', () => {
    // TODO: Test friend request flow
    // TODO: Test privacy enforcement
  })
  
  describe('Suggestions API', () => {
    // TODO: Test suggestion creation
    // TODO: Test suggestion retrieval
  })
  
  describe('Quota Enforcement', () => {
    // TODO: Test 50 upload limit (catalog items unlimited)
  })
})
