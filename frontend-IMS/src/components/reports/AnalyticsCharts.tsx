'use client';

import dynamic from 'next/dynamic';
import { LuLoader } from 'react-icons/lu';
import { formatCurrency } from '@/lib/utils';

import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// 1. Category Distribution Chart (Donut)
export function CategoryDistributionChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => formatCurrency(Number(value || 0))}
          contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '12px', border: 'none' }}
          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
          labelStyle={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  );
}

// 2. Top Products Chart (Horizontal Bar)
export function TopProductsChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart layout="vertical" data={data} margin={{ left: 40, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={100} 
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          formatter={(value: any) => formatCurrency(Number(value || 0))}
          contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '12px', border: 'none' }}
          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
          labelStyle={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}
        />
        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// 3. Inventory Status Chart (Donut)
export function InventoryStatusChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '12px', border: 'none' }}
          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
          labelStyle={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 4. Cash Flow Chart (Grouped Bar - Sales vs Purchases)
export function CashFlowChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#6b7280', fontSize: 12 }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `₹${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
        />
        <Tooltip 
          formatter={(value: any) => formatCurrency(Number(value || 0))}
          contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderRadius: '12px', border: 'none' }}
          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}
          labelStyle={{ color: '#9ca3af', fontSize: '11px', marginBottom: '2px' }}
        />
        <Legend />
        <Bar dataKey="sales" name="Sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="purchases" name="Purchases" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState() {
  return (
    <div className="h-[300px] w-full flex items-center justify-center text-gray-400 text-sm italic">
      No data available to display
    </div>
  );
}
