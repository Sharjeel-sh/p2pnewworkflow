import React, { useMemo, useState, useEffect } from "react";
import {
  Bell, TrendingUp, Clock, ChefHat, Users, ShoppingBag,
  Eye, DollarSign, Calendar, Filter, Printer, Download,
  AlertCircle, CheckCircle, RefreshCw, Truck, Award, Flame,
  TrendingDown, Activity, BarChart3, MoreVertical, Star, Timer, Zap, AlertTriangle, Gauge, Navigation, Phone,
  Package, Utensils, Bike, MapPin, TrendingUp as TrendingUpIcon, X, ChevronLeft, ChevronRight
} from "lucide-react";
import { MobileLayout } from "../shared/MobileLayout";
import { KitchenBottomNav } from "./KitchenBottomNav";
import { useApp } from "../../context/AppContext";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

// Types for better type safety
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  peakHour: string;
  ordersByStatus: Record<string, number>;
  trendData: TrendDataPoint[];
  topItems: TopItem[];
  riderPerformance: RiderPerformance[];
}

interface TrendDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
  price?: number;
  image?: string;
}

interface RiderPerformance {
  id: string;
  name: string;
  deliveries: number;
  avgDeliveryTime: number;
  rating: number;
  lateDeliveries: number;
  lateDeliveryPercent: number;
  revenue: number;
  status: 'available' | 'on-break' | 'unavailable';
  efficiency: number;
  zone?: string;
  contact?: string;
  avatar?: string;
}

interface ExtendedRiderPerformance extends RiderPerformance {
  efficiencyScore: number;
}

interface PeakHourData {
  hour: string;
  orders: number;
}

// Mock riders data
const mockRiders = [
  {
    id: 'r1',
    name: 'John Doe',
    avatar: 'JD',
    phone: '+1 234-567-8901',
    zone: 'Downtown',
    status: 'available' as const,
    rating: 4.8,
    deliveries: 156,
    avgDeliveryTime: 28,
    lateDeliveries: 8,
    revenue: 4680,
    efficiency: 92
  },
  {
    id: 'r2',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    phone: '+1 234-567-8902',
    zone: 'Uptown',
    status: 'available' as const,
    rating: 4.9,
    deliveries: 142,
    avgDeliveryTime: 24,
    lateDeliveries: 4,
    revenue: 4260,
    efficiency: 95
  },
  {
    id: 'r3',
    name: 'Mike Wilson',
    avatar: 'MW',
    phone: '+1 234-567-8903',
    zone: 'East Side',
    status: 'unavailable' as const,
    rating: 4.5,
    deliveries: 98,
    avgDeliveryTime: 32,
    lateDeliveries: 12,
    revenue: 2940,
    efficiency: 82
  },
  {
    id: 'r4',
    name: 'Emma Davis',
    avatar: 'ED',
    phone: '+1 234-567-8904',
    zone: 'West Side',
    status: 'active' as const,
    rating: 4.7,
    deliveries: 134,
    avgDeliveryTime: 26,
    lateDeliveries: 6,
    revenue: 4020,
    efficiency: 90
  },
  {
    id: 'r5',
    name: 'Chris Brown',
    avatar: 'CB',
    phone: '+1 234-567-8905',
    zone: 'North End',
    status: 'unavailable' as const,
    rating: 4.2,
    deliveries: 67,
    avgDeliveryTime: 38,
    lateDeliveries: 14,
    revenue: 2010,
    efficiency: 75
  },
  {
    id: 'r6',
    name: 'Lisa Martinez',
    avatar: 'LM',
    phone: '+1 234-567-8906',
    zone: 'South Park',
    status: 'available' as const,
    rating: 4.9,
    deliveries: 178,
    avgDeliveryTime: 22,
    lateDeliveries: 3,
    revenue: 5340,
    efficiency: 97
  }
];

