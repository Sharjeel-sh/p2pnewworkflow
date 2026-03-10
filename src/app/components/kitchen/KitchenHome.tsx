import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, MapPin } from 'lucide-react';
import { OrgDashboard } from './OrgDashboard';
import { MobileLayout } from '../shared/MobileLayout';
import { KitchenBottomNav } from './KitchenBottomNav';
import { useApp } from '../../context/AppContext';

export function KitchenHome() {
  const { currentUser, organizations, branches, orders } = useApp();
  const navigate = useNavigate();

  const org = organizations.find(o => o.id === currentUser?.orgId);
  const orgBranches = branches.filter(b => b.orgId === currentUser?.orgId);

  const { monthlyRevenue, monthlyOrderCount, branchMonthlyRevenue } = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const orgOrdersThisMonth = orders.filter(order => {
      if (order.orgId !== currentUser?.orgId) return false;
      const createdAt = new Date(order.createdAt).getTime();
      return createdAt >= monthStart;
    });

    const revenueByBranch: Record<string, number> = {};
    for (const order of orgOrdersThisMonth) {
      if (!order.branchId) continue;
      revenueByBranch[order.branchId] = (revenueByBranch[order.branchId] || 0) + order.total;
    }

    return {
      monthlyRevenue: orgOrdersThisMonth.reduce((sum, order) => sum + order.total, 0),
      monthlyOrderCount: orgOrdersThisMonth.length,
      branchMonthlyRevenue: orgBranches
        .map(branch => ({
          id: branch.id,
          name: branch.name,
          revenue: revenueByBranch[branch.id] || 0,
        }))
        .sort((a, b) => b.revenue - a.revenue),
    };
  }, [orders, currentUser?.orgId, orgBranches]);

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  if (!org) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-stone-500">Organization not found.</p>
        </div>
        <KitchenBottomNav />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="bg-red-600 px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="text-red-100 mr-2">
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="flex-1">
            <p className="text-red-100" style={{ fontSize: '0.8rem' }}>Welcome back,</p>
            <h2 className="text-white" style={{ fontSize: '1.3rem', fontWeight: 700 }}>{org.orgName}</h2>
          </div>
        </div>
        <p className="text-red-100 flex items-center gap-1 mt-1" style={{ fontSize: '0.8rem' }}>
          <MapPin size={12} />
          {org.address}
        </p>
      </div>

      {/* embed organization dashboard here */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <OrgDashboard showHeader={false} />
      </div>

      <KitchenBottomNav />
    </MobileLayout>
  );
}
