# PRD: sgStyleSnap2025 (StyleSnap)

## Overview
A full-stack Vue 3 web application for digital wardrobe management and AI-powered outfit curation. Users upload clothing photos to build a digital closet, use a drag-and-drop canvas to create outfit combinations, receive Google Gemini AI outfit suggestions, and visualize outfits via virtual try-on (HuggingFace IDM-VTON). Social features allow connecting with friends and sharing outfits. Built with Supabase backend, Cloudinary image storage, and Playwright E2E tests.

## Goals
- Allow users to upload and categorize their clothing items with photos
- Provide drag-and-drop outfit creator canvas
- Generate AI outfit suggestions via Google Gemini
- Virtual try-on: render outfit on AI model using HuggingFace IDM-VTON
- Social: add friends, view closets, share outfits
- Real-time notifications for friend activity
- Smart search/filter by name, brand, category, color
- Light/dark/multiple theme support
- Browse and add from pre-seeded catalog

## Non-Goals
- Physical e-commerce (no checkout/payment)
- Mobile native app (web only)
- Professional stylist consultation
- Real-time video try-on (static image only)

## User Stories
- As a fashion enthusiast, I want to digitize my wardrobe and organize items by category.
- As a user, I want to mix and match clothes on a canvas to visualize an outfit before wearing it.
- As a style-seeker, I want AI to suggest outfits based on my closet items and preferences.
- As a social user, I want to see what my friends are wearing and share outfit ideas.
- As a user, I want to see what an outfit looks like on an AI model before committing.

## Tech Stack
- **Frontend**: Vue 3 (Composition API) + TypeScript + Vite
- **State**: Pinia
- **Routing**: Vue Router 5
- **Styling**: Tailwind CSS v4 + Motion.js animations + Lenis smooth scroll
- **3D**: Three.js (avatar carousel)
- **AI**: `@google/genai` (Gemini for suggestions) + `@huggingface/inference` (IDM-VTON try-on)
- **Background removal**: `modern-rembg` + ONNX Runtime Web (in-browser)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Image storage**: Cloudinary
- **Email**: Brevo (transactional notifications)
- **Testing**: Playwright (E2E) + Vitest (unit)
- **Build**: Vite 8

## Architecture
```
sgStyleSnap2025/
├── src/
│   ├── views/               # Pages: Closet, OutfitCreator, TryOn, Friends, Catalog, Auth
│   ├── components/          # ClosetItem, OutfitCanvas, ItemCard, FriendCard, etc.
│   ├── stores/              # Pinia: closet, outfits, friends, notifications, user
│   ├── services/            # Supabase client, Gemini API, HuggingFace API
│   ├── composables/         # useCloset, useOutfits, useTheme, etc.
│   └── router/              # Route definitions
├── api/                     # Vercel serverless functions (if any)
├── database/
│   └── migrations/          # 001–048 Supabase SQL migrations (sequential)
├── playwright.config.js     # E2E test config
└── .env.example
```

**Key routes:**
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/auth` | Google OAuth login |
| `/closet` | Browse + manage wardrobe items |
| `/outfit` | Drag-and-drop outfit creator canvas |
| `/tryon` | Virtual try-on with AI model |
| `/friends` | Social connections |
| `/catalog` | Browse + add pre-seeded items |
| `/notifications` | Real-time activity feed |

## Features (detailed)

### Digital Closet
- Upload clothing photos via Cloudinary (unsigned preset)
- Background removal via `modern-rembg` + ONNX Runtime Web (client-side, no server)
- Categorize: tops, bottoms, shoes, accessories, outerwear
- Metadata: name, brand, color, size
- Search and filter by any field

### Outfit Creator
- Drag-and-drop canvas using Vue composition
- Layer multiple closet items
- Save named outfit combinations

### AI Suggestions (Gemini)
- Send closet items metadata to Gemini API
- Returns outfit combination suggestions with reasoning
- Considers weather, occasion, style preferences

### Virtual Try-On (HuggingFace)
- User selects outfit items
- Sends reference photo + garment images to IDM-VTON model
- Returns AI-generated image of model wearing the outfit

### Social Features
- Add friends by username/email
- View friend's public closet and outfits
- Real-time activity notifications (Supabase Realtime)

### Theme System
- Light / dark / multiple theme options
- Persisted to localStorage

## Database (Supabase — 48 migrations)
Key tables (inferred from scope):
- `users` — profile, preferences
- `closet_items` — clothing metadata + Cloudinary URLs
- `outfits` — named outfit combinations
- `outfit_items` — many-to-many outfits ↔ closet_items
- `friends` — user connections
- `notifications` — real-time activity events
- `catalog_items` — pre-seeded clothing catalog

## Environment Variables
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_CLIENT_ID=        # OAuth
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_HUGGINGFACE_API_TOKEN=
VITE_GEMINI_API_KEY=
```

## Deployment / Run
```bash
npm install
cp .env.example .env
# Run migrations: database/migrations/001-048 (sequential) in Supabase
npm run dev           # http://localhost:5173
npm run build         # production
npm run test:e2e      # Playwright E2E
npm run test          # Vitest unit tests
npm run lint          # ESLint
```

## Constraints & Notes
- **48 DB migrations**: must be applied in order 001→048; rollback not scripted
- **Cloudinary unsigned preset**: image uploads are public — configure Cloudinary delivery settings appropriately
- **HuggingFace IDM-VTON**: slow inference (~30-60s per try-on); show loading state
- **Gemini API key**: client-side exposure — consider proxying through Vercel serverless for production
- **Background removal**: ONNX runs in-browser with WebAssembly — first load may be slow (model download)
- **Google OAuth only**: no email/password auth — all users must have Google accounts
