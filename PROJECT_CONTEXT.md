# StyleSnap - Project Context

## Project Overview
Digital closet app for outfit suggestions from friends.

## Technology Stack
Frontend: Vue.js 3 + Vite + Tailwind CSS
Backend: Supabase (PostgreSQL) + Cloudinary
Authentication: Google OAuth

## File Structure
src/
├── components/
│ ├── ui/ # Base components (Button, Modal, Input)
│ ├── closet/ # Closet-specific components
│ └── social/ # Social features components
├── pages/ # Route components
├── stores/ # Pinia stores
├── services/ # API services
├── utils/ # Helper functions
├── assets/
│ ├── styles/
│ │ ├── base.css # CSS variables and base styles
│ │ └── components.css # Component-specific styles
│ └── images/
└── config/ # Configuration files

## Code Conventions
- **SQL**: snake_case for tables and columns
- **JavaScript**: camelCase for variables/functions, PascalCase for components
- **CSS**: kebab-case for class names
- **Files**: kebab-case for file names

## Documentation Structure
- `REQUIREMENTS.md` - Main requirements index
- `TASKS.md` - Main tasks index
- `requirements/` - Detailed requirement files
- `tasks/` - Detailed task files
- `sql/` - SQL migration files

## Cross-Reference Notation
When tasks reference requirements: `[REQ: database-schema#2.1]`
When requirements reference tasks: `[TASK: 01-infrastructure-setup#1.1]`