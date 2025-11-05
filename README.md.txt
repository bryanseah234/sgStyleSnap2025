# 🏫 IS216 Web Application Development II

---

## Section & Team Number
G3 Team 4

---

## Team Members

| Photo | Full Name | Role / Features Responsible For |
|:--:|:--|:--|
| <img src="public/photos/leon.png" width="80"> | Leon | Frontend Developer - Outfit Canvas & Drag-and-Drop |
| <img src="public/photos/kaijie.png" width="80"> | Kai Jie | Backend Developer - Supabase API & Database |
| <img src="public/photos/bryan.png" width="80"> | Bryan | Full Stack Developer - Authentication & Notifications |
| <img src="public/photos/weiting.png" width="80"> | Wei Ting | UI/UX Designer - Theme System & Responsive Design |
| <img src="public/photos/andrew.png" width="80"> | Andrew | Frontend Developer - Closet Management & Search |
| <img src="public/photos/alan.png" width="80"> | Alan | Backend Developer - AI Integration & Cloudinary |

> ✅ All headshot thumbnails are in the `/public/photos` folder (PNG format).

---

## Business Problem

**The Challenge:**  
Fashion enthusiasts struggle to organize their wardrobes, plan outfits efficiently, and discover new style combinations. Many people own clothes they forget about, cannot easily visualize outfit combinations, and lack tools to manage their fashion choices digitally.

**Pain Points Addressed:**
- No centralized system to track clothing items across different storage locations
- Difficulty visualizing outfit combinations before wearing them
- Limited ability to get personalized style recommendations
- Lack of social features to share and get feedback on outfits
- No weather-based or occasion-specific outfit suggestions

**Solution Overview:**  
StyleSnap is a comprehensive digital wardrobe management platform that helps users organize their clothing, create outfit combinations, connect with fashion-forward friends, and receive AI-powered style suggestions based on their preferences and external factors.

---

## Web Solution Overview

### 🎯 Intended Users

StyleSnap targets three primary user groups:

1. **Fashion Enthusiasts** - Users who love fashion and want to organize their wardrobe
2. **Minimalists** - People who want to maximize outfit variety with fewer items
3. **Social Style Seekers** - Users who want to share outfits and get style inspiration from friends

### 💡 What Users Can Do & Benefits

| Feature | Description | User Benefit |
|:--|:--|:--|
| Digital Wardrobe | Upload and organize clothing items with photos | Keep all clothing information in one place, accessible from any device |
| Interactive Outfit Creator | Drag-and-drop canvas to create outfit combinations | Visualize outfits before wearing them, discover new combinations |
| AI-Powered Suggestions | Get automated outfit recommendations | Save time planning outfits, discover unexpected combinations |
| Friend Connections | Add friends and view their closets | Get style inspiration from people you know and trust |
| Outfit Suggestions | Create and share outfit ideas with friends | Receive personalized style advice and recommendations |
| Weather-Based Recommendations | Get outfit suggestions based on weather | Dress appropriately for any weather condition |
| Real-time Notifications | Get notified of friend activities and suggestions | Stay engaged with the community, never miss important updates |
| Search & Filter | Find items by name, brand, category, or color | Quickly locate specific items from large wardrobes |

---

## Tech Stack

| Logo | Technology | Purpose / Usage |
|:--:|:--|:--|
| <img src="https://vuejs.org/images/logo.png" width="40"> | **Vue.js 3** | Component-based frontend framework using Composition API |
| <img src="https://vitejs.dev/logo.svg" width="40"> | **Vite** | Fast development server and production build tool |
| <img src="https://github.com/tailwindlabs/tailwindcss/raw/main/.github/readme-logo.svg" width="40"> | **Tailwind CSS** | Utility-first CSS framework for responsive design |
| <img src="https://supabase.com/favicon/favicon-192x192.png" width="40"> | **Supabase** | Backend-as-a-Service for PostgreSQL, Auth, and Realtime |
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/postgresql/postgresql.png" width="40"> | **PostgreSQL** | Relational database with Row-Level Security |
| <img src="https://cloudinary.com/favicon.ico" width="40"> | **Cloudinary** | Image storage, optimization, and CDN |
| <img src="https://raw.githubusercontent.com/github/explore/main/topics/typescript/typescript.png" width="40"> | **TypeScript** | Type-safe JavaScript for better development experience |
| <img src="https://lucide.dev/favicon.ico" width="40"> | **Lucide Vue Next** | Modern icon library with 1000+ icons |

