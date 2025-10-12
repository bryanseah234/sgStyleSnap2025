/**
 * User Journeys E2E Tests - StyleSnap
 * 
 * Purpose: End-to-end tests for complete user workflows using Playwright
 * 
 * Run Tests:
 * npm run test:e2e
 * npx playwright test
 * npx playwright test --ui (interactive mode)
 * npx playwright test --headed (see browser)
 */

import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:3000'

// Helper to login via Google OAuth (mocked in test env)
async function loginAsTestUser(page) {
  await page.goto(`${BASE_URL}/login`)
  await page.click('button:has-text("Sign in with Google")')
  // In test env, this should auto-complete OAuth
  await page.waitForURL(`${BASE_URL}/closet`, { timeout: 10000 })
}

// Helper to create test item
async function createTestItem(page, itemData) {
  await page.click('button[aria-label="Add item"]')
  await page.fill('input[name="name"]', itemData.name)
  await page.selectOption('select[name="category"]', itemData.category)
  if (itemData.privacy) {
    await page.selectOption('select[name="privacy"]', itemData.privacy)
  }
  if (itemData.image) {
    await page.setInputFiles('input[type="file"]', itemData.image)
  }
  await page.click('button[type="submit"]')
  await expect(page.locator('.notification.success')).toBeVisible({ timeout: 5000 })
}

test.describe('Authentication Journey', () => {
  test('should login with Google OAuth', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    // Verify login page elements
    await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible()
    
    // Click sign in
    await page.click('button:has-text("Sign in with Google")')
    
    // Should redirect to closet after successful auth
    await page.waitForURL(`${BASE_URL}/closet`, { timeout: 10000 })
    
    // Verify user is on closet page
    await expect(page.locator('h1:has-text("My Closet")')).toBeVisible()
  })

  test('should persist session on page refresh', async ({ page }) => {
    await loginAsTestUser(page)
    
    // Refresh page
    await page.reload()
    
    // Should still be logged in
    await expect(page.locator('h1:has-text("My Closet")')).toBeVisible()
    await expect(page).toHaveURL(`${BASE_URL}/closet`)
  })

  test('should logout successfully', async ({ page }) => {
    await loginAsTestUser(page)
    
    // Click logout
    await page.click('button[aria-label="User menu"]')
    await page.click('button:has-text("Logout")')
    
    // Should redirect to login
    await page.waitForURL(`${BASE_URL}/login`)
    await expect(page.locator('button:has-text("Sign in with Google")')).toBeVisible()
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    
    // Should redirect to login
    await page.waitForURL(`${BASE_URL}/login`)
  })
})

test.describe('Add Item Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should add item successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    
    // Click add button
    await page.click('button[aria-label="Add item"]')
    
    // Fill form
    await page.fill('input[name="name"]', 'Blue Jeans')
    await page.selectOption('select[name="category"]', 'bottom')
    await page.selectOption('select[name="clothing_type"]', 'jeans')
    await page.selectOption('select[name="privacy"]', 'friends')
    
    // Upload image
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/jeans.jpg')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Verify success notification
    await expect(page.locator('.notification.success')).toBeVisible()
    await expect(page.locator('.notification.success')).toContainText('Item added successfully')
    
    // Verify item appears in grid
    await expect(page.locator('.closet-item:has-text("Blue Jeans")')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    await page.click('button[aria-label="Add item"]')
    
    // Submit without filling
    await page.click('button[type="submit"]')
    
    // Check validation errors
    await expect(page.locator('.error:has-text("Name is required")')).toBeVisible()
    await expect(page.locator('.error:has-text("Category is required")')).toBeVisible()
  })

  test('should show image preview before upload', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    await page.click('button[aria-label="Add item"]')
    
    // Upload image
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/jeans.jpg')
    
    // Verify preview appears
    await expect(page.locator('.image-preview')).toBeVisible()
  })

  test('should edit item successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    
    // Click on existing item
    await page.click('.closet-item:first-child')
    
    // Click edit button
    await page.click('button:has-text("Edit")')
    
    // Change name
    await page.fill('input[name="name"]', 'Updated Name')
    await page.click('button[type="submit"]')
    
    // Verify success
    await expect(page.locator('.notification.success')).toBeVisible()
    await expect(page.locator('.closet-item:has-text("Updated Name")')).toBeVisible()
  })

  test('should delete item successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    
    // Get item count before deletion
    const itemsBefore = await page.locator('.closet-item').count()
    
    // Click on item
    await page.click('.closet-item:first-child')
    
    // Click delete button
    await page.click('button:has-text("Delete")')
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")')
    
    // Verify success
    await expect(page.locator('.notification.success')).toBeVisible()
    
    // Verify item count decreased
    const itemsAfter = await page.locator('.closet-item').count()
    expect(itemsAfter).toBe(itemsBefore - 1)
  })

  test('should toggle favorite successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    
    // Click favorite button on first item
    await page.click('.closet-item:first-child .favorite-button')
    
    // Verify favorite icon changes
    await expect(page.locator('.closet-item:first-child .favorite-button.active')).toBeVisible()
  })
})

