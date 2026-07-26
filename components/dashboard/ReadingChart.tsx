'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface ReadingChartData {
  date: string;
  minutes: number;
}

interface ReadingChartProps {
  data: ReadingChartData[];
}

export default function ReadingChart({ data }: ReadingChartProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="readingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            unit="m"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              borderColor: '#334155',
              borderRadius: '12px',
              color: '#F8FAFC',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${value} min`, 'Reading Time']}
          />
          <Area
            type="monotone"
            dataKey="minutes"
            stroke="#3B82F6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#readingGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
