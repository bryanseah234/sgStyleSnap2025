/**
 * API Endpoints Integration Tests - StyleSnap
 * 
 * Purpose: Integration tests for all API endpoints
 * Uses real Supabase database with automatic test data cleanup
 * 
 * Features:
 * - Uses TestTransaction for automatic cleanup
 * - Test data is removed after each test
 * - No leftover data in database
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TestTransaction } from '../helpers/db-transactions.js'

let transaction
let supabase
let testUser1
let testUser2

describe('API Endpoints Integration Tests', () => {
  beforeEach(async () => {
    // Initialize test transaction
    transaction = new TestTransaction()
    supabase = await transaction.begin()
    
    // Create test users
    testUser1 = await transaction.createTestUser({
      full_name: 'Test User 1',
      username: `testuser1_${transaction.testId}`
    })
    
    testUser2 = await transaction.createTestUser({
      full_name: 'Test User 2',
      username: `testuser2_${transaction.testId}`
    })
  })
  
  afterEach(async () => {
    // Clean up all test data automatically
    await transaction.rollback()
  })

  describe('Closet CRUD API', () => {
    it('should create clothing item', async () => {
      const { data, error } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser1.id,
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
      expect(data.user_id).toBe(testUser1.id)
    })

    it('should get item by ID', async () => {
      // First create an item
      const { data: created } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser1.id,
          name: 'Test Item',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()
      
      const itemId = created.id

      // Then fetch it
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('id', itemId)
        .single()

      expect(error).toBeNull()
      expect(data.id).toBe(itemId)
      expect(data.name).toBe('Test Item')
    })

    it('should update clothing item', async () => {
      // Create item
      const { data: created } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser1.id,
          name: 'Original Name',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()
      
      const itemId = created.id

      // Update it
      const { data, error } = await supabase
        .from('clothes')
        .update({ name: 'Updated Name' })
        .eq('id', itemId)
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
          user_id: testUser1.id,
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
        { user_id: testUser1.id, name: 'Item 1', category: 'top', privacy: 'private', source: 'upload' },
        { user_id: testUser1.id, name: 'Item 2', category: 'bottom', privacy: 'friends', source: 'upload' }
      ])

      // Get all user's items
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('user_id', testUser1.id)

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThanOrEqual(2)
    })

    it('should enforce RLS - cannot view other user\'s private items', async () => {
      // Create private item for user1
      const { data: privateItem } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser1.id,
          name: 'Private Item',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()

      const itemId = privateItem.id

      // Sign in as user2
      await supabase.auth.signInWithPassword({
        email: `test2@example.com`,
        password: 'testpassword123'
      })

      // Try to access user1's private item
      const { data } = await supabase
        .from('clothes')
        .select()
        .eq('id', itemId)

      // Should not return the item
      expect(data).toHaveLength(0)
    })

    it('should allow viewing friend\'s items with friends privacy', async () => {
      // Create friendship
      await supabase.from('friendships').insert({
        user_id: testUser1.id,
        friend_id: testUser2.id,
        status: 'accepted'
      })

      // Create friends-only item for user1
      const { data: friendItem } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser1.id,
          name: 'Friends Item',
          category: 'top',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      const itemId = friendItem.id

      // Sign in as user2 (friend)
      await supabase.auth.signInWithPassword({
        email: `test2@example.com`,
        password: 'testpassword123'
      })

      // Should be able to see friend's item
      const { data, error } = await supabase
        .from('clothes')
        .select()
        .eq('id', itemId)

      expect(error).toBeNull()
      expect(data.length).toBe(1)
    })
  })

  describe('Friends API', () => {
    it('should send friend request', async () => {
      const { data, error } = await supabase
        .from('friendships')
        .insert({
          user_id: testUser1.id,
          friend_id: testUser2.id,
          status: 'pending'
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.status).toBe('pending')
      expect(data.user_id).toBe(testUser1.id)
      expect(data.friend_id).toBe(testUser2.id)
    })

    it('should accept friend request', async () => {
      // Create pending request
      const { data: request } = await supabase
        .from('friendships')
        .insert({
          user_id: testUser1.id,
          friend_id: testUser2.id,
          status: 'pending'
        })
        .select()
        .single()

      const friendshipId = request.id

      // Accept request
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
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
          user_id: testUser1.id,
          friend_id: testUser2.id,
          status: 'pending'
        })
        .select()
        .single()

      const friendshipId = request.id

      // Reject request
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.status).toBe('rejected')
    })

    it('should get friends list', async () => {
      // Create accepted friendship
      await supabase.from('friendships').insert({
        user_id: testUser1.id,
        friend_id: testUser2.id,
        status: 'accepted'
      })

      // Get friends
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .eq('user_id', testUser1.id)
        .eq('status', 'accepted')

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThanOrEqual(1)
    })

    it('should prevent duplicate friend requests', async () => {
      // Create first request
      await supabase.from('friendships').insert({
        user_id: testUser1.id,
        friend_id: testUser2.id,
        status: 'pending'
      })

      // Try to create duplicate
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: testUser1.id,
          friend_id: testUser2.id,
          status: 'pending'
        })

      // Should fail due to unique constraint
      expect(error).not.toBeNull()
    })
  })

  describe('Suggestions API', () => {
    it('should create outfit suggestion', async () => {
      // Create test items first
      const { data: item1 } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser2.id,
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
          user_id: testUser2.id,
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
          from_user_id: testUser1.id,
          to_user_id: testUser2.id,
          item_ids: [item1.id, item2.id],
          note: 'This would look great!'
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.from_user_id).toBe(testUser1.id)
      expect(data.to_user_id).toBe(testUser2.id)
      expect(data.item_ids).toHaveLength(2)
    })

    it('should get user\'s suggestions', async () => {
      const { data, error } = await supabase
        .from('outfit_suggestions')
        .select('*')
        .eq('to_user_id', testUser2.id)

      expect(error).toBeNull()
      expect(Array.isArray(data)).toBe(true)
    })

    it('should mark suggestion as viewed', async () => {
      // Create suggestion
      const { data: suggestion } = await supabase
        .from('outfit_suggestions')
        .insert({
          from_user_id: testUser1.id,
          to_user_id: testUser2.id,
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
          user_id: testUser2.id,
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
          user_id: testUser1.id,
          item_id: item.id
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data.user_id).toBe(testUser1.id)
      expect(data.item_id).toBe(item.id)
    })

    it('should unlike an item', async () => {
      // Create item and like
      const { data: item } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser2.id,
          name: 'Item',
          category: 'top',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      await supabase.from('likes').insert({
        user_id: testUser1.id,
        item_id: item.id
      })

      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', testUser1.id)
        .eq('item_id', item.id)

      expect(error).toBeNull()
    })

    it('should get item like count', async () => {
      // Create item
      const { data: item } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser1.id,
          name: 'Popular Item',
          category: 'top',
          privacy: 'friends',
          source: 'upload'
        })
        .select()
        .single()

      // Add multiple likes
      await supabase.from('likes').insert([
        { user_id: testUser2.id, item_id: item.id }
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
        { user_id: testUser1.id, name: 'Item 1', category: 'top', privacy: 'private', source: 'upload' },
        { user_id: testUser1.id, name: 'Item 2', category: 'bottom', privacy: 'private', source: 'upload' },
        { user_id: testUser1.id, name: 'Item 3', category: 'top', privacy: 'private', source: 'catalog' }
      ])

      // Get stats
      const { data, error } = await supabase
        .from('clothes')
        .select('category, source', { count: 'exact' })
        .eq('user_id', testUser1.id)

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThanOrEqual(3)
    })

    it('should track item usage in outfit history', async () => {
      // Create item
      const { data: item } = await supabase
        .from('clothes')
        .insert({
          user_id: testUser1.id,
          name: 'Tracked Item',
          category: 'top',
          privacy: 'private',
          source: 'upload'
        })
        .select()
        .single()

      // Record outfit
      await supabase.from('outfit_history').insert({
        user_id: testUser1.id,
        item_ids: [item.id],
        worn_date: new Date().toISOString()
      })

      // Check history
      const { data, error } = await supabase
        .from('outfit_history')
        .select('*')
        .eq('user_id', testUser1.id)
        .contains('item_ids', [item.id])

      expect(error).toBeNull()
      expect(data.length).toBeGreaterThanOrEqual(1)
    })
  })
})
