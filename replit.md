# RideCompare - Full-Stack Ride Comparison App

## Overview

RideCompare is a full-stack web application designed to compare ride options between Uber and Lyft services. The app helps users find the best ride choice based on their preferences for price, speed (ETA), or luxury level. Built with a modern React frontend and Express.js backend, it provides a mobile-first experience for comparing ride sharing options.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Data Storage**: In-memory storage with planned PostgreSQL migration
- **ORM**: Drizzle ORM configured for PostgreSQL
- **API Design**: RESTful API with JSON responses
- **Validation**: Zod for runtime type validation

### Mobile-First Design
- Responsive design optimized for mobile devices
- Touch-friendly interface components
- Location services integration (GPS access)
- Deep linking support for opening native ride apps

## Key Components

### Frontend Components
1. **LocationInput**: Handles origin/destination input with GPS integration
2. **PreferenceSelector**: Allows users to choose between price, speed, or luxury priorities
3. **RideComparison**: Displays side-by-side comparison of available rides
4. **RideCard**: Individual ride option display with pricing and ETA
5. **RideModal**: Confirmation dialog for ride selection with deep linking

### Backend Services
1. **Storage Layer**: Abstracted storage interface with in-memory implementation
2. **Ride Management**: CRUD operations for ride data and user requests
3. **Comparison Engine**: Algorithm to rank rides based on user preferences
4. **API Routes**: RESTful endpoints for ride comparison and data retrieval

### Shared Schema
- **Database Models**: Rides and ride requests with proper typing
- **Validation Schemas**: Zod schemas for API request/response validation
- **Type Safety**: Shared TypeScript types between frontend and backend

## Data Flow

1. **User Input**: User enters origin, destination, and preference
2. **Location Processing**: GPS coordinates or address geocoding
3. **API Request**: Frontend sends comparison request to backend
4. **Ride Retrieval**: Backend fetches available rides from storage
5. **Price/ETA Simulation**: Dynamic pricing and timing variations applied
6. **Preference Ranking**: Rides sorted based on user's priority
7. **Response**: Formatted ride comparison data returned to frontend
8. **Display**: Rides shown with recommendation highlighting
9. **Selection**: User selects ride and gets directed to appropriate app

## External Dependencies

### Database & ORM
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Production database (via Neon serverless)
- **Drizzle Kit**: Database migrations and schema management

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Static type checking
- **ESLint**: Code linting (implied)
- **PostCSS**: CSS processing with Tailwind

### Planned Integrations
- **Uber API**: Real-time ride data and deep linking
- **Lyft API**: Real-time ride data and deep linking
- **Google Maps/Mapbox**: Geocoding and mapping services
- **OAuth2**: User authentication for ride services

## Deployment Strategy

### Development Environment
- **Replit Integration**: Optimized for Replit development environment
- **Hot Module Replacement**: Fast development with Vite HMR
- **Development Server**: Express server with Vite middleware integration
- **Error Handling**: Runtime error overlay for debugging

### Production Build
- **Static Assets**: Frontend built to `dist/public`
- **Server Bundle**: Backend bundled with esbuild for Node.js
- **Environment Variables**: Database URL and API keys via environment
- **Process Management**: Single Node.js process serving both frontend and API

### Database Setup
- **Local Development**: In-memory storage for rapid prototyping
- **Production**: PostgreSQL database with Drizzle migrations
- **Schema Evolution**: Version-controlled database migrations
- **Connection Management**: Serverless-optimized database connections

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```