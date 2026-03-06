"use client";

import React, { useMemo, useState } from "react";
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
} from "lucide-react";

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
  const { currentUser, branches, orders, riders } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [kitchenFilter, setKitchenFilter] = useState<string>("all");

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
      totalRiders: riders.filter((r) => orgBranchIds.has(r.branchId)).length,
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

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      {showHeader && (
        <div className="bg-white px-4 pt-4 pb-2">
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-500">Manage your kitchens & track performance</p>
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
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
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
              <span className="flex items-center gap-0.5 text-xs text-green-600">
                <CheckCircle2 size={10} /> {filteredKitchens.filter((k) => k.status === "Active").length} Active
              </span>
              <span className="flex items-center gap-0.5 text-xs text-red-500">
                <XCircle size={10} /> {filteredKitchens.filter((k) => k.status === "Inactive").length} Inactive
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <ShoppingBag size={16} className="text-green-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{totalOrders.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-xs text-green-600 mt-1.5">+{ordersToday} today</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Bike size={16} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{data.totalRiders}</p>
            <p className="text-xs text-gray-500">Total Riders</p>
            <p className="text-xs text-purple-600 mt-1.5">Across all branches</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(todaysRevenue)}</p>
            <p className="text-xs text-gray-500">Today's Revenue</p>
            <p className="text-xs text-amber-600 mt-1.5">{ordersToday} orders</p>
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
                          kitchen.status === "Active" ? "bg-green-500" : "bg-red-400"
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
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(kitchen.revenue - kitchen.commission)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
