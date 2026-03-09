# Full Application Documentation

This document describes the current implemented behavior of the application based on code in `src/`.

## 1. Overview

The application is a mobile-first food delivery workflow with 3 user roles:

1. Buyer
2. Kitchen (Organization Owner and Branch Manager paths)
3. Rider

Core capabilities:

1. Kitchen registration and branch setup
2. Manager/rider credential-based login
3. Buyer order placement
4. Auto/manual rider assignment
5. Rider acceptance, pickup, delivery lifecycle
6. Order chat between Buyer, Kitchen, and Rider
7. Mock data generation and full reset for testing

State is managed in-memory through React Context and persisted to `localStorage`.

## 2. Tech Stack

1. React + TypeScript
2. React Router
3. Tailwind CSS
4. Lucide icons
5. Sonner toast notifications
6. Vite build/dev tooling

## 3. Application Architecture

## 3.1 Central State

File: [AppContext.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/context/AppContext.tsx)

`AppProvider` holds all business state and actions:

1. Organizations
2. Branches
3. Riders
4. Dishes
5. Orders
6. Cart
7. Chat messages
8. Current user session

Persistence:

1. Storage key: `quickbite_app_state`
2. State loads from storage at boot
3. State auto-saves on every change

## 3.2 Routing

File: [routes.ts](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/routes.ts)

Main routes:

1. `/` Welcome
2. `/signup` Role-based signup/login entry
3. `/buyer` Buyer home
4. `/buyer/restaurant/:orgId` Restaurant details
5. `/buyer/cart` Cart
6. `/buyer/order/:orderId` Order tracker
7. `/kitchen/register` Organization registration
8. `/kitchen` Kitchen home
9. `/kitchen/manager` Manager credentials management
10. `/kitchen/manager/login` Branch manager login
11. `/kitchen/rider` Rider management
12. `/kitchen/dishes` Menu management
13. `/kitchen/branch/:branchId` Branch manager/details page
14. `/kitchen/orders` Kitchen orders
15. `/kitchen/profile` Kitchen profile
16. `/rider/login` Rider login
17. `/rider/orders` Rider orders
18. `/rider/order/:orderId` Rider order details
19. `/rider/profile` Rider profile
20. `/chat/:orderId` Shared order chat

## 4. User Roles and Access

## 4.1 Buyer

Access:

1. Browse organizations and dishes
2. Add to cart and place orders
3. Track order timeline
4. Use chat while chat window is open

Notes:

1. Buyer can enter flow without signup.
2. Buyer only sees dishes where `isAvailable === true`.

## 4.2 Organization Owner (Kitchen)

Access:

1. Register organization
2. Create/delete branches
3. Manage manager credentials
4. Manage riders across organization
5. Manage dishes
6. View/update organization orders
7. Assign/change/de-assign riders

## 4.3 Branch Manager

Auth path:

1. `/kitchen/manager/login`
2. Auth checks **phone number** + `managerPassword` against branch records

Session model:

1. Logged in with role `kitchen`
2. Branch scope enforced using `currentUser.branchId`

Access:

1. Branch-scoped orders only
2. Branch-scoped riders only
3. Branch-scoped menu management path
4. Cannot manage organization-wide manager list

## 4.4 Rider

Access:

1. Login with phone number/password provided by kitchen
2. View assigned orders
3. Accept assigned order
4. Mark pickup and delivery
5. Use chat while open

## 5. Core Workflows

## 5.1 Welcome and Role Selection

File: [WelcomeScreen.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/welcome/WelcomeScreen.tsx)

Behavior:

1. Buyer -> `/buyer`
2. Kitchen -> `/signup`
3. Rider -> `/rider/login`

Welcome also includes:

1. `Load Full Mock Data`
2. `Clear All Data`

## 5.2 Signup and Registration

Files:

1. [SignupScreen.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/auth/SignupScreen.tsx)
2. [OrgRegistration.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/kitchen/OrgRegistration.tsx)

