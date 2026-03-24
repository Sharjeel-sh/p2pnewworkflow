"use client";

import React, { useMemo, useState } from "react";
import { useNavigate } from 'react-router';
import {
  Store,
  ShoppingBag,
  Bike,
  TrendingUp,
  MapPin,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Star,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { cn } from "../ui/utils";
import { useApp } from "../../context/AppContext";

type DateRange = "today" | "week" | "month";

interface KitchenInfo {
  id: string;
  name: string;
  orders: number;
  totalOrders: number;
  revenue: number;
  commission: number;
  status: "Active" | "Inactive";
  location: string;
  ordersToday: number;
  revenueToday: number;
}

interface BestSellingDish {
  name: string;
  qty: number;
  revenue: number;
  rating: number;
  revenueShare: number;
  stock: number | null;
  lowStock: boolean;
}

const COMMISSION_RATE = 0.1;

function getStartOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getRangeStart(now: Date, range: DateRange): Date {
  const todayStart = getStartOfDay(now);

  if (range === "today") return todayStart;

  if (range === "week") {
    const diffToMonday = (todayStart.getDay() + 6) % 7;
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - diffToMonday);
    return weekStart;
  }

  return new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
}

export function OrgDashboard({ showHeader = true }: { showHeader?: boolean }) {
  const navigate = useNavigate();
  const { currentUser, branches, orders, riders, dishes } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [kitchenFilter, setKitchenFilter] = useState<string>("all");
  const [expandedRider, setExpandedRider] = useState<string | null>(null);
  const [showOrdersAnalysis, setShowOrdersAnalysis] = useState<boolean>(true);

  const orgId = currentUser?.orgId;

  const data = useMemo(() => {
    if (!orgId) {
      return {
        totalKitchens: 0,
        activeKitchens: 0,
        inactiveKitchens: 0,
        totalOrders: 0,
        totalOrdersToday: 0,
        totalRiders: 0,
        activeRiders: 0,
        inactiveRiders: 0,
        delayedOrders: 0,
        totalDeliveredOrders: 0,
        totalPendingOrders: 0,
        totalCancelledOrders: 0,
        averageDeliveryMins: 0,
        riderLeaderboard: [],
        weeklyDeliveryTrend: [],
        bestSellingDishes: [],
        totalRevenue: 0,
        totalRevenueToday: 0,
        kitchens: [] as KitchenInfo[],
      };
    }

    const now = new Date();
    const todayStart = getStartOfDay(now);
    const rangeStart = getRangeStart(now, dateRange);

    const orgBranches = branches.filter((b) => b.orgId === orgId);
    const orgBranchIds = new Set(orgBranches.map((b) => b.id));

    const orgOrders = orders.filter((o) => o.orgId === orgId);
    const orgDishes = (dishes || []).filter((d) => d.orgId === orgId);

    const rangeOrders = orgOrders.filter((o) => {
      const dt = new Date(o.createdAt);
      return !Number.isNaN(dt.getTime()) && dt >= rangeStart;
    });

    const todayOrders = orgOrders.filter((o) => {
      const dt = new Date(o.createdAt);
      return !Number.isNaN(dt.getTime()) && dt >= todayStart;
    });

    const rangeDurationDays = Math.max(1, Math.ceil((todayStart.getTime() - rangeStart.getTime()) / 86400000));
    const prevRangeStart = new Date(rangeStart);
    prevRangeStart.setDate(prevRangeStart.getDate() - rangeDurationDays);

    const previousRangeOrders = orgOrders.filter((o) => {
      const dt = new Date(o.createdAt);
      return !Number.isNaN(dt.getTime()) && dt >= prevRangeStart && dt < rangeStart;
    });

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayOrders = orgOrders.filter((o) => {
      const dt = new Date(o.createdAt);
      return !Number.isNaN(dt.getTime()) && dt >= yesterdayStart && dt < todayStart;
    });

    const orgRiders = riders.filter((r) => orgBranchIds.has(r.branchId));
    const activeRiders = orgRiders.filter((r) => r.isAvailable).length;
    const inactiveRiders = orgRiders.length - activeRiders;

    const selectedBranchId = kitchenFilter === "all" ? undefined : orgBranches.find((b) => b.name === kitchenFilter)?.id;
    const branchOrders = selectedBranchId
      ? rangeOrders.filter((o) => o.branchId === selectedBranchId)
      : rangeOrders;
    const branchRiders = selectedBranchId
      ? orgRiders.filter((r) => r.branchId === selectedBranchId)
      : orgRiders;

    type RiderStat = {
      rider: typeof orgRiders[number];
      deliveries: number;
      notDelivered: number;
      revenue: number;
      totalDeliveryMinutes: number;
      deliveryCountForAvg: number;
    };

    const riderStatsMap: Record<string, RiderStat> = {};
    branchRiders.forEach((rider) => {
      riderStatsMap[rider.id] = {
        rider,
        deliveries: 0,
        notDelivered: 0,
        revenue: 0,
        totalDeliveryMinutes: 0,
        deliveryCountForAvg: 0,
      };
    });

    branchOrders.forEach((o) => {
      const riderId = o.riderId;
      if (!riderId) return;
      const stats = riderStatsMap[riderId];
      if (!stats) return;

      if (o.status === "delivered") {
        stats.deliveries += 1;
        stats.revenue += o.total;
        if (o.createdAt && o.deliveredAt) {
          const created = new Date(o.createdAt).getTime();
          const delivered = new Date(o.deliveredAt).getTime();
          if (!Number.isNaN(created) && !Number.isNaN(delivered) && delivered > created) {
            stats.totalDeliveryMinutes += (delivered - created) / 60000;
            stats.deliveryCountForAvg += 1;
          }
        }
      } else {
        stats.notDelivered += 1;
      }
    });

    const totalDelivered = Object.values(riderStatsMap).reduce((sum, stat) => sum + stat.deliveries, 0);
    const totalUndelivered = Object.values(riderStatsMap).reduce((sum, stat) => sum + stat.notDelivered, 0);
    const totalCancelled = branchOrders.reduce(
      (sum, o) => sum + ((o.status as string) === "cancelled" ? 1 : 0),
      0
    );

    const totalDeliveryMinutes = Object.values(riderStatsMap).reduce(
      (sum, stat) => sum + stat.totalDeliveryMinutes,
      0
    );
    const totalDeliveryCount = Object.values(riderStatsMap).reduce(
      (sum, stat) => sum + stat.deliveryCountForAvg,
      0
    );

    const averageDeliveryMinutes = totalDeliveryCount
      ? totalDeliveryMinutes / totalDeliveryCount
      : 0;

    const riderLeaderboard = Object.values(riderStatsMap)
      .sort((a, b) => b.deliveries - a.deliveries)
      .slice(0, 5)
      .map((stat) => ({
        id: stat.rider.id,
        name: stat.rider.name,
        branchId: stat.rider.branchId,
        deliveries: stat.deliveries,
        notDelivered: stat.notDelivered,
        revenue: stat.revenue,
        avgDeliveryMinutes: stat.deliveryCountForAvg
          ? stat.totalDeliveryMinutes / stat.deliveryCountForAvg
          : 0,
        isAvailable: stat.rider.isAvailable,
      }));

    const delayedOrders = orgOrders.filter((o) => {
      if (o.status === "delivered") return false;
      const created = new Date(o.createdAt).getTime();
      if (Number.isNaN(created)) return false;
      const minutesSinceCreated = (Date.now() - created) / 60000;
      return minutesSinceCreated > 45;
    }).length;

    const last7Days = Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date(todayStart);
      day.setDate(day.getDate() - (6 - idx));
      const label = day.toLocaleDateString(undefined, { weekday: "short" });
      const count = orgOrders.filter((o) => {
        const dt = new Date(o.createdAt);
        return (
          !Number.isNaN(dt.getTime()) &&
          dt.toDateString() === day.toDateString() &&
          o.status === "delivered"
        );
      }).length;
      return { label, count };
    });

    const mockBestSellingDishes = [
      { name: "Zinger Burger", qty: 124, revenue: 6200 },
      { name: "Chicken Shawarma", qty: 98, revenue: 5880 },
      { name: "Loaded Fries", qty: 86, revenue: 3440 },
      { name: "Grilled Sandwich", qty: 74, revenue: 3700 },
      { name: "Cheese Pizza Slice", qty: 63, revenue: 4410 },
    ];

    const previousBranchOrders = selectedBranchId
      ? previousRangeOrders.filter((o) => o.branchId === selectedBranchId)
      : previousRangeOrders;

    const calculateDishStats = (ordersArray: typeof branchOrders) =>
      ordersArray
        .filter((o) => o.status === "delivered")
        .reduce<Record<string, { name: string; qty: number; revenue: number }>>((acc, order) => {
          order.items?.forEach((item) => {
            const name = (item as any)?.dish?.name || (item as any)?.name || "Unknown";
            const qty = (item as any)?.quantity || 0;
            const price = (item as any)?.dish?.price || 0;
            if (!acc[name]) acc[name] = { name, qty: 0, revenue: 0 };
            acc[name].qty += qty;
            acc[name].revenue += qty * price;
          });
          return acc;
        }, {});

    const currentDishStats = calculateDishStats(branchOrders);
    const previousDishStats = calculateDishStats(previousBranchOrders);

    const totalDishRevenue = Object.values(currentDishStats).reduce((sum, item) => sum + item.revenue, 0);
    const currentBestDishes = Object.values(currentDishStats).sort((a, b) => b.qty - a.qty).slice(0, 5);

    const enrichedBestSellingDishes: BestSellingDish[] = (currentBestDishes.length > 0 ? currentBestDishes : mockBestSellingDishes).map((dish, idx) => {
      const framedStock = orgDishes.find((d) => d.name === dish.name);
      const stock = (framedStock as any)?.stock ?? null;
      const revenueShare = totalDishRevenue ? (dish.revenue / totalDishRevenue) * 100 : 0;
      return {
        ...dish,
        rating: Number((5 - idx * 0.2).toFixed(1)),
        revenueShare,
        stock,
        lowStock: typeof stock === "number" ? stock < 10 : false,
      };
    });

    const zingerName = "Zinger Burger";
    const currentZingerQty = currentDishStats[zingerName]?.qty ?? 0;
    const previousZingerQty = previousDishStats[zingerName]?.qty ?? 0;
    const zingerTrend = currentZingerQty > previousZingerQty ? "up" : currentZingerQty < previousZingerQty ? "down" : "flat";
    const zingerChange = previousZingerQty > 0 ? ((currentZingerQty - previousZingerQty) / previousZingerQty) * 100 : 0;

    const lowStockDishes = enrichedBestSellingDishes.filter((dish) => dish.lowStock);

    // Order category analysis
    const orderCategoryMap = branchOrders
      .filter((o) => o.status === "delivered")
      .reduce<Record<string, { category: string; orders: number; quantity: number; revenue: number }>>((acc, order) => {
        order.items?.forEach((item) => {
          const category = (item as any)?.dish?.category || "Unknown";
          const qty = (item as any)?.quantity || 0;
          const price = (item as any)?.dish?.price || 0;

          if (!acc[category]) acc[category] = { category, orders: 0, quantity: 0, revenue: 0 };
          acc[category].orders += 1;
          acc[category].quantity += qty;
          acc[category].revenue += qty * price;
        });
        return acc;
      }, {});

    const orderCategoryStats = Object.values(orderCategoryMap).sort((a, b) => b.revenue - a.revenue);

    // Repeat vs new customers (based on selected range)
    const customerOrderMap = rangeOrders.reduce<Record<string, number>>((acc, order) => {
      const phone = order.buyerPhone || order.buyerName || "unknown";
      acc[phone] = (acc[phone] || 0) + 1;
      return acc;
    }, {});
    const totalCustomers = Object.keys(customerOrderMap).length;
    const repeatCustomers = Object.values(customerOrderMap).filter((count) => count > 1).length;
    const newCustomers = totalCustomers - repeatCustomers;
    const repeatCustomerPct = totalCustomers ? (repeatCustomers / totalCustomers) * 100 : 0;
    const newCustomerPct = totalCustomers ? (newCustomers / totalCustomers) * 100 : 0;

    // Peak order times
    const hourlyOrderCounts = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
    branchOrders.forEach((order) => {
      const created = new Date(order.createdAt);
      if (!Number.isNaN(created.getTime())) {
        const hour = created.getHours();
        hourlyOrderCounts[hour].count += 1;
      }
    });
    const peakOrderTime = hourlyOrderCounts.reduce((best, entry) => (entry.count > best.count ? entry : best), hourlyOrderCounts[0]);

    const peakOrderTimeline = hourlyOrderCounts.map((entry) => ({
      hour: `${entry.hour}:00`,
      orders: entry.count,
    }));

    const kitchens: KitchenInfo[] = orgBranches.map((branch) => {
      const branchRangeOrders = rangeOrders.filter((o) => o.branchId === branch.id);
      const branchTodayOrders = todayOrders.filter((o) => o.branchId === branch.id);
      const revenue = branchRangeOrders.reduce((sum, o) => sum + o.total, 0);
      const revenueToday = branchTodayOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        id: branch.id,
        name: branch.name,
        orders: branchRangeOrders.length,
        totalOrders: branchRangeOrders.length,
        revenue,
        commission: revenue * COMMISSION_RATE,
        status: branchRangeOrders.length > 0 ? "Active" : "Inactive",
        location: branch.address,
        ordersToday: branchTodayOrders.length,
        revenueToday,
      };
    });

    return {
      totalKitchens: orgBranches.length,
      activeKitchens: kitchens.filter((k) => k.status === "Active").length,
      inactiveKitchens: kitchens.filter((k) => k.status === "Inactive").length,
      totalOrders: kitchens.reduce((sum, k) => sum + k.totalOrders, 0),
      totalOrdersToday: todayOrders.length,
      totalRiders: orgRiders.length,
      activeRiders,
      inactiveRiders,
      delayedOrders,
      totalDeliveredOrders: totalDelivered,
      totalPendingOrders: totalUndelivered,
      totalCancelledOrders: totalCancelled,
      averageDeliveryMins: averageDeliveryMinutes,
      riderLeaderboard,
      todayOrdersCount: todayOrders.length,
      yesterdayOrdersCount: yesterdayOrders.length,
      weeklyDeliveryTrend: last7Days,
      bestSellingDishes: enrichedBestSellingDishes,
      zingerTrend: {
        currentQty: currentZingerQty,
        previousQty: previousZingerQty,
        direction: zingerTrend,
        changePct: Number(zingerChange.toFixed(1)),
      },
      lowStockDishes,
      dishRevenueChart: enrichedBestSellingDishes.map((dish) => ({
        name: dish.name,
        qty: dish.qty,
        revenue: dish.revenue,
      })),
      orderCountChart: enrichedBestSellingDishes.map((dish) => ({
        name: dish.name,
        qty: dish.qty,
      })),
      orderCategoryStats,
      repeatCustomerStats: {
        repeat: repeatCustomers,
        new: newCustomers,
        repeatPct: Number(repeatCustomerPct.toFixed(1)),
        newPct: Number(newCustomerPct.toFixed(1)),
      },
      peakOrderTimeline,
      peakOrderTime,
      totalRevenue: kitchens.reduce((sum, k) => sum + k.revenue, 0),
      totalRevenueToday: todayOrders.reduce((sum, o) => sum + o.total, 0),
      kitchens,
    };
  }, [orgId, branches, orders, riders, dateRange, kitchenFilter]);

  const filteredKitchens = useMemo(() => {
    if (kitchenFilter === "all") return data.kitchens;
    return data.kitchens.filter((k) => k.name === kitchenFilter);
  }, [data.kitchens, kitchenFilter]);

  const totalRevenue = filteredKitchens.reduce((sum, k) => sum + k.revenue, 0);
  const totalCommission = filteredKitchens.reduce((sum, k) => sum + k.commission, 0);
  const netRevenue = totalRevenue - totalCommission;
  const totalOrders = filteredKitchens.reduce((sum, k) => sum + k.totalOrders, 0);
  const ordersToday = filteredKitchens.reduce((sum, k) => sum + k.ordersToday, 0);
  const todaysRevenue = filteredKitchens.reduce((sum, k) => sum + k.revenueToday, 0);

  const formatCurrency = (amount: number) => `Rs. ${Math.round(amount).toLocaleString()}`;

  const formatMinutes = (mins: number) => {
    if (!mins || Number.isNaN(mins)) return "—";
    const hours = Math.floor(mins / 60);
    const minutes = Math.round(mins % 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const topDishMaxQty = data.bestSellingDishes && data.bestSellingDishes.length
    ? Math.max(...data.bestSellingDishes.map((d: any) => d.qty))
    : 1;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      {showHeader && (
        <div className="bg-white px-4 pt-4 pb-2 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-500">Manage your kitchens & track performance</p>
          </div>
        </div>
      )}

      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
            <SelectTrigger className="flex-1 h-9 bg-gray-50 border-gray-200 text-sm">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {data.kitchens.map((k) => (
                <SelectItem key={k.id} value={k.name}>
                  {k.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-32 h-9 bg-gray-50 border-gray-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} />
              <span className="text-sm font-medium opacity-90">Total Revenue</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {dateRange === "today" ? "Today" : dateRange === "week" ? "This Week" : "This Month"}
            </span>
          </div>
          <p className="text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center gap-4 text-sm opacity-80">
            <span>Commission: {formatCurrency(totalCommission)}</span>
            <span>•</span>
            <span>Net: {formatCurrency(netRevenue)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Store size={16} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{filteredKitchens.length === data.kitchens.length ? data.totalKitchens : filteredKitchens.length}</p>
            <p className="text-xs text-gray-500">Total Branches</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-0.5 text-xs text-red-700">
                <CheckCircle2 size={10} /> {filteredKitchens.filter((k) => k.status === "Active").length} Active
              </span>
              <span className="flex items-center gap-0.5 text-xs text-red-700">
                <XCircle size={10} /> {filteredKitchens.filter((k) => k.status === "Inactive").length} Inactive
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <ShoppingBag size={16} className="text-red-700" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-xs text-red-700 mt-1.5">+{ordersToday} today</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Bike size={16} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{data.totalRiders}</p>
            <p className="text-xs text-gray-500">Total Riders</p>
            <p className="text-xs text-purple-600 mt-1.5">
              {data.activeRiders} active · {data.inactiveRiders} inactive
            </p>
          </div>


        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Branch Performance</h3>
            <span className="text-xs text-gray-400">{filteredKitchens.length} branches</span>
          </div>

          <div className="space-y-2.5">
            {filteredKitchens.map((kitchen) => (
              <div key={kitchen.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{kitchen.name}</h4>
                      <span
                        className={cn(
                          "shrink-0 w-1.5 h-1.5 rounded-full",
                          kitchen.status === "Active" ? "bg-red-600" : "bg-red-600"
                        )}
                      />
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {kitchen.location}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400">Orders</p>
                    <p className="text-sm font-semibold text-gray-900">{kitchen.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(kitchen.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Net</p>
                    <p className="text-sm font-semibold text-red-700">
                      {formatCurrency(kitchen.revenue - kitchen.commission)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Analysis */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Orders Analysis</h3>
            <span className="text-xs text-gray-400">{dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'This Week' : 'This Month'}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-900">Orders Analysis details</h4>
              <button onClick={() => setShowOrdersAnalysis((s) => !s)} className="text-blue-600 text-xs font-medium">
                {showOrdersAnalysis ? 'Hide' : 'Show'}
              </button>
            </div>

            {showOrdersAnalysis ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-indigo-50 p-3 text-xs">
                    <p className="font-medium text-gray-700">New vs Repeat Customers</p>
                    <p>{data.repeatCustomerStats?.new ?? 0} new ({data.repeatCustomerStats?.newPct ?? 0}%)</p>
                    <p>{data.repeatCustomerStats?.repeat ?? 0} repeat ({data.repeatCustomerStats?.repeatPct ?? 0}%)</p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-3 text-xs">
                    <p className="font-medium text-gray-700">Peak Order Hour</p>
                    <p>{data.peakOrderTime?.hour ?? '0:00'} ({data.peakOrderTime?.count ?? 0} orders)</p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3 text-xs">
                    <p className="font-medium text-gray-700">Top Category</p>
                    <p>{data.orderCategoryStats?.[0]?.category || '—'}</p>
                    <p>{data.orderCategoryStats?.[0]?.orders ?? 0} orders • {formatCurrency(data.orderCategoryStats?.[0]?.revenue ?? 0)}</p>
                  </div>
                </div>

                <div className="mt-4 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.peakOrderTimeline || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 space-y-1 text-xs">
                  <p className="font-medium text-gray-700">Orders by Category</p>
                  {data.orderCategoryStats?.slice(0, 4).map((c: any) => (
                    <p key={c.category}>{c.category}: {c.orders} orders • {c.quantity} items • {formatCurrency(c.revenue)}</p>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400">Click "Show" to view detailed orders analysis for the selected date range.</p>
            )}
          </div>
        </div>

        {/* Rider Performance */}

        {/* Top Rated Dishes */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Top Rated Dishes</h3>
            <span className="text-xs text-gray-400">{dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'This Week' : 'This Month'}</span>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="mb-3 space-y-1">
              <p className="text-xs text-gray-500">
                Zinger Burger trend: {data.zingerTrend?.direction === "up" ? "▲ Trending up" : data.zingerTrend?.direction === "down" ? "▼ Trending down" : "— Flat"}
              </p>
              <p className="text-xs text-gray-500">
                {data.zingerTrend?.currentQty ?? 0} sold {dateRange === 'today' ? 'today' : dateRange === 'week' ? 'this week' : 'this month'} vs {data.zingerTrend?.previousQty ?? 0} in previous period ({data.zingerTrend?.changePct?.toFixed(1)}% change)
              </p>
            </div>

            {data.lowStockDishes && data.lowStockDishes.length > 0 && (
              <div className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-800">
                <strong>Low stock alert:</strong> {data.lowStockDishes.map((dish: any) => `${dish.name} (${dish.stock} left)`).join(', ')}
              </div>
            )}

            <div className="h-40 mb-3">
              {data.orderCountChart && data.orderCountChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.orderCountChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value: number) => `${value} orders`} />
                    <Bar dataKey="qty" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-500">
                  No top-rated dish activity to display
                </div>
              )}
            </div>

            <div className="space-y-3">
              {data.bestSellingDishes && data.bestSellingDishes.length > 0 ? (
                data.bestSellingDishes.map((dish: any, idx: number) => {
                  const ratio = topDishMaxQty ? Math.min(100, Math.round((dish.qty / topDishMaxQty) * 100)) : 0;
                  return (
                    <div key={dish.name} className="rounded-xl border border-gray-100 p-3 hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{idx + 1}. {dish.name}</p>
                          <p className="text-xs text-gray-500">{dish.qty} sold • {formatCurrency(dish.revenue)}</p>
                          {dish.lowStock && dish.stock !== null && (
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                              Low stock: {dish.stock} left
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold">
                            <Star size={14} />
                            {dish.rating?.toFixed(1) ?? "4.8"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-orange-400" style={{ width: `${ratio}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Top dish intensity {ratio}%</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400">No dish ordering data yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
