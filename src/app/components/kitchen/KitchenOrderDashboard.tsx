import React, { useMemo, useState, useEffect } from "react";
import {
  Bell, TrendingUp, Clock, ChefHat, Users, ShoppingBag,
  Eye, DollarSign, Calendar, Filter, Printer, Download,
  AlertCircle, CheckCircle, RefreshCw, Truck, Award, Flame,
  TrendingDown, Activity, BarChart3, MoreVertical, Star, Timer, 
  AlertTriangle, Gauge, Navigation, Phone, Package, Utensils, 
  Bike, MapPin, X, ChevronLeft, ChevronRight, PieChart,
  GitCompare, Zap, User, UserCheck, UserX, UserMinus, ChevronDown
} from "lucide-react";
import { MobileLayout } from "../shared/MobileLayout";
import { KitchenBottomNav } from "./KitchenBottomNav";
import { useApp } from "../../context/AppContext";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, 
  Pie, Cell, AreaChart, Area, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

// Types
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
}

interface RiderPerformance {
  id: string;
  name: string;
  phone?: string;
  deliveries: number;
  avgDeliveryTime: number;
  rating: number;
  lateDeliveries: number;
  lateDeliveryPercent: number;
  revenue: number;
  status: 'available' | 'on-break' | 'unavailable';
  efficiency: number;
  zone?: string;
  totalOrders: number;
  delivered: number;
  cancelled: number;
  pending: number;
  active: number;
  onTimeRate?: number;
}

interface PeakHourData {
  hour: string;
  orders: number;
}

// Mock Riders Data
const mockRiders = [
  {
    id: 'r1',
    name: 'John Doe',
    phone: '+1 234-567-8901',
    zone: 'Downtown',
    status: 'available' as const,
    deliveries: 156,
    avgDeliveryTime: 28,
    lateDeliveries: 8,
    revenue: 4680,
    efficiency: 92,
    totalOrders: 172,
    delivered: 156,
    cancelled: 4,
    pending: 8,
    active: 4,
    onTimeRate: 85
  },
  {
    id: 'r2',
    name: 'Sarah Johnson',
    phone: '+1 234-567-8902',
    zone: 'Uptown',
    status: 'available' as const,
    deliveries: 142,
    avgDeliveryTime: 24,
    lateDeliveries: 4,
    revenue: 4260,
    efficiency: 95,
    totalOrders: 158,
    delivered: 142,
    cancelled: 2,
    pending: 10,
    active: 4,
    onTimeRate: 92
  },
  {
    id: 'r3',
    name: 'Mike Wilson',
    phone: '+1 234-567-8903',
    zone: 'East Side',
    status: 'unavailable' as const,
    deliveries: 98,
    avgDeliveryTime: 32,
    lateDeliveries: 12,
    revenue: 2940,
    efficiency: 82,
    totalOrders: 112,
    delivered: 98,
    cancelled: 8,
    pending: 4,
    active: 2,
    onTimeRate: 70
  },
  {
    id: 'r4',
    name: 'Emma Davis',
    phone: '+1 234-567-8904',
    zone: 'West Side',
    status: 'available' as const,
    deliveries: 134,
    avgDeliveryTime: 26,
    lateDeliveries: 6,
    revenue: 4020,
    efficiency: 90,
    totalOrders: 148,
    delivered: 134,
    cancelled: 5,
    pending: 6,
    active: 3,
    onTimeRate: 88
  },
  {
    id: 'r5',
    name: 'Chris Brown',
    phone: '+1 234-567-8905',
    zone: 'North End',
    status: 'on-break' as const,
    deliveries: 67,
    avgDeliveryTime: 38,
    lateDeliveries: 14,
    revenue: 2010,
    efficiency: 75,
    totalOrders: 82,
    delivered: 67,
    cancelled: 9,
    pending: 4,
    active: 2,
    onTimeRate: 62
  },
  {
    id: 'r6',
    name: 'Lisa Martinez',
    phone: '+1 234-567-8906',
    zone: 'South Park',
    status: 'available' as const,
    deliveries: 178,
    avgDeliveryTime: 22,
    lateDeliveries: 3,
    revenue: 5340,
    efficiency: 97,
    totalOrders: 195,
    delivered: 178,
    cancelled: 3,
    pending: 10,
    active: 4,
    onTimeRate: 96
  }
];

