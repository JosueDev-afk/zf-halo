# ZF-HALO Client

A futuristic, minimalist, mobile-first React PWA for Asset Management.

## Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn UI + Framer Motion
- **State Management:** Zustand
- **Routing:** TanStack Router
- **Form Handling:** React Hook Form + Zod
- **PWA:** Vite PWA Plugin
- **Architecture:** Clean Architecture (Domain, Infrastructure, Application, Presentation)

## Project Structure

```
src/
├── application/       # State management (Zustand stores), use cases
├── domain/           # Core entities, repository interfaces, value objects
├── infrastructure/   # API clients, repository implementations
├── presentation/     # UI components, pages, routes, layouts
│   ├── components/   # Shared UI components (Shadcn)
│   ├── layouts/      # Layout wrappers
│   ├── modules/      # Feature-specific pages (Auth, etc.)
│   └── routes/       # Router configuration
└── lib/              # Utilities
```

## Getting Started

### Prerequisites

- Node.js (Latest LTS)
- pnpm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

## Features

- **Authentication:** Login/Register with JWT, RBAC (Role-Based Access Control).
- **Mobile First:** Bottom navigation, touch-friendly UI.
- **PWA:** Installable on mobile devices.
- **Visuals:** Futuristic "ZF Engineering" aesthetic with dark mode and glassmorphism.

## Architecture Highlights

- **Repository Pattern:** Logic is decoupled from the UI. `AuthRepository` handles API calls, ensuring easy testing and swapping of data sources.
- **Strict Typing:** Full TypeScript coverage with strict mode.
- **Modern Routing:** Type-safe routing with TanStack Router.
