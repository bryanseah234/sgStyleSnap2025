/**
 * Advanced Outfit Features API Integration Tests
 * 
 * Tests for outfit history, shared outfits, collections using real database
 * Uses TestTransaction for automatic cleanup
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { TestTransaction } from '../helpers/db-transactions.js'

let transaction
let supabase
let testUser1, testUser2, testItem1, testItem2, testItem3

describe('Advanced Outfit Features API Integration Tests', () => {
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

    // Create test items for outfits
    testItem1 = await transaction.createTestItem(testUser1.id, {
      name: 'Test Shirt',
      category: 'top'
    })

    testItem2 = await transaction.createTestItem(testUser1.id, {
      name: 'Test Jeans',
      category: 'bottom'
    })

    testItem3 = await transaction.createTestItem(testUser1.id, {
      name: 'Test Shoes',
      category: 'shoes'
    })
  })

  afterEach(async () => {
    // Clean up all test data automatically
    await transaction.rollback()
  })

  describe('Outfits API', () => {
    it('should create an outfit', async () => {
      const { data: outfit, error } = await supabase
        .from('outfits')
        .insert({
          user_id: testUser1.id,
          name: 'Test Outfit',
          item_ids: [testItem1.id, testItem2.id, testItem3.id],
          weather_condition: 'sunny',
          is_public: true
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(outfit.name).toBe('Test Outfit')
      expect(outfit.item_ids).toHaveLength(3)
    })

    it('should get user outfits', async () => {
      // Create test outfits
      await transaction.createTestOutfit(testUser1.id, [testItem1.id, testItem2.id], {
        name: 'Outfit 1'
      })
      await transaction.createTestOutfit(testUser1.id, [testItem2.id, testItem3.id], {
        name: 'Outfit 2'
      })

      const { data, error } = await supabase
        .from('outfits')
        .select()
        .eq('user_id', testUser1.id)

      expect(error).toBeNull()
      expect(data).toHaveLength(2)
    })

    it('should delete an outfit', async () => {
      const outfit = await transaction.createTestOutfit(testUser1.id, [testItem1.id])

      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfit.id)

      expect(error).toBeNull()
    })
  })

  describe('Collections API', () => {
    it('should create a collection', async () => {
      const collection = await transaction.createTestCollection(testUser1.id, {
        name: 'Summer Outfits',
        description: 'My summer collection'
      })

      expect(collection.name).toBe('Summer Outfits')
      expect(collection.user_id).toBe(testUser1.id)
    })

    it('should get user collections', async () => {
      await transaction.createTestCollection(testUser1.id, { name: 'Collection 1' })
      await transaction.createTestCollection(testUser1.id, { name: 'Collection 2' })

      const { data, error } = await supabase
        .from('collections')
        .select()
        .eq('user_id', testUser1.id)

      expect(error).toBeNull()
      expect(data).toHaveLength(2)
    })
  })

  describe('Suggestions API', () => {
    it('should create a suggestion', async () => {
      const suggestion = await transaction.createTestSuggestion(
        testUser1.id,
        testUser2.id,
        [testItem1.id, testItem2.id],
        { message: 'Try this outfit!' }
      )

      expect(suggestion.from_user_id).toBe(testUser1.id)
      expect(suggestion.to_user_id).toBe(testUser2.id)
      expect(suggestion.item_ids).toHaveLength(2)
    })

    it('should get user suggestions', async () => {
      await transaction.createTestSuggestion(testUser1.id, testUser2.id, [testItem1.id])

      const { data, error } = await supabase
        .from('friend_outfit_suggestions')
        .select()
        .eq('to_user_id', testUser2.id)

      expect(error).toBeNull()
      expect(data).toHaveLength(1)
    })
  })
})
