/**
 * Database Transaction Helpers for Testing - StyleSnap
 * 
 * Purpose: Provides transaction management and cleanup utilities for integration tests
 * 
 * Features:
 * - Test data isolation with unique identifiers
 * - Automatic cleanup after each test
 * - Test user creation and deletion
 * - Tracks all created resources for cleanup
 * 
 * Usage:
 * import { TestTransaction } from './helpers/db-transactions'
 * 
 * describe('My Tests', () => {
 *   let transaction
 *   
 *   beforeEach(async () => {
 *     transaction = new TestTransaction()
 *     await transaction.begin()
 *   })
 *   
 *   afterEach(async () => {
 *     await transaction.rollback()
 *   })
 * })
 */

import { createClient } from '@supabase/supabase-js'

/**
 * TestTransaction class manages test data lifecycle
 */
export class TestTransaction {
  constructor() {
    this.supabase = null
    this.createdUsers = []
    this.createdItems = []
    this.createdOutfits = []
    this.createdSuggestions = []
    this.createdNotifications = []
    this.createdFriendships = []
    this.createdLikes = []
    this.createdCollections = []
    this.testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Initialize Supabase client for testing
   */
  async begin() {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing Supabase credentials in environment')
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    return this.supabase
  }

  /**
   * Create a test user with unique email
   * @param {Object} overrides - Optional user data overrides
   * @returns {Promise<Object>} Created user object
   */
  async createTestUser(overrides = {}) {
    const testEmail = `test_${this.testId}_${this.createdUsers.length}@example.com`
    const testUsername = `testuser_${this.testId}_${this.createdUsers.length}`

    // Create user directly in the database (skip auth for tests)
    const { data: user, error } = await this.supabase
      .from('users')
      .insert({
        email: testEmail,
        username: testUsername,
        full_name: overrides.full_name || 'Test User',
        avatar: overrides.avatar || 'avatar-1.png',
        ...overrides
      })
      .select()
      .single()

    if (error) throw error

    this.createdUsers.push(user.id)
    return user
  }

  /**
   * Create a test clothing item
   * @param {string} userId - Owner user ID
   * @param {Object} overrides - Optional item data overrides
   * @returns {Promise<Object>} Created item
   */
  async createTestItem(userId, overrides = {}) {
    const { data: item, error } = await this.supabase
      .from('clothes')
      .insert({
        owner_id: userId,
        name: overrides.name || `Test Item ${this.createdItems.length}`,
        category: overrides.category || 'top',
        color: overrides.color || 'blue',
        image_url: overrides.image_url || 'https://res.cloudinary.com/test/image.jpg',
        is_public: overrides.is_public !== undefined ? overrides.is_public : true,
        source: overrides.source || 'upload',
        ...overrides
      })
      .select()
      .single()

    if (error) throw error

    this.createdItems.push(item.id)
    return item
  }

  /**
   * Create a test outfit
   * @param {string} userId - Owner user ID
   * @param {Array<string>} itemIds - Array of clothing item IDs
   * @param {Object} overrides - Optional outfit data overrides
   * @returns {Promise<Object>} Created outfit
   */
  async createTestOutfit(userId, itemIds, overrides = {}) {
    const { data: outfit, error } = await this.supabase
      .from('outfits')
      .insert({
        user_id: userId,
        name: overrides.name || `Test Outfit ${this.createdOutfits.length}`,
        item_ids: itemIds,
        weather_condition: overrides.weather_condition || 'sunny',
        is_public: overrides.is_public !== undefined ? overrides.is_public : true,
        ...overrides
      })
      .select()
      .single()

    if (error) throw error

    this.createdOutfits.push(outfit.id)
    return outfit
  }

  /**
   * Create a friendship between two users
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Promise<Object>} Created friendship
   */
  async createTestFriendship(userId1, userId2) {
    const { data: friendship, error } = await this.supabase
      .from('friends')
      .insert({
        user_id: userId1,
        friend_id: userId2,
        status: 'accepted'
      })
      .select()
      .single()

    if (error) throw error

    this.createdFriendships.push(friendship.id)
    return friendship
  }

  /**
   * Create a test suggestion
   * @param {string} fromUserId - Sender user ID
   * @param {string} toUserId - Recipient user ID
   * @param {Array<string>} itemIds - Array of clothing item IDs
   * @param {Object} overrides - Optional suggestion data overrides
   * @returns {Promise<Object>} Created suggestion
   */
  async createTestSuggestion(fromUserId, toUserId, itemIds, overrides = {}) {
    const { data: suggestion, error } = await this.supabase
      .from('friend_outfit_suggestions')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        item_ids: itemIds,
        message: overrides.message || 'Test suggestion',
        status: overrides.status || 'pending',
        ...overrides
      })
      .select()
      .single()

