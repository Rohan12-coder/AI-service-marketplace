'use client';
import React from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

interface ChartProps {
  data:       { _id?: string; date?: string; revenue?: number; totalRevenue?: number; count?: number; [key: string]: unknown }[];
  type?:      'line' | 'bar';
  dataKey?:   string;
  xKey?:      string;
  label?:     string;
  color?:     string;
  height?:    number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1A26] border border-[rgba(212,175,55,0.2)] rounded-xl px-3 py-2 shadow-lg">
      <p className="text-[#9090A0] text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[#F5F5F5] text-sm font-semibold">
          {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue')
            ? `₹${p.value.toLocaleString('en-IN')}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

const AnalyticsChart: React.FC<ChartProps> = ({
  data, type = 'line', dataKey = 'totalRevenue', xKey = '_id',
  label = 'Revenue', color = '#D4AF37', height = 220,
}) => {
  const formatted = data.map((d) => ({
    ...d,
    name: d[xKey] ? String(d[xKey]).slice(-5) : '',
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      {type === 'line' ? (
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#9090A0', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9090A0', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: color }} name={label} />
        </LineChart>
      ) : (
        <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" tick={{ fill: '#9090A0', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9090A0', fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} name={label} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

export default AnalyticsChart;
