# Welcome Screen and Role Selection — Repository Documentation

## Overview

This repository implements a mobile-first food delivery workflow application with three main user roles:

- Buyer
- Kitchen (organization owner / branch manager)
- Rider

The application is built with React, TypeScript, Vite, Tailwind CSS, and a set of reusable UI primitives. The main architecture uses React Context for in-memory state with persistence to `localStorage`.

---

## Setup Instructions

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Build production bundle

```bash
npm run build
```

> The project uses Vite and is configured as an ES module package. React and React DOM are declared as peer dependencies.

---

## Dependencies

### Runtime

- `@emotion/react`, `@emotion/styled`
- `@mui/icons-material`, `@mui/material`
- `@radix-ui/react-*` packages for accessible UI primitives
- `apexcharts`, `react-apexcharts`
- `clsx`, `class-variance-authority`, `tailwind-merge`
- `cmdk`, `lucide-react`, `sonner`
- `react-router`, `react-hook-form`, `react-dnd`, `react-responsive-masonry`
- `react-slick`, `recharts`, `date-fns`
- `tailwindcss`, `@tailwindcss/vite`, `vite`

### Peer dependencies

- `react@18.3.1`
- `react-dom@18.3.1`

---

## Architecture

### Entry Points

- `src/app/App.tsx`
  - Wraps the application with `AppProvider`.
  - Mounts React Router using `RouterProvider` and the configured `router`.

- `src/app/Root.tsx`
  - Provides the React Router `<Outlet />` for nested routes.
  - Renders the `Toaster` from `sonner` for global toast notifications.

### Routing

- `src/app/routes.tsx`
  - Defines all application routes with `createBrowserRouter`.
  - Maps URL paths to screen components for buyer, kitchen, rider, authentication, and chat flows.
  - Includes fallback route with `NotFoundError`.

### State Management

- `src/app/context/AppContext.tsx`
  - Implements the primary app state container using React Context.
  - Exports `AppProvider` and `useApp()`.
  - Persists state to `localStorage` under key `quickbite_app_state`.
  - Defines the core domain models and actions.

---

## Core App Context: `src/app/context/AppContext.tsx`

### Data Models

- `UserRole`: `'buyer' | 'kitchen' | 'rider' | 'system'`
- `OrgType`: `'homemade' | 'restaurant'`
- `OrderStatus`: `'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered'`
- `Organization`
- `Branch`
- `Rider`
- `Dish`
- `CartItem`
- `OrderItem`
- `Order`
- `ChatMessage`
- `CurrentUser`

### App State

`AppContextType` includes:

- `organizations`, `branches`, `riders`, `dishes`, `orders`, `cart`, `chatMessages`
- `favoriteKitchens`, `favoriteDishes`
- `currentUser`
- action functions for CRUD operations and workflow state updates

### Key functions

- `registerOrganization(data: Omit<Organization, 'id'>): Organization`
- `updateOrganization(id: string, data: Partial<Organization>): void`
- `addBranch(data: Omit<Branch, 'id'>): Branch`
- `deleteBranch(branchId: string): void`
- `updateBranch(id: string, data: Partial<Branch>): void`
- `addRider(data: Omit<Rider, 'id'>): Rider`
- `deleteRider(riderId: string): void`
- `updateRider(id: string, data: Partial<Rider>): void`
- `addDish(data: Omit<Dish, 'id'>): Dish`
- `deleteDish(dishId: string): void`
- `updateDish(id: string, data: Partial<Dish>): void`
- `addToCart(dish: Dish, quantity: number): void`
- `updateCartItem(dishId: string, quantity: number): void`
- `removeFromCart(dishId: string): void`
- `clearCart(): void`
- `placeOrder(buyerInfo: { name: string; phone: string; address: string; orgId: string; paymentMethod?: string; specialInstructions?: string; }): Order`
- `createMockOrderForOrg(orgId: string, count?: number, deliveryType?: 'delivery' | 'pickup'): Order[] | null`
- `createMockOrdersForRider(riderId: string, countPerTab?: number): Order[] | null`
- `clearOrdersForOrg(orgId: string): void`
- `createApplicationMockData(): void`
- `resetApplicationData(): void`
- `updateOrderStatus(orderId: string, status: OrderStatus): void`
- `assignRiderToOrder(orderId: string, riderId: string, riderName: string, branchId: string): void`
- `unassignRiderFromOrder(orderId: string): void`
- `acceptAssignedOrder(orderId: string): void`
- `loginKitchenOwner(phone: string, password: string): Organization | null`
- `loginBranchManager(phone: string, password: string): Branch | null`
- `loginRider(phone: string, password: string): Rider | null`
- `sendChatMessage(orderId: string, message: string, senderName: string, senderRole: UserRole): void`
- `isChatOpen(order: Order): boolean`
- `toggleFavoriteKitchen(orgId: string): void`
- `toggleFavoriteDish(dishId: string): void`
- `isKitchenFavorite(orgId: string): boolean`
- `isDishFavorite(dishId: string): boolean`

