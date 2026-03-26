import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  ClipboardList, 
  TrendingUp, 
  Award, 
  Clock, 
  Star,
  Calendar,
  ChevronRight,
  AlertCircle,
  Zap,
  Target,
  Truck,
  ThumbsUp
} from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { RiderBottomNav } from './RiderBottomNav';
import { useApp } from '../../context/AppContext';

interface PerformanceMetrics {
  completionRate: number;
  cancellationRate: number;
  onTimeRate: number;
  avgDeliveryTime: number;
  performanceScore: number;
  totalDeliveries: number;
  activeHours: number;
}

export function RiderDashboard() {
  const navigate = useNavigate();
  const { currentUser, orders, riders } = useApp();
  const [selectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  const rider = riders.find(r => r.id === currentUser?.riderId);

  if (!rider) {
    return (
      <MobileLayout>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto text-stone-400 mb-3" size={48} />
            <p className="text-stone-500">Rider not found. Please login again.</p>
          </div>
        </div>
        <RiderBottomNav />
      </MobileLayout>
    );
  }

  // Process orders data
  const riderOrders = orders.filter(o => o.riderId === rider.id);
  const deliveredOrders = riderOrders.filter(o => o.status === 'delivered');
  const cancelledOrders = riderOrders.filter(o => (o.status as string) === 'cancelled');
  const pickedOrders = riderOrders.filter(o => o.status === 'picked_up');
  const readyOrders = riderOrders.filter(o => o.status === 'ready');
  const activeOrders = readyOrders.length + pickedOrders.length;
  const totalProcessed = deliveredOrders.length + cancelledOrders.length;

  // Calculate metrics
  const completionRate = totalProcessed > 0 ? Math.round((deliveredOrders.length / totalProcessed) * 100) : 0;
  const cancellationRate = totalProcessed > 0 ? Math.round((cancelledOrders.length / totalProcessed) * 100) : 0;

  const deliveredTimesInMin = deliveredOrders
    .map(o => {
      if (!o.deliveredAt) return null;
      const start = new Date(o.createdAt).getTime();
      const end = new Date(o.deliveredAt).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
      return (end - start) / 60000;
    })
    .filter((x): x is number => x !== null);

  const avgDeliveryTime = deliveredTimesInMin.length > 0
    ? Number((deliveredTimesInMin.reduce((sum, x) => sum + x, 0) / deliveredTimesInMin.length).toFixed(1))
    : 0;

  // On-time delivery rate (assuming target is 30 minutes)
  const onTimeDeliveries = deliveredTimesInMin.filter(time => time <= 30).length;
  const onTimeRate = deliveredOrders.length > 0 ? Math.round((onTimeDeliveries / deliveredOrders.length) * 100) : 100;

  // Performance score calculation
  const performanceScore = Math.round(
    0.4 * completionRate +
    0.25 * onTimeRate +
    0.2 * (avgDeliveryTime > 0 ? Math.max(0, 100 - avgDeliveryTime) : 50) +
    0.15 * (activeOrders > 0 ? 100 : 50)
  );

  // Achievement data
  const achievements = [
    { icon: Zap, label: 'Speed Star', condition: avgDeliveryTime < 25, description: 'Avg delivery < 25 min', color: 'text-yellow-600' },
    { icon: ThumbsUp, label: 'Perfect Rating', condition: completionRate > 95, description: '95%+ completion rate', color: 'text-green-600' },
    { icon: Award, label: 'Early Bird', condition: onTimeRate > 90, description: '90%+ on-time delivery', color: 'text-blue-600' },
    { icon: Target, label: 'Goal Getter', condition: deliveredOrders.length > 50, description: '50+ deliveries total', color: 'text-purple-600' }
  ];

  const earnedAchievements = achievements.filter(a => a.condition);
  const nextAchievement = achievements.find(a => !a.condition);

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <MobileLayout>
      {/* Header Section - Personal Greeting */}
      <div className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-500 px-5 pt-10 pb-8">
        <div className="absolute top-0 right-0 opacity-10">
          <Truck size={120} />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl font-bold">Welcome back,</h1>
            <p className="text-red-100 text-lg font-semibold mt-1">{rider.name}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
            <Star className="text-yellow-300" size={24} fill="currentColor" />
          </div>
        </div>
        
        {/* Quick Stats Cards - Real-time Overview */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
            <p className="text-red-100 text-xs">Active Orders</p>
            <p className="text-white text-2xl font-bold">{activeOrders}</p>
            <p className="text-red-200 text-xs mt-1">Ready for pickup</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3">
            <p className="text-red-100 text-xs">Completed Today</p>
            <p className="text-white text-2xl font-bold">{deliveredOrders.filter(o => {
              const today = new Date().toDateString();
              return o.deliveredAt && new Date(o.deliveredAt).toDateString() === today;
            }).length}</p>
            <p className="text-red-200 text-xs mt-1">Deliveries done</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Performance Score Card - Overall Rating */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-indigo-100 text-sm">Performance Score</p>
              <p className="text-4xl font-bold">{performanceScore}</p>
              <p className="text-indigo-100 text-xs mt-1">
                {performanceScore >= 90 ? 'Excellent performance' : 
                 performanceScore >= 70 ? 'Good performance' : 
                 'Needs improvement'}
              </p>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="35" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="35" 
                  stroke="white" 
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray={`${(performanceScore / 100) * 219.8} 219.8`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{performanceScore}%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-indigo-400">
            {/* <div>
              <p className="text-indigo-100 text-xs">Rating</p>
              <p className="font-semibold">4.8 ★</p>
            </div> */}
            <div>
              <p className="text-indigo-100 text-xs">Deliveries</p>
              <p className="font-semibold">{deliveredOrders.length}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs">Active Hours</p>
              <p className="font-semibold">{Math.round((deliveredTimesInMin.reduce((a, b) => a + b, 0) / 60))}h</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs">Success Rate</p>
              <p className="font-semibold">{completionRate}%</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs">Cancelled</p>
              <p className="font-semibold">{cancellationRate}%</p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Navigation Buttons
        <div className="grid grid-cols-2 gap-3 pb-4">
          <button
            onClick={() => navigate('/rider/orders')}
            className="bg-red-50 text-red-700 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <ClipboardList size={16} />
            View Orders
          </button>
          <button
            onClick={() => navigate('/rider/profile')}
            className="bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Calendar size={16} />
            Schedule
          </button>
        </div> */}
      </div>

      <RiderBottomNav />
    </MobileLayout>
  );
}