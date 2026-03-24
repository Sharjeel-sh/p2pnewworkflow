import React, { useMemo, useState } from "react";
import {
  Bell,
  Star,
  TrendingUp,
  Clock,
  ChefHat,
  Users,
  ShoppingBag,
  Eye,
  MessageCircle,
  ThumbsUp,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Printer,
  Download,
  Settings,
  Coffee,
  Pizza,
  Salad,
  Fish,
  Beef,
  Award,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  CreditCard,
  Smartphone,
  Watch,
  Zap,
  Flame,
  Heart,
  Share2,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  User,
  Package,
  Truck,
  Home,
  Briefcase
} from "lucide-react";
import { MobileLayout } from "../shared/MobileLayout";
import { KitchenBottomNav } from "./KitchenBottomNav";
import { useApp } from "../../context/AppContext";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

export function KitchenOrderDashboard() {
  const { currentUser, orders, dishes } = useApp();
  const orgId = currentUser?.orgId;
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showFilters, setShowFilters] = useState(false);

  const orgOrders = useMemo(() => {
    if (!orgId) return [];
    return orders.filter(o => o.orgId === orgId);
  }, [orgId, orders]);

  const dateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now.toDateString());
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    if (selectedTimeRange === "week") {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { start, end: endOfToday };
    }

    if (selectedTimeRange === "month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start, end: endOfToday };
    }

    if (selectedTimeRange === "year") {
      const start = new Date(today.getFullYear(), 0, 1);
      return { start, end: endOfToday };
    }

    if (selectedTimeRange === "custom") {
      const start = customStartDate ? new Date(customStartDate) : today;
      const end = customEndDate ? new Date(customEndDate) : endOfToday;
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    return { start: today, end: endOfToday };
  }, [selectedTimeRange, customStartDate, customEndDate]);

  const rangeOrders = useMemo(() => {
    const { start, end } = dateRange;
    return orgOrders.filter(o => {
      const created = new Date(o.createdAt);
      return created >= start && created <= end;
    });
  }, [orgOrders, dateRange]);

  const rangeLabel = useMemo(() => {
    if (selectedTimeRange === "today") return "Today";
    if (selectedTimeRange === "week") return "Last 7 days";
    if (selectedTimeRange === "month") return "Month to date";
    if (selectedTimeRange === "year") return "Year to date";
    if (selectedTimeRange === "custom") return `${customStartDate} → ${customEndDate}`;
    return "Custom";
  }, [selectedTimeRange, customStartDate, customEndDate]);

  /* ---------------- MOCK DATA FOR FALLBACK ---------------- */
  const mockBestSelling = [
    { name: "Zinger Burger", qty: 124, price: 5 },
    { name: "Chicken Shawarma", qty: 98, price: 6 },
    { name: "Loaded Fries", qty: 86, price: 4 },
    { name: "Grilled Sandwich", qty: 74, price: 5 },
    { name: "Cheese Pizza Slice", qty: 63, price: 7 }
  ];

  const mockRecentOrders = [
    {
      id: "ORD1001",
      total: 18,
      status: "pending",
      createdAt: new Date(),
      items: [{ name: "Burger" }, { name: "Fries" }]
    },
    {
      id: "ORD1002",
      total: 22,
      status: "preparing",
      createdAt: new Date(),
      items: [{ name: "Pizza" }]
    },
    {
      id: "ORD1003",
      total: 12,
      status: "ready",
      createdAt: new Date(),
      items: [{ name: "Sandwich" }]
    }
  ];

  const stats = useMemo(() => {
    if (!orgId) return null;

    const filtered = rangeOrders;

    const totalRevenue = filtered.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrder = filtered.length ? (totalRevenue / filtered.length).toFixed(2) : "0.00";

    const productMap: Record<string, number> = {};
    filtered.forEach(order => {
      order.items?.forEach(item => {
        const name = (item as any)?.name || "Unknown";
        const qty = (item as any)?.quantity || 0;
        productMap[name] = (productMap[name] || 0) + qty;
      });
    });

    const bestSelling = Object.entries(productMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      total: filtered.length,
      new: filtered.filter(o => o.status === "pending").length,
      processing: filtered.filter(o => o.status === "preparing").length,
      ready: filtered.filter(o => o.status === "ready").length,
      delivered: filtered.filter(o => o.status === "delivered").length,
      rejected: filtered.filter(o => (o.status as any) === "rejected").length,
      cancelled: filtered.filter(o => (o.status as any) === "cancelled").length,
      revenue: totalRevenue,
      todayRevenue: totalRevenue,
      avgOrder,
      bestSelling
    };
  }, [orgId, rangeOrders]);

  const bestSellingEnhanced = useMemo(() => {
    if (!orgId || !dishes) return mockBestSelling;

    const sales: Record<string, number> = {};
    rangeOrders
      .filter(o => o.status === "delivered")
      .forEach(order => {
        order.items?.forEach(item => {
          const name = (item as any)?.name || "Unknown";
          const qty = (item as any)?.quantity || 0;
          sales[name] = (sales[name] || 0) + qty;
        });
      });

    const result = Object.entries(sales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return result.length > 0 ? result : mockBestSelling;
  }, [orgId, orders, dishes]);

  const recentOrders = useMemo(() => {
    if (!orgId) return mockRecentOrders;

    const result = orders
      .filter(o => o.orgId === orgId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return result.length > 0 ? result : mockRecentOrders;
  }, [orgId, orders]);

  const menuAlerts = useMemo(() => {
    if (!orgId || !dishes) return [];
    return dishes
      .filter(item => item.orgId === orgId && (item as any).stock < 10)
      .slice(0, 3);
  }, [orgId, dishes]);

  const orderTrends = useMemo(() => {
    if (!orgId) return { increase: 0, percentage: 0 };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayOrders = orders.filter(o =>
      o.orgId === orgId &&
      new Date(o.createdAt).toDateString() === today.toDateString()
    ).length;

    const yesterdayOrders = orders.filter(o =>
      o.orgId === orgId &&
      new Date(o.createdAt).toDateString() === yesterday.toDateString()
    ).length;

    const increase = todayOrders - yesterdayOrders;
    const percentage = yesterdayOrders ? (increase / yesterdayOrders) * 100 : 0;

    return { increase, percentage };
  }, [orgId, orders]);

  const peakHours = useMemo(() => {
    const hourCounts: Record<number, number> = {};
    orgOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHourEntry = Object.entries(hourCounts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))[0];

    return peakHourEntry ? `${peakHourEntry[0]}:00` : "12:00";
  }, [orgOrders]);

  const last7Days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, idx) => {
      const dt = new Date(today);
      dt.setDate(today.getDate() - 6 + idx);
      return dt;
    });
  }, []);

  const revenueTrendData = useMemo(() => {
    return last7Days.map(dt => {
      const day = dt.toISOString().slice(5, 10);
      const revenue = rangeOrders
        .filter(o => new Date(o.createdAt).toDateString() === dt.toDateString())
        .reduce((sum, o) => sum + (o.total || 0), 0);
      return { day, revenue };
    });
  }, [last7Days, rangeOrders]);

  const dailyOrdersData = useMemo(() => {
    return last7Days.map(dt => {
      const day = dt.toISOString().slice(5, 10);
      const ordersCount = rangeOrders.filter(o => new Date(o.createdAt).toDateString() === dt.toDateString()).length;
      return { day, orders: ordersCount };
    });
  }, [last7Days, rangeOrders]);

  const statusData = useMemo(() => {
    const completed = stats?.delivered ?? 0;
    const cancelled = stats?.cancelled ?? 0;
    return [
      { name: "Completed", value: completed, color: "#34D399" },
      { name: "Cancelled", value: cancelled, color: "#F87171" },
    ];
  }, [stats]);

  const peakHourHeatmap = useMemo(() => {
    const counts = Array.from({ length: 24 }, (_, h) => {
      const value = orgOrders.filter(order => new Date(order.createdAt).getHours() === h).length;
      return { hour: h, value };
    });
    const max = Math.max(...counts.map(c => c.value), 1);
    return counts.map(c => ({ ...c, intensity: c.value / max }));
  }, [orgOrders]);

  if (!stats) return null;

  return (
    <MobileLayout>
      <div className="flex-1 bg-gray-50 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="px-5 pt-6 pb-4 flex justify-between items-center bg-white border-b">
          <h1 className="text-red-600 text-2xl font-bold">P2P</h1>
          <Bell size={22} className="text-red-600" />
        </div>
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="px-5 mt-4 mb-6">
            <h2 className="text-2xl font-semibold text-gray-400">
              {currentUser?.orgId ? `Org: ${currentUser.orgId}` : "SoftOpsHub"}
            </h2>
          </div>
          {/* Orders Card */}
          <div className="px-5">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-gray-400 font-semibold">Orders</h3>
              <p className="text-gray-400 mb-3">Totals ({rangeLabel})</p>
              <div className="text-4xl font-bold mb-6">{stats.total}</div>
              <div className="grid grid-cols-2 text-center border-t pt-4">
                <div>
                  <p className="text-gray-400">New</p>
                  <p className="text-2xl font-bold text-green-600">{stats.new}</p>
                </div>
                <div className="border-l">
                  <p className="text-gray-400">In Processing</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.processing}</p>
                </div>
              </div>
              <div className="border-t my-4"></div>
              <div className="grid grid-cols-2 text-center">
                <div>
                  <p className="text-gray-400">Ready for Delivery</p>
                  <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
                </div>
                <div className="border-l">
                  <p className="text-gray-400">Delivered</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.delivered}</p>
                </div>
              </div>
              <div className="border-t my-4"></div>
              <div className="grid grid-cols-2 text-center">
                <div>
                  <p className="text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.rejected}</p>
                </div>
                <div className="border-l">
                  <p className="text-gray-400">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
              </div>
            </div>
          </div>


          <div className="px-5 mt-4 mb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Performance</h2>
              <p className="text-gray-500 mt-1">Overview for {rangeLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedTimeRange}
                onChange={e => setSelectedTimeRange(e.target.value)}
                className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm"
              >
                <option value="today">Today</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Annual</option>
                <option value="custom">Custom Date</option>
              </select>
              {selectedTimeRange === "custom" && (
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={e => setCustomStartDate(e.target.value)}
                    className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-2"
                  />
                  <span className="text-xs text-gray-500">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={e => setCustomEndDate(e.target.value)}
                    className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-2"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="px-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-3xl p-5 shadow-sm border border-green-100">
              <p className="text-xs font-semibold text-green-700 uppercase">Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">${stats.todayRevenue.toFixed(0)}</p>
            </div>
            <div className="bg-blue-50 rounded-3xl p-5 shadow-sm border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase">Orders</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
            </div>
          </div>

          <div className="px-5 mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* Other cards */}

            {/* FULL WIDTH CARD */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-3xl shadow-lg p-4 border border-gray-100 w-full">
                <h3 className="text-gray-700 font-semibold mb-3">
                  Peak Hour Distribution
                </h3>

                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHourHeatmap}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#14B8A6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{peakHours}</p>
                  <p className="text-sm text-gray-500">Highest activity level</p>
                </div>
              </div>
            </div>

          </div>

          {/* Best Selling Dishes */}

          {/* Best Selling Dishes */}
          <div className="px-5 mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <Award size={18} className="text-yellow-500 mr-2" />
                Best Selling Dishes
              </h3>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">{rangeLabel}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4">
              {bestSellingEnhanced.length > 0 ? (
                <div className="space-y-3">
                  {bestSellingEnhanced.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 ${index === 0 ? 'bg-yellow-100' :
                          index === 1 ? 'bg-gray-100' :
                            index === 2 ? 'bg-orange-100' : 'bg-blue-50'
                          }`}>
                          <span className={`text-xs font-bold ${index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                              index === 2 ? 'text-orange-600' : 'text-blue-600'
                            }`}>
                            #{index + 1}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Flame size={14} className="text-orange-500 mr-1" />
                        <span className="text-sm font-bold text-gray-900 mr-2">{item.qty}</span>
                        <span className="text-xs text-gray-500">sold</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">No sales data yet</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="px-5 mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">Recent Orders</h3>
              <button className="text-xs text-red-600 font-medium flex items-center">
                <Eye size={12} className="mr-1" /> View All
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {recentOrders.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentOrders.map((order, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-800">Order #{order.id?.slice(-4)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.items?.length} items • ${order.total}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'ready' ? 'bg-green-100 text-green-700' :
                              order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                                order.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  order.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                                    'bg-gray-100 text-gray-700'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                        <div className="flex space-x-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <CheckCircle size={14} className="text-green-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Printer size={14} className="text-blue-500" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertical size={14} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">No recent orders</p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          {menuAlerts.length > 0 && (
            <div className="px-5 mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <AlertCircle size={18} className="text-red-500 mr-2" />
                  Low Stock Alerts
                </h3>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{menuAlerts.length} items</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4">
                {menuAlerts.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-sm font-bold text-red-600">{item.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <KitchenBottomNav />
      </div>
    </MobileLayout>
  );
}