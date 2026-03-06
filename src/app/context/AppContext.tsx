import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type UserRole = 'buyer' | 'kitchen' | 'rider';
export type OrgType = 'homemade' | 'restaurant';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered';

export interface Organization {
  id: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPassword?: string;
  orgName: string;
  address: string;
  phone: string;
  type: OrgType;
  verificationStatus?: 'pending' | 'verified';
  cnic?: string;
  ntn?: string;
  cnicFrontPhoto?: string;
  cnicBackPhoto?: string;
  legalAgreementDoc?: string;
}

export interface Branch {
  id: string;
  orgId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  kitchenLogo?: string;
  openingTime?: string;
  closingTime?: string;
  isDeliveryEnabled?: boolean;
  deliveryPrice?: string;
  deliveryTime?: string;
  managerName?: string;
  managerPhone?: string;
  managerImage?: string;
  managerUsername?: string;
  managerPassword?: string;
}

export interface Rider {
  id: string;
  orgId: string;
  branchId: string;
  name: string;
  phone: string;
  username: string;
  password: string;
  isAvailable: boolean;
  profilePicture?: string;
}

export interface Dish {
  id: string;
  orgId: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isAvailable: boolean;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface OrderItem {
  dish: Dish;
  quantity: number;
}

export interface Order {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  orgId: string;
  branchId?: string;
  riderId?: string;
  riderName?: string;
  riderAccepted?: boolean;
  riderAcceptedAt?: string;
  paymentMethod?: string;
  specialInstructions?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
}

export interface CurrentUser {
  role: UserRole;
  orgId?: string;
  branchId?: string;
  riderId?: string;
  buyerName?: string;
  managerName?: string;
}

interface AppState {
  organizations: Organization[];
  branches: Branch[];
  riders: Rider[];
  dishes: Dish[];
  orders: Order[];
  cart: CartItem[];
  chatMessages: ChatMessage[];
}

interface AppContextType extends AppState {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  registerOrganization: (data: Omit<Organization, 'id'>) => Organization;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  addBranch: (data: Omit<Branch, 'id'>) => Branch;
  deleteBranch: (branchId: string) => void;
  updateBranch: (id: string, data: Partial<Branch>) => void;
  addRider: (data: Omit<Rider, 'id'>) => Rider;
  deleteRider: (riderId: string) => void;
  updateRider: (id: string, data: Partial<Rider>) => void;
  addDish: (data: Omit<Dish, 'id'>) => Dish;
  deleteDish: (dishId: string) => void;
  updateDish: (id: string, data: Partial<Dish>) => void;
  addToCart: (dish: Dish, quantity: number) => void;
  updateCartItem: (dishId: string, quantity: number) => void;
  removeFromCart: (dishId: string) => void;
  clearCart: () => void;
  placeOrder: (buyerInfo: { name: string; phone: string; address: string; orgId: string; paymentMethod?: string; specialInstructions?: string }) => Order;
  createMockOrderForOrg: (orgId: string, count?: number) => Order[] | null;
  createMockOrdersForRider: (riderId: string, countPerTab?: number) => Order[] | null;
  createApplicationMockData: () => void;
  resetApplicationData: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignRiderToOrder: (orderId: string, riderId: string, riderName: string, branchId: string) => void;
  unassignRiderFromOrder: (orderId: string) => void;
  acceptAssignedOrder: (orderId: string) => void;
  loginKitchenOwner: (phone: string, password: string) => Organization | null;
  loginBranchManager: (phone: string, password: string) => Branch | null;
  loginRider: (username: string, password: string) => Rider | null;
  sendChatMessage: (orderId: string, message: string, senderName: string, senderRole: UserRole) => void;
  isChatOpen: (order: Order) => boolean;
}

const STORAGE_KEY = 'quickbite_app_state';

const INITIAL_ORGS: Organization[] = [
  {
    id: 'org-001',
    ownerName: 'Salman Khan',
    ownerEmail: 'salman@karachigrills.pk',
    ownerPassword: 'owner123',
    orgName: 'Karachi Grills',
    address: 'Block 5, Clifton, Karachi',
    phone: '0311-1234567',
    type: 'restaurant',
    verificationStatus: 'verified',
    ntn: '1234567-8',
    cnic: '42101-1234567-8',
  },
  {
    id: 'org-002',
    ownerName: 'Amna Bibi',
    ownerEmail: 'amna@homespice.pk',
    ownerPassword: 'owner123',
    orgName: 'Home Spice by Amna',
    address: 'Street 4, Gulshan-e-Iqbal, Karachi',
    phone: '0300-9876543',
    type: 'homemade',
    verificationStatus: 'verified',
    cnic: '42101-1234567-8',
  },
];

const INITIAL_BRANCHES: Branch[] = [
  { id: 'branch-001', orgId: 'org-001', name: 'Clifton Branch', address: 'Block 5, Clifton, Karachi', managerName: 'Usman Ali', managerPhone: '0321-7654321', managerUsername: 'usman_ali', managerPassword: 'manager123' },
  { id: 'branch-002', orgId: 'org-001', name: 'DHA Branch', address: 'Phase 6, DHA, Karachi', managerName: 'Farrukh Ahmed', managerPhone: '0335-1234567', managerUsername: 'farrukh_ahmed', managerPassword: 'manager123' },
  { id: 'branch-003', orgId: 'org-002', name: "Amna's Home Kitchen", address: 'Street 4, Gulshan-e-Iqbal, Karachi', managerName: 'Amna Bibi', managerPhone: '0300-9876543', managerUsername: 'amna_bibi', managerPassword: 'manager123' },
];

const INITIAL_RIDERS: Rider[] = [
  { id: 'rider-001', orgId: 'org-001', branchId: 'branch-001', name: 'Ali Hassan', phone: '0312-9876543', username: 'ali123', password: 'pass123', isAvailable: true },
  { id: 'rider-002', orgId: 'org-001', branchId: 'branch-002', name: 'Bilal Sheikh', phone: '0333-2345678', username: 'bilal123', password: 'pass123', isAvailable: true },
  { id: 'rider-003', orgId: 'org-002', branchId: 'branch-003', name: 'Zubair Ahmad', phone: '0344-5678901', username: 'zubair123', password: 'pass123', isAvailable: true },
];

const INITIAL_DISHES: Dish[] = [
  { id: 'dish-001', orgId: 'org-001', name: 'Chicken Karahi', price: 750, description: 'Spicy and tender chicken in traditional Karahi style with tomatoes and spices', category: 'Main Course', isAvailable: true },
  { id: 'dish-002', orgId: 'org-001', name: 'Beef Biryani', price: 350, description: 'Aromatic basmati rice cooked with premium beef and whole spices', category: 'Rice', isAvailable: true },
  { id: 'dish-003', orgId: 'org-001', name: 'Seekh Kabab (6 pcs)', price: 450, description: 'Juicy minced beef kababs grilled on skewers with raita', category: 'Starters', isAvailable: true },
  { id: 'dish-004', orgId: 'org-001', name: 'Garlic Naan', price: 60, description: 'Freshly baked soft naan with garlic butter', category: 'Bread', isAvailable: true },
  { id: 'dish-005', orgId: 'org-001', name: 'Mango Lassi', price: 120, description: 'Chilled mango yogurt drink, refreshing and sweet', category: 'Drinks', isAvailable: true },
  { id: 'dish-006', orgId: 'org-002', name: 'Home-Style Karahi', price: 500, description: 'Authentic home-style karahi made with love and secret spices', category: 'Main Course', isAvailable: true },
  { id: 'dish-007', orgId: 'org-002', name: 'Halwa Puri (Full)', price: 250, description: 'Traditional breakfast - fluffy puris with sweet halwa and chana masala', category: 'Breakfast', isAvailable: true },
  { id: 'dish-008', orgId: 'org-002', name: 'Daal Chawal', price: 180, description: 'Comfort food - masoor daal with steamed basmati rice', category: 'Main Course', isAvailable: true },
  { id: 'dish-009', orgId: 'org-002', name: 'Kheer', price: 100, description: 'Classic creamy rice pudding topped with pistachios', category: 'Desserts', isAvailable: true },
  { id: 'dish-010', orgId: 'org-002', name: 'Rooh Afza Sharbat', price: 60, description: 'Refreshing rose syrup drink with milk', category: 'Drinks', isAvailable: true },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-001',
    buyerName: 'Ahmed Raza',
    buyerPhone: '0301-1112233',
    buyerAddress: 'Street 9, Clifton, Karachi',
    items: [
      { dish: INITIAL_DISHES[0], quantity: 1 },
      { dish: INITIAL_DISHES[3], quantity: 2 },
    ],
    total: INITIAL_DISHES[0].price * 1 + INITIAL_DISHES[3].price * 2,
    status: 'ready',
    orgId: 'org-001',
    branchId: 'branch-001',
    riderId: 'rider-001',
    riderName: 'Ali Hassan',
    riderAccepted: true,
    riderAcceptedAt: new Date(Date.now() - 36 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-002',
    buyerName: 'Sara Khan',
    buyerPhone: '0332-7788990',
    buyerAddress: 'Phase 6, DHA, Karachi',
    items: [
      { dish: INITIAL_DISHES[1], quantity: 1 },
      { dish: INITIAL_DISHES[4], quantity: 2 },
    ],
    total: INITIAL_DISHES[1].price * 1 + INITIAL_DISHES[4].price * 2,
    status: 'picked_up',
    orgId: 'org-001',
    branchId: 'branch-002',
    riderId: 'rider-002',
    riderName: 'Bilal Sheikh',
    riderAccepted: true,
    riderAcceptedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-003',
    buyerName: 'Hina Ali',
    buyerPhone: '0345-3344556',
    buyerAddress: 'Gulshan-e-Iqbal, Karachi',
    items: [
      { dish: INITIAL_DISHES[6], quantity: 1 },
      { dish: INITIAL_DISHES[9], quantity: 1 },
    ],
    total: INITIAL_DISHES[6].price * 1 + INITIAL_DISHES[9].price * 1,
    status: 'delivered',
    orgId: 'org-002',
    branchId: 'branch-003',
    riderId: 'rider-003',
    riderName: 'Zubair Ahmad',
    riderAccepted: true,
    riderAcceptedAt: new Date(Date.now() - 230 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order-004',
    buyerName: 'Test Buyer',
    buyerPhone: '0300-0001122',
    buyerAddress: 'Test Street 10, Clifton, Karachi',
    items: [
      { dish: INITIAL_DISHES[1], quantity: 1 },
      { dish: INITIAL_DISHES[4], quantity: 1 },
    ],
    total: INITIAL_DISHES[1].price * 1 + INITIAL_DISHES[4].price * 1,
    status: 'pending',
    orgId: 'org-001',
    branchId: 'branch-001',
    riderAccepted: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function slugify(value: string, fallback: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || fallback;
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const normalizedBranches = (parsed.branches ?? INITIAL_BRANCHES).map((b: Branch) => ({
        ...b,
        managerUsername: b.managerUsername ?? (b.managerName ? slugify(b.managerName, 'kitchen_manager') : undefined),
      }));
      const normalizedDishes = (parsed.dishes ?? INITIAL_DISHES).map((d: Dish) => ({
        ...d,
        isAvailable: typeof d.isAvailable === 'boolean' ? d.isAvailable : true,
      }));
      return {
        organizations: parsed.organizations ?? INITIAL_ORGS,
        branches: normalizedBranches,
        riders: parsed.riders ?? INITIAL_RIDERS,
        dishes: normalizedDishes,
        orders: parsed.orders ?? INITIAL_ORDERS,
        cart: parsed.cart ?? [],
        chatMessages: parsed.chatMessages ?? [],
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {
    organizations: INITIAL_ORGS,
    branches: INITIAL_BRANCHES,
    riders: INITIAL_RIDERS,
    dishes: INITIAL_DISHES,
    orders: INITIAL_ORDERS,
    cart: [],
    chatMessages: [],
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(null);
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  const setCurrentUser = useCallback((user: CurrentUser | null) => {
    setCurrentUserState(user);
  }, []);

  const registerOrganization = useCallback((data: Omit<Organization, 'id'>) => {
    const org: Organization = { ...data, id: `org-${generateId()}` };
    setState(prev => ({
      ...prev,
      organizations: [...prev.organizations, org],
    }));
    return org;
  }, []);

  const updateOrganization = useCallback((id: string, data: Partial<Organization>) => {
    setState(prev => ({ ...prev, organizations: prev.organizations.map(o => o.id === id ? { ...o, ...data } : o) }));
  }, []);

  const addBranch = useCallback((data: Omit<Branch, 'id'>) => {
    const branch: Branch = { ...data, id: `branch-${generateId()}` };
    setState(prev => ({ ...prev, branches: [...prev.branches, branch] }));
    return branch;
  }, []);

  const deleteBranch = useCallback((branchId: string) => {
    setState(prev => ({ ...prev, branches: prev.branches.filter(b => b.id !== branchId) }));
  }, []);

  const updateBranch = useCallback((id: string, data: Partial<Branch>) => {
    setState(prev => ({ ...prev, branches: prev.branches.map(b => b.id === id ? { ...b, ...data } : b) }));
  }, []);

  const addRider = useCallback((data: Omit<Rider, 'id'>) => {
    const rider: Rider = { ...data, id: `rider-${generateId()}` };
    setState(prev => ({ ...prev, riders: [...prev.riders, rider] }));
    return rider;
  }, []);

  const deleteRider = useCallback((riderId: string) => {
    setState(prev => ({ ...prev, riders: prev.riders.filter(r => r.id !== riderId) }));
  }, []);

  const updateRider = useCallback((id: string, data: Partial<Rider>) => {
    setState(prev => ({ ...prev, riders: prev.riders.map(r => r.id === id ? { ...r, ...data } : r) }));
  }, []);

  const addDish = useCallback((data: Omit<Dish, 'id'>) => {
    const dish: Dish = { ...data, id: `dish-${generateId()}` };
    setState(prev => ({ ...prev, dishes: [...prev.dishes, dish] }));
    return dish;
  }, []);

  const deleteDish = useCallback((dishId: string) => {
    setState(prev => ({ ...prev, dishes: prev.dishes.filter(d => d.id !== dishId) }));
  }, []);

  const updateDish = useCallback((id: string, data: Partial<Dish>) => {
    setState(prev => ({ ...prev, dishes: prev.dishes.map(d => d.id === id ? { ...d, ...data } : d) }));
  }, []);

  const addToCart = useCallback((dish: Dish, quantity: number) => {
    setState(prev => {
      const existing = prev.cart.find(i => i.dish.id === dish.id);
      if (existing) {
        return { ...prev, cart: prev.cart.map(i => i.dish.id === dish.id ? { ...i, quantity: i.quantity + quantity } : i) };
      }
      return { ...prev, cart: [...prev.cart, { dish, quantity }] };
    });
  }, []);

  const updateCartItem = useCallback((dishId: string, quantity: number) => {
    setState(prev => {
      if (quantity <= 0) return { ...prev, cart: prev.cart.filter(i => i.dish.id !== dishId) };
      return { ...prev, cart: prev.cart.map(i => i.dish.id === dishId ? { ...i, quantity } : i) };
    });
  }, []);

  const removeFromCart = useCallback((dishId: string) => {
    setState(prev => ({ ...prev, cart: prev.cart.filter(i => i.dish.id !== dishId) }));
  }, []);

  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, cart: [] }));
  }, []);

  const placeOrder = useCallback((buyerInfo: { name: string; phone: string; address: string; orgId: string; paymentMethod?: string; specialInstructions?: string }) => {
    let createdOrder: Order | null = null;
    setState(prev => {
      const availableRider = prev.riders.find(r => r.orgId === buyerInfo.orgId && r.isAvailable);
      const fallbackBranch = prev.branches.find(b => b.orgId === buyerInfo.orgId);
      const total = prev.cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
      const order: Order = {
        id: `order-${generateId()}`,
        buyerName: buyerInfo.name,
        buyerPhone: buyerInfo.phone,
        buyerAddress: buyerInfo.address,
        items: prev.cart.map(i => ({ dish: i.dish, quantity: i.quantity })),
        total,
        status: 'pending',
        orgId: buyerInfo.orgId,
        ...(availableRider
          ? {
              riderId: availableRider.id,
              riderName: availableRider.name,
              branchId: availableRider.branchId,
            }
          : fallbackBranch
            ? { branchId: fallbackBranch.id }
            : {}),
        riderAccepted: false,
        paymentMethod: buyerInfo.paymentMethod || 'cod',
        specialInstructions: buyerInfo.specialInstructions,
        createdAt: new Date().toISOString(),
      };
      createdOrder = order;
      return { ...prev, orders: [...prev.orders, order], cart: [] };
    });
    return createdOrder!;
  }, []);

  const createMockOrderForOrg = useCallback((orgId: string, count = 1): Order[] | null => {
    let createdOrders: Order[] | null = null;
    setState(prev => {
      const orgDishes = prev.dishes.filter(d => d.orgId === orgId && d.isAvailable);
      if (orgDishes.length === 0) return prev;

      const branch = prev.branches.find(b => b.orgId === orgId);
      const toCreate = Math.max(1, Math.min(10, count));
      const generated: Order[] = [];

      for (let i = 0; i < toCreate; i += 1) {
        const firstDish = orgDishes[i % orgDishes.length];
        const secondDish = orgDishes[(i + 1) % orgDishes.length];
        const items = [
          { dish: firstDish, quantity: 1 },
          ...(secondDish.id !== firstDish.id ? [{ dish: secondDish, quantity: 1 }] : []),
        ];
        const total = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

        generated.push({
          id: `order-${generateId()}`,
          buyerName: `Mock Buyer ${i + 1}`,
          buyerPhone: `0300-11122${String(i + 1).padStart(2, '0')}`,
          buyerAddress: `Testing Address ${i + 1}, Karachi`,
          items,
          total,
          status: 'pending',
          orgId,
          branchId: branch?.id,
          riderAccepted: false,
          createdAt: new Date(Date.now() - i * 60 * 1000).toISOString(),
        });
      }

      createdOrders = generated;
      return { ...prev, orders: [...prev.orders, ...generated] };
    });
    return createdOrders;
  }, []);

  const createMockOrdersForRider = useCallback((riderId: string, countPerTab = 1): Order[] | null => {
    let createdOrders: Order[] | null = null;
    setState(prev => {
      const rider = prev.riders.find(r => r.id === riderId);
      if (!rider) return prev;

      const orgDishes = prev.dishes.filter(d => d.orgId === rider.orgId && d.isAvailable);
      if (orgDishes.length === 0) return prev;

      const perTab = Math.max(1, Math.min(3, countPerTab));
      const statuses: Array<{ status: OrderStatus; accepted: boolean; label: string }> = [
        { status: 'pending', accepted: false, label: 'Assigned' },
        { status: 'ready', accepted: true, label: 'Pickup' },
        { status: 'picked_up', accepted: true, label: 'Delivery' },
      ];

      const generated: Order[] = [];
      let dishIndex = 0;
      for (const step of statuses) {
        for (let i = 0; i < perTab; i += 1) {
          const firstDish = orgDishes[dishIndex % orgDishes.length];
          const secondDish = orgDishes[(dishIndex + 1) % orgDishes.length];
          dishIndex += 1;
          const items = [
            { dish: firstDish, quantity: 1 },
            ...(secondDish.id !== firstDish.id ? [{ dish: secondDish, quantity: 1 }] : []),
          ];
          const total = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

          generated.push({
            id: `order-${generateId()}`,
            buyerName: `Mock ${step.label} Buyer ${i + 1}`,
            buyerPhone: `0300-22233${String(i + 1).padStart(2, '0')}`,
            buyerAddress: `Rider Test ${step.label} ${i + 1}, Karachi`,
            items,
            total,
            status: step.status,
            orgId: rider.orgId,
            branchId: rider.branchId,
            riderId: rider.id,
            riderName: rider.name,
            riderAccepted: step.accepted,
            riderAcceptedAt: step.accepted ? new Date().toISOString() : undefined,
            createdAt: new Date(Date.now() - generated.length * 60 * 1000).toISOString(),
          });
        }
      }

      createdOrders = generated;
      return { ...prev, orders: [...prev.orders, ...generated] };
    });
    return createdOrders;
  }, []);

  const createApplicationMockData = useCallback(() => {
    const now = Date.now();
    const orgId = `org-${generateId()}`;
    const branchId = `branch-${generateId()}`;
    const rider1Id = `rider-${generateId()}`;
    const rider2Id = `rider-${generateId()}`;
    const rider3Id = `rider-${generateId()}`;

    const org: Organization = {
      id: orgId,
      ownerName: 'Mock Owner',
      orgName: 'Mock Kitchen Hub',
      address: 'Main Boulevard, Karachi',
      phone: '0300-9998877',
      type: 'restaurant',
      ntn: '9876543-2',
    };

    const branch: Branch = {
      id: branchId,
      orgId,
      name: 'Mock Main Branch',
      address: 'Main Boulevard, Karachi',
      managerName: 'Mock Manager',
      managerPhone: '0311-2223344',
      managerUsername: `mock_manager_${Math.floor(100 + Math.random() * 900)}`,
      managerPassword: 'manager123',
    };

    const ridersToAdd: Rider[] = [
      { id: rider1Id, orgId, branchId, name: 'Mock Rider 1', phone: '0321-1110001', username: 'mockrider1', password: 'pass123', isAvailable: true },
      { id: rider2Id, orgId, branchId, name: 'Mock Rider 2', phone: '0321-1110002', username: 'mockrider2', password: 'pass123', isAvailable: true },
      { id: rider3Id, orgId, branchId, name: 'Mock Rider 3', phone: '0321-1110003', username: 'mockrider3', password: 'pass123', isAvailable: true },
    ];

    const dish1: Dish = { id: `dish-${generateId()}`, orgId, name: 'Mock Chicken Karahi', price: 750, description: 'Mock spicy chicken karahi', category: 'Main Course', isAvailable: true };
    const dish2: Dish = { id: `dish-${generateId()}`, orgId, name: 'Mock Beef Biryani', price: 390, description: 'Mock biryani', category: 'Rice', isAvailable: true };
    const dish3: Dish = { id: `dish-${generateId()}`, orgId, name: 'Mock Fries', price: 220, description: 'Mock crispy fries', category: 'Starters', isAvailable: true };
    const dishesToAdd = [dish1, dish2, dish3];

    const order1Id = `order-${generateId()}`;
    const order2Id = `order-${generateId()}`;
    const order3Id = `order-${generateId()}`;
    const order4Id = `order-${generateId()}`;

    const ordersToAdd: Order[] = [
      {
        id: order1Id,
        buyerName: 'Mock Buyer Assigned',
        buyerPhone: '0333-1112233',
        buyerAddress: 'Mock Street 1, Karachi',
        items: [{ dish: dish1, quantity: 1 }],
        total: dish1.price,
        status: 'pending',
        orgId,
        branchId,
        riderId: rider1Id,
        riderName: 'Mock Rider 1',
        riderAccepted: false,
        createdAt: new Date(now - 10 * 60 * 1000).toISOString(),
      },
      {
        id: order2Id,
        buyerName: 'Mock Buyer Pickup',
        buyerPhone: '0333-1112244',
        buyerAddress: 'Mock Street 2, Karachi',
        items: [{ dish: dish2, quantity: 1 }],
        total: dish2.price,
        status: 'ready',
        orgId,
        branchId,
        riderId: rider2Id,
        riderName: 'Mock Rider 2',
        riderAccepted: true,
        riderAcceptedAt: new Date(now - 16 * 60 * 1000).toISOString(),
        createdAt: new Date(now - 20 * 60 * 1000).toISOString(),
      },
      {
        id: order3Id,
        buyerName: 'Mock Buyer Delivery',
        buyerPhone: '0333-1112255',
        buyerAddress: 'Mock Street 3, Karachi',
        items: [{ dish: dish3, quantity: 2 }],
        total: dish3.price * 2,
        status: 'picked_up',
        orgId,
        branchId,
        riderId: rider3Id,
        riderName: 'Mock Rider 3',
        riderAccepted: true,
        riderAcceptedAt: new Date(now - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(now - 35 * 60 * 1000).toISOString(),
      },
      {
        id: order4Id,
        buyerName: 'Mock Buyer Delivered',
        buyerPhone: '0333-1112266',
        buyerAddress: 'Mock Street 4, Karachi',
        items: [{ dish: dish1, quantity: 1 }, { dish: dish2, quantity: 1 }],
        total: dish1.price + dish2.price,
        status: 'delivered',
        orgId,
        branchId,
        riderId: rider1Id,
        riderName: 'Mock Rider 1',
        riderAccepted: true,
        riderAcceptedAt: new Date(now - 90 * 60 * 1000).toISOString(),
        createdAt: new Date(now - 120 * 60 * 1000).toISOString(),
        deliveredAt: new Date(now - 80 * 60 * 1000).toISOString(),
      },
    ];

    const chatsToAdd: ChatMessage[] = [
      {
        id: `msg-${generateId()}`,
        orderId: order2Id,
        senderName: 'Mock Buyer Pickup',
        senderRole: 'buyer',
        message: 'Please deliver quickly.',
        timestamp: new Date(now - 15 * 60 * 1000).toISOString(),
      },
      {
        id: `msg-${generateId()}`,
        orderId: order2Id,
        senderName: 'Mock Kitchen',
        senderRole: 'kitchen',
        message: 'Order is ready for rider pickup.',
        timestamp: new Date(now - 12 * 60 * 1000).toISOString(),
      },
    ];

    setState(prev => ({
      ...prev,
      organizations: [...prev.organizations, org],
      branches: [...prev.branches, branch],
      riders: [...prev.riders, ...ridersToAdd],
      dishes: [...prev.dishes, ...dishesToAdd],
      orders: [...prev.orders, ...ordersToAdd],
      chatMessages: [...prev.chatMessages, ...chatsToAdd],
    }));
  }, []);

  const resetApplicationData = useCallback(() => {
    setState({
      organizations: INITIAL_ORGS,
      branches: INITIAL_BRANCHES,
      riders: INITIAL_RIDERS,
      dishes: INITIAL_DISHES,
      orders: [], // Clear all orders instead of resetting to INITIAL_ORDERS
      cart: [],
      chatMessages: [],
    });
    setCurrentUserState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear app storage:', e);
    }
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => {
        if (o.id !== orderId) return o;
        const updates: Partial<Order> = { status };
        if (status === 'delivered') updates.deliveredAt = new Date().toISOString();
        return { ...o, ...updates };
      }),
    }));
  }, []);

  const assignRiderToOrder = useCallback((orderId: string, riderId: string, riderName: string, branchId: string) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === orderId ? { ...o, riderId, riderName, branchId, riderAccepted: false, riderAcceptedAt: undefined } : o),
    }));
  }, []);

  const unassignRiderFromOrder = useCallback((orderId: string) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => (
        o.id === orderId
          ? { ...o, riderId: undefined, riderName: undefined, riderAccepted: false, riderAcceptedAt: undefined }
          : o
      )),
    }));
  }, []);

  const acceptAssignedOrder = useCallback((orderId: string) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => (
        o.id === orderId
          ? { ...o, riderAccepted: true, riderAcceptedAt: new Date().toISOString() }
          : o
      )),
    }));
  }, []);

  const loginKitchenOwner = useCallback((phone: string, password: string): Organization | null => {
    const found = state.organizations.find(
      o => o.phone === phone && o.ownerPassword === password,
    );
    return found ?? null;
  }, [state.organizations]);

  const loginBranchManager = useCallback((phone: string, password: string): Branch | null => {
    const found = state.branches.find(
      b => b.managerPhone === phone && b.managerPassword === password,
    );
    return found ?? null;
  }, [state.branches]);

  const loginRider = useCallback((username: string, password: string): Rider | null => {
    const found = state.riders.find(
      r => r.username === username && r.password === password && r.isAvailable,
    );
    return found ?? null;
  }, [state.riders]);

  const sendChatMessage = useCallback((orderId: string, message: string, senderName: string, senderRole: UserRole) => {
    const msg: ChatMessage = {
      id: `msg-${generateId()}`,
      orderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, chatMessages: [...prev.chatMessages, msg] }));
  }, []);

  const isChatOpen = useCallback((order: Order): boolean => {
    if (order.status !== 'delivered') return true;
    if (!order.deliveredAt) return true;
    const delivered = new Date(order.deliveredAt).getTime();
    const now = Date.now();
    return (now - delivered) < 60 * 60 * 1000; // 1 hour
  }, []);

  return (
    <AppContext.Provider value={{
      ...state,
      currentUser,
      setCurrentUser,
      registerOrganization,
      updateOrganization,
      addBranch,
      deleteBranch,
      updateBranch,
      addRider,
      deleteRider,
      updateRider,
      addDish,
      deleteDish,
      updateDish,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      placeOrder,
      createMockOrderForOrg,
      createMockOrdersForRider,
      createApplicationMockData,
      resetApplicationData,
      updateOrderStatus,
      assignRiderToOrder,
      unassignRiderFromOrder,
      acceptAssignedOrder,
      loginKitchenOwner,
      loginBranchManager,
      loginRider,
      sendChatMessage,
      isChatOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
