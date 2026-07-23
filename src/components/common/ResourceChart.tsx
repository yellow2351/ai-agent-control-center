import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { NeuCard } from '@/components/neumorphic/NeuCard';

interface ChartData {
  time: string;
  value: number;
}

interface ResourceChartProps {
  title: string;
  data: ChartData[];
  value: number;
  unit?: string;
  color?: string;
  gradientId?: string;
}

export function ResourceChart({
  title,
  data,
  value,
  unit = '%',
  color = '#6366f1',
  gradientId = 'colorGradient',
}: ResourceChartProps) {
  return (
    <NeuCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neu-text dark:text-neu-textDark">
            {title}
          </h3>
          <div className="text-right">
            <p className="text-2xl font-bold text-gradient">{value.toFixed(1)}{unit}</p>
          </div>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#718096', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#718096', fontSize: 10 }}
                domain={[0, 100]}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#e0e5ec',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px #a3b1c6, -4px -4px 8px #ffffff',
                  fontSize: '12px',
                }}
                formatter={(val: number) => [`${val.toFixed(1)}${unit}`, title]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </NeuCard>
  );
}