// Mock orders data
const generateMockOrders = () => {
  const orders = [];
  const statuses = ['pending payment', 'accepted', 'preparing', 'ready-for-pickup', 'delivered', 'cancelled'];
  const items = [
    { name: 'Zinger Burger', quantity: 124, price: 8.99 },
    { name: 'Chicken Shawarma', quantity: 98, price: 7.99 },
    { name: 'Loaded Fries', quantity: 86, price: 5.99 },
    { name: 'Grilled Sandwich', quantity: 74, price: 6.99 },
    { name: 'Cheese Pizza Slice', quantity: 63, price: 4.99 }
  ];
  
  for (let i = 0; i < 200; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const total = randomItem.price * (Math.floor(Math.random() * 3) + 1);
    const rider = Math.random() > 0.3 ? mockRiders[Math.floor(Math.random() * mockRiders.length)] : null;
    
    orders.push({
      id: `order_${i}`,
      orgId: 'org1',
      branchId: 'branch1',
      createdAt: date.toISOString(),
      deliveredAt: status === 'delivered' ? new Date(date.getTime() + (Math.random() * 60 + 20) * 60000).toISOString() : null,
      status: status,
      total: total,
      items: [
        {
          name: randomItem.name,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: randomItem.price
        }
      ],
      riderId: rider?.id,
      riderRating: rider ? Math.floor(Math.random() * 2) + 4 : null
    });
  }
  
  return orders;
};