> Core technologies: Vue 3 + Composition API, Supabase for backend, Tailwind CSS for styling, Cloudinary for images

---

## Use Case & User Journey

Provide screenshots and captions showing how users interact with your app.

1. **Landing/Login Page**  
   <img src="screenshots/landing.png" width="600">  
   - Clean landing page with Google OAuth sign-in button
   - Theme toggle and feature highlights
   - Terms of Service and Privacy Policy modals

2. **Home Dashboard**  
   <img src="screenshots/home.png" width="600">  
   - Welcome message with user's name
   - Stats cards showing closet items, outfits, and friends count
   - Notification bell with unread count
   - Quick navigation to all major features

3. **Digital Closet**  
   <img src="screenshots/closet.png" width="600">  
   - Grid layout of clothing items with images
   - Category filters (All, Top, Bottom, Shoes, etc.)
   - Search functionality to find items quickly
   - Favorite toggle on each item

4. **Interactive Outfit Creator**  
   <img src="screenshots/outfit-creator.png" width="600">  
   - Drag-and-drop canvas for arranging items
   - Sidebar with user's closet items
   - Canvas tools for zoom, rotate, layer management
   - Save/Share buttons

5. **Outfit Gallery**  
   <img src="screenshots/outfits.png" width="600">  
   - Visual gallery of all saved outfits
   - Filter by All, Favorites, or Suggestions
   - Quick edit and delete options on hover
   - Add outfit dropdown with 3 options

6. **Friend & Social Features**  
   <img src="screenshots/friends.png" width="600">  
   - Friend list with avatars
   - Friend request management
   - Ability to browse friend closets
   - Create outfit suggestions for friends

7. **Profile & Settings**  
   <img src="screenshots/profile.png" width="600">  
   - User profile information from Google
   - Email notification preferences
   - Theme toggle and logout
   - Account management options

> Save screenshots inside `/screenshots` with clear filenames: landing.png, home.png, closet.png, outfit-creator.png, outfits.png, friends.png, profile.png

---

## Developers Setup Guide

Comprehensive steps to help other developers or evaluators run and test your project.

---

