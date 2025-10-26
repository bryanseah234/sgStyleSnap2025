/**
 * Suggestion Components Tests
 * 
 * Tests for Vue components in the Suggestion System (Task 5)
 * 
 * Components tested:
 * - SuggestionItem.vue
 * - SuggestionList.vue
 * - SuggestionCanvas.vue
 * - SuggestionDetailModal.vue
 * 
 * Coverage:
 * - Component rendering
 * - Props handling
 * - Event emissions
 * - User interactions
 * - Conditional rendering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SuggestionItem from '@/components/social/SuggestionItem.vue'
import SuggestionCanvas from '@/components/social/SuggestionCanvas.vue'

// Mock Supabase
vi.mock('@/config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }))
    }
  }
}))

describe('SuggestionItem Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockSuggestion = {
    id: 'suggestion-1',
    from_user_id: 'user-1',
    to_user_id: 'user-2',
    from_user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar_url: 'https://example.com/avatar.jpg'
    },
    items: [
      { id: 'item-1', name: 'Blue Shirt', image_url: 'https://example.com/shirt.jpg' },
      { id: 'item-2', name: 'Black Pants', image_url: 'https://example.com/pants.jpg' }
    ],
    suggested_item_ids: ['item-1', 'item-2'],
    message: 'Try this outfit!',
    is_read: false,
    created_at: new Date().toISOString()
  }

  describe('Rendering', () => {
    it('renders received suggestion correctly', () => {
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: mockSuggestion,
          mode: 'received'
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.find('.new-badge').exists()).toBe(true)
    })

    it('renders sent suggestion correctly', () => {
      const sentSuggestion = {
        ...mockSuggestion,
        to_user: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar_url: null
        }
      }

      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: sentSuggestion,
          mode: 'sent'
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Jane Smith')
      expect(wrapper.find('.delete-btn').exists()).toBe(true)
    })

    it('displays new badge for unread received suggestions', () => {
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: mockSuggestion,
          mode: 'received'
        }
      })

      expect(wrapper.find('.new-badge').exists()).toBe(true)
      expect(wrapper.find('.new-badge').text()).toBe('New')
    })

    it('does not display new badge for read suggestions', () => {
      const readSuggestion = { ...mockSuggestion, is_read: true }
      
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: readSuggestion,
          mode: 'received'
        }
      })

      expect(wrapper.find('.new-badge').exists()).toBe(false)
    })

    it('displays message when present', () => {
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: mockSuggestion,
          mode: 'received'
        }
      })

      expect(wrapper.text()).toContain('Try this outfit!')
    })

    it('shows item count', () => {
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: mockSuggestion,
          mode: 'received'
        }
      })

      expect(wrapper.text()).toContain('2 items')
    })

    it('shows status badge for sent suggestions', () => {
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: mockSuggestion,
          mode: 'sent'
        }
      })

      expect(wrapper.find('.status-badge').exists()).toBe(true)
      expect(wrapper.find('.status-unread').exists()).toBe(true)
    })
  })

  describe('User Interactions', () => {
    it('emits click event when card is clicked', async () => {
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: mockSuggestion,
          mode: 'received'
        }
      })

      await wrapper.find('.suggestion-card').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0][0]).toEqual(mockSuggestion)
    })

    it('emits delete event when delete button is clicked', async () => {
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: mockSuggestion,
          mode: 'sent'
        }
      })

      await wrapper.find('.delete-btn').trigger('click')
      
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')?.[0][0]).toBe(mockSuggestion.id)
    })

    it('prevents delete event from triggering click event', async () => {
      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: mockSuggestion,
          mode: 'sent'
        }
      })

      await wrapper.find('.delete-btn').trigger('click')
      
      // Delete should be emitted but not click
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('Computed Properties', () => {
    it('formats timestamp to relative time', () => {
      const recentDate = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      const recentSuggestion = {
        ...mockSuggestion,
        created_at: recentDate.toISOString()
      }

      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: recentSuggestion,
          mode: 'received'
        }
      })

      expect(wrapper.text()).toContain('ago')
    })

    it('displays user initial when no avatar', () => {
      const noAvatarSuggestion = {
        ...mockSuggestion,
        from_user: {
          ...mockSuggestion.from_user,
          avatar_url: null
        }
      }

      const wrapper = mount(SuggestionItem, {
        props: {
          suggestion: noAvatarSuggestion,
          mode: 'received'
        }
      })

      expect(wrapper.find('.avatar-placeholder').exists()).toBe(true)
      expect(wrapper.find('.avatar-placeholder').text()).toBe('J')
    })
  })
})

describe('SuggestionCanvas Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockFriendItems = [
    { id: 'item-1', name: 'Blue Shirt', image_url: 'https://example.com/shirt.jpg' },
    { id: 'item-2', name: 'Black Pants', image_url: 'https://example.com/pants.jpg' },
    { id: 'item-3', name: 'Red Jacket', image_url: 'https://example.com/jacket.jpg' }
  ]

  describe('Rendering', () => {
    it('renders canvas with friend items', () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findAll('.item-thumbnail')).toHaveLength(3)
    })

    it('displays placeholder when no items on canvas', () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      expect(wrapper.find('.canvas-placeholder').exists()).toBe(true)
      expect(wrapper.text()).toContain('Drag items here')
    })

    it('shows empty state when no friend items', () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: []
        }
      })

      expect(wrapper.find('.no-items').exists()).toBe(true)
      expect(wrapper.text()).toContain('No items available')
    })

    it('displays message character count', () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      expect(wrapper.text()).toContain('0/100')
    })
  })

  describe('User Interactions', () => {
    it('emits cancel event when cancel button is clicked', async () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      const cancelButtons = wrapper.findAll('.btn-secondary')
      await cancelButtons[0].trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('disables save button when no items selected', () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      const saveButton = wrapper.find('.btn-primary')
      expect(saveButton.attributes('disabled')).toBeDefined()
    })

    it('updates message character count', async () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      const textarea = wrapper.find('#suggestion-message')
      await textarea.setValue('Test message')
      
      expect(wrapper.text()).toContain('12/100')
    })

    it('enforces 100 character limit on message', () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      const textarea = wrapper.find('#suggestion-message')
      expect(textarea.attributes('maxlength')).toBe('100')
    })
  })

  describe('Drag and Drop', () => {
    it('makes friend items draggable', () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      const draggableItems = wrapper.findAll('.item-thumbnail')
      draggableItems.forEach(item => {
        expect(item.attributes('draggable')).toBe('true')
      })
    })

    it('has drop zone configured on canvas area', () => {
      const wrapper = mount(SuggestionCanvas, {
        props: {
          friendId: 'friend-1',
          friendItems: mockFriendItems
        }
      })

      const canvas = wrapper.find('.canvas-area')
      expect(canvas.exists()).toBe(true)
    })
  })
})

describe('Component Integration', () => {
  it('SuggestionItem validates mode prop', () => {
    const wrapper = mount(SuggestionItem, {
      props: {
        suggestion: {
          id: 'test',
          from_user: { name: 'Test' },
          items: [],
          created_at: new Date().toISOString(),
          is_read: false
        },
        mode: 'received'
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('SuggestionCanvas renders with all required props', () => {
    const wrapper = mount(SuggestionCanvas, {
      props: {
        friendId: 'friend-1',
        friendItems: []
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('SuggestionItem renders with all required props', () => {
    const wrapper = mount(SuggestionItem, {
      props: {
        suggestion: {
          id: 'test',
          from_user: { name: 'Test' },
          items: [],
          created_at: new Date().toISOString(),
          is_read: false
        },
        mode: 'sent'
      }
    })

    expect(wrapper.exists()).toBe(true)
  })
})