export function KitchenOrderDashboard() {
  const { currentUser, orders: contextOrders, dishes, riders: contextRiders, isLoading: contextLoading } = useApp();
  const orgId = currentUser?.orgId;
  const branchId = currentUser?.branchId;
  
  // Use mock data if context data is empty
  const [mockOrders] = useState(generateMockOrders());
  const [mockRidersData] = useState(mockRiders);
  
  const orders = contextOrders?.length ? contextOrders : mockOrders;
  const riders = contextRiders?.length ? contextRiders : mockRidersData;
  const isLoading = contextLoading && !orders.length;
  
  // State management
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'analytics' | 'riders'>('overview');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
  const [sortBy, setSortBy] = useState<'deliveries' | 'avgTime' | 'rating'>('deliveries');
  const [selectedRider, setSelectedRider] = useState<string | null>(null);

  // Date range calculation with proper timezone handling
  const dateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(selectedPeriod) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 86400000 - 1) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { start: weekStart, end: new Date(today.getTime() + 86400000 - 1) };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: monthStart, end: new Date(today.getTime() + 86400000 - 1) };
      case 'custom':
        return { 
          start: new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate()),
          end: new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate(), 23, 59, 59, 999)
        };
      default:
        return { start: today, end: new Date(today.getTime() + 86400000 - 1) };
    }
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Format date for display
  const formatDateRange = () => {
    if (selectedPeriod === 'custom') {
      return `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;
    }
    return `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`;
  };

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (!orgId && !orders.length) return mockOrders;
    if (!orgId) return orders;
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return order.orgId === orgId && 
             orderDate >= dateRange.start && 
             orderDate <= dateRange.end;
    });
  }, [orgId, orders, dateRange, mockOrders]);

  // Calculate comprehensive dashboard stats
  const dashboardStats = useMemo<DashboardStats>(() => {
    if (!filteredOrders.length) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        completionRate: 0,
        peakHour: 'N/A',
        ordersByStatus: {
          'pending payment': 0,
          accepted: 0,
          preparing: 0,
          'ready-for-pickup': 0,
          delivered: 0,
          cancelled: 0
        },
        trendData: [],
        topItems: [
          { name: 'Zinger Burger', quantity: 124, revenue: 1114.76, trend: 'up' as const, price: 8.99 },
          { name: 'Chicken Shawarma', quantity: 98, revenue: 783.02, trend: 'up' as const, price: 7.99 },
          { name: 'Loaded Fries', quantity: 86, revenue: 515.14, trend: 'up' as const, price: 5.99 },
          { name: 'Grilled Sandwich', quantity: 74, revenue: 517.26, trend: 'stable' as const, price: 6.99 },
          { name: 'Cheese Pizza Slice', quantity: 63, revenue: 314.37, trend: 'stable' as const, price: 4.99 }
        ],
        riderPerformance: []
      };
    }

    // Calculate revenue and orders
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate completion rate (delivered vs total excluding cancelled)
    const nonCancelledOrders = filteredOrders.filter(o => o.status !== 'cancelled');
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;
    const completionRate = nonCancelledOrders.length > 0 ? (deliveredOrders / nonCancelledOrders.length) * 100 : 0;

    // Find peak hour
    const hourCounts = new Array(24).fill(0);
    filteredOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour]++;
    });
    const peakHourIndex = hourCounts.indexOf(Math.max(...hourCounts));
    const peakHour = `${peakHourIndex.toString().padStart(2, '0')}:00`;

    // Group orders by status with all statuses
    const ordersByStatus = {
      'pending payment': 0,
      accepted: 0,
      preparing: 0,
      'ready-for-pickup': 0,
      delivered: 0,
      cancelled: 0
    };
    
    filteredOrders.forEach(order => {
      const status = order.status as keyof typeof ordersByStatus;
      if (ordersByStatus.hasOwnProperty(status)) {
        ordersByStatus[status]++;
      }
    });

    // Calculate trend data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const trendData = last7Days.map(date => {
      const dayOrders = filteredOrders.filter(order => 
        new Date(order.createdAt).toDateString() === date.toDateString()
      );
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayRevenue
      };
    });

    // Calculate top selling items with trends
    const itemSales = new Map<string, { quantity: number; revenue: number; price?: number }>();
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        const itemName = item.name;
        const quantity = item.quantity || 1;
        const revenue = (item.price || 0) * quantity;
        
        const current = itemSales.get(itemName) || { quantity: 0, revenue: 0, price: item.price };
        itemSales.set(itemName, {
          quantity: current.quantity + quantity,
          revenue: current.revenue + revenue,
          price: item.price || current.price
        });
      });
    });

    const topItems = Array.from(itemSales.entries())
      .map(([name, data]) => ({ 
        name, 
        quantity: data.quantity, 
        revenue: data.revenue,
        price: data.price,
        trend: Math.random() > 0.7 ? 'up' as const : Math.random() > 0.5 ? 'down' as const : 'stable' as const
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate rider performance with late deliveries
    const riderStats = new Map<string, { 
      id: string;
      deliveries: number; 
      totalTime: number; 
      rating: number;
      lateDeliveries: number;
      revenue: number;
      status: 'available' | 'on-break' | 'unavailable';
      zone?: string;
      contact?: string;
      avatar?: string;
    }>();
    
    // Define what constitutes a late delivery (e.g., > 45 minutes)
    const LATE_DELIVERY_THRESHOLD = 45; // minutes
    
    filteredOrders
      .filter(order => order.status === 'delivered' && order.riderId)
      .forEach(order => {
        const rider = riders.find(r => r.id === order.riderId);
        if (!rider) return;
        
        const current = riderStats.get(rider.id) || { 
          id: rider.id,
          deliveries: 0, 
          totalTime: 0, 
          rating: 0,
          lateDeliveries: 0,
          revenue: 0,
          status: rider.status || 'available',
          zone: rider.zone,
          contact: rider.phone,
          avatar: rider.avatar
        };
        
        const deliveryTime = order.deliveredAt && order.createdAt 
          ? (new Date(order.deliveredAt).getTime() - new Date(order.createdAt).getTime()) / 60000
          : 0;
        
        // Check if delivery is late
        const isLate = deliveryTime > LATE_DELIVERY_THRESHOLD;
        
        riderStats.set(rider.id, {
          ...current,
          deliveries: current.deliveries + 1,
          totalTime: current.totalTime + deliveryTime,
          rating: current.rating + (order.riderRating || 3),
          lateDeliveries: current.lateDeliveries + (isLate ? 1 : 0),
          revenue: current.revenue + (order.total || 0)
        });
      });

    // Also include riders from mock data that might not have deliveries
    riders.forEach(rider => {
      if (!riderStats.has(rider.id)) {
        riderStats.set(rider.id, {
          id: rider.id,
          deliveries: 0,
          totalTime: 0,
          rating: 0,
          lateDeliveries: 0,
          revenue: 0,
          status: rider.status || 'available',
          zone: rider.zone,
          contact: rider.phone,
          avatar: rider.avatar
        });
      }
    });

    const riderPerformance = Array.from(riderStats.values())
      .map(stats => {
        const avgDeliveryTime = stats.deliveries > 0 ? stats.totalTime / stats.deliveries : 0;
        const rating = stats.deliveries > 0 ? stats.rating / stats.deliveries : 0;
        const lateDeliveryPercent = stats.deliveries > 0 ? (stats.lateDeliveries / stats.deliveries) * 100 : 0;
        const efficiency = stats.deliveries > 0 
          ? Math.max(0, Math.min(100, 100 - (lateDeliveryPercent * 0.8) - (avgDeliveryTime / 3)))
          : 50;
        
        const rider = riders.find(r => r.id === stats.id);
        
        return {
          id: stats.id,
          name: rider?.name || 'Unknown Rider',
          deliveries: stats.deliveries,
          avgDeliveryTime,
          rating,
          lateDeliveries: stats.lateDeliveries,
          lateDeliveryPercent,
          revenue: stats.revenue,
          status: stats.status,
          efficiency,
          zone: stats.zone,
          contact: stats.contact,
          avatar: stats.avatar
        };
      })
      .sort((a, b) => b.deliveries - a.deliveries);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      completionRate,
      peakHour,
      ordersByStatus,
      trendData,
      topItems,
      riderPerformance
    };
  }, [filteredOrders, riders]);

  // Calculate peak hours data
  const peakHours = useMemo<PeakHourData[]>(() => {
    const hourCounts = new Array(24).fill(0);
    filteredOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour]++;
    });
    
    return hourCounts.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      orders: count
    }));
  }, [filteredOrders]);

  // Calculate rider summary
  const riderSummary = useMemo(() => {
    const riders = dashboardStats.riderPerformance.filter(r => r.deliveries > 0);
    if (riders.length === 0) {
      return {
        avgDeliveryTime: 0,
        ordersPerRider: 0,
        lateDeliveryPercent: 0,
        efficiencyScore: 0
      };
    }
    
    const avgDeliveryTime = riders.reduce((sum, r) => sum + r.avgDeliveryTime, 0) / riders.length;
    const ordersPerRider = riders.reduce((sum, r) => sum + r.deliveries, 0) / riders.length;
    const lateDeliveryPercent = riders.reduce((sum, r) => sum + r.lateDeliveryPercent, 0) / riders.length;
    const efficiencyScore = riders.reduce((sum, r) => sum + r.efficiency, 0) / riders.length;
    
    return {
      avgDeliveryTime,
      ordersPerRider,
      lateDeliveryPercent,
      efficiencyScore
    };
  }, [dashboardStats.riderPerformance]);

  // Sort riders based on selected criteria
  const sortedRiders = useMemo(() => {
    const riders = [...dashboardStats.riderPerformance];
    switch(sortBy) {
      case 'deliveries':
        return riders.sort((a, b) => b.deliveries - a.deliveries);
      case 'avgTime':
        return riders.sort((a, b) => a.avgDeliveryTime - b.avgDeliveryTime);
      case 'rating':
        return riders.sort((a, b) => b.rating - a.rating);
      default:
        return riders;
    }
  }, [dashboardStats.riderPerformance, sortBy]);

  // Get range label
  const rangeLabel = useMemo(() => {
    switch(selectedPeriod) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'custom': return 'Custom Range';
      default: return 'Selected Period';
    }
  }, [selectedPeriod]);

  // Handle custom date selection
  const handleCustomDateApply = () => {
    setSelectedPeriod('custom');
    setShowCustomDatePicker(false);
  };

  const handleQuickDateSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setCustomStartDate(start);
    setCustomEndDate(end);
    setSelectedPeriod('custom');
    setShowCustomDatePicker(false);
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatTime = (minutes: number) => {
    return `${Math.round(minutes)} min`;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'on-break': return 'bg-yellow-100 text-yellow-700';
      case 'unavailable': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch(status) {
      case 'pending payment': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-purple-100 text-purple-700';
      case 'ready-for-pickup': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch(status) {
      case 'pending payment': return <Clock size={14} />;
      case 'accepted': return <CheckCircle size={14} />;
      case 'preparing': return <ChefHat size={14} />;
      case 'ready-for-pickup': return <Package size={14} />;
      case 'delivered': return <Truck size={14} />;
      case 'cancelled': return <AlertCircle size={14} />;
      default: return <Package size={14} />;
    }
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5 mt-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={12} 
            className={`${i < fullStars ? 'fill-yellow-400 text-yellow-400' : 
                        i === fullStars && hasHalfStar ? 'fill-yellow-400 text-yellow-400 opacity-50' : 
                        'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="flex-1 bg-gray-50 flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kitchen Dashboard</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDateRange()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RefreshCw size={20} className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-20">
          {/* Period Selector with Custom Date */}
          <div className="px-5 pt-4 pb-2">
            <div className="bg-white rounded-xl p-1 flex gap-1 shadow-sm flex-wrap">
              {(['today', 'week', 'month', 'custom'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => {
                    if (period === 'custom') {
                      setShowCustomDatePicker(true);
                    } else {
                      setSelectedPeriod(period);
                    }
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedPeriod === period && period !== 'custom'
                      ? 'bg-red-600 text-white shadow-sm'
                      : period === 'custom' && selectedPeriod === 'custom'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'Custom'}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Picker Modal */}
          {showCustomDatePicker && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowCustomDatePicker(false)}>
              <div className="bg-white rounded-t-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Select Date Range</h3>
                  <button onClick={() => setShowCustomDatePicker(false)} className="p-1">
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Quick Select Options */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-3">Quick Select</p>
                  <div className="flex gap-2">
                    {[
                      { label: 'Last 7 days', days: 7 },
                      { label: 'Last 14 days', days: 14 },
                      { label: 'Last 30 days', days: 30 },
                      { label: 'Last 90 days', days: 90 }
                    ].map((option) => (
                      <button
                        key={option.days}
                        onClick={() => handleQuickDateSelect(option.days)}
                        className="px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Date Inputs */}
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate.toISOString().split('T')[0]}
                      onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customEndDate.toISOString().split('T')[0]}
                      onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => setShowCustomDatePicker(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomDateApply}
                    className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Selector */}
          <div className="px-5 pb-4">
            <div className="flex gap-2">
              {(['overview', 'analytics', 'riders'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                    selectedView === view
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {view === 'overview' ? 'Overview' : view === 'analytics' ? 'Analytics' : 'Riders'}
                </button>
              ))}
            </div>
          </div>

          {selectedView === 'overview' && (
            <>
              {/* KPI Cards */}
              <div className="px-5 grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Total Orders</span>
                    <ShoppingBag size={16} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg {formatCurrency(dashboardStats.averageOrderValue)}/order
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Revenue</span>
                    <DollarSign size={16} className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardStats.totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(dashboardStats.completionRate)} completed
                  </p>
                </div>
              </div>

              {/* Order Status Summary - Enhanced with all statuses */}
              <div className="px-5 mt-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Package size={16} className="text-gray-500" />
                    Order Status
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(dashboardStats.ordersByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getOrderStatusIcon(status)}
                          <span className="text-xs text-gray-600 capitalize">
                            {status === 'ready-for-pickup' ? 'Ready for Pickup' : status === 'pending payment' ? 'Pending Payment' : status}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${getOrderStatusColor(status)}`}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Peak Hours Analysis */}
              <div className="px-5 mt-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Clock size={16} className="mr-2 text-orange-500" />
                    Peak Hours Analysis
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={peakHours}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="orders" stroke="#F97316" fill="#FED7AA" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                      Peak hour: <span className="font-semibold text-orange-600">
                        {peakHours.reduce((max, curr) => curr.orders > max.orders ? curr : max, peakHours[0])?.hour || 'N/A'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Best Selling Dishes - Updated to match screenshot style */}
              <div className="px-5 mt-6 mb-6">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                          <Flame size={20} className="text-orange-500" />
                          Best Selling Dishes
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{rangeLabel}</p>
                      </div>
                      <TrendingUpIcon size={20} className="text-green-500" />
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {dashboardStats.topItems.map((item, index) => (
                      <div key={item.name} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-8 text-center">
                              <span className={`text-lg font-bold ${
                                index === 0 ? 'text-yellow-500' : 
                                index === 1 ? 'text-gray-400' : 
                                index === 2 ? 'text-orange-400' : 'text-gray-500'
                              }`}>#{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800">{item.name}</span>
                                <div className="flex items-center gap-2">
                                  {item.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                                  {item.trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-green-500 rounded-full"
                                      style={{ width: `${(item.quantity / (dashboardStats.topItems[0]?.quantity || 1)) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {((item.quantity / (dashboardStats.topItems[0]?.quantity || 1)) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                                    <span className="text-xs text-gray-500">sold</span>
                                  </div>
                                  {item.price && (
                                    <p className="text-xs text-gray-400">{formatCurrency(item.price)} each</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {dashboardStats.topItems.length === 0 && (
                    <div className="p-8 text-center">
                      <Utensils size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No items sold in this period</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {selectedView === 'analytics' && (
            <>
              {/* Trend Chart */}
              <div className="px-5">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardStats.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="orders" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="px-5 mt-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardStats.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="px-5 mt-4 mb-6">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Order Value</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(dashboardStats.averageOrderValue)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatPercentage(dashboardStats.completionRate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Items</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {dashboardStats.topItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Riders</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {dashboardStats.riderPerformance.filter(r => r.status === 'available').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedView === 'riders' && (
            <>
              {/* Rider Section */}
              <div className="px-5 mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Truck size={18} className="text-indigo-500 mr-2" />
                    Rider Performance
                  </h3>
                  <div className="flex items-center gap-2">

                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {rangeLabel}
                    </span>
                  </div>
                </div>

                {/* Rider Summary Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-3 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <Timer size={14} className="opacity-80" />
                      <span className="text-xs opacity-80">Avg Delivery</span>
                    </div>
                    <p className="text-xl font-bold">{formatTime(riderSummary.avgDeliveryTime)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-3 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <Users size={14} className="opacity-80" />
                      <span className="text-xs opacity-80">Orders/Rider</span>
                    </div>
                    <p className="text-xl font-bold">{riderSummary.ordersPerRider.toFixed(1)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-3 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <AlertCircle size={14} className="opacity-80" />
                      <span className="text-xs opacity-80">Late Delivery</span>
                    </div>
                    <p className="text-xl font-bold">{riderSummary.lateDeliveryPercent.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-3 text-white">
                    <div className="flex items-center justify-between mb-1">
                      <Gauge size={14} className="opacity-80" />
                      <span className="text-xs opacity-80">Efficiency</span>
                    </div>
                    <p className="text-xl font-bold">{riderSummary.efficiencyScore.toFixed(0)}%</p>
                  </div>
                </div>

                {/* Rider List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {sortedRiders.length > 0 ? (
                    <div>
                      {sortedRiders.map((rider, index) => (
                        <div 
                          key={rider.id} 
                          className={`p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer ${
                            selectedRider === rider.id ? 'bg-indigo-50' : ''
                          }`}
                          onClick={() => setSelectedRider(selectedRider === rider.id ? null : rider.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                index === 0 ? 'bg-yellow-100' : 'bg-indigo-100'
                              }`}>
                                <span className="text-sm font-bold text-indigo-600">
                                  {rider.avatar || rider.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-800">{rider.name}</p>
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(rider.status)}`}>
                                    {rider.status === 'available' ? 'Available' : rider.status === 'on-break' ? 'On Break' : 'Unavailable'}
                                  </span>
                                </div>
                                {/* {getRatingStars(rider.rating)} */}
                              </div>
                            </div>

                          </div>
                          
                          {/* Expanded Details */}
                          {selectedRider === rider.id && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                                <div>
                                  <p className="text-gray-500">Avg Time</p>
                                  <p className="font-semibold text-gray-800">{formatTime(rider.avgDeliveryTime)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Late %</p>
                                  <p className={`font-semibold ${rider.lateDeliveryPercent > 15 ? 'text-red-600' : 'text-green-600'}`}>
                                    {rider.lateDeliveryPercent.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Orders Delivered</p>
                                  <p className="font-semibold text-gray-800">{rider.deliveries}</p>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-xs">
                                {/* <div className="flex items-center gap-2">
                                  <MapPin size={12} className="text-gray-400" />
                                  <span className="text-gray-600">{rider.zone || 'All Zones'}</span>
                                </div> */}
                                {/* rider.contact &&  */}

                                {/* <div className="flex items-center gap-2">
                                  <Phone size={12} className="text-gray-400" />
                                  <span className="text-gray-600">{rider.contact || 'N/A'}</span>
                                </div> */}
                              </div>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                  <span>Efficiency</span>
                                  <span>{rider.efficiency.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-green-500 h-1.5 rounded-full" 
                                    style={{ width: `${rider.efficiency}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Truck size={32} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No rider data available</p>
                    </div>
                  )}
                </div>

                {/* Rider Performance Chart */}
                {dashboardStats.riderPerformance.filter(r => r.deliveries > 0).length > 0 && (
                  <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance Comparison</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardStats.riderPerformance.filter(r => r.deliveries > 0).slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                          <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="deliveries" name="Deliveries" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="avgDeliveryTime" name="Avg Time (min)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <KitchenBottomNav />
      </div>
    </MobileLayout>
  );
}