### Comments on behavior

- Application state is loaded from `localStorage` and normalized for branch usernames and dish availability.
- Order placement attempts to auto-assign a currently available rider from the selected organization.
- Chat stays open for one hour after delivery by evaluating `deliveredAt` timestamp.
- Mock data generation supports kitchen/org-level and rider-level test scenarios.

---

## Module / File Index

### Top-level files

- `src/app/App.tsx`
  - Root application component.
  - Wraps `AppProvider` and renders the router.

- `src/app/Root.tsx`
  - Outlet wrapper component for nested routes.
  - Includes the global `Toaster` component.

- `src/app/routes.tsx`
  - Defines the browser router and all route-to-component mappings.
  - Includes buyer, kitchen, rider, auth, and chat route definitions.

- `src/app/NotFoundError.tsx`
  - 404 fallback UI.
  - Uses `MobileLayout` for consistent mobile styling.

### Context

- `src/app/context/AppContext.tsx`
  - Primary state container and business logic.
  - Holds both mock seed data and runtime state updates.

### Welcome

- `src/app/components/welcome/WelcomeScreen.tsx`
  - Role selection landing page.
  - Supports buyer guest flows, kitchen onboarding, rider login, mock data creation, and data reset.

### Authentication screens

- `src/app/components/auth/SignupScreen.tsx`
  - Kitchen registration entry point.
  - Allows quick demo login into existing kitchens.
  - Navigates to kitchen onboarding, owner login, manager login, and rider login.

- `src/app/components/auth/KitchenOnboardingScreen.tsx`
  - Kitchen registration form and onboarding steps.
  - Collects organization metadata, NTN/CNIC, and kitchen credentials.

- `src/app/components/auth/KitchenOwnerLoginScreen.tsx`
  - Kitchen owner sign-in screen.
  - Authenticates against stored organization owner credentials.

- `src/app/components/auth/RiderLoginScreen.tsx`
  - Rider login screen for credentials issued by kitchen/manager.

- `src/app/components/auth/BranchManagerLoginScreen.tsx`
  - Branch manager login flow.
  - Authenticates by branch phone and manager password.

### Buyer screens

- `src/app/components/buyer/BuyerHome.tsx`
  - Buyer dashboard with search, filter, and restaurant listing.
  - Displays active orders, favorites, and organization cards.

- `src/app/components/buyer/BuyerFavorites.tsx`
  - Buyer favorites page for saved kitchens and dishes.

- `src/app/components/buyer/BuyerSearch.tsx`
  - Search-focused UI for restaurants and dishes.

- `src/app/components/buyer/BuyerProfile.tsx`
  - Buyer profile and account summary screen.

- `src/app/components/buyer/RestaurantDetail.tsx`
  - Organization detail page with dish listing.
  - Shows restaurant info, ratings, and add-to-cart actions.

- `src/app/components/buyer/DishDetail.tsx`
  - Dish detail view with item information and add-to-cart controls.

- `src/app/components/buyer/CartScreen.tsx`
  - Cart management screen.
  - Controls item quantity, cart totals, and checkout navigation.

- `src/app/components/buyer/DeliveryScreen.tsx`
  - Delivery option selection.
  - Stores delivery method and fee preference.

- `src/app/components/buyer/AddressSelection.tsx`
  - Buyer address selection or entry.

- `src/app/components/buyer/PaymentConfirmation.tsx`
  - Order payment confirmation screen.
  - Displays payment summary before placement.

- `src/app/components/buyer/OrderTracker.tsx`
  - Order tracking view for buyer.
  - Shows order status updates and chat navigation.

- `src/app/components/buyer/PickupConfirmation.tsx`
  - Pickup confirmation screen for self-pickup orders.

### Kitchen screens

- `src/app/components/kitchen/KitchenHome.tsx`
  - Kitchen owner / manager dashboard home.
  - Provides quick access to branches, riders, orders, and menu.

- `src/app/components/kitchen/KitchenBranchesScreen.tsx`
  - Branch management listing.

- `src/app/components/kitchen/BranchManager.tsx`
  - Branch manager dashboard screen.

- `src/app/components/kitchen/KitchenManagerScreen.tsx`
  - Kitchen manager credentials and manager list.

- `src/app/components/kitchen/KitchenRiderScreen.tsx`
  - Rider management screen for kitchen organizations.

- `src/app/components/kitchen/DishesList.tsx`
  - Menu management screen.
  - Supports add, update, delete, and availability toggles.

- `src/app/components/kitchen/KitchenOrders.tsx`
  - Kitchen orders list.
  - Shows order status and assignment controls.

- `src/app/components/kitchen/KitchenOrderDashboard.tsx`
  - Order dashboard view for kitchen operations.

- `src/app/components/kitchen/KitchenChatListScreen.tsx`
  - Kitchen view of open chats and order messages.

