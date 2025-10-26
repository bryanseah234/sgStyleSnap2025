# Component Architecture Documentation

## Overview

StyleSnap 2025 follows Vue.js 3 Composition API patterns with a component-based architecture. Components are organized by feature and functionality, promoting reusability and maintainability.

## Component Hierarchy

```
App.vue
├── RouterView
    ├── Home.vue (Dashboard)
    ├── Cabinet.vue (Closet Management)
    │   ├── UploadItemModal.vue
    │   ├── ManualUploadForm.vue
    │   ├── CatalogueBrowser.vue
    │   └── ItemDetailsModal.vue
    ├── Outfits.vue (Outfit Management)
    │   └── OutfitCanvasMiniature.vue
    ├── Friends.vue (Social Features)
    └── Profile.vue (User Profile)
```

## Core Components

### App.vue
**Purpose**: Root application component
**Responsibilities**:
- Global layout structure
- Theme provider
- Router configuration
- Global error handling

**Key Features**:
- Theme switching (dark/light mode)
- Responsive navigation
- Global loading states

### Home.vue (Dashboard)
**Purpose**: Main dashboard displaying user's overview
**Responsibilities**:
- Display recent outfits
- Show notifications
- Quick access to main features
- User statistics

**Props**: None (uses auth store)
**Emits**: None
**Composables Used**:
- `useTheme()` - Theme management
- `useAuthStore()` - User authentication
- `NotificationsService` - Notification management

**Key Features**:
- Real-time notifications
- Quick outfit previews
- Recent activity feed

### Cabinet.vue (Closet Management)
**Purpose**: Wardrobe management interface
**Responsibilities**:
- Display clothing items in grid layout
- Filter and search functionality
- Item upload and management
- Category organization

**Props**: None
**Emits**: None
**Composables Used**:
- `useTheme()` - Theme management
- `useLiquidHover()` - Animation effects
- `useLiquidPress()` - Button animations
- `ClothesService` - Data management

**Key Features**:
- Search functionality (name, brand, color, category)
- Category filtering
- Favorites filtering
- Drag-and-drop upload
- Item details modal
- Liquid glass hover effects

**Child Components**:
- `UploadItemModal.vue` - Image upload interface
- `ManualUploadForm.vue` - Manual item entry
- `CatalogueBrowser.vue` - Browse clothing catalogue
- `ItemDetailsModal.vue` - Item information display

### Outfits.vue (Outfit Management)
**Purpose**: Outfit creation and management interface
**Responsibilities**:
- Display saved outfits
- Create new outfit combinations
- Edit existing outfits
- Outfit sharing and favorites

**Props**: None
**Emits**: None
**Composables Used**:
- `useTheme()` - Theme management
- `usePopup()` - Modal management
- `OutfitsService` - Data management

**Key Features**:
- Search functionality (outfit name, description)
- Favorites filtering
- Outfit creation wizard
- Outfit sharing with friends
- Outfit editing interface

**Child Components**:
- `OutfitCanvasMiniature.vue` - Outfit preview component

### Friends.vue (Social Features)
**Purpose**: Social interaction and friend management
**Responsibilities**:
- Display friend list
- Manage friend requests
- Search for friends
- View friend profiles

**Props**: None
**Emits**: None
**Composables Used**:
- `useTheme()` - Theme management
- `FriendsService` - Data management

**Key Features**:
- Search functionality (friend name, username)
- Friend request management
- Sent requests tracking
- Friend profile viewing

## Reusable Components

### UI Components (`src/components/ui/`)

#### Button.vue
**Purpose**: Standardized button component
**Props**:
- `variant` (string): Button style variant
- `size` (string): Button size
- `disabled` (boolean): Disabled state
- `loading` (boolean): Loading state

**Usage**:
```vue
<Button variant="primary" size="lg" @click="handleClick">
  Click Me
</Button>
```

#### Modal.vue
**Purpose**: Reusable modal dialog component
**Props**:
- `isOpen` (boolean): Modal visibility
- `title` (string): Modal title
- `size` (string): Modal size

**Slots**:
- `default`: Modal content
- `footer`: Modal footer actions

**Usage**:
```vue
<Modal :isOpen="showModal" title="Example Modal">
  <p>Modal content goes here</p>
  <template #footer>
    <Button @click="closeModal">Close</Button>
  </template>
</Modal>
```

#### Input.vue
**Purpose**: Standardized input component
**Props**:
- `type` (string): Input type
- `placeholder` (string): Placeholder text
- `value` (string): Input value
- `error` (string): Error message

**Usage**:
```vue
<Input
  v-model="inputValue"
  type="text"
  placeholder="Enter text"
  :error="inputError"
/>
```

### Feature Components

#### UploadItemModal.vue
**Purpose**: Image upload interface for clothing items
**Props**:
- `isOpen` (boolean): Modal visibility
- `onUpload` (function): Upload callback

**Features**:
- Drag-and-drop file upload
- Image preview
- Progress tracking
- Error handling

#### ItemDetailsModal.vue
**Purpose**: Detailed view of clothing items
**Props**:
- `item` (object): Clothing item data
- `isOpen` (boolean): Modal visibility

**Features**:
- Item information display
- Edit functionality
- Delete confirmation
- Favorite toggle

#### OutfitCanvasMiniature.vue
**Purpose**: Compact outfit preview component
**Props**:
- `outfit` (object): Outfit data
- `size` (string): Preview size

**Features**:
- Layered item display
- Hover effects
- Quick actions menu

## Composables

### useTheme.js
**Purpose**: Theme management and switching
**Returns**:
- `theme` (ref): Current theme ('dark' or 'light')
- `toggleTheme()` (function): Switch between themes
- `setTheme(theme)` (function): Set specific theme

**Usage**:
```javascript
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
```

