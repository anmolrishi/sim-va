# EverAI Simulator

A comprehensive simulation tool for training and assessment, featuring role-based access control, interactive training modules, and real-time performance tracking.

## Features

- 🔐 Role-based access control with JWT authentication
- 📊 Interactive dashboards for trainees, trainers, and administrators
- 🎯 Training plan management and progress tracking
- 🎮 Interactive simulation modules with audio/visual components
- 📝 Real-time performance assessment and scoring
- 📊 Detailed playback and analysis features
- 🔄 Comprehensive simulation management system

## Tech Stack

- React 18 with TypeScript
- Material-UI (MUI) for UI components
- React Router for navigation
- JWT for authentication
- Vite for build tooling
- WaveSurfer.js for audio visualization
- Retell SDK for voice interactions

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following content:
   ```env
   VITE_API_URL=https://everise-backend.replit.app
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── api/            # API integration files
├── assets/         # Static assets (images, fonts)
├── components/     # React components
│   ├── common/     # Shared components
│   ├── dashboard/  # Dashboard-specific components
│   └── layout/     # Layout components
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── services/       # API services
├── theme/          # Theme configuration
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run generate-api` - Generate API types from OpenAPI spec

## Authentication

The application uses JWT tokens for authentication. Tokens are stored in localStorage and include role-based permissions. The permission structure is as follows:

```json
{
  "WS-2025-1001": {
    "permissions": {
      "simulator": {
        "training": ["read", "write"],
        "playback": ["read"],
        "dashboard_admin": ["read", "write"]
      }
    }
  }
}
```

## Development Guidelines

1. **Component Structure**
   - Use functional components with TypeScript
   - Implement proper type definitions
   - Use React hooks for state management

2. **Styling**
   - Use MUI components as base
   - Follow theme configuration in `src/theme`

3. **State Management**
   - Use React Context for global state
   - Implement proper error boundaries
   - Handle loading states appropriately

4. **Code Quality**
   - Follow ESLint configuration
   - Write meaningful component and function names
   - Add proper documentation for complex logic

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the production build:
   ```bash
   npm run preview
   ```

3. Deploy the `dist` directory to your hosting service