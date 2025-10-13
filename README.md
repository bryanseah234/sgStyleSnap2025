# StyleSnap - Digital Closet App

A modern Vue.js application for managing your digital closet with AI-powered outfit suggestions and social features.

## 🏗️ Project Structure

```
├── src/                          # Source code
│   ├── components/               # Vue components
│   │   ├── analytics/           # Analytics components
│   │   ├── catalog/             # Catalog browsing components
│   │   ├── closet/              # Closet management components
│   │   ├── collections/         # Outfit collections components
│   │   ├── layouts/             # Layout components
│   │   ├── notifications/       # Notification components
│   │   ├── outfits/             # Outfit creation components
│   │   ├── preferences/         # User preferences components
│   │   ├── social/              # Social features components
│   │   └── ui/                  # Reusable UI components
│   ├── pages/                   # Page components
│   ├── stores/                  # Pinia stores
│   ├── services/                # API services
│   ├── utils/                   # Utility functions
│   ├── config/                  # Configuration files
│   └── assets/                  # Static assets
├── tests/                       # Test files
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   ├── e2e/                     # End-to-end tests
│   ├── fixtures/                # Test fixtures
│   └── helpers/                 # Test helpers
├── docs/                        # Documentation
│   ├── api/                     # API documentation
│   ├── guides/                  # User and developer guides
│   ├── design/                  # Design assets and mockups
│   └── deployment/              # Deployment guides
├── database/                    # Database files
│   ├── migrations/              # SQL migration files
│   ├── seeds/                   # Database seed files
│   └── functions/               # Database functions
├── ai-models/                   # AI/ML models and related files
├── deployment/                  # Deployment configurations
├── scripts/                     # Build and utility scripts
└── config/                      # Build configuration files
```

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📚 Documentation

- [API Documentation](docs/api/)
- [User Guides](docs/guides/)
- [Deployment Guide](docs/deployment/)
- [Design Reference](docs/design/)

## 🛠️ Development

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Build**: `npm run build`
- **E2E Tests**: `npm run test:e2e`

## 🏷️ Features

- **Digital Closet**: Upload and organize clothing items
- **AI Outfit Generation**: Smart outfit suggestions
- **Social Features**: Friends, sharing, and suggestions
- **Analytics**: Wardrobe insights and usage tracking
- **Mobile-First**: Responsive design with PWA support

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.