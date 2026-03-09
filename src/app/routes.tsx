import React from 'react';
import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { SignupScreen } from './components/auth/SignupScreen';
import { RiderLoginScreen } from './components/auth/RiderLoginScreen';
import { BranchManagerLoginScreen } from './components/auth/BranchManagerLoginScreen';
import { KitchenOnboardingScreen } from './components/auth/KitchenOnboardingScreen';
import { KitchenOwnerLoginScreen } from './components/auth/KitchenOwnerLoginScreen';
import { BuyerHome } from './components/buyer/BuyerHome';
import { BuyerSearch } from './components/buyer/BuyerSearch';
import { BuyerProfile } from './components/buyer/BuyerProfile';
import { RestaurantDetail } from './components/buyer/RestaurantDetail';
import { CartScreen } from './components/buyer/CartScreen';
import { AddressSelection } from './components/buyer/AddressSelection';
import { PaymentConfirmation } from './components/buyer/PaymentConfirmation';
import { OrderTracker } from './components/buyer/OrderTracker';
import { OrgRegistration } from './components/kitchen/OrgRegistration';
import { KitchenHome } from './components/kitchen/KitchenHome';
import { KitchenBranchesScreen } from './components/kitchen/KitchenBranchesScreen';
import { KitchenManagerScreen } from './components/kitchen/KitchenManagerScreen';
import { KitchenRiderScreen } from './components/kitchen/KitchenRiderScreen';
import { DishesList } from './components/kitchen/DishesList';
import { BranchManager } from './components/kitchen/BranchManager';
import { KitchenOrders } from './components/kitchen/KitchenOrders';
import { KitchenChatListScreen } from './components/kitchen/KitchenChatListScreen';
import { OrgProfile, OrgEdit } from './components/kitchen/OrgProfile';
import { OrgOrgEdit } from './components/kitchen/OrgOrgEdit';
import { OrgInfo } from './components/kitchen/OrgInfo';
import { OrgDashboard } from './components/kitchen/OrgDashboard';
import { RiderOrders } from './components/rider/RiderOrders';
import { RiderProfile } from './components/rider/RiderProfile';
import { RiderOrderDetails } from './components/rider/RiderOrderDetails';
import { ChatScreen } from './components/chat/ChatScreen';
import { NotFoundError } from './NotFoundError';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFoundError />,
    children: [
      { index: true, element: <WelcomeScreen /> },
      { path: 'signup', element: <SignupScreen /> },
      { path: 'kitchen/onboarding', element: <KitchenOnboardingScreen /> },
      { path: 'kitchen/login', element: <KitchenOwnerLoginScreen /> },
      { path: 'rider/login', element: <RiderLoginScreen /> },
      { path: 'kitchen/manager/login', element: <BranchManagerLoginScreen /> },
      { path: 'buyer', element: <BuyerHome /> },
      { path: 'buyer/search', element: <BuyerSearch /> },
      { path: 'buyer/profile', element: <BuyerProfile /> },
      { path: 'buyer/restaurant/:orgId', element: <RestaurantDetail /> },
      { path: 'buyer/cart', element: <CartScreen /> },
      { path: 'buyer/address-selection', element: <AddressSelection /> },
      { path: 'buyer/payment-confirmation', element: <PaymentConfirmation /> },
      { path: 'buyer/order/:orderId', element: <OrderTracker /> },
      { path: 'kitchen/register', element: <OrgRegistration /> },
      { path: 'kitchen/dashboard', element: <OrgDashboard /> },
      { path: 'kitchen', element: <KitchenHome /> },
      { path: 'kitchen/branches', element: <KitchenBranchesScreen /> },
      { path: 'kitchen/manager', element: <KitchenManagerScreen /> },
      { path: 'kitchen/rider', element: <KitchenRiderScreen /> },
      { path: 'kitchen/dishes', element: <DishesList /> },
      { path: 'kitchen/branch/:branchId', element: <BranchManager /> },
      { path: 'kitchen/orders', element: <KitchenOrders /> },
      { path: 'kitchen/chat-list', element: <KitchenChatListScreen /> },
      { path: 'kitchen/profile', element: <OrgProfile /> },
      { path: 'kitchen/profile/info', element: <OrgInfo /> },
      { path: 'kitchen/profile/org-edit', element: <OrgOrgEdit /> },
      { path: 'kitchen/profile/edit', element: <OrgEdit /> },
      { path: 'rider/orders', element: <RiderOrders /> },
      { path: 'rider/order/:orderId', element: <RiderOrderDetails /> },
      { path: 'rider/profile', element: <RiderProfile /> },
      { path: 'chat/:orderId', element: <ChatScreen /> },
    ],
  },
]);
