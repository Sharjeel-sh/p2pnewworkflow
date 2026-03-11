import React, { useMemo } from "react";
import { Bell } from "lucide-react";
import { MobileLayout } from "../shared/MobileLayout";
import { KitchenBottomNav } from "./KitchenBottomNav";
import { useApp } from "../../context/AppContext";

export function KitchenOrderDashboard() {
  const { currentUser, orders } = useApp();
  const orgId = currentUser?.orgId;

  const stats = useMemo(() => {
    if (!orgId) return null;

    const filtered = orders.filter(o => o.orgId === orgId);

    return {
      total: filtered.length,
      new: filtered.filter(o => o.status === "pending").length,
      processing: filtered.filter(o => o.status === "preparing").length,
      ready: filtered.filter(o => o.status === "ready").length,
      delivered: filtered.filter(o => o.status === "delivered").length,
      rejected: filtered.filter(o => o.status === "rejected").length,
      cancelled: filtered.filter(o => o.status === "cancelled").length,
    };
  }, [orgId, orders]);

  if (!stats) return null;

  return (
    <MobileLayout>
      {/* Page Content */}
      <div className="flex-1 pb-20">

        {/* Header */}
        <div className="px-5 pt-6 pb-4 flex justify-between items-center">
          <h1 className="text-red-600 text-2xl font-bold">P2P</h1>
          <Bell size={22} className="text-red-600" />
        </div>

        {/* Org Name */}
        <div className="px-5 mb-6">
          <h2 className="text-2xl font-semibold text-gray-400">
            {currentUser?.organizationName || "SoftOpsHub"}
          </h2>
        </div>

        {/* Orders Card */}
        <div className="px-5">
          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h3 className="text-gray-400 font-semibold">Orders</h3>
            <p className="text-gray-400 mb-3">Totals</p>

            <div className="text-4xl font-bold mb-6">
              {stats.total}
            </div>

            {/* Row 1 */}
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

            {/* Row 2 */}
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

            {/* Row 3 */}
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

      </div>

      {/* Bottom Navigation */}
      <KitchenBottomNav />
    </MobileLayout>
  );
}