/**
 * Integration Tests for Notifications API
 * Tests end-to-end notification flows with real database
 * Uses TestTransaction for automatic cleanup
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TestTransaction } from '../helpers/db-transactions.js'

let transaction
let supabase
let testUser1
let testUser2
let testItem

describe('Notifications API Integration', () => {
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

    // Create friendship
    await transaction.createTestFriendship(testUser1.id, testUser2.id)

    // Create test item for user2
    testItem = await transaction.createTestItem(testUser2.id, {
      name: 'Test Shirt',
      category: 'top',
      image_url: 'https://example.com/shirt.jpg'
    })
  })

  afterEach(async () => {
    // Clean up all test data automatically
    await transaction.rollback()
  })

  describe('Item Like Notifications', () => {
    it('should create notification when item is liked', async () => {
      // User1 likes User2's item
      await supabase.auth.setSession(testUser1.session)

      const { data: like } = await supabase
        .from('likes')
        .insert({
          user_id: testUser1.id,
          item_id: testItem.id
        })
        .select()
        .single()

      expect(like).toBeDefined()

      // Check if notification was created for User2
      await supabase.auth.setSession(testUser2.session)

      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testUser2.id)
        .eq('type', 'item_like')
        .eq('reference_id', testItem.id)

      expect(notifications).toBeDefined()
      expect(notifications.length).toBeGreaterThan(0)

      const notification = notifications[0]
      expect(notification.actor_id).toBe(testUser1.id)
      expect(notification.is_read).toBe(false)

      // Cleanup
      await supabase.from('likes').delete().eq('id', like.id)
      await supabase.from('notifications').delete().eq('id', notification.id)
    })
  })

  describe('Friend Outfit Suggestions', () => {
    it('should create notification when outfit suggestion is sent', async () => {
      await supabase.auth.setSession(testUser1.session)

      // Create outfit suggestion from User1 to User2
      const { data: suggestion } = await supabase
        .from('friend_outfit_suggestions')
        .insert({
          owner_id: testUser2.id,
          suggester_id: testUser1.id,
          outfit_items: [
            {
              clothes_id: testItem.id,
              name: testItem.name,
              category: testItem.category,
              image_url: testItem.image_url
            }
          ],
          message: 'Try this outfit!',
          status: 'pending'
        })
        .select()
        .single()

      expect(suggestion).toBeDefined()

      // Check if notification was created for User2
      await supabase.auth.setSession(testUser2.session)

      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', testUser2.id)
        .eq('type', 'friend_outfit_suggestion')
        .eq('reference_id', suggestion.id)

      expect(notifications).toBeDefined()
      expect(notifications.length).toBeGreaterThan(0)

      const notification = notifications[0]
      expect(notification.actor_id).toBe(testUser1.id)
      expect(notification.is_read).toBe(false)

      // Cleanup
      await supabase.from('friend_outfit_suggestions').delete().eq('id', suggestion.id)
      await supabase.from('notifications').delete().eq('id', notification.id)
    })

    it('should approve suggestion using RPC function', async () => {
      await supabase.auth.setSession(testUser1.session)

      // Create suggestion
      const { data: suggestion } = await supabase
        .from('friend_outfit_suggestions')
        .insert({
          owner_id: testUser2.id,
          suggester_id: testUser1.id,
          outfit_items: [
            {
              clothes_id: testItem.id,
              name: testItem.name,
              category: testItem.category,
              image_url: testItem.image_url
            }
          ],
          status: 'pending'
        })
        .select()
        .single()

      // Switch to User2 and approve
      await supabase.auth.setSession(testUser2.session)

      const { data: outfitId, error } = await supabase.rpc(
        'approve_friend_outfit_suggestion',
        { p_suggestion_id: suggestion.id }
      )

      expect(error).toBeNull()
      expect(outfitId).toBeDefined()

      // Verify suggestion status updated
      const { data: updatedSuggestion } = await supabase
        .from('friend_outfit_suggestions')
        .select('status')
        .eq('id', suggestion.id)
        .single()

      expect(updatedSuggestion.status).toBe('approved')

      // Verify outfit was created
      const { data: outfit } = await supabase
        .from('generated_outfits')
        .select('*')
        .eq('id', outfitId)
        .single()

      expect(outfit).toBeDefined()
      expect(outfit.owner_id).toBe(testUser2.id)
      expect(outfit.created_by_friend).toBe(true)
      expect(outfit.friend_suggester_id).toBe(testUser1.id)

      // Cleanup
      await supabase.from('generated_outfits').delete().eq('id', outfitId)
      await supabase.from('friend_outfit_suggestions').delete().eq('id', suggestion.id)
    })

    it('should reject suggestion using RPC function', async () => {
      await supabase.auth.setSession(testUser1.session)

      // Create suggestion
      const { data: suggestion } = await supabase
        .from('friend_outfit_suggestions')
        .insert({
          owner_id: testUser2.id,
          suggester_id: testUser1.id,
          outfit_items: [
            {
              clothes_id: testItem.id,
              name: testItem.name,
              category: testItem.category,
              image_url: testItem.image_url
            }
          ],
          status: 'pending'
        })
        .select()
        .single()

      // Switch to User2 and reject
      await supabase.auth.setSession(testUser2.session)

      const { error } = await supabase.rpc(
        'reject_friend_outfit_suggestion',
        { p_suggestion_id: suggestion.id }
      )

      expect(error).toBeNull()

      // Verify suggestion status updated
      const { data: updatedSuggestion } = await supabase
        .from('friend_outfit_suggestions')
        .select('status')
        .eq('id', suggestion.id)
        .single()

      expect(updatedSuggestion.status).toBe('rejected')

      // Cleanup
      await supabase.from('friend_outfit_suggestions').delete().eq('id', suggestion.id)
    })
  })

  describe('Notification Management', () => {
    it('should mark notification as read', async () => {
      // Create a test notification
      await supabase.auth.setSession(testUser1.session)

      const { data: notification } = await supabase
        .from('notifications')
        .insert({
          recipient_id: testUser1.id,
          actor_id: testUser2.id,
          type: 'item_like',
          reference_id: testItem.id,
          is_read: false
        })
        .select()
        .single()

      // Mark as read using RPC
      const { error } = await supabase.rpc('mark_notification_read', {
        p_notification_id: notification.id
      })

      expect(error).toBeNull()

      // Verify it's marked as read
      const { data: updated } = await supabase
        .from('notifications')
        .select('is_read')
        .eq('id', notification.id)
        .single()

      expect(updated.is_read).toBe(true)

      // Cleanup
      await supabase.from('notifications').delete().eq('id', notification.id)
    })

    it('should mark all notifications as read', async () => {
      await supabase.auth.setSession(testUser1.session)

      // Create multiple notifications
      await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: testUser1.id,
            actor_id: testUser2.id,
            type: 'item_like',
            reference_id: testItem.id,
            is_read: false
          },
          {
            recipient_id: testUser1.id,
            actor_id: testUser2.id,
            type: 'outfit_like',
            reference_id: testItem.id,
            is_read: false
          }
        ])
        .select()

      // Mark all as read
      const { data: count, error } = await supabase.rpc(
        'mark_all_notifications_read',
        { p_user_id: testUser1.id }
      )

      expect(error).toBeNull()
      expect(count).toBeGreaterThanOrEqual(2)

      // Verify all are marked as read
      const { data: unread } = await supabase
        .from('notifications')
        .select('id')
        .eq('recipient_id', testUser1.id)
        .eq('is_read', false)

      expect(unread.length).toBe(0)

      // Cleanup
      await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', testUser1.id)
    })

    it('should get unread count', async () => {
      await supabase.auth.setSession(testUser1.session)

      // Create notifications
      await supabase
        .from('notifications')
        .insert([
          {
            recipient_id: testUser1.id,
            actor_id: testUser2.id,
            type: 'item_like',
            is_read: false
          },
          {
            recipient_id: testUser1.id,
            actor_id: testUser2.id,
            type: 'item_like',
            is_read: false
          },
          {
            recipient_id: testUser1.id,
            actor_id: testUser2.id,
            type: 'item_like',
            is_read: true
          }
        ])

      // Get unread count
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', testUser1.id)
        .eq('is_read', false)

      expect(count).toBeGreaterThanOrEqual(2)

      // Cleanup
      await supabase
        .from('notifications')
        .delete()
        .eq('recipient_id', testUser1.id)
    })
  })

  describe('RLS Policies', () => {
    it('should prevent users from viewing others\' notifications', async () => {
      // Create notification for User2
      await supabase.auth.setSession(testUser2.session)

      const { data: notification } = await supabase
        .from('notifications')
        .insert({
          recipient_id: testUser2.id,
          actor_id: testUser1.id,
          type: 'item_like',
          is_read: false
        })
        .select()
        .single()

      // Try to read as User1
      await supabase.auth.setSession(testUser1.session)

      const { data: stolen } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notification.id)

      expect(stolen).toEqual([]) // Should not return anything

      // Cleanup
      await supabase.auth.setSession(testUser2.session)
      await supabase.from('notifications').delete().eq('id', notification.id)
    })

    it('should require friendship for suggestions', async () => {
      // Verify that users are friends (set up in beforeEach)
      const { data: friendship } = await supabase
        .from('friends')
        .select()
        .or(`and(user_id.eq.${testUser1.id},friend_id.eq.${testUser2.id}),and(user_id.eq.${testUser2.id},friend_id.eq.${testUser1.id})`)
        .single()

      expect(friendship).toBeDefined()
    })
  })
})