- `src/app/components/kitchen/KitchenProfile.tsx`
  - Kitchen profile page.

- `src/app/components/kitchen/OrgProfile.tsx`
  - Organization profile, edit, and settings screens.
  - Exports `OrgProfile`, `OrgEdit`, and `AppSetting`.

- `src/app/components/kitchen/OrgInfo.tsx`
  - Organization information page.

- `src/app/components/kitchen/OrgOrgEdit.tsx`
  - Organization edit form.

- `src/app/components/kitchen/OrgDashboard.tsx`
  - Kitchen analytics dashboard.

- `src/app/components/kitchen/KitchenBranchEdit.tsx`
  - Branch edit screen.

- `src/app/components/kitchen/KitchenCoupons.tsx`
  - Coupon management page.

- `src/app/components/kitchen/KitchenDiscounts.tsx`
  - Discount management page.

- `src/app/components/kitchen/KitchenSettings.tsx`
  - Kitchen settings page.

- `src/app/components/kitchen/RiderIcon.tsx`
  - Rider icon UI component used in kitchen interfaces.

### Rider screens

- `src/app/components/rider/RiderDashboard.tsx`
  - Rider home screen with order summary and tabs.

- `src/app/components/rider/RiderOrders.tsx`
  - Rider order list and status overview.

- `src/app/components/rider/RiderOrderDetails.tsx`
  - Single rider order detail workflow.

- `src/app/components/rider/RiderProfile.tsx`
  - Rider profile and settings page.

- `src/app/components/rider/RiderBottomNav.tsx`
  - Rider bottom navigation component.

### Chat

- `src/app/components/chat/ChatScreen.tsx`
  - Order chat interface for buyer, kitchen, and rider participants.
  - Supports message entry, timestamp formatting, and chat closure after delivery.

### Shared components

- `src/app/components/shared/MobileLayout.tsx`
  - Mobile-first layout shell for all screens.
  - Centers the app in a responsive, card-style container.

- `src/app/components/shared/StatusBadge.tsx`
  - Visual badge component for status labels.

- `src/app/components/shared/TopBar.tsx`
  - Top navigation bar with optional back button and custom actions.

### UI primitives

The `src/app/components/ui/` directory contains a reusable component library built on Radix UI and Tailwind.
It includes wrappers and accessibility helpers for:

- `accordion.tsx`
- `alert-dialog.tsx`
- `alert.tsx`
- `aspect-ratio.tsx`
- `avatar.tsx`
- `badge.tsx`
- `breadcrumb.tsx`
- `button.tsx`
- `calendar.tsx`
- `card.tsx`
- `carousel.tsx`
- `chart.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `command.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `drawer.tsx`
- `dropdown-menu.tsx`
- `hover-card.tsx`
- `input-otp.tsx`
- `input.tsx`
- `label.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `pagination.tsx`
- `popover.tsx`
- `progress.tsx`
- `radio-group.tsx`
- `resizable.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `skeleton.tsx`
- `slider.tsx`
- `sonner.tsx`
- `switch.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toggle-group.tsx`
- `toggle.tsx`
- `tooltip.tsx`
- `use-mobile.ts`
- `utils.ts`

### Utility components

- `button.tsx`
  - Exported `Button` component.
  - Accepts standard HTML `button` props plus variant and size props via `class-variance-authority`.

- `input.tsx`
  - Exported `Input` component.
  - Styled `input` wrapper with focus and invalid styling.

- `form.tsx`
  - Reusable form field helpers built on `react-hook-form`.
  - Exports `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, and `FormField`.

- `utils.ts`
  - `cn(...inputs: ClassValue[])`: tailwind class name merge helper using `clsx` and `tailwind-merge`.

---

## Example usage

### Root application

```tsx
import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
```

### Using app context in a screen

```tsx
import { useApp } from '../../context/AppContext';

export function BuyerHome() {
  const { organizations, dishes, cart, addToCart, toggleFavoriteKitchen } = useApp();

  return (
    <div>
      {/* render UI */}
    </div>
  );
}
```

### Using a shared UI primitive

```tsx
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormItem, FormLabel, FormControl } from '../ui/form';
```

---

## Notes and best summary points

- The application is intentionally built as a demo workflow platform.
- `AppContext` contains the full domain model and is the single authority for state updates.
- Most screens are mobile-first and use `MobileLayout` for consistent outer styling.
- Routing is centralized in `src/app/routes.tsx`, making it easy to inspect and extend navigation.
- UI primitives in `src/app/components/ui` form a reusable design system around Tailwind and Radix.

---

## Recommended navigation for maintainers

1. Start with `src/app/context/AppContext.tsx` to understand state shape and actions.
2. Open `src/app/routes.tsx` to see screen-to-path mappings.
3. Review `src/app/components/welcome/WelcomeScreen.tsx` for entry flow logic.
4. Inspect buyer, kitchen, and rider folder screens to understand role-specific flows.
5. Use `src/app/components/ui` when adding new shared components.
