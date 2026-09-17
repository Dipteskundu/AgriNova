# AgriNova Frontend

Next.js frontend for the AgriNova Smart Agriculture & Farm-to-Market Platform.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context + Hooks
- **API Client:** Fetch API

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=AgriNova
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # Start development server on port 3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── app/                    # App Router Pages
│   ├── (public)/          # Public pages (home, about, contact)
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── dashboard/         # Dashboard pages
│   └── admin/             # Admin pages
│
├── components/            # Reusable Components
│   ├── ui/                # UI components (buttons, inputs, etc.)
│   ├── layout/            # Layout components (header, sidebar)
│   ├── forms/             # Form components
│   ├── cards/             # Card components
│   ├── charts/            # Chart components
│   ├── marketplace/       # Marketplace components
│   └── common/            # Common components
│
├── features/              # Feature Modules
│   ├── auth/              # Authentication
│   ├── farms/             # Farm management
│   ├── fields/            # Field management
│   ├── crops/             # Crop management
│   ├── harvest/           # Harvest management
│   ├── quality/           # Quality verification
│   ├── marketplace/       # Marketplace
│   ├── demands/           # Demand board
│   ├── orders/            # Orders
│   ├── payments/          # Payments
│   ├── weather/           # Weather
│   └── assistant/         # AI Assistant
│
├── hooks/                 # Custom React Hooks
├── lib/                   # Utilities & Configuration
│   ├── api.ts            # API client
│   ├── auth.ts           # Authentication utilities
│   ├── utils.ts          # Helper functions
│   └── constants.ts      # Constants
│
├── services/              # API Services
├── types/                 # TypeScript Types
└── providers/             # Context Providers
```

## Features

### Public Pages
- Home page with overview
- About page
- Contact page

### Authentication
- Login
- Registration (Farmer, Buyer, Supplier)
- Forgot Password

### Dashboard (Farmer)
- Overview with stats
- Farm management
- Field management
- Crop recommendations
- Crop cycle tracking
- Harvest management
- Quality verification requests
- Marketplace (Input & Produce)
- Demand board
- Orders
- Deliveries
- Payments
- Expenses
- Analytics
- Weather
- AI Assistant

### Dashboard (Buyer)
- Browse marketplace
- Post demands
- Orders
- Deliveries
- Payments

### Admin
- User management
- Dataset management
- Product management
- Order management
- Quality verification
- Reports
- Settings

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`.

Example usage:

```typescript
import { apiClient } from "@/lib/api";

// GET request
const farms = await apiClient.get("/farms");

// POST request
const newFarm = await apiClient.post("/farms", {
  name: "My Farm",
  area: 50,
});
```

## Components

### UI Components
- Button
- Input
- Select
- Card
- Modal
- Table
- Badge
- Alert

### Layout Components
- Header
- Sidebar
- Footer
- DashboardLayout

## Styling

This project uses Tailwind CSS for styling. All styles are defined in:
- `src/app/globals.css` - Global styles
- Component-level styles using Tailwind classes

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
