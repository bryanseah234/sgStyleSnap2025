# StyleSnap Documentation

Welcome to the StyleSnap documentation! This directory contains comprehensive documentation for the StyleSnap fashion application.

## 📁 Documentation Structure

### 🚀 [Setup & Installation](./setup/)
- [Cloudinary Setup](./setup/CLOUDINARY_SETUP.md) - Image upload service configuration
- [Environment Variables](./setup/env.example) - Required environment configuration
- [Project Setup](./guides/PROJECT_STRUCTURE.md) - Getting started with the project

### 🗄️ [Database](./database/)
- [Database Schema](./database/DATABASE.md) - Complete database documentation
- [Migrations](./database/migrations/) - Database migration files
- [Setup Guide](./database/SETUP.md) - Database setup instructions
- [Features](./database/FEATURES.md) - Database feature overview

### 🔌 [API Documentation](./api/)
- [API Reference](./api/API.md) - Complete API documentation
- [Architecture](./api/ARCHITECTURE.md) - System architecture overview
- [Components](./api/COMPONENTS.md) - Vue.js components documentation
- [Routes](./api/ROUTES.md) - Application routing structure

### ✨ [Features](./features/)
- [Feature Overview](./features/FEATURE_OVERVIEW.md) - Complete feature list
- [AI Outfit Suggestions](./features/AI_OUTFIT_SUGGESTIONS.md) - AI-powered outfit generation
- [Friend Notifications](./features/FRIEND_NOTIFICATIONS.md) - Social notification system
- [Friend Outfit Creation](./features/FRIEND_OUTFIT_CREATION.md) - Collaborative outfit creation
- [Google Profile Sync](./features/GOOGLE_PROFILE_SYNC.md) - OAuth integration
- [Edit Outfit](./features/EDIT_OUTFIT.md) - Outfit editing capabilities

### 📖 [Guides](./guides/)
- [Quick Reference](./guides/QUICK_REFERENCE.md) - Quick start guide
- [Authentication Guide](./guides/AUTHENTICATION_GUIDE.md) - User authentication
- [Database Guide](./guides/DATABASE_GUIDE.md) - Database operations
- [Closet Guide](./guides/CLOSET_GUIDE.md) - Wardrobe management
- [Catalog Guide](./guides/CATALOG_GUIDE.md) - Item catalog system
- [Notifications Guide](./guides/NOTIFICATIONS_GUIDE.md) - Notification system
- [Social Guide](./guides/SOCIAL_GUIDE.md) - Friend system and social features
- [OAuth Complete Guide](./guides/OAUTH_COMPLETE_GUIDE.md) - OAuth integration
- [Code Standards](./guides/CODE_STANDARDS.md) - Development standards
- [Project Structure](./guides/PROJECT_STRUCTURE.md) - Codebase organization
- [User Flows](./guides/USER_FLOWS.md) - Application user journeys
- [Tests Guide](./guides/TESTS_GUIDE.md) - Testing procedures

### 🚀 [Deployment](./deployment/)
- [Deployment Guide](./deployment/DEPLOYMENT.md) - Production deployment
- [Deployment Guide (Detailed)](./deployment/DEPLOYMENT_GUIDE.md) - Comprehensive deployment
- [Contributing](./deployment/CONTRIBUTING.md) - Contribution guidelines
- [Requirements](./deployment/REQUIREMENTS.md) - System requirements
- [Hugging Face Integration](./deployment/HUGGINGFACE_INTEGRATION.md) - AI model deployment
- [Model Deployment](./deployment/MODEL_DEPLOYMENT_GUIDE.md) - AI model setup

### 🆘 [Emergency Fixes](./emergency-fixes/)
- [OAuth Emergency Fix](./emergency-fixes/OAUTH_EMERGENCY_FIX.md) - OAuth troubleshooting
- [Routing Fix](./emergency-fixes/ROUTING_FIX.md) - Routing issues resolution

### 🎨 [Design](./design/)
- [Design Reference](./design/DESIGN_REFERENCE.md) - UI/UX design guidelines
- [Mobile Mockups](./design/mobile-mockups/) - Mobile design mockups

### 🔧 [Scripts](./scripts/)
- [Scripts README](./scripts/README.md) - Utility scripts documentation
- [Catalog Seeding Quickstart](./scripts/CATALOG_SEEDING_QUICKSTART.md) - Data seeding guide

## 🚀 Quick Start

1. **Setup Environment**: Follow [Environment Setup](./setup/env.example)
2. **Database Setup**: Run [Database Migrations](./database/migrations/)
3. **Cloudinary Setup**: Configure [Image Upload Service](./setup/CLOUDINARY_SETUP.md)
4. **Development**: Start with [Project Structure](./guides/PROJECT_STRUCTURE.md)

## 📋 Project Overview

StyleSnap is a modern fashion application that helps users:
- 📱 Manage their digital wardrobe
- 👥 Connect with friends
- 🤖 Get AI-powered outfit suggestions
- 🛍️ Browse curated fashion catalog
- 📸 Upload and organize clothing items

## 🏗️ Architecture

- **Frontend**: Vue.js 3 with Composition API
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS with custom theme system
- **AI**: Hugging Face FashionRNN model
- **Images**: Cloudinary for image management
- **Deployment**: Vercel (Frontend) + Supabase (Backend)

## 📞 Support

For questions or issues:
1. Check the relevant documentation section
2. Review [Emergency Fixes](./emergency-fixes/) for common issues
3. Consult [Code Standards](./guides/CODE_STANDARDS.md) for development guidelines

---

**Last Updated**: January 2025  
**Version**: 1.0.0