// Generate mock orders
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
  const { currentUser, orders: contextOrders, dishes, riders: contextRiders } = useApp();
  const orgId = currentUser?.orgId;
  const branchId = currentUser?.branchId;
  
  // Use mock data if context data is empty
  const [mockOrders] = useState(generateMockOrders());
  const [mockRidersData] = useState(mockRiders);
  
  const orders = contextOrders?.length ? contextOrders : mockOrders;
  const riders = contextRiders?.length ? contextRiders : mockRidersData;
  const isLoading = !orders.length;
  
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Date range calculation
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

  // Calculate dashboard stats
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
        topItems: [],
        riderPerformance: riders.map(rider => ({
          id: rider.id,
          name: rider.name,
          phone: (rider as any).phone,
          deliveries: 0,
          avgDeliveryTime: 0,
          rating: 0,
          lateDeliveries: 0,
          lateDeliveryPercent: 0,
          revenue: 0,
          status: (rider as any).status || 'available',
          efficiency: 0,
          zone: (rider as any).zone,
          totalOrders: 0,
          delivered: 0,
          cancelled: 0,
          pending: 0,
          active: 0,
          onTimeRate: 0
        }))
      };
    }

    // Calculate revenue and orders
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate completion rate
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

    // Group orders by status
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

    // Calculate trend data
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

    // Calculate top items
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

    // Calculate rider performance with order counts
    const riderPerformance = riders.map(rider => {
      const riderOrders = filteredOrders.filter(o => o.riderId === rider.id);
      const deliveredOrdersCount = riderOrders.filter(o => o.status === 'delivered').length;
      const cancelledOrdersCount = riderOrders.filter(o => o.status === 'cancelled').length;
      const pendingOrdersCount = riderOrders.filter(o => o.status === 'pending payment' || o.status === 'accepted').length;
      const activeOrdersCount = riderOrders.filter(o => o.status === 'preparing' || o.status === 'ready-for-pickup').length;
      
      const deliveryTimes = riderOrders
        .filter(o => o.status === 'delivered' && o.deliveredAt)
        .map(o => {
          const start = new Date(o.createdAt).getTime();
          const end = new Date(o.deliveredAt!).getTime();
          return (end - start) / 60000;
        });
      
      const avgDeliveryTime = deliveryTimes.length > 0 
        ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length 
        : 0;
      
      const lateDeliveries = deliveryTimes.filter(t => t > 45).length;
      const lateDeliveryPercent = deliveredOrdersCount > 0 ? (lateDeliveries / deliveredOrdersCount) * 100 : 0;
      
      const onTimeDeliveries = deliveryTimes.filter(t => t <= 30).length;
      const onTimeRate = deliveredOrdersCount > 0 ? (onTimeDeliveries / deliveredOrdersCount) * 100 : 0;
      
      // Calculate efficiency based on multiple factors
      const efficiency = deliveredOrdersCount > 0 
        ? Math.min(100, Math.max(0, 
            (onTimeRate * 0.4) + 
            (100 - (lateDeliveryPercent * 0.3)) + 
            (Math.min(100, (100 - (avgDeliveryTime / 2))) * 0.3)
          ))
        : 50;
      
      return {
        id: rider.id,
        name: rider.name,
        phone: (rider as any).phone,
        deliveries: deliveredOrdersCount,
        avgDeliveryTime,
        rating: (rider as any).rating || 4.5,
        lateDeliveries,
        lateDeliveryPercent,
        revenue: riderOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        status: (rider as any).status || 'available',
        efficiency,
        zone: (rider as any).zone,
        totalOrders: riderOrders.length,
        delivered: deliveredOrdersCount,
        cancelled: cancelledOrdersCount,
        pending: pendingOrdersCount,
        active: activeOrdersCount,
        onTimeRate
      };
    });

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

  // Calculate peak hours
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

  // Get selected rider data
  const selectedRiderData = dashboardStats.riderPerformance.find(r => r.id);

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

  // Handle custom date
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

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'available': return <UserCheck size={16} className="text-green-600" />;
      case 'on-break': return <UserMinus size={16} className="text-yellow-600" />;
      case 'unavailable': return <UserX size={16} className="text-gray-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEfficiencyBgColor = (efficiency: number) => {
    if (efficiency >= 90) return 'bg-green-500';
    if (efficiency >= 70) return 'bg-orange-500';
    return 'bg-red-500';
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

  // Handle refresh
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
              <p className="text-xs text-gray-500 mt-0.5">{formatDateRange()}</p>
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
          {/* Period Selector */}
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
                
                <div className="p-4 border-b border-gray-Kitchen Dashboard100">
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

              {/* Order Status Summary */}
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

              {/* Best Selling Dishes */}
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
                      <TrendingUp size={20} className="text-green-500" />
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
            <div className="px-5 mt-2 pb-6">
              {/* Single Rider Performance Section */}
              <div className="space-y-4">
                {/* Rider List - no selector */}

                {/* Single Rider Performance Card */}
                {selectedRiderData ? (
                  <><div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
                          {selectedRiderData.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedRiderData.name}</h3>
                          <p className="text-sm text-gray-500">{selectedRiderData.phone ?? '+0000000000'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Pending</span>
                            <span className="text-sm font-bold text-orange-600">{selectedRiderData.pending}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Delivered</span>
                            <span className="text-sm font-bold text-emerald-600">{selectedRiderData.delivered}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Rejected</span>
                            <span className="text-sm font-bold text-blue-600">{Math.max(0, selectedRiderData.totalOrders - (selectedRiderData.delivered + selectedRiderData.cancelled + selectedRiderData.pending))}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Cancelled</span>
                            <span className="text-sm font-bold text-red-600">{selectedRiderData.cancelled}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div className="relative w-28 h-28">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                              <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                stroke="#22C55E"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${(2 * Math.PI * 42).toFixed(2)}`}
                                strokeDashoffset={`${((1 - Math.min(1, selectedRiderData.delivered / Math.max(1, selectedRiderData.totalOrders))) * 2 * Math.PI * 42).toFixed(2)}`}
                                transform="rotate(-90 50 50)" />
                            </svg>
                            <div className="absolute inset-0 grid place-items-center">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{selectedRiderData.totalOrders}</p>
                                <p className="text-xs text-gray-500">Total</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div><div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-700">
                            {selectedRiderData.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedRiderData.name}</h3>
                            <p className="text-sm text-gray-500">{selectedRiderData.phone ?? '+0000000000'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Pending</span>
                              <span className="text-sm font-bold text-orange-600">{selectedRiderData.pending}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Delivered</span>
                              <span className="text-sm font-bold text-emerald-600">{selectedRiderData.delivered}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Rejected</span>
                              <span className="text-sm font-bold text-blue-600">{Math.max(0, selectedRiderData.totalOrders - (selectedRiderData.delivered + selectedRiderData.cancelled + selectedRiderData.pending))}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">Cancelled</span>
                              <span className="text-sm font-bold text-red-600">{selectedRiderData.cancelled}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="relative w-28 h-28">
                              <svg viewBox="0 0 100 100" className="w-full h-full">
                                <circle cx="50" cy="50" r="42" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="42"
                                  stroke="#22C55E"
                                  strokeWidth="12"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeDasharray={`${(2 * Math.PI * 42).toFixed(2)}`}
                                  strokeDashoffset={`${((1 - Math.min(1, selectedRiderData.delivered / Math.max(1, selectedRiderData.totalOrders))) * 2 * Math.PI * 42).toFixed(2)}`}
                                  transform="rotate(-90 50 50)" />
                              </svg>
                              <div className="absolute inset-0 grid place-items-center">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-gray-900">{selectedRiderData.totalOrders}</p>
                                  <p className="text-xs text-gray-500">Total</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div></>
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                    <User size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Select a rider to view detailed performance metrics</p>
                    <p className="text-xs text-gray-400 mt-2">Click the dropdown above to choose a rider</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <KitchenBottomNav />
      </div>
    </MobileLayout>
  );
}