### 0) Prerequisites
- [Git](https://git-scm.com/) v2.4+  
- [Node.js](https://nodejs.org/) v18+ and npm v9+  
- [Supabase Account](https://supabase.com/) - Free tier available
- [Cloudinary Account](https://cloudinary.com/) - Free tier available
- Modern browser (Chrome, Firefox, Safari, Edge)

---

### 1) Download the Project
```bash
git clone https://github.com/<org-or-user>/sgStyleSnap2025.git
cd sgStyleSnap2025
npm install
```

---

### 2) Configure Environment Variables
Create a `.env` file in the root directory with the following structure:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

> **Important:** Never commit the `.env` file to your repository.  
> An `.env.example` file with placeholder values is included in the repository.

---

### 3) Backend / Cloud Service Setup

#### Supabase Setup
1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Create a new project
3. Wait for the project to initialize (2-3 minutes)
4. Navigate to **Settings → API** to find:
   - Project URL → Copy to `VITE_SUPABASE_URL`
   - Anon public key → Copy to `VITE_SUPABASE_ANON_KEY`
5. Enable Row-Level Security (RLS) on all tables:
   - Go to **SQL Editor**
   - Run migrations in order from `database/migrations/` folder
6. Configure Authentication:
   - Go to **Authentication → Providers**
   - Enable **Google** provider
   - Add your OAuth credentials
7. Enable Realtime (optional):
   - Go to **Database → Replication**
   - Enable replication for `notifications` table

#### Cloudinary Setup
1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Create an account or sign in
3. Navigate to **Settings → Upload**
4. Create an unsigned upload preset:
   - Go to **Settings → Upload presets**
   - Click **Add upload preset**
   - Set to **Unsigned**
   - Add folder: `stylesnap/clothes`
   - Save and copy preset name to `VITE_CLOUDINARY_UPLOAD_PRESET`
5. Copy your credentials:
   - Cloud name → `VITE_CLOUDINARY_CLOUD_NAME`
   - API Key → `VITE_CLOUDINARY_API_KEY`
   - API Secret → `VITE_CLOUDINARY_API_SECRET`

#### Database Migrations
Run migrations in the correct order:

```bash
# Navigate to database/migrations folder
cd database/migrations

# Apply each migration in order
# Use Supabase SQL Editor or psql command:
psql -h your-db-host -U your-username -d your-database -f 001_initial_schema.sql
psql -h your-db-host -U your-username -d your-database -f 002_auth_setup.sql
# ... continue with all migration files
```

> **Note:** Migration files are numbered sequentially. Run them in order (001, 002, 003, etc.)

---

### 4) Run the Frontend
To start the development server:
```bash
npm run dev
```
The project will run on [http://localhost:5173](http://localhost:5173) by default.

To build and preview the production version:
```bash
npm run build
npm run preview
```

---

### 5) Testing the Application

#### Manual Testing
Perform the following checks before submission:

| Area | Test Description | Expected Outcome |
|:--|:--|:--|
| Authentication | Login with Google OAuth | User successfully signs in and redirects to home page |
| Closet Management | Add, Edit, Delete clothing items | Items appear/disappear in grid, database updates correctly |
| Outfit Creation | Create outfit using drag-and-drop canvas | Outfit saved and appears in gallery with correct items |
| Friend System | Send friend request, accept/reject | Friend connections reflect correctly in database |
| Search & Filter | Search items by name, filter by category | Results update in real-time based on search term |
| Responsiveness | Test on mobile & desktop | Layout adjusts without distortion, touch interactions work |
| Theme System | Toggle light/dark mode | Theme persists across page refreshes |
| Notifications | Receive friend notifications | Notifications appear and can be marked as read |

#### Automated Testing (Optional)
If applicable:
```bash
# Run unit tests
npm run test

# Run E2E tests with Playwright
npm run test:e2e
```

---

### 6) Common Issues & Fixes

| Issue | Cause | Fix |
|:--|:--|:--|
| `Module not found` | Missing dependencies | Run `npm install` again |
| `Failed to fetch` | Supabase connection issue | Check `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| `Cloudinary upload failed` | Invalid credentials | Verify Cloudinary credentials in `.env` file |
| `CORS policy error` | Supabase not allowing requests | Check Supabase project settings and RLS policies |
| `.env` variables undefined | Missing `VITE_` prefix | Rename variables to start with `VITE_` |
| `npm run dev` fails | Node version mismatch | Check Node version (`node -v` ≥ 18) and update if needed |
| `Database migration error` | Migrations not run in order | Run migrations sequentially from 001 onwards |
| `Authentication redirects to localhost` | Wrong OAuth redirect URL | Add `http://localhost:5173/auth/callback` to Supabase auth settings |
| `Images not loading` | Cloudinary not configured | Verify Cloudinary credentials and upload preset |

---

## Group Reflection

Each member should contribute 2–3 sentences on their learning and project experience.

> **Group Member Reflections:**  

- **Leon:** Learned to implement drag-and-drop functionality using native HTML5 API and Vue composition patterns. Gained experience in managing complex state for interactive canvas elements and creating smooth user interactions.

- **Kai Jie:** Developed expertise in database design with PostgreSQL and implementing Row-Level Security policies. Learned how to structure efficient database queries and manage migrations for production applications.

- **Bryan:** Built comprehensive authentication flows with Google OAuth and created a real-time notification system. Learned to implement database triggers for automatic notifications and manage complex state across multiple pages.

- **Wei Ting:** Designed the entire theme system with 6 color themes and 6 font options. Created responsive layouts that work seamlessly across all device sizes and learned to implement persistent user preferences.

- **Andrew:** Implemented advanced search and filtering systems across multiple pages. Gained experience in Vue computed properties, working with large datasets efficiently, and creating intuitive user interfaces for wardrobe management.

- **Alan:** Integrated Cloudinary for image optimization and worked on AI model integration. Learned about image compression, CDN optimization, and preparing the infrastructure for AI-powered features.

**As a team, we reflected on:**

- **Key Takeaways:** Working with Supabase taught us how to leverage Backend-as-a-Service platforms to accelerate development. We learned the importance of proper database design with RLS policies for security, and how Component-Based Architecture in Vue.js makes code more maintainable and scalable.

- **Challenges Faced:** Implementing the drag-and-drop canvas required significant research into native HTML5 APIs and coordinate management. Setting up proper OAuth redirects and database triggers also presented initial difficulties, but collaborative debugging sessions helped us overcome these issues.

- **Insights on Teamwork:** We found that clear role assignments based on each member's strengths led to efficient development. Regular standup meetings and using Git branches for feature development prevented merge conflicts. The combination of frontend specialists and backend developers allowed us to build a truly full-stack application.

