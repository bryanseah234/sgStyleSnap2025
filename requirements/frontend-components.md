# Frontend Components Requirements

## 1. Design System & Theming

### 1.1 Design Tokens Structure

```javascript
// /src/config/theme.js
export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      // ... shades up to 900
    },
    secondary: {
      50: '#fdf4ff',
      // ... shades up to 900
    },
    neutral: {
      50: '#f8fafc',
      // ... shades up to 900
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  typography: {
    font_family: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace']
    },
    font_size: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};
```

---

### 1.2 Icon Mapping System

```javascript
// /src/config/icons.js
export const icons = {
  add: 'plus-circle',
  edit: 'pencil',
  delete: 'trash',
  close: 'x',
  menu: 'menu',
  search: 'search',
  filter: 'filter',
  camera: 'camera',
  gallery: 'photo',
  user: 'user',
  friends: 'users',
  closet: 'hanger',
  suggestion: 'lightbulb'
};
```

---

## 2. Core Layout Components

### 2.1 MainLayout.vue

**Requirements:**

- Persistent bottom navigation bar (mobile)
- Side navigation (desktop)
- Three primary tabs: My Closet, Friends, Profile
- Notification badge indicator
- Theme toggle button
- Responsive breakpoint handling

---

### 2.2 AuthLayout.vue

**Requirements:**

- Centered content container
- StyleSnap mascot display
- App branding elements
- Clean, minimal design

---

## 3. Page Components

### 3.1 Login.vue

**Requirements:**

- Uses AuthLayout wrapper
- Single "Sign in with Google" button
- Display app logo and mascot
- Handle OAuth redirect flow
- Store JWT securely
- Show loading state during authentication

---

### 3.2 Closet.vue

**Requirements:**

- Uses MainLayout wrapper
- Integrates ClosetGrid component
- Floating action button for adding items
- Category filter controls
- Item count with quota indicator
- Search functionality

---

### 3.3 Friends.vue

**Requirements:**

- Uses MainLayout wrapper
- Tab navigation for Friends/Requests
- Search bar with email validation
- Friend list with status indicators
- Pending request badges

---

### 3.4 Profile.vue

**Requirements:**

- Uses MainLayout wrapper
- User avatar and name display
- Quota usage visualization
- Theme toggle
- Settings links
- Sign out button

---

## 4. Reusable UI Components (/components/ui/)

### 4.1 Button.vue

**Props:**

- `variant`: primary, secondary, outline, ghost
- `size`: sm, md, lg
- `loading`: Boolean
- `disabled`: Boolean

---

### 4.2 Modal.vue

**Props:**

- `is_open`: Boolean
- `title`: String
- `size`: sm, md, lg

---

### 4.3 FormInput.vue

**Props:**

- `type`: text, email, password
- `label`: String
- `error`: String
- `required`: Boolean

---

### 4.4 Select.vue

**Props:**

- `options`: Array
- `value`: Any
- `placeholder`: String

---

### 4.5 Notification.vue

**Props:**

- `type`: success, warning, error, info
- `message`: String
- `duration`: Number

---

### 4.6 Badge.vue

**Props:**

- `count`: Number
- `variant`: default, secondary, destructive

---

### 4.7 Skeleton.vue

**Props:**

- `height`: String
- `width`: String
- `variant`: text, circular, rectangular

---

## 5. Feature-Specific Components

### 5.1 ClosetGrid.vue

**Requirements:**

- Responsive grid (3 cols mobile, 4-6 desktop)
- Lazy loading with Intersection Observer
- Category filter integration
- Item click → detail modal
- Empty state with illustration

---

### 5.2 AddItemForm.vue

**CRITICAL Requirements:**

- Image selection (camera/gallery)
- CLIENT-SIDE RESIZE to max 1080px
- Target < 1MB file size
- Required fields with validation
- Optional fields in collapsible section
- Upload progress with percentage

---

### 5.3 SuggestionCanvas.vue

**CRITICAL Requirements:**

- Split view layout: items panel + canvas drop zone
- Drag-and-drop with vue-draggable
- Touch gesture support
- Visual feedback for drag operations
- Message input (100 char limit)
- Undo/redo functionality

**Related Tasks:** [TASK: 03-closet-crud-image-management#3.3], [TASK: 05-suggestion-system#5.2]