test.describe('Quota Enforcement Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should show quota indicator', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    
    // Verify quota indicator is visible
    await expect(page.locator('.quota-indicator')).toBeVisible()
    await expect(page.locator('.quota-indicator')).toContainText('uploads')
  })

  test('should show warning at 90% quota', async ({ page }) => {
    // TODO: Seed database with 45 user uploads
    await page.goto(`${BASE_URL}/closet`)
    
    // Verify warning appears
    await expect(page.locator('.quota-indicator.warning')).toBeVisible()
    await expect(page.locator('.quota-warning')).toContainText('almost at your limit')
  })

  test('should block uploads at full quota', async ({ page }) => {
    // TODO: Seed database with 50 user uploads
    await page.goto(`${BASE_URL}/closet`)
    
    // Try to add item
    await page.click('button[aria-label="Add item"]')
    
    // Should see quota message
    await expect(page.locator('.quota-full-message')).toBeVisible()
    await expect(page.locator('.quota-full-message')).toContainText('reached your 50 upload limit')
    
    // Submit button should be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })

  test('should allow catalog additions at full quota', async ({ page }) => {
    // TODO: Seed database with 50 user uploads
    await page.goto(`${BASE_URL}/catalog`)
    
    // Should still be able to add from catalog
    await page.click('.catalog-item:first-child button:has-text("Add to Closet")')
    
    // Verify success
    await expect(page.locator('.notification.success')).toBeVisible()
  })
})

test.describe('Friend Request Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should send friend request', async ({ page }) => {
    await page.goto(`${BASE_URL}/friends`)
    
    // Click add friend
    await page.click('button:has-text("Add Friend")')
    
    // Search for user
    await page.fill('input[placeholder="Search users"]', 'testuser2')
    await page.click('.search-results .user-card:first-child')
    
    // Send request
    await page.click('button:has-text("Send Request")')
    
    // Verify success
    await expect(page.locator('.notification.success')).toBeVisible()
    await expect(page.locator('.notification.success')).toContainText('Friend request sent')
  })

  test('should receive and accept friend request', async ({ page }) => {
    // TODO: Create test user with pending friend request
    await page.goto(`${BASE_URL}/notifications`)
    
    // Verify friend request notification
    await expect(page.locator('.notification-item:has-text("friend request")')).toBeVisible()
    
    // Click to view
    await page.click('.notification-item:has-text("friend request")')
    
    // Accept request
    await page.click('button:has-text("Accept")')
    
    // Verify success
    await expect(page.locator('.notification.success')).toContainText('Friend request accepted')
    
    // Verify friend appears in friends list
    await page.goto(`${BASE_URL}/friends`)
    await expect(page.locator('.friends-list .friend-card')).toBeVisible()
  })

  test('should reject friend request', async ({ page }) => {
    await page.goto(`${BASE_URL}/notifications`)
    
    // Find friend request
    await page.click('.notification-item:has-text("friend request")')
    
    // Reject request
    await page.click('button:has-text("Reject")')
    
    // Verify success
    await expect(page.locator('.notification.success')).toContainText('Friend request rejected')
  })
})

test.describe('Outfit Suggestion Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should create outfit suggestion for friend', async ({ page }) => {
    await page.goto(`${BASE_URL}/friends`)
    
    // Click on friend
    await page.click('.friend-card:first-child')
    
    // Click suggest outfit
    await page.click('button:has-text("Suggest Outfit")')
    
    // Drag items to canvas
    // (This requires more complex drag-and-drop simulation)
    
    // Add note
    await page.fill('textarea[placeholder="Add a note"]', 'This would look great!')
    
    // Submit
    await page.click('button:has-text("Send Suggestion")')
    
    // Verify success
    await expect(page.locator('.notification.success')).toContainText('Suggestion sent')
  })

  test('should receive and view outfit suggestion', async ({ page }) => {
    await page.goto(`${BASE_URL}/suggestions`)
    
    // Verify suggestions appear
    await expect(page.locator('.suggestion-card')).toBeVisible()
    
    // Click to view details
    await page.click('.suggestion-card:first-child')
    
    // Verify outfit items are displayed
    await expect(page.locator('.outfit-canvas .outfit-item')).toHaveCount(3)
  })
})

