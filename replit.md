# Overview

INFRA_V1 is a blockchain infrastructure platform built with a brutalist design aesthetic. The application provides a web interface for managing blockchain node connections and infrastructure, offering both free and premium tiers for accessing various blockchain networks. The platform features a dashboard for monitoring connections, API key management, and a node marketplace for deploying blockchain infrastructure.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and Vite as the build tool. The application follows a single-page application (SPA) pattern using `wouter` for client-side routing.

**Key Design Decisions:**

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for accessible, customizable UI components
- **Styling**: Tailwind CSS with a custom brutalist theme featuring high contrast colors (acid green, black, white) and zero border radius
- **State Management**: TanStack Query (React Query) for server state management with custom query client configuration
- **Routing**: wouter library for lightweight client-side routing
- **Animation**: Framer Motion for declarative animations and transitions
- **Typography**: Custom font stack using Space Grotesk for display text and JetBrains Mono for code/UI elements

**Pages:**
- Home: Landing page with hero section and feature showcase
- Dashboard: Connection management and monitoring
- Connect: Interactive connection creation wizard
- Nodes: Node marketplace/explorer
- Pricing: Tiered pricing plans
- Docs: Technical documentation

## Backend Architecture

The backend is built with Express.js and TypeScript, following a modular structure with clear separation of concerns.

**Key Design Decisions:**

- **Server Framework**: Express.js for HTTP server
- **Type Safety**: TypeScript throughout with strict compiler options
- **Build Process**: esbuild for fast server compilation, bundling selected dependencies to reduce syscalls and improve cold start times
- **Development**: Custom Vite integration for HMR and development middleware
- **Static Serving**: SPA fallback routing for client-side navigation
- **Logging**: Custom logging middleware with timestamp formatting and request/response tracking

**API Structure:**
- RESTful endpoints under `/api` prefix
- CRUD operations for connection management
- JSON request/response format

## Data Storage

**Database**: PostgreSQL via Neon serverless PostgreSQL with WebSocket support

**Key Design Decisions:**

- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Schema Location**: Shared schema definitions in `/shared/schema.ts` for type sharing between client and server
- **Connection Pooling**: Neon serverless connection pool with WebSocket constructor for edge compatibility
- **Validation**: Zod schemas derived from Drizzle schemas using `drizzle-zod` for runtime validation

**Database Tables:**
- `users`: User authentication with username/password
- `connections`: Blockchain node connections with API keys, network information, request tracking, and IP restrictions

**Data Models:**
- Auto-generated UUID for user IDs
- API keys prefixed with `infra_` and 24-byte random hex
- Timestamps for connection creation tracking
- Boolean flags for active/inactive states
- Integer counters for request tracking

## Authentication and Authorization

**Current State**: Basic user schema exists but authentication is not actively implemented in the routes. The storage layer includes methods for user management (getUser, getUserByUsername, createUser).

**Schema Support:**
- User table with username and password fields
- Insert schema validation via Zod

**Future Considerations**: The infrastructure is in place for implementing session-based or token-based authentication.

## External Dependencies

**Core Framework Dependencies:**
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon database
- **drizzle-orm**: TypeScript ORM for database operations
- **drizzle-zod**: Schema validation integration
- **express**: Web server framework

**Frontend Libraries:**
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **framer-motion**: Animation library
- **@radix-ui/***: Component primitives (dialogs, dropdowns, forms, etc.)
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation

**UI and Styling:**
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx/tailwind-merge**: Conditional class name utilities

**Development Tools:**
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development plugins (error modal, cartographer, dev banner)

**Session Management (Available but Unused):**
- **express-session**: Session middleware
- **connect-pg-simple**: PostgreSQL session store

**API Key Generation:**
- Node.js `crypto` module for secure random byte generation

**Meta Image Handling:**
- Custom Vite plugin for updating OpenGraph and Twitter meta tags with deployment-specific URLs