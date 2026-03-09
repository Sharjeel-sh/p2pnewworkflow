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
import { OrgDashboard } from './components/kitchen/OrgDashboard';
import { RiderOrders } from './components/rider/RiderOrders';
import { RiderProfile } from './components/rider/RiderProfile';
import { RiderOrderDetails } from './components/rider/RiderOrderDetails';
import { ChatScreen } from './components/chat/ChatScreen';
import { NotFoundError } from './NotFoundError';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    errorElement: NotFoundError, // Custom error element for 404 and other errors
    children: [
      { index: true, Component: WelcomeScreen },
      { path: 'signup', Component: SignupScreen },
      { path: 'kitchen/onboarding', Component: KitchenOnboardingScreen },
      { path: 'kitchen/login', Component: KitchenOwnerLoginScreen },
      { path: 'rider/login', Component: RiderLoginScreen },
      { path: 'kitchen/manager/login', Component: BranchManagerLoginScreen },
      { path: 'buyer', Component: BuyerHome },
      { path: 'buyer/search', Component: BuyerSearch },
      { path: 'buyer/profile', Component: BuyerProfile },
      { path: 'buyer/restaurant/:orgId', Component: RestaurantDetail },
      { path: 'buyer/cart', Component: CartScreen },
      { path: 'buyer/address-selection', Component: AddressSelection },
      { path: 'buyer/payment-confirmation', Component: PaymentConfirmation },
      { path: 'buyer/order/:orderId', Component: OrderTracker },
      { path: 'kitchen/register', Component: OrgRegistration },
      { path: 'kitchen/dashboard', Component: OrgDashboard },
      { path: 'kitchen', Component: KitchenHome },
      { path: 'kitchen/branches', Component: KitchenBranchesScreen },
      { path: 'kitchen/manager', Component: KitchenManagerScreen },
      { path: 'kitchen/rider', Component: KitchenRiderScreen },
      { path: 'kitchen/dishes', Component: DishesList },
      { path: 'kitchen/branch/:branchId', Component: BranchManager },
      { path: 'kitchen/orders', Component: KitchenOrders },
      { path: 'kitchen/chat-list', Component: KitchenChatListScreen },
      { path: 'kitchen/profile', Component: OrgProfile },
      { path: 'kitchen/profile/edit', Component: OrgEdit },
      { path: 'rider/orders', Component: RiderOrders },
      { path: 'rider/order/:orderId', Component: RiderOrderDetails },
      { path: 'rider/profile', Component: RiderProfile },
      { path: 'chat/:orderId', Component: ChatScreen },
    ],
  },
]);
