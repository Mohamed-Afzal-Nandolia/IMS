'use client';

import dynamic from 'next/dynamic';
import { LuLoader } from 'react-icons/lu';

// Dynamic imports for recharts to ensure client-side rendering only
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false, loading: () => <div className="h-[350px] w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl"><LuLoader className="w-8 h-8 animate-spin text-indigo-500" /></div> });

interface ChartDataPoint {
  name: string;
  sales: number;
  purchases: number;
  revenue: number;
  profit: number;
}

export default function ReportsChart({ data }: { data: ChartDataPoint[] }) {
  console.log('ReportsChart rendering with data:', data);
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
        <p>No data available for this range</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(17, 24, 39, 0.8)', 
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            border: '1px solid rgba(75, 85, 99, 0.4)',
            color: '#fff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}
          itemStyle={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 500 }}
          labelStyle={{ color: '#9ca3af', marginBottom: '4px', fontSize: '12px' }}
        />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
        <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
