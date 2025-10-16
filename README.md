# StyleSnap

A modern React application for managing your digital wardrobe and creating outfits.

## Features

- 🏠 **Dashboard**: Overview of your wardrobe with quick stats
- 👕 **Cabinet**: Manage your clothing items and saved outfits
- 🎨 **Outfit Studio**: Create and save outfit combinations
- 👥 **Friends**: Connect with friends and share wardrobes
- 👤 **Profile**: Manage your account settings
- 🌙 **Dark/Light Mode**: Toggle between themes

## Tech Stack

- **React 18** with functional components and hooks
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling
- **Vitest** for testing

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd stylesnap
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues



## Testing

The project uses Vitest for testing with React Testing Library:

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

## Development

### Adding New Components

1. Create component files in the appropriate directory
2. Use the established naming conventions (PascalCase for components)
3. Include proper TypeScript types if using TypeScript
4. Add tests for new components

### Styling

- Use Tailwind CSS classes for styling
- Follow the established design system
- Use the theme context for dark/light mode support
- Maintain consistent spacing and typography

### State Management

- Use React Query for server state
- Use React hooks for local state
- Follow the established patterns for data fetching

## Deployment

The application is configured for deployment on Base44:

1. Build the application:

```bash
npm run build
```

2. Deploy to your Base44 instance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.
