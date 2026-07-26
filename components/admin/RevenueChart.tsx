'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenuePoint {
  date: string;
  revenue: number; // in INR
  orders: number;
}

interface RevenueChartProps {
  data: RevenuePoint[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<'30' | '90'>('30');

  const filteredData = timeRange === '30' ? data.slice(-30) : data.slice(-90);

  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 text-theme-text shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-theme/60">
        <div>
          <h3 className="text-base font-bold text-theme-heading font-montserrat">Platform Revenue Trend</h3>
          <p className="text-xs text-theme-muted">Gross earnings across eBook purchases & subscriptions</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-theme-surface border border-theme/60">
          <button
            onClick={() => setTimeRange('30')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              timeRange === '30'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-theme-muted hover:text-theme-heading'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              timeRange === '90'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-theme-muted hover:text-theme-heading'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
