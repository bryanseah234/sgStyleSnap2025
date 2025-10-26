# Project Structure Guide

This document explains the organization and structure of the StyleSnap codebase.

## 📁 Root Directory Structure

```
├── src/                          # Source code
├── tests/                        # All test files
├── docs/                         # Documentation
├── database/                     # Database files
├── ai-models/                    # AI/ML models and related files
├── deployment/                   # Deployment configurations
├── scripts/                      # Build and utility scripts
├── config/                       # Build configuration files
├── public/                       # Static public assets
├── node_modules/                 # Dependencies
├── package.json                  # Project configuration
├── package-lock.json            # Dependency lock file
├── index.html                   # Main HTML entry point
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
└── README.md                    # Project overview
```

## 🎯 Source Code (`src/`)

### Components (`src/components/`)
Organized by feature domain:

- **`analytics/`** - Analytics and reporting components
- **`catalog/`** - Catalog browsing and search components
- **`closet/`** - Closet management components
- **`collections/`** - Outfit collections components
- **`layouts/`** - Layout and wrapper components
- **`notifications/`** - Notification system components
- **`outfits/`** - Outfit creation and management components
- **`preferences/`** - User preferences components
- **`social/`** - Social features components
- **`ui/`** - Reusable UI components

### Pages (`src/pages/`)
Main application pages and routes.

### Stores (`src/stores/`)
Pinia state management stores.

### Services (`src/services/`)
API services and external integrations.

### Utils (`src/utils/`)
Utility functions and helpers.

### Config (`src/config/`)
Application configuration files.

### Assets (`src/assets/`)
Static assets like images, styles, and fonts.

## 🧪 Testing (`tests/`)

### Unit Tests (`tests/unit/`)
- Individual component and function tests
- Store tests
- Service tests
- Utility function tests

### Integration Tests (`tests/integration/`)
- API endpoint tests
- Component integration tests
- Service integration tests

### End-to-End Tests (`tests/e2e/`)
- Full user journey tests
- Cross-browser tests

### Test Helpers (`tests/helpers/`)
- Test utilities and fixtures
- Mock data and functions
- Test setup files

## 📚 Documentation (`docs/`)

### API Documentation (`docs/api/`)
- API reference
- Architecture documentation

### User Guides (`docs/guides/`)
- User guides and tutorials
- Developer guides
- Setup instructions

### Design (`docs/design/`)
- Design mockups and assets
- UI/UX guidelines

### Deployment (`docs/deployment/`)
- Deployment guides
- Production setup

## 🗄️ Database (`database/`)

### Migrations (`database/migrations/`)
- SQL migration files
- Schema changes
- Data transformations

### Seeds (`database/seeds/`)
- Initial data seeding
- Test data generation

### Functions (`database/functions/`)
- Database functions and procedures
- Triggers and stored procedures

## 🤖 AI Models (`ai-models/`)

- Machine learning models
- Training data
- Model deployment files

## 🚀 Deployment (`deployment/`)

- Deployment configurations
- CI/CD pipeline files
- Production environment settings

## ⚙️ Configuration (`config/`)

- Build configuration files
- Vite configuration
- Tailwind CSS configuration
- PostCSS configuration

## 📜 Scripts (`scripts/`)

- Build and development scripts
- Database management scripts
- Utility scripts
- Maintenance scripts

## 🎨 Public Assets (`public/`)

- Static files served directly
- Favicon and app icons
- Service worker files
- PWA manifest

## 📋 Naming Conventions

### Files
- **Components**: PascalCase (e.g., `UserProfile.vue`)
- **Pages**: PascalCase (e.g., `LoginPage.vue`)
- **Stores**: kebab-case with `-store` suffix (e.g., `user-store.js`)
- **Services**: kebab-case with `-service` suffix (e.g., `auth-service.js`)
- **Utils**: kebab-case (e.g., `date-helpers.js`)
- **Tests**: kebab-case with `.test.js` suffix (e.g., `user-service.test.js`)

### Directories
- **kebab-case** for all directories
- **Descriptive names** that clearly indicate purpose
- **Grouped by feature** or functionality

## 🔄 Import Paths

Use the `@` alias for clean imports:

```javascript
// Instead of relative paths
import UserService from '../../../services/user-service.js'

// Use the alias
import UserService from '@/services/user-service.js'
```

## 📝 Best Practices

1. **Keep related files together** in feature-based directories
2. **Use descriptive names** that clearly indicate purpose
3. **Follow consistent naming conventions** across the project
4. **Group by functionality** rather than file type
5. **Keep the root directory clean** with only essential files
6. **Document complex structures** in this guide
7. **Use TypeScript-style imports** even in JavaScript files
8. **Maintain clear separation** between different concerns