    if (error) throw error

    this.createdSuggestions.push(suggestion.id)
    return suggestion
  }

  /**
   * Create a test notification
   * @param {string} userId - User to receive notification
   * @param {Object} overrides - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createTestNotification(userId, overrides = {}) {
    const { data: notification, error } = await this.supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: overrides.type || 'friend_outfit_suggestion',
        actor_id: overrides.actor_id || userId,
        is_read: overrides.is_read || false,
        ...overrides
      })
      .select()
      .single()

    if (error) throw error

    this.createdNotifications.push(notification.id)
    return notification
  }

  /**
   * Create a test like
   * @param {string} userId - User who likes
   * @param {string} itemId - Item being liked
   * @returns {Promise<Object>} Created like
   */
  async createTestLike(userId, itemId) {
    const { data: like, error } = await this.supabase
      .from('likes')
      .insert({
        user_id: userId,
        item_id: itemId
      })
      .select()
      .single()

    if (error) throw error

    this.createdLikes.push(like.id)
    return like
  }

  /**
   * Create a test collection
   * @param {string} userId - Owner user ID
   * @param {Object} overrides - Optional collection data
   * @returns {Promise<Object>} Created collection
   */
  async createTestCollection(userId, overrides = {}) {
    const { data: collection, error } = await this.supabase
      .from('collections')
      .insert({
        user_id: userId,
        name: overrides.name || `Test Collection ${this.createdCollections.length}`,
        description: overrides.description || 'Test collection',
        is_public: overrides.is_public !== undefined ? overrides.is_public : true,
        ...overrides
      })
      .select()
      .single()

    if (error) throw error

    this.createdCollections.push(collection.id)
    return collection
  }

  /**
   * Rollback all test data (cleanup after test)
   * Deletes in reverse order to respect foreign key constraints
   */
  async rollback() {
    if (!this.supabase) return

    try {
      // Delete in reverse order of dependencies
      
      // 1. Delete likes (depends on items)
      if (this.createdLikes.length > 0) {
        await this.supabase
          .from('likes')
          .delete()
          .in('id', this.createdLikes)
      }

      // 2. Delete notifications
      if (this.createdNotifications.length > 0) {
        await this.supabase
          .from('notifications')
          .delete()
          .in('id', this.createdNotifications)
      }

      // 3. Delete suggestions
      if (this.createdSuggestions.length > 0) {
        await this.supabase
          .from('friend_outfit_suggestions')
          .delete()
          .in('id', this.createdSuggestions)
      }

      // 4. Delete friendships
      if (this.createdFriendships.length > 0) {
        await this.supabase
          .from('friends')
          .delete()
          .in('id', this.createdFriendships)
      }

      // 5. Delete collections
      if (this.createdCollections.length > 0) {
        await this.supabase
          .from('collections')
          .delete()
          .in('id', this.createdCollections)
      }

      // 6. Delete outfits (depends on items)
      if (this.createdOutfits.length > 0) {
        await this.supabase
          .from('outfits')
          .delete()
          .in('id', this.createdOutfits)
      }

      // 7. Delete items (depends on users)
      if (this.createdItems.length > 0) {
        await this.supabase
          .from('clothes')
          .delete()
          .in('id', this.createdItems)
      }

      // 8. Delete users (last, everything depends on users)
      if (this.createdUsers.length > 0) {
        await this.supabase
          .from('users')
          .delete()
          .in('id', this.createdUsers)
      }

      // Clear tracking arrays
      this.createdUsers = []
      this.createdItems = []
      this.createdOutfits = []
      this.createdSuggestions = []
      this.createdNotifications = []
      this.createdFriendships = []
      this.createdLikes = []
      this.createdCollections = []
    } catch (error) {
      console.error('Error during test cleanup:', error)
      // Don't throw - we don't want cleanup errors to fail tests
    }
  }

  /**
   * Get the Supabase client instance
   * @returns {Object} Supabase client
   */
  getClient() {
    return this.supabase
  }
}

/**
 * Utility function to create a test transaction quickly
 * @returns {Promise<TestTransaction>} Initialized transaction
 */
export async function createTestTransaction() {
  const transaction = new TestTransaction()
  await transaction.begin()
  return transaction
}