test.describe('Likes Feature Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should like friend\'s item', async ({ page }) => {
    await page.goto(`${BASE_URL}/friends`)
    
    // Visit friend's closet
    await page.click('.friend-card:first-child')
    await page.click('.closet-item:first-child')
    
    // Click like button
    await page.click('button.like-button')
    
    // Verify like count increased
    await expect(page.locator('.like-count')).toContainText('1')
    
    // Verify button shows liked state
    await expect(page.locator('button.like-button.liked')).toBeVisible()
  })

  test('should unlike item', async ({ page }) => {
    await page.goto(`${BASE_URL}/friends`)
    
    // Visit friend's closet
    await page.click('.friend-card:first-child')
    await page.click('.closet-item:first-child')
    
    // Like then unlike
    await page.click('button.like-button')
    await page.click('button.like-button')
    
    // Verify like count decreased
    await expect(page.locator('.like-count')).toContainText('0')
  })

  test('should view list of likers', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    
    // Click on item with likes
    await page.click('.closet-item:first-child')
    
    // Click on like count
    await page.click('.like-count')
    
    // Verify likers modal appears
    await expect(page.locator('.likers-modal')).toBeVisible()
    await expect(page.locator('.likers-modal .user-card')).toBeVisible()
  })
})

test.describe('Outfit Generation Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should generate outfit from AI', async ({ page }) => {
    await page.goto(`${BASE_URL}/outfit-generator`)
    
    // Click generate button
    await page.click('button:has-text("Generate Outfit")')
    
    // Wait for generation
    await expect(page.locator('.loading-spinner')).toBeVisible()
    await expect(page.locator('.generated-outfit')).toBeVisible({ timeout: 10000 })
    
    // Verify outfit has items
    await expect(page.locator('.generated-outfit .outfit-item')).toHaveCount(3)
  })

  test('should save generated outfit', async ({ page }) => {
    await page.goto(`${BASE_URL}/outfit-generator`)
    
    // Generate outfit
    await page.click('button:has-text("Generate Outfit")')
    await expect(page.locator('.generated-outfit')).toBeVisible({ timeout: 10000 })
    
    // Save outfit
    await page.click('button:has-text("Save Outfit")')
    
    // Verify success
    await expect(page.locator('.notification.success')).toContainText('Outfit saved')
  })
})

test.describe('Analytics Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should view wardrobe analytics', async ({ page }) => {
    await page.goto(`${BASE_URL}/analytics`)
    
    // Verify analytics components
    await expect(page.locator('.total-items')).toBeVisible()
    await expect(page.locator('.most-worn')).toBeVisible()
    await expect(page.locator('.category-breakdown')).toBeVisible()
  })

  test('should view most worn items', async ({ page }) => {
    await page.goto(`${BASE_URL}/analytics`)
    
    // Verify chart is rendered
    await expect(page.locator('.most-worn-chart')).toBeVisible()
    
    // Verify items are listed
    await expect(page.locator('.most-worn .item-card')).toBeVisible()
  })
})

test.describe('Notifications Journey', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page)
  })

  test('should display notification badge', async ({ page }) => {
    await page.goto(`${BASE_URL}/closet`)
    
    // Verify notification bell
    await expect(page.locator('.notification-bell')).toBeVisible()
    
    // If there are unread notifications, verify badge
    const badge = page.locator('.notification-badge')
    if (await badge.isVisible()) {
      await expect(badge).toContainText(/\d+/)
    }
  })

  test('should view notification list', async ({ page }) => {
    await page.goto(`${BASE_URL}/notifications`)
    
    // Verify notifications are displayed
    await expect(page.locator('.notifications-list')).toBeVisible()
  })

  test('should mark notification as read', async ({ page }) => {
    await page.goto(`${BASE_URL}/notifications`)
    
    // Click on unread notification
    await page.click('.notification-item.unread:first-child')
    
    // Verify it becomes read
    await expect(page.locator('.notification-item.unread:first-child')).not.toBeVisible()
  })
})
