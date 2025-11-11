# RM-ROX Frontend

A React web application for RM-ROX project with Vite and Tailwind CSS.

## Features
- React 18 with functional components
- Routing with react-router-dom
- Global dark mode with context
- Error boundary and loading spinner
- API integration with separate backend service
- Modular folder structure

## Getting Started

### Prerequisites
- Node.js 18+
- The RM-ROX Backend API running (see separate backend project)

### Install dependencies
```bash
npm install
```

### Run the app
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

## Project Structure
```
src/
  components/      # Reusable UI components
  hooks/           # Custom hooks and context
  pages/           # Route-based pages
  services/        # API and data services
  utils/           # Utility functions
  App.jsx          # Main app component
  main.jsx         # Entry point
  index.css        # Tailwind CSS imports
```

## API Configuration

The frontend is configured to communicate with a separate backend API service using direct HTTP calls:

- **Default Backend URL:** `http://localhost:4000`
- **Environment Variable:** Set `VITE_BACKEND_URL` to override the default
- **API Endpoints:** All API calls go to `${BACKEND_URL}/api/*`

### Environment Setup

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Update `.env` with your backend URL:
   ```env
   VITE_BACKEND_URL=http://localhost:4000
   ```

## Running the Application

### Prerequisites
- Node.js 18+
- RM-ROX Backend API running (see separate backend project)

### Start the Frontend
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at http://localhost:5173

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Backend Integration

This frontend requires the RM-ROX Backend API to be running separately. The backend should be available at:
- **Development:** http://localhost:4000
- **Production:** Update `VITE_BACKEND_URL` environment variable

## Customization
- Add more pages to `src/pages/` and routes in `App.jsx`
- Add more services to `src/services/`
- Add more components to `src/components/`
- Update API configuration in `src/services/api.js` for different environments 