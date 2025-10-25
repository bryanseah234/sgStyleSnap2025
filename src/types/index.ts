/**
 * StyleSnap - Type Definitions
 * 
 * Centralized type definitions for the entire application.
 * Provides type safety across components, stores, and services.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  username?: string
  avatar_url?: string | null
  theme?: 'light' | 'dark'
  theme_preference?: 'light' | 'dark'
  bio?: string | null
  created_at?: string
  updated_at?: string
  user_metadata?: UserMetadata
  app_metadata?: AppMetadata
}

export interface UserMetadata {
  name?: string
  full_name?: string
  avatar_url?: string | null
  picture?: string | null
}

export interface AppMetadata {
  provider?: string
  providers?: string[]
}

export interface Profile extends User {
  // Additional profile-specific fields
}

// ============================================
// Clothing & Wardrobe Types
// ============================================

export interface ClothingItem {
  id: string
  user_id: string
  name: string
  category: ClothingCategory
  subcategory?: string
  brand?: string
  color: string
  colors?: string[]
  size?: string
  image_url: string
  cloudinary_public_id?: string
  notes?: string
  tags?: string[]
  is_favorite?: boolean
  purchase_date?: string
  purchase_price?: number
  created_at: string
  updated_at: string
}

export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'bags'

export interface CatalogItem {
  id: string
  name: string
  category: ClothingCategory
  subcategory?: string
  brand: string
  color: string
  colors?: string[]
  image_url: string
  description?: string
  price?: number
  retailer?: string
  is_available?: boolean
}

// ============================================
// Outfit Types
// ============================================

export interface Outfit {
  id: string
  user_id: string
  name: string
  description?: string
  items: OutfitItem[]
  created_at: string
  updated_at: string
  is_favorite?: boolean
  tags?: string[]
  season?: string
  occasion?: string
  thumbnail_url?: string
}

export interface OutfitItem {
  id: string
  item_id: string
  position_x: number
  position_y: number
  scale?: number
  rotation?: number
  z_index?: number
}

// ============================================
// Friends & Social Types
// ============================================

export interface Friend {
  id: string
  username: string
  full_name?: string
  avatar_url?: string | null
  bio?: string | null
  friendship_status: FriendshipStatus
  created_at?: string
}

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface FriendRequest {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  requester?: User
  addressee?: User
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
  metadata?: Record<string, any>
}

export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'outfit_liked'
  | 'outfit_commented'
  | 'system'

// ============================================
// Theme Types
// ============================================

export type Theme = 'light' | 'dark'

export interface ThemeStore {
  theme: Theme
  user: User | null
  isInitialized: boolean
  isDark: boolean
  isLight: boolean
  applyTheme: (theme: Theme) => void
  initializeTheme: () => void
  loadUser: () => Promise<void>
  toggleTheme: () => Promise<void>
  setTheme: (theme: Theme) => void
  refreshTheme: () => void
  syncTheme: (theme: Theme) => void
}

// ============================================
// Auth Store Types
// ============================================

export interface AuthStore {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  userId: string | null
  userName: string
  userEmail: string | null
  userAvatar: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  clearUser: () => void
  initializeAuth: () => Promise<void>
  login: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  fetchUserProfile: () => Promise<Profile | null>
  updateProfile: (updates: Partial<Profile>) => Promise<Profile>
  updateAvatar: (avatarUrl: string) => Promise<Profile>
  updateTheme: (theme: Theme) => Promise<Profile>
  refreshSession: () => Promise<User | null>
  mockLogin: () => Promise<User>
  setupAuthListener: () => any
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================
// Form & Input Types
// ============================================

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox'
  placeholder?: string
  required?: boolean
  value?: any
  options?: Array<{ label: string; value: any }>
}

// ============================================
// Utility Types
// ============================================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncFunction<T = void> = () => Promise<T>
export type Callback<T = void> = (data?: T) => void

// ============================================
// Component Prop Types
// ============================================

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export interface DialogProps {
  open: boolean
  title?: string
  description?: string
  onClose: () => void
}

export interface CardProps {
  title?: string
  description?: string
  image?: string
  onClick?: () => void
  className?: string
}

