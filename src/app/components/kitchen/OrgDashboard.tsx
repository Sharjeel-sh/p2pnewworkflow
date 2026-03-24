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
  const { currentUser, branches, orders, riders } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>("week");
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

    const rangeOrders = orgOrders.filter((o) => {
      const dt = new Date(o.createdAt);
      return !Number.isNaN(dt.getTime()) && dt >= rangeStart;
    });

    const todayOrders = orgOrders.filter((o) => {
      const dt = new Date(o.createdAt);
      return !Number.isNaN(dt.getTime()) && dt >= todayStart;
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

    type RiderStat = {
      rider: typeof orgRiders[number];
      deliveries: number;
      notDelivered: number;
      revenue: number;
      totalDeliveryMinutes: number;
      deliveryCountForAvg: number;
    };

    const riderStatsMap: Record<string, RiderStat> = {};
    orgRiders.forEach((rider) => {
      riderStatsMap[rider.id] = {
        rider,
        deliveries: 0,
        notDelivered: 0,
        revenue: 0,
        totalDeliveryMinutes: 0,
        deliveryCountForAvg: 0,
      };
    });

    rangeOrders.forEach((o) => {
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
    const totalCancelled = rangeOrders.reduce(
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
      totalRevenue: kitchens.reduce((sum, k) => sum + k.revenue, 0),
      totalRevenueToday: todayOrders.reduce((sum, o) => sum + o.total, 0),
      kitchens,
    };
  }, [orgId, branches, orders, riders, dateRange]);

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

        {/* Rider Performance */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Rider Performance</h3>
            <div className="flex items-center gap-2">
              {data.delayedOrders > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {data.delayedOrders} delayed
                </span>
              )}
              <span className="text-xs text-gray-400">{data.totalRiders} riders</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-xs font-semibold text-gray-900">Deliveries</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{data.totalDeliveredOrders}</p>
              <p className="text-xs text-gray-500">Delivered</p>
              <div className="mt-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span className="font-medium">{data.totalPendingOrders}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Cancelled</span>
                  <span className="font-medium">{data.totalCancelledOrders}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Avg delivery</span>
                  <span className="font-medium">{formatMinutes(data.averageDeliveryMins)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-600" />
                  <span className="text-xs font-semibold text-gray-900">Weekly Trend</span>
                </div>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.weeklyDeliveryTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(value: any) => [`${value}`, "Deliveries"]} />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-400 mt-2">Today vs yesterday</p>
            </div>
          </div>

          <div className="mt-4 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-900">Top riders</h4>
            </div>
            <div className="space-y-2">
              {data.riderLeaderboard.map((r) => {
                const branchName = branches.find((b) => b.id === r.branchId)?.name || "Unknown";
                const isExpanded = expandedRider === r.id;
                return (
                  <div
                    key={r.id}
                    className="border border-gray-100 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedRider(isExpanded ? null : r.id)}
                      className="w-full text-left p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-400">{branchName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{r.deliveries}</p>
                        <p className="text-xs text-gray-500">delivered</p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50 p-3 border-t border-gray-100 text-xs text-gray-600">
                        <div className="flex justify-between mb-1">
                          <span>Revenue</span>
                          <span className="font-medium">{formatCurrency(r.revenue)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Avg delivery</span>
                          <span className="font-medium">{formatMinutes(r.avgDeliveryMinutes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending</span>
                          <span className="font-medium">{r.notDelivered}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
