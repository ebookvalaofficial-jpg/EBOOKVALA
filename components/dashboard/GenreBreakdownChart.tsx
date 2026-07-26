'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export interface GenreBreakdownData {
  name: string;
  value: number;
}

interface GenreBreakdownChartProps {
  data: GenreBreakdownData[];
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#6366F1'];

export default function GenreBreakdownChart({ data }: GenreBreakdownChartProps) {
  return (
    <div className="w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#F8FAFC',
              fontSize: '12px',
            }}
            formatter={(val: any) => [`${val}%`, 'Share']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(val: string) => <span className="text-[11px] font-bold text-theme-muted">{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