Organization registration:

1. Collect owner/org/address/phone
2. Restaurant requires NTN
3. Home-made requires CNIC (+ CNIC photos)
4. On success:
   1. Organization is created
   2. Default branch is auto-created
   3. Manager credentials are auto-generated
   4. User lands in kitchen dashboard

## 5.3 Kitchen and Branch Management

Files:

1. [KitchenHome.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/kitchen/KitchenHome.tsx)
2. [KitchenManagerScreen.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/kitchen/KitchenManagerScreen.tsx)
3. [BranchManager.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/kitchen/BranchManager.tsx)

Capabilities:

1. Create branches
2. Add/edit manager credentials
3. View/copy manager credentials
4. Add/edit riders at org or branch scope

## 5.4 Menu and Availability

File: [DishesList.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/kitchen/DishesList.tsx)

Capabilities:

1. Add/edit/delete dishes
2. Toggle availability (`isAvailable`)

Buyer visibility:

1. Buyer list/detail screens filter out unavailable dishes

## 5.5 Order and Rider Assignment

Files:

1. [CartScreen.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/buyer/CartScreen.tsx)
2. [KitchenOrders.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/kitchen/KitchenOrders.tsx)
3. [RiderOrders.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/rider/RiderOrders.tsx)
4. [RiderOrderDetails.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/rider/RiderOrderDetails.tsx)

Flow:

1. Buyer places order
2. Order auto-assigns first available rider in org (if available)
3. Kitchen sees order and can:
   1. assign rider
   2. change rider
   3. de-assign rider
4. Rider receives assignment and sees it in `Assigned`
5. Rider accepts order
6. Rider moves order to pickup/delivery
7. Rider marks delivered

Status model (`OrderStatus`):

1. `pending`
2. `accepted`
3. `preparing`
4. `ready`
5. `picked_up`
6. `delivered`

## 5.6 Chat Lifecycle

Chat route: `/chat/:orderId`

Rule:

1. Chat remains open during active order
2. After delivery, chat auto-closes after 1 hour

Logic implemented in `isChatOpen(order)` in context.

## 6. Data Models

Main interfaces (from context):

1. `Organization`
2. `Branch`
3. `Rider`
4. `Dish`
5. `Order`
6. `ChatMessage`
7. `CurrentUser`

Important order fields:

1. `branchId`
2. `riderId`
3. `riderName`
4. `riderAccepted`
5. `riderAcceptedAt`
6. `status`
7. `deliveredAt`

## 7. Mock Data and Testing Helpers

Context actions:

1. `createMockOrderForOrg(orgId, count)`
2. `createMockOrdersForRider(riderId, countPerTab)`
3. `createApplicationMockData()`
4. `resetApplicationData()`

UI entry points:

1. Welcome -> `Load Full Mock Data`
2. Welcome -> `Clear All Data`
3. Kitchen Orders -> `+3 Mock`
4. Rider Orders -> `+Mock`

## 8. Professional UI Layer

Shared visual shell/components:

1. [MobileLayout.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/shared/MobileLayout.tsx) (iPhone-style frame on larger screens)
2. [TopBar.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/shared/TopBar.tsx)
3. [KitchenBottomNav.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/kitchen/KitchenBottomNav.tsx)
4. [RiderBottomNav.tsx](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/app/components/rider/RiderBottomNav.tsx)
5. [theme.css](/home/sharjeel/Welcome%20Screen%20and%20Role%20Selection/src/styles/theme.css)

## 9. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```
3. Build:
   ```bash
   npm run build
   ```

## 10. Current Implementation Notes

1. Branch manager and organization owner both use role `kitchen`; branch scoping is controlled by `currentUser.branchId`.
2. Dishes are organization-level records; availability toggle is currently global per dish.
3. Default seed data is loaded only when local storage is empty or reset.
4. Mock actions append data; use `Clear All Data` to return to baseline.

