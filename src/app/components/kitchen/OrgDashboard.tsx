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
  Package,
  CheckCircle,
} from "lucide-react";


import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
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

type DateRange = "today" | "week" | "month" | "custom";

interface KitchenInfo {
  id: string;
  name: string;
  orders: number;
  totalOrders: number;
  deliveredOrders: number;
  readyForPickupOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  revenue: number;
  commission: number;
  status: "Active" | "Inactive";
  location: string;
  ordersToday: number;
  revenueToday: number;
  avgOrderValue?: number;
  cancellationRate?: number;
  deliveryRate?: number;
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

function getEndOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
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
  // Dashboard card variables must be in scope for all JSX below
  const performanceScore = 85;
  const readyForPickup = 12;
  const inProgressOrders = 8;
  const completedOrders = 45;
  const cancelledOrders = 3;

  const navigate = useNavigate();
  const { currentUser, branches, orders, riders, dishes, organizations } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [kitchenFilter, setKitchenFilter] = useState<string>("all");
  const [expandedRider, setExpandedRider] = useState<string | null>(null);

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
        totalReadyForPickupOrders: 0,
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

    let rangeStart = getRangeStart(now, dateRange);
    let rangeEnd = getEndOfDay(now);

    if (dateRange === "custom") {
      const parsedStart = customStartDate ? new Date(customStartDate) : null;
      const parsedEnd = customEndDate ? new Date(customEndDate) : null;

      if (parsedStart && !Number.isNaN(parsedStart.getTime())) {
        rangeStart = getStartOfDay(parsedStart);
      }
      if (parsedEnd && !Number.isNaN(parsedEnd.getTime())) {
        rangeEnd = getEndOfDay(parsedEnd);
      }
      if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
        // Swap if user accidentally entered start after end
        rangeStart = getStartOfDay(parsedEnd);
        rangeEnd = getEndOfDay(parsedStart);
      }
    }

    const orgBranches = branches.filter((b) => b.orgId === orgId);
    const orgBranchIds = new Set(orgBranches.map((b) => b.id));

    const orgOrders = orders.filter((o) => o.orgId === orgId);
    const orgDishes = (dishes || []).filter((d) => d.orgId === orgId);

    const rangeOrders = orgOrders.filter((o) => {
      const dt = new Date(o.createdAt);
      return !Number.isNaN(dt.getTime()) && dt >= rangeStart && dt <= rangeEnd;
    });

    const todayOrders = orgOrders.filter((o) => {
      const dt = new Date(o.createdAt);
      return !Number.isNaN(dt.getTime()) && dt >= todayStart;
    });

    const rangeDurationDays = Math.max(
      1,
      Math.ceil((getStartOfDay(rangeEnd).getTime() - getStartOfDay(rangeStart).getTime() + 1) / 86400000)
    );
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

    const weeklyOrderRevenueTrend = (() => {
      if (dateRange === "today") {
        return Array.from({ length: 24 }).map((_, hour) => {
          const label = `${hour.toString().padStart(2, "0")}:00`;
          const hourOrders = rangeOrders.filter((o) => {
            const dt = new Date(o.createdAt);
            return (
              !Number.isNaN(dt.getTime()) &&
              dt >= todayStart &&
              dt.getHours() === hour
            );
          });
          const revenue = hourOrders.reduce((sum, order) => sum + (order.total || 0), 0);
          return { label, orders: hourOrders.length, revenue };
        });
      }

      const startDay = getStartOfDay(rangeStart);
      const endDay = getStartOfDay(rangeEnd);
      const daySpan = Math.max(
        1,
        Math.ceil((endDay.getTime() - startDay.getTime()) / 86400000) + 1
      );

      return Array.from({ length: daySpan }).map((_, idx) => {
        const day = new Date(startDay);
        day.setDate(startDay.getDate() + idx);

        const label =
          dateRange === "month" || dateRange === "custom"
            ? `${day.getDate()} ${day.toLocaleDateString(undefined, { month: "short" })}`
            : day.toLocaleDateString(undefined, { weekday: "short" });

        const dayOrders = rangeOrders.filter((o) => {
          const dt = new Date(o.createdAt);
          return (
            !Number.isNaN(dt.getTime()) &&
            getStartOfDay(dt).getTime() === day.getTime()
          );
        });

        const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        return { label, orders: dayOrders.length, revenue };
      });
    })();

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
// Define the variables for the dashboard cards
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

      const cancelled = branchRangeOrders.filter((o) => (o.status as string) === "cancelled").length;
      const delivered = branchRangeOrders.filter((o) => o.status === "delivered").length;
      const readyForPickup = branchRangeOrders.filter((o) =>
        (o.status as string) === "ready" ||
        (o.status as string) === "picked_up"
      ).length;
      const pending = branchRangeOrders.filter((o) =>
        ["pending", "accepted", "preparing"].includes(o.status as string)
      ).length;
      const avgOrderValue = branchRangeOrders.length ? revenue / branchRangeOrders.length : 0;

      return {
        id: branch.id,
        name: branch.name,
        orders: branchRangeOrders.length,
        totalOrders: branchRangeOrders.length,
        deliveredOrders: delivered,
        readyForPickupOrders: readyForPickup,
        pendingOrders: pending,
        cancelledOrders: cancelled,
        revenue,
        commission: revenue * COMMISSION_RATE,
        status: branchRangeOrders.length > 0 ? "Active" : "Inactive",
        location: branch.address,
        ordersToday: branchTodayOrders.length,
        revenueToday,
        avgOrderValue,
        cancellationRate: branchRangeOrders.length ? (cancelled / branchRangeOrders.length) * 100 : 0,
        deliveryRate: branchRangeOrders.length ? (delivered / branchRangeOrders.length) * 100 : 0,
      };
    });

    // Calculate total ready for pickup orders
    const totalReadyForPickupOrders = branchOrders.filter((o) =>
      (o.status as string) === "ready" ||
      (o.status as string) === "picked_up"
    ).length;

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
      weeklyDeliveryTrend: weeklyOrderRevenueTrend.map((d) => ({ label: d.label, count: d.orders })),
      weeklyOrderRevenueTrend,
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
      selectedBranchId, // Add this to know if a specific branch is selected
      totalReadyForPickupOrders, // <-- Add this line
    };
  }, [orgId, branches, orders, riders, dateRange, customStartDate, customEndDate, kitchenFilter]);

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

  // Determine if a specific branch is selected (not "all")
  const isSpecificBranchSelected = kitchenFilter !== "all";

  // Helper to get kitchen/org name for a dish
  const getKitchenNameForDish = (dishName: string) => {
    // Find the dish in all dishes (across orgs)
    const dishObj = dishes.find((d) => d.name === dishName);
    if (dishObj) {
      const org = organizations.find((o) => o.id === dishObj.orgId);
      return org ? org.orgName : null;
    }
    // If not found in real dishes, try to guess for mock dishes
    // Map mock dish names to orgs by searching for a similar dish name in orgDishes
    for (const org of organizations) {
      const orgDishes = dishes.filter((d) => d.orgId === org.id);
      if (orgDishes.some((d) => d.name.toLowerCase().includes(dishName.toLowerCase().split(' ')[0]))) {
        return org.orgName;
      }
    }
    return 'Unknown Kitchen';
  };

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

          <Select
            value={dateRange}
            onValueChange={(v) => {
              setDateRange(v as DateRange);
              if (v !== "custom") {
                setCustomStartDate("");
                setCustomEndDate("");
              }
            }}
          >
            <SelectTrigger className="w-32 h-9 bg-gray-50 border-gray-200 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateRange === "custom" && (
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="text-xs text-gray-500">
              From
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              To
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
              />
            </label>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-5">
      {!isSpecificBranchSelected && (
        <div className="flex flex-col md:flex-row gap-3">
          {/* Left: Revenue + Branches */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 text-gray-900 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-blue-700" />
                  <span className="text-sm font-medium opacity-90">Total Revenue</span>
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</p>
            </div>
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
          </div>
          {/* Right: Total Orders */}
          <div className="flex-1">
            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm max-h-36">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                    <ShoppingBag size={16} className="text-red-700" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <p className="text-xs text-gray-400">Avg order value</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(kitchen.avgOrderValue ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(kitchen.revenue)}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-green-50 p-2 text-xs text-green-700">
                    <div className="flex justify-between">
                      <span>Ready for Pickup</span>
                      <strong>{kitchen.readyForPickupOrders}</strong>
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2 text-xs text-blue-700">
                    <div className="flex justify-between">
                      <span>Delivered</span>
                      <strong>{kitchen.deliveredOrders}</strong>
                    </div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-2 text-xs text-orange-700">
                    <div className="flex justify-between">
                      <span>Pending</span>
                      <strong>{kitchen.pendingOrders}</strong>
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
                    <div className="flex justify-between">
                      <span>Cancelled</span>
                      <strong>{kitchen.cancelledOrders}</strong>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Conditional Rendering: Orders Analysis for Specific Branch OR Top Rated Dishes for All Branches */}
        {isSpecificBranchSelected ? (
          // Show Orders Analysis when a specific branch is selected
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-slate-900">Branch Order Insights</h3>
              <span className="text-sm text-gray-500">
                {dateRange === 'today'
                  ? 'Today'
                  : dateRange === 'week'
                  ? 'This Week'
                  : dateRange === 'month'
                  ? 'This Month'
                  : 'Custom Range'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Peak Hour</p>
                  <span className="text-xs text-emerald-700 font-bold">
                    {data.peakOrderTime?.hour ?? '00:00'} ({data.peakOrderTime?.count ?? 0} orders)
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 mt-4">Hourly Order Trend</p>
                <div className="mt-2 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(data.peakOrderTimeline && data.peakOrderTimeline.length > 0) ? data.peakOrderTimeline : [
              { hour: '10:00', orders: 5 },
              { hour: '11:00', orders: 8 },
              { hour: '12:00', orders: 15 },
              { hour: '13:00', orders: 25 },
              { hour: '14:00', orders: 18 },
              { hour: '15:00', orders: 10 },
              { hour: '16:00', orders: 7 },
            ]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <> 
            {/* New: Order Trend and Revenue Trend Separate Graphs */}
            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Order Trend</h3>
                  <span className="text-xs text-gray-400">
                    {dateRange === 'today'
                      ? 'Today'
                      : dateRange === 'week'
                      ? 'This Week'
                      : dateRange === 'month'
                      ? 'This Month'
                      : 'Custom Range'}
                  </span>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.weeklyOrderRevenueTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip formatter={(value) => [value, 'Orders']} />
                      <Line type="monotone" dataKey="orders" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Revenue Trend</h3>
                  <span className="text-xs text-gray-400">
                    {dateRange === 'today'
                      ? 'Today'
                      : dateRange === 'week'
                      ? 'This Week'
                      : dateRange === 'month'
                      ? 'This Month'
                      : 'Custom Range'}
                  </span>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.weeklyOrderRevenueTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                      <YAxis tickFormatter={(value) => `Rs.${Math.round(value as number).toLocaleString()}`} />
                      <Tooltip formatter={(value) => [`Rs.${Math.round((value as number) || 0).toLocaleString()}`, 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Show Top Rated Dishes when "All Branches" is selected */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Top Rated Dishes</h3>
              <span className="text-xs text-gray-400">
                {dateRange === 'today'
                  ? 'Today'
                  : dateRange === 'week'
                  ? 'This Week'
                  : dateRange === 'month'
                  ? 'This Month'
                  : 'Custom Range'}
              </span>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
              <div className="mb-3 space-y-1">
                <p className="text-xs text-gray-500">
                  Zinger Burger trend: {data.zingerTrend?.direction === "up" ? "▲ Trending up" : data.zingerTrend?.direction === "down" ? "▼ Trending down" : "— Flat"}
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
                    const kitchenName = getKitchenNameForDish(dish.name);
                    return (
                      <div key={dish.name} className="rounded-xl border border-gray-100 p-3 hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{idx + 1}. {dish.name}</p>
                            {kitchenName && (
                              <p className="text-xs font-semibold text-red-700">Kitchen: {kitchenName}</p>
                            )}
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
          </>
        )}
      </div>
    </div>
  );
}