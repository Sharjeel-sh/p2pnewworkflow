import React from 'react';
import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { SignupScreen } from './components/auth/SignupScreen';
import { RiderLoginScreen } from './components/auth/RiderLoginScreen';
import { BranchManagerLoginScreen } from './components/auth/BranchManagerLoginScreen';
import { KitchenOnboardingScreen } from './components/auth/KitchenOnboardingScreen';
import { KitchenOwnerLoginScreen } from './components/auth/KitchenOwnerLoginScreen';
import { VendorLoginScreen } from './components/auth/VendorLoginScreen';
import { VendorRegistrationScreen } from './components/auth/VendorRegistrationScreen';
import { VendorOTPVerificationScreen } from './components/auth/VendorOTPVerificationScreen';
import { VendorOrganizationRegistrationScreen } from './components/auth/VendorOrganizationRegistrationScreen';
import { VendorUploadCNICScreen } from './components/auth/VendorUploadCNICScreen';
import { VendorUploadDocumentsScreen } from './components/auth/VendorUploadDocumentsScreen';
import { BuyerFavorites } from './components/buyer/BuyerFavorites';
import { BuyerHome } from './components/buyer/BuyerHome';
import { BuyerSearch } from './components/buyer/BuyerSearch';
import { BuyerProfile } from './components/buyer/BuyerProfile';
import { ActiveOrders } from './components/buyer/ActiveOrders';
import { RestaurantDetail } from './components/buyer/RestaurantDetail';
import { DishDetail } from './components/buyer/DishDetail';
import { CartScreen } from './components/buyer/CartScreen';
import { AddressSelection } from './components/buyer/AddressSelection';
import { DeliveryScreen } from './components/buyer/DeliveryScreen';
import { PaymentConfirmation } from './components/buyer/PaymentConfirmation';
import { OrderTracker } from './components/buyer/OrderTracker';
import { PickupConfirmation } from './components/buyer/PickupConfirmation';
import { OrgRegistration } from './components/kitchen/OrgRegistration';
import { KitchenHome } from './components/kitchen/KitchenHome';
import { KitchenBranchesScreen } from './components/kitchen/KitchenBranchesScreen';
import { KitchenManagerScreen } from './components/kitchen/KitchenManagerScreen';
import { KitchenRiderScreen } from './components/kitchen/KitchenRiderScreen';
import { DishesList } from './components/kitchen/DishesList';
import { BranchManager } from './components/kitchen/BranchManager';
import { KitchenOrders } from './components/kitchen/KitchenOrders';
import { KitchenChatListScreen } from './components/kitchen/KitchenChatListScreen';
import { OrgProfile, OrgEdit, AppSetting } from './components/kitchen/OrgProfile';
import { OrgOrgEdit } from './components/kitchen/OrgOrgEdit';
import { OrgInfo } from './components/kitchen/OrgInfo';
import { OrgDashboard } from './components/kitchen/OrgDashboard';
import { KitchenBranchEdit } from './components/kitchen/KitchenBranchEdit';
import { KitchenOrderDashboard } from './components/kitchen/KitchenOrderDashboard';
import { KitchenProfile } from './components/kitchen/KitchenProfile';
import { KitchenCoupons } from './components/kitchen/KitchenCoupons';
import { KitchenDiscounts } from './components/kitchen/KitchenDiscounts';
import { KitchenSettings } from './components/kitchen/KitchenSettings';
import { RiderDashboard } from './components/rider/RiderDashboard';
import { RiderOrders } from './components/rider/RiderOrders';
import { RiderProfile } from './components/rider/RiderProfile';
import { RiderOrderDetails } from './components/rider/RiderOrderDetails';
import { ChatScreen } from './components/chat/ChatScreen';
import { BuyerNotificationsScreen, KitchenNotificationsScreen, RiderNotificationsScreen } from './components/shared/NotificationsScreen';
import { NotFoundError } from './NotFoundError';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFoundError />,
    children: [
      { index: true, element: <WelcomeScreen /> },
      { path: 'signup', element: <SignupScreen /> },
      { path: 'vendor/register', element: <VendorRegistrationScreen /> },
      { path: 'vendor/login', element: <VendorLoginScreen /> },
      { path: 'vendor/otp-verify', element: <VendorOTPVerificationScreen /> },
      { path: 'vendor/organization-register', element: <VendorOrganizationRegistrationScreen /> },
      { path: 'vendor/upload-cnic', element: <VendorUploadCNICScreen /> },
      { path: 'vendor/upload-documents', element: <VendorUploadDocumentsScreen /> },
      { path: 'kitchen/onboarding', element: <KitchenOnboardingScreen /> },
      { path: 'kitchen/login', element: <KitchenOwnerLoginScreen /> },
      { path: 'rider/login', element: <RiderLoginScreen /> },
      { path: 'kitchen/manager/login', element: <BranchManagerLoginScreen /> },
      { path: 'buyer', element: <BuyerHome /> },
      { path: 'buyer/orders', element: <ActiveOrders /> },
      { path: 'buyer/favorites', element: <BuyerFavorites /> },
      { path: 'buyer/search', element: <BuyerSearch /> },
      { path: 'buyer/profile', element: <BuyerProfile /> },
      { path: 'buyer/notifications', element: <BuyerNotificationsScreen /> },
      { path: 'buyer/restaurant/:orgId', element: <RestaurantDetail /> },
      { path: 'buyer/restaurant/:orgId/dish/:dishId', element: <DishDetail /> },
      { path: 'buyer/cart', element: <CartScreen /> },
      { path: 'buyer/delivery', element: <DeliveryScreen /> },
      { path: 'buyer/address-selection', element: <AddressSelection /> },
      { path: 'buyer/payment-confirmation', element: <PaymentConfirmation /> },
      { path: 'buyer/pickup/:orderId', element: <PickupConfirmation /> },
      { path: 'buyer/order/:orderId', element: <OrderTracker /> },
      { path: 'kitchen/register', element: <OrgRegistration /> },
      { path: 'kitchen/order/dashboard', element: <KitchenOrderDashboard /> },
      { path: 'kitchen/dashboard', element: <OrgDashboard /> },
      { path: 'kitchen', element: <KitchenHome /> },
      { path: 'kitchen/branches', element: <KitchenBranchesScreen /> },
      { path: 'kitchen/manager', element: <KitchenManagerScreen /> },
      { path: 'kitchen/rider', element: <KitchenRiderScreen /> },
      { path: 'kitchen/dishes', element: <DishesList /> },
      { path: 'kitchen/branch/:branchId', element: <BranchManager /> },
      { path: 'kitchen/orders', element: <KitchenOrders /> },
      { path: 'kitchen/chat-list', element: <KitchenChatListScreen /> },
      { path: 'kitchen/profile', element: <KitchenProfile /> },
      { path: 'kitchen/notifications', element: <KitchenNotificationsScreen /> },
      { path: 'kitchen/profile/organization', element: <OrgProfile /> },
      { path: 'kitchen/profile/info', element: <OrgInfo /> },
      { path: 'kitchen/profile/org-edit', element: <OrgOrgEdit /> },
      { path: 'kitchen/profile/edit', element: <OrgEdit /> },
      { path: 'kitchen/profile/branch-edit', element: <KitchenBranchEdit /> },
      { path: 'kitchen/profile/app-setting', element: <AppSetting /> },
      { path: 'kitchen/profile/coupons', element: <KitchenCoupons /> },
      { path: 'kitchen/profile/discounts', element: <KitchenDiscounts /> },
      { path: 'kitchen/profile/kitchen-info', element: <KitchenSettings /> },
      { path: 'rider', element: <RiderDashboard /> },
      { path: 'rider/dashboard', element: <RiderDashboard /> },
      { path: 'rider/orders', element: <RiderOrders /> },
      { path: 'rider/order/:orderId', element: <RiderOrderDetails /> },
      { path: 'rider/profile', element: <RiderProfile /> },
      { path: 'rider/notifications', element: <RiderNotificationsScreen /> },
      { path: 'chat/:orderId', element: <ChatScreen /> },
    ],
  },
]);