### useLiquidGlass.js
**Purpose**: Liquid glass animation effects
**Exports**:
- `useLiquidHover()` - Hover animation effects
- `useLiquidPress()` - Press animation effects

**Usage**:
```javascript
import { useLiquidHover } from '@/composables/useLiquidGlass'

const { elementRef, hoverIn, hoverOut } = useLiquidHover()
```

### usePopup.js
**Purpose**: Modal and popup management
**Returns**:
- `showError(message)` (function): Show error popup
- `showSuccess(message)` (function): Show success popup
- `showConfirm(message, callback)` (function): Show confirmation dialog

**Usage**:
```javascript
import { usePopup } from '@/composables/usePopup'

const { showError, showSuccess } = usePopup()
```

### useAuth.js
**Purpose**: Authentication state management
**Returns**:
- `user` (ref): Current user data
- `isAuthenticated` (ref): Authentication status
- `login(email, password)` (function): User login
- `logout()` (function): User logout

**Usage**:
```javascript
import { useAuth } from '@/composables/useAuth'

const { user, isAuthenticated, login } = useAuth()
```

## State Management

### Pinia Stores

#### auth-store.js
**Purpose**: Global authentication state
**State**:
- `user` (object): Current user data
- `isAuthenticated` (boolean): Login status
- `loading` (boolean): Authentication loading state

**Actions**:
- `initializeAuth()` - Initialize authentication
- `signIn(email, password)` - User login
- `signOut()` - User logout
- `updateProfile(data)` - Update user profile

#### theme-store.js
**Purpose**: Global theme state
**State**:
- `theme` (string): Current theme
- `systemPreference` (string): System theme preference

**Actions**:
- `setTheme(theme)` - Set theme
- `toggleTheme()` - Toggle theme
- `detectSystemTheme()` - Detect system preference

## Component Communication Patterns

### Parent-Child Communication
```vue
<!-- Parent Component -->
<template>
  <ChildComponent
    :data="parentData"
    @update="handleUpdate"
  />
</template>

<script setup>
const parentData = ref('Hello')
const handleUpdate = (newData) => {
  parentData.value = newData
}
</script>
```

### Sibling Communication
```vue
<!-- Using Pinia Store -->
<script setup>
import { useAuthStore } from '@/stores/auth-store'

const authStore = useAuthStore()
// Access shared state
</script>
```

### Event Bus Pattern
```javascript
// For complex cross-component communication
import { createEventBus } from '@/utils/eventBus'

const eventBus = createEventBus()

// Emit event
eventBus.emit('item-updated', itemData)

// Listen for event
eventBus.on('item-updated', (itemData) => {
  // Handle update
})
```

## Styling Architecture

### CSS Organization
```
src/assets/css/
├── main.css (Global styles)
├── tokens/
│   ├── animations.css (Animation definitions)
│   ├── colors.css (Color palette)
│   └── typography.css (Font definitions)
└── components/
    ├── buttons.css (Button styles)
    ├── forms.css (Form styles)
    └── modals.css (Modal styles)
```

### Tailwind CSS Integration
- **Utility Classes**: Primary styling method
- **Component Classes**: Custom component styles
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Automatic theme switching

### CSS Custom Properties
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
}

[data-theme="dark"] {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --card: 0 0% 0%;
  --card-foreground: 0 0% 100%;
}
```

## Performance Optimization

### Component Lazy Loading
```javascript
// Route-based code splitting
const Cabinet = () => import('@/pages/Cabinet.vue')
const Outfits = () => import('@/pages/Outfits.vue')
```

### Image Optimization
```vue
<template>
  <img
    :src="optimizedImageUrl"
    :alt="item.name"
    loading="lazy"
    class="w-full h-full object-cover"
  />
</template>
```

### Computed Properties
```javascript
// Efficient reactive computations
const filteredItems = computed(() => {
  return items.value.filter(item => 
    item.category === activeCategory.value
  )
})
```

### Memoization
```javascript
// Prevent unnecessary re-renders
const expensiveComputation = computed(() => {
  return heavyCalculation(props.data)
})
```

## Testing Strategy

### Unit Testing
```javascript
// Component testing with Vue Test Utils
import { mount } from '@vue/test-utils'
import Cabinet from '@/pages/Cabinet.vue'

test('renders clothing items', () => {
  const wrapper = mount(Cabinet, {
    props: { items: mockItems }
  })
  expect(wrapper.findAll('.item-card')).toHaveLength(mockItems.length)
})
```

### Integration Testing
```javascript
// Service integration testing
import { ClothesService } from '@/services/clothesService'

test('fetches user clothes', async () => {
  const service = new ClothesService()
  const items = await service.getClothes(userId)
  expect(items).toBeDefined()
})
```

## Best Practices

### Component Design
1. **Single Responsibility**: Each component has one clear purpose
2. **Props Validation**: Use TypeScript or prop validation
3. **Event Naming**: Use descriptive event names
4. **Slot Usage**: Use slots for flexible content

### Performance
1. **Lazy Loading**: Load components when needed
2. **Image Optimization**: Use appropriate image formats
3. **Bundle Splitting**: Split code by route/feature
4. **Memoization**: Cache expensive computations

### Accessibility
1. **Semantic HTML**: Use proper HTML elements
2. **ARIA Labels**: Provide screen reader support
3. **Keyboard Navigation**: Ensure keyboard accessibility
4. **Color Contrast**: Maintain proper contrast ratios

### Code Organization
1. **Feature-based Structure**: Group related components
2. **Consistent Naming**: Use consistent naming conventions
3. **Documentation**: Document complex components
4. **Type Safety**: Use TypeScript when possible

---

This component architecture documentation provides a comprehensive overview of the StyleSnap 2025 component system, including patterns, best practices, and implementation details.
