'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RoyaltyEntry {
  createdAt: string;
  royaltyAmount: number;
}

interface EarningsChartProps {
  entries: RoyaltyEntry[];
}

export default function EarningsChart({ entries }: EarningsChartProps) {
  // Aggregate earnings by date
  const dateMap: Record<string, number> = {};

  entries.forEach((e) => {
    const dateStr = new Date(e.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    dateMap[dateStr] = (dateMap[dateStr] || 0) + e.royaltyAmount;
  });

  const data = Object.keys(dateMap).map((date) => ({
    date,
    royalty: dateMap[date],
  }));

  if (data.length === 0) {
    data.push(
      { date: 'Day 1', royalty: 0 },
      { date: 'Day 15', royalty: 0 },
      { date: 'Day 30', royalty: 0 }
    );
  }

  return (
    <div className="w-full h-64 font-inter text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="royaltyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${val}`} />
          <Tooltip
            formatter={(value: any) => [`₹${value}`, 'Royalty Earned']}
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '16px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          />
          <Area
            type="monotone"
            dataKey="royalty"
            stroke="#f59e0b"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#royaltyGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
