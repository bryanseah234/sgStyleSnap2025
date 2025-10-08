# 🏗️ System Architecture Documentation

## Overview
This document provides comprehensive system architecture documentation for StyleSnap, including UML diagrams, component relationships, and data flow patterns.

---

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Component Diagram](#component-diagram)
3. [Class Diagrams](#class-diagrams)
4. [Sequence Diagrams](#sequence-diagrams)
5. [State Diagrams](#state-diagrams)
6. [Deployment Architecture](#deployment-architecture)

---

## System Architecture Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        PWA[Progressive Web App]
    end
    
    subgraph "Frontend Layer"
        Vue[Vue 3 + Vite]
        Pinia[Pinia State Management]
        Router[Vue Router]
        Components[UI Components]
    end
    
    subgraph "API Layer"
        Supabase[Supabase Client]
        Services[Service Layer]
        Auth[Auth Service]
    end
    
    subgraph "Backend Layer - Supabase"
        PostgreSQL[(PostgreSQL Database)]
        Auth2[Supabase Auth]
        Realtime[Realtime Subscriptions]
        Storage[Storage API]
        RLS[Row Level Security]
    end
    
    subgraph "External Services"
        Google[Google OAuth]
        Cloudinary[Cloudinary CDN]
    end
    
    Browser --> Vue
    PWA --> Vue
    Vue --> Pinia
    Vue --> Router
    Vue --> Components
    Components --> Services
    Services --> Supabase
    Services --> Auth
    
    Supabase --> PostgreSQL
    Supabase --> Auth2
    Supabase --> Realtime
    Supabase --> Storage
    PostgreSQL --> RLS
    
    Auth2 --> Google
    Services --> Cloudinary
```

**Key Characteristics:**
- **Architecture Pattern**: JAMstack (JavaScript, APIs, Markup)
- **Frontend**: Vue 3 SPA with Vite bundler
- **Backend**: Serverless (Supabase)
- **Database**: PostgreSQL with Row Level Security
- **Real-time**: WebSocket-based subscriptions
- **Storage**: Cloudinary CDN for images

---

## Component Diagram

### Frontend Component Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        App[App.vue]
        Router[Router]
        MainLayout[MainLayout.vue]
    end
    
    subgraph "Page Components"
        Closet[Closet.vue]
        Catalog[Catalog.vue]
        Suggestions[OutfitSuggestions.vue]
        Feed[SocialFeed.vue]
        Notifications[Notifications.vue]
        Friends[Friends.vue]
        Settings[Settings.vue]
    end
    
    subgraph "Feature Components"
        ItemCard[ItemCard.vue]
        ItemDetail[ItemDetailModal.vue]
        OutfitCard[OutfitCard.vue]
        NotificationsList[NotificationsList.vue]
        FriendsList[FriendsList.vue]
    end
    
    subgraph "UI Components"
        Spinner[Spinner.vue]
        Skeleton[Skeleton.vue]
        ProgressBar[ProgressBar.vue]
        Modal[Modal.vue]
        Toast[Toast.vue]
    end
    
    subgraph "State Management (Pinia)"
        AuthStore[Auth Store]
        ClosetStore[Closet Store]
        CatalogStore[Catalog Store]
        SocialStore[Social Store]
        NotificationsStore[Notifications Store]
    end
    
    subgraph "Services Layer"
        AuthService[auth-service.js]
        ClosetService[closet-service.js]
        CatalogService[catalog-service.js]
        SocialService[social-service.js]
        NotificationsService[notifications-service.js]
        LikesService[likes-service.js]
        OutfitGenService[outfit-generation-service.js]
    end
    
    App --> Router
    Router --> MainLayout
    MainLayout --> Closet
    MainLayout --> Catalog
    MainLayout --> Suggestions
    MainLayout --> Feed
    MainLayout --> Notifications
    MainLayout --> Friends
    MainLayout --> Settings
    
    Closet --> ItemCard
    Closet --> ItemDetail
    Catalog --> ItemCard
    Suggestions --> OutfitCard
    Feed --> OutfitCard
    Notifications --> NotificationsList
    Friends --> FriendsList
    
    ItemCard --> Spinner
    ItemCard --> Modal
    OutfitCard --> Skeleton
    NotificationsList --> Spinner
    
    Closet --> ClosetStore
    Catalog --> CatalogStore
    Feed --> SocialStore
    Notifications --> NotificationsStore
    
    ClosetStore --> ClosetService
    CatalogStore --> CatalogService
    SocialStore --> SocialService
    NotificationsStore --> NotificationsService
    
    AuthService --> AuthStore
```

---

## Class Diagrams

### Services Class Diagram

```mermaid
classDiagram
    class BaseService {
        +supabase: SupabaseClient
        +handleError(error): void
        +getCurrentUser(): User
    }
    
    class ClosetService {
        +fetchItems(filters): Promise~Item[]~
        +addItem(itemData): Promise~Item~
        +updateItem(id, updates): Promise~Item~
        +deleteItem(id): Promise~void~
        +restoreItem(id): Promise~void~
        +getQuotaInfo(): Promise~QuotaInfo~
    }
    
    class CatalogService {
        +browse(options): Promise~CatalogItem[]~
        +search(query, filters): Promise~CatalogItem[]~
        +getItemById(id): Promise~CatalogItem~
        +addToCloset(catalogItemId): Promise~Item~
    }
    
    class SocialService {
        +getFeed(options): Promise~FeedResponse~
        +shareOutfit(outfitData): Promise~Outfit~
        +likeOutfit(outfitId): Promise~void~
        +unlikeOutfit(outfitId): Promise~void~
        +commentOnOutfit(outfitId, comment): Promise~Comment~
    }
    
    class NotificationsService {
        +getNotifications(options): Promise~Notification[]~
        +getUnreadCount(): Promise~number~
        +markAsRead(notificationId): Promise~void~
        +markAllAsRead(): Promise~void~
        +subscribeToNotifications(userId, callback): Subscription
    }
    
    class OutfitGenerationService {
        +generateOutfits(options): Promise~GeneratedOutfit[]~
        +groupItemsByCategory(items): CategoryGroups
        +scoreOutfit(outfit): number
        +filterByContext(outfits, context): Outfit[]
    }
    
    class FriendSuggestionsService {
        +createSuggestion(data): Promise~Suggestion~
        +getReceivedSuggestions(): Promise~Suggestion[]~
        +approveSuggestion(id): Promise~Outfit~
        +rejectSuggestion(id): Promise~void~
    }
    
    class LikesService {
        +likeClosetItem(itemId): Promise~void~
        +unlikeClosetItem(itemId): Promise~void~
        +hasUserLikedClosetItem(itemId): Promise~boolean~
        +getClosetItemLikers(itemId): Promise~User[]~
        +toggleClosetItemLike(itemId): Promise~void~
    }
    
    BaseService <|-- ClosetService
    BaseService <|-- CatalogService
    BaseService <|-- SocialService
    BaseService <|-- NotificationsService
    BaseService <|-- OutfitGenerationService
    BaseService <|-- FriendSuggestionsService
    BaseService <|-- LikesService
```

### Store Class Diagram

```mermaid
classDiagram
    class AuthStore {
        -user: User | null
        -session: Session | null
        -loading: boolean
        +isAuthenticated: boolean
        +initialize(): Promise~void~
        +signInWithGoogle(): Promise~void~
        +signOut(): Promise~void~
        +updateProfile(data): Promise~void~
    }
    
    class ClosetStore {
        -items: Item[]
        -loading: boolean
        -quotaInfo: QuotaInfo
        -selectedItem: Item | null
        +activeItems: Item[]
        +fetchItems(): Promise~void~
        +addItem(data): Promise~Item~
        +updateItem(id, data): Promise~void~
        +deleteItem(id): Promise~void~
        +refreshQuota(): Promise~void~
    }
    
    class CatalogStore {
        -items: CatalogItem[]
        -loading: boolean
        -filters: Filters
        -searchQuery: string
        +filteredItems: CatalogItem[]
        +browse(options): Promise~void~
        +search(query): Promise~void~
        +setFilters(filters): void
        +addToCloset(itemId): Promise~void~
    }
    
    class SocialStore {
        -feed: Outfit[]
        -loading: boolean
        -hasMore: boolean
        -offset: number
        +loadFeed(): Promise~void~
        +loadMore(): Promise~void~
        +likeOutfit(id): Promise~void~
        +unlikeOutfit(id): Promise~void~
        +refresh(): Promise~void~
    }
    
    class NotificationsStore {
        -notifications: Notification[]
        -unreadCount: number
        -loading: boolean
        -subscription: Subscription | null
        +hasUnread: boolean
        +initialize(): Promise~void~
        +markAsRead(id): Promise~void~
        +markAllAsRead(): Promise~void~
        +loadMore(): Promise~void~
        +cleanup(): void
    }
    
    AuthStore --> ClosetStore : provides user
    AuthStore --> CatalogStore : provides user
    AuthStore --> SocialStore : provides user
    AuthStore --> NotificationsStore : provides user
```

### Domain Models

```mermaid
classDiagram
    class User {
        +id: UUID
        +email: string
        +username: string
        +avatar_url: string
        +created_at: timestamp
        +updated_at: timestamp
    }
    
    class ClothingItem {
        +id: UUID
        +owner_id: UUID
        +name: string
        +category: string
        +image_url: string
        +thumbnail_url: string
        +dominant_color: string
        +secondary_colors: string[]
        +style_tags: string[]
        +privacy: string
        +size: string
        +brand: string
        +created_at: timestamp
        +removed_at: timestamp
        +likes_count: number
    }
    
    class CatalogItem {
        +id: UUID
        +name: string
        +category: string
        +image_url: string
        +thumbnail_url: string
        +tags: string[]
        +brand: string
        +color: string
        +season: string
        +style: string[]
        +is_active: boolean
        +created_at: timestamp
    }
    
    class Outfit {
        +id: UUID
        +user_id: UUID
        +caption: string
        +outfit_items: JSONB
        +visibility: string
        +likes_count: number
        +comments_count: number
        +created_at: timestamp
    }
    
    class Friendship {
        +id: UUID
        +requester_id: UUID
        +receiver_id: UUID
        +status: string
        +created_at: timestamp
        +updated_at: timestamp
    }
    
    class Notification {
        +id: UUID
        +recipient_id: UUID
        +actor_id: UUID
        +type: string
        +reference_id: UUID
        +message: string
        +is_read: boolean
        +created_at: timestamp
    }
    
    class FriendOutfitSuggestion {
        +id: UUID
        +owner_id: UUID
        +suggester_id: UUID
        +outfit_items: JSONB
        +message: string
        +status: string
        +created_at: timestamp
    }
    
    User "1" --> "*" ClothingItem : owns
    User "1" --> "*" Outfit : creates
    User "*" --> "*" Friendship : participates
    User "1" --> "*" Notification : receives
    User "1" --> "*" FriendOutfitSuggestion : creates/receives
    Outfit "*" --> "*" ClothingItem : contains
```

---

## Sequence Diagrams

### Authentication Sequence

```mermaid
sequenceDiagram
    actor User
    participant App
    participant AuthStore
    participant AuthService
    participant Supabase
    participant Google
    
    User->>App: Opens Application
    App->>AuthStore: initialize()
    AuthStore->>AuthService: checkSession()
    AuthService->>Supabase: auth.getSession()
    
    alt Session Exists
        Supabase-->>AuthService: Valid Session
        AuthService-->>AuthStore: Session Data
        AuthStore-->>App: Authenticated
        App->>User: Show Dashboard
    else No Session
        Supabase-->>AuthService: No Session
        AuthService-->>AuthStore: Not Authenticated
        AuthStore-->>App: Not Authenticated
        App->>User: Show Login Page
        
        User->>App: Click "Sign in with Google"
        App->>AuthStore: signInWithGoogle()
        AuthStore->>AuthService: initiateGoogleAuth()
        AuthService->>Supabase: auth.signInWithOAuth({provider: 'google'})
        Supabase->>Google: OAuth Request
        Google->>User: Google Login Page
        User->>Google: Authorize
        Google->>Supabase: OAuth Token
        Supabase->>AuthService: Session Created
        AuthService->>AuthStore: Update Session
        AuthStore->>App: Authenticated
        App->>User: Show Dashboard
    end
```

### Adding Item Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant ClosetStore
    participant ClosetService
    participant Cloudinary
    participant Supabase
    
    User->>UI: Click Add Item (+)
    UI->>UI: Open Upload Modal
    User->>UI: Select Image
    UI->>UI: Validate Image
    UI->>Cloudinary: Upload Image
    Cloudinary-->>UI: Image URL
    
    User->>UI: Fill Details (name, category, etc.)
    User->>UI: Click Save
    UI->>ClosetStore: addItem(itemData)
    ClosetStore->>ClosetService: addItem(itemData)
    ClosetService->>Supabase: INSERT into clothes
    
    alt Success
        Supabase-->>ClosetService: Item Created
        ClosetService-->>ClosetStore: New Item
        ClosetStore->>ClosetStore: Add to items array
        ClosetStore->>ClosetStore: Update quota
        ClosetStore-->>UI: Success
        UI->>User: Show Success Toast
        UI->>UI: Refresh Grid
    else Error
        Supabase-->>ClosetService: Error
        ClosetService-->>ClosetStore: Error
        ClosetStore-->>UI: Error
        UI->>User: Show Error Message
    end
```

### Real-Time Notification Sequence

```mermaid
sequenceDiagram
    actor Friend
    actor User
    participant FriendApp
    participant UserApp
    participant NotifStore
    participant Supabase
    participant WebSocket
    
    Note over UserApp,NotifStore: User initializes app
    UserApp->>NotifStore: initialize()
    NotifStore->>Supabase: subscribeToNotifications()
    Supabase->>WebSocket: Establish Connection
    WebSocket-->>NotifStore: Connected
    
    Note over Friend,FriendApp: Friend likes User's outfit
    Friend->>FriendApp: Click Like
    FriendApp->>Supabase: INSERT into shared_outfit_likes
    Supabase->>Supabase: Trigger: create_outfit_like_notification
    Supabase->>Supabase: INSERT into notifications
    
    Note over WebSocket,UserApp: Real-time notification
    Supabase->>WebSocket: Broadcast notification
    WebSocket->>NotifStore: New notification event
    NotifStore->>NotifStore: Add to notifications array
    NotifStore->>NotifStore: Increment unreadCount
    NotifStore->>UserApp: Update UI
    UserApp->>User: Show badge with count
    UserApp->>User: Pulse animation
    
    opt Browser Notifications Enabled
        UserApp->>User: Browser notification popup
    end
    
    User->>UserApp: Click Bell Icon
    UserApp->>NotifStore: Open notifications page
    NotifStore-->>UserApp: Display notifications list
    User->>UserApp: Click notification
    UserApp->>NotifStore: markAsRead(notificationId)
    NotifStore->>Supabase: UPDATE notifications
    Supabase-->>NotifStore: Success
    NotifStore->>NotifStore: Update local state
    UserApp->>User: Navigate to outfit detail
```

### Outfit Generation Sequence

```mermaid
sequenceDiagram
    actor User
    participant UI
    participant OutfitService
    participant Supabase
    participant Algorithm
    
    User->>UI: Select weather/occasion filters
    User->>UI: Click Generate Outfits
    UI->>OutfitService: generateOutfits(options)
    
    OutfitService->>Supabase: Fetch user's items
    Supabase-->>OutfitService: Items array
    
    OutfitService->>Algorithm: groupItemsByCategory(items)
    Algorithm-->>OutfitService: Grouped items
    
    OutfitService->>Algorithm: validateMinimumItems()
    alt Insufficient Items
        Algorithm-->>OutfitService: Error
        OutfitService-->>UI: Error: Need more items
        UI->>User: Show error message
    else Sufficient Items
        Algorithm-->>OutfitService: Valid
        
        OutfitService->>Algorithm: generatePermutations(grouped)
        loop For each combination
            Algorithm->>Algorithm: Create outfit (top+bottom+shoes)
            Algorithm->>Algorithm: Optional: add outerwear
        end
        Algorithm-->>OutfitService: Permutations (max 200)
        
        OutfitService->>Algorithm: scoreOutfits(permutations)
        loop For each outfit
            Algorithm->>Algorithm: calculateColorHarmony()
            Algorithm->>Algorithm: checkCompleteness()
            Algorithm->>Algorithm: Calculate total score
        end
        Algorithm-->>OutfitService: Scored outfits
        
        OutfitService->>Algorithm: filterByContext(options)
        Algorithm-->>OutfitService: Filtered outfits
        
        OutfitService->>Algorithm: sortByScore() & takeTop(10)
        Algorithm-->>OutfitService: Top 10 outfits
        
        OutfitService-->>UI: Generated outfits
        UI->>User: Display outfit cards
    end
```

---

## State Diagrams

### Item Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Creating: User uploads image
    Creating --> Validating: Image uploaded
    Validating --> Creating: Invalid (retry)
    Validating --> Active: Valid & Saved
    
    Active --> Editing: User edits details
    Editing --> Active: Save changes
    Editing --> Active: Cancel
    
    Active --> SoftDeleted: User deletes
    SoftDeleted --> Active: Undo within 5s
    SoftDeleted --> RecoveryPeriod: After 5s
    RecoveryPeriod --> Active: User restores (within 30 days)
    RecoveryPeriod --> PermanentlyDeleted: After 30 days
    
    Active --> Shared: User shares with friends
    Shared --> Active: Change to private
    
    PermanentlyDeleted --> [*]
```

### Friendship State Machine

```mermaid
stateDiagram-v2
    [*] --> NoRelationship: Users not connected
    NoRelationship --> RequestPending: User A sends request
    
    RequestPending --> Accepted: User B accepts
    RequestPending --> Rejected: User B rejects
    RequestPending --> NoRelationship: User A cancels
    
    Accepted --> NoRelationship: Either user unfriends
    Rejected --> NoRelationship: Time passes / User removes
    
    Accepted --> [*]: Users are friends
    NoRelationship --> [*]: No connection
```

### Notification State Machine

```mermaid
stateDiagram-v2
    [*] --> Created: Event triggers notification
    Created --> Unread: Saved to database
    
    Unread --> Read: User views/clicks
    Unread --> Read: Mark all as read
    
    Read --> Archived: After 30 days
    Archived --> Deleted: After 90 days
    
    Deleted --> [*]
```

---

## Deployment Architecture

### Production Deployment Diagram

```mermaid
graph TB
    subgraph "CDN - Cloudflare"
        CDN[Static Assets Cache]
    end
    
    subgraph "Frontend Hosting - Vercel/Netlify"
        WebServer[Web Server]
        StaticFiles[Static Files]
    end
    
    subgraph "Supabase Cloud"
        LoadBalancer[Load Balancer]
        API[Supabase API]
        DB[(PostgreSQL Primary)]
        DBReplica[(PostgreSQL Replica)]
        Realtime[Realtime Server]
        Auth[Auth Server]
    end
    
    subgraph "External Services"
        GoogleOAuth[Google OAuth]
        CloudinaryAPI[Cloudinary API]
        CloudinaryCDN[Cloudinary CDN]
    end
    
    subgraph "Monitoring"
        Sentry[Sentry Error Tracking]
        Analytics[Analytics]
    end
    
    Users[Users] --> CDN
    CDN --> WebServer
    WebServer --> StaticFiles
    StaticFiles --> API
    
    API --> LoadBalancer
    LoadBalancer --> DB
    DB --> DBReplica
    API --> Realtime
    API --> Auth
    
    Auth --> GoogleOAuth
    API --> CloudinaryAPI
    CloudinaryAPI --> CloudinaryCDN
    
    WebServer --> Sentry
    WebServer --> Analytics
```

### Infrastructure Components

**Frontend:**
- **Hosting**: Vercel or Netlify
- **CDN**: Cloudflare
- **Build**: Vite production build
- **Deployment**: Git-based (auto-deploy on push)

**Backend (Supabase):**
- **Database**: PostgreSQL 15+ with read replicas
- **API**: Auto-generated REST & GraphQL APIs
- **Real-time**: WebSocket server for subscriptions
- **Auth**: Supabase Auth with Google OAuth
- **Storage**: Supabase Storage (optional, using Cloudinary instead)

**External Services:**
- **Cloudinary**: Image hosting and transformation
- **Google OAuth**: Authentication provider
- **Sentry**: Error tracking and monitoring
- **Analytics**: User behavior tracking

---

## Technology Stack

### Frontend Technologies
```
Vue 3.4+                    # Progressive framework
Vite 5+                     # Build tool
Pinia 2+                    # State management
Vue Router 4+               # Client-side routing
TailwindCSS 3+              # Utility-first CSS
Headless UI                 # Accessible components
date-fns                    # Date utilities
```

### Backend Technologies
```
Supabase                    # Backend-as-a-Service
PostgreSQL 15+              # Relational database
PostgREST                   # Automatic REST API
Realtime                    # WebSocket server
pgvector (optional)         # Vector similarity search
```

### Development Tools
```
ESLint                      # Linting
Prettier                    # Code formatting
Vitest                      # Unit testing
Playwright                  # E2E testing
Husky                       # Git hooks
```

---

## Design Patterns

### Service Layer Pattern
All API calls go through dedicated service modules:
```
Component → Store → Service → Supabase
```

### Repository Pattern
Services act as repositories for data access:
```js
// Abstract data access
class ClosetRepository {
  async findAll() { /* ... */ }
  async findById(id) { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
}
```

### Observer Pattern (Real-time)
WebSocket subscriptions for real-time updates:
```js
// Subscribe to changes
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', { event: 'INSERT' }, (payload) => {
    // Handle new notification
  })
  .subscribe()
```

### Factory Pattern (Outfit Generation)
Generate outfits using factory methods:
```js
class OutfitFactory {
  static create(items, options) {
    const outfit = new Outfit()
    outfit.addItems(items)
    outfit.setContext(options)
    return outfit
  }
}
```

---

## Security Architecture

### Row Level Security (RLS)
```sql
-- Users can only see their own items
CREATE POLICY "Users own items"
ON clothes FOR ALL
USING (owner_id = auth.uid());

-- Users can see friends' shared items
CREATE POLICY "Users see friends items"
ON clothes FOR SELECT
USING (
  privacy = 'friends'
  AND owner_id IN (SELECT friend_id FROM friends WHERE user_id = auth.uid())
);
```

### Authentication Flow
```
User → Google OAuth → Supabase Auth → JWT Token → API Requests
```

### API Security
- JWT tokens for authentication
- RLS policies for authorization
- HTTPS only
- CORS configuration
- Rate limiting (Supabase built-in)

---

## Performance Optimization

### Frontend
- **Code Splitting**: Lazy load routes
- **Image Optimization**: Cloudinary transformations
- **Caching**: Service worker cache
- **Virtual Scrolling**: Large lists
- **Debouncing**: Search inputs

### Backend
- **Indexing**: Strategic database indexes
- **Connection Pooling**: Supabase Pooler
- **Query Optimization**: Efficient SQL queries
- **CDN**: Static asset caching
- **Read Replicas**: Scale read operations

---

## Related Documentation
- [User Flows](./USER_FLOWS.md) - User journey diagrams
- [Database Guide](../DATABASE_GUIDE.md) - Complete database setup, schema, and ER diagrams
- [API Reference](./API_REFERENCE.md) - API documentation
- [Deployment](./DEPLOYMENT.md) - Deployment guide

---

## Status: COMPLETE ✅
Complete system architecture documented with UML diagrams!
