'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TopBookItem {
  title: string;
  revenue: number;
  units: number;
}

interface TopBooksChartProps {
  data: TopBookItem[];
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

export default function TopBooksChart({ data }: TopBooksChartProps) {
  return (
    <div className="p-6 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 text-theme-text shadow-sm">
      <div className="pb-2 border-b border-theme/60">
        <h3 className="text-base font-bold text-theme-heading font-montserrat">Best Selling eBooks</h3>
        <p className="text-xs text-theme-muted">Top performers ranked by total revenue generated</p>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `₹${v}`} />
            <YAxis
              type="category"
              dataKey="title"
              stroke="#94a3b8"
              fontSize={11}
              width={110}
              tickFormatter={(t) => (t.length > 14 ? `${t.slice(0, 14)}...` : t)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                fontSize: '12px',
                color: '#fff',
              }}
              formatter={(val: any, name: any, item: any) => [
                `₹${Number(val).toLocaleString('en-IN')} (${item.payload.units} units)`,
                'Revenue',
              ]}
            />
            <Bar dataKey="revenue" radius={[0, 12, 12, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
