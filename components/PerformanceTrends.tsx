
import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line } from 'recharts';

interface Props {
  history: { date: string; overall: number; technical: number; physical: number }[];
}

const PerformanceTrends: React.FC<Props> = ({ history }) => {
  // Đảm bảo có ít nhất 2 điểm để vẽ đường
  const chartData = history.length > 1 ? history : (history.length === 1 ? [
    { ...history[0], date: 'Giai đoạn 0' },
    history[0]
  ] : []);

  return (
    <div className="w-full h-[280px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: '800' }} 
            dy={10}
          />
          <YAxis 
            hide 
            domain={['dataMin - 5', 'auto']} // Zoom vào để thấy biến động nhỏ nhưng ko quá hẹp
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0a0a0a', 
              border: '1px solid rgba(57, 255, 20, 0.2)', 
              borderRadius: '16px', 
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
            }}
            itemStyle={{ fontWeight: '900', color: '#39FF14', textTransform: 'uppercase' }}
            labelStyle={{ color: '#ffffff40', marginBottom: '4px', fontWeight: 'bold' }}
            cursor={{ stroke: '#39FF14', strokeWidth: 1, strokeDasharray: '5 5' }}
          />
          <Area 
            type="monotone" 
            dataKey="overall" 
            stroke="#39FF14" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorOverall)" 
            name="Overall"
            animationDuration={1500}
            dot={{ r: 4, fill: '#39FF14', strokeWidth: 2, stroke: '#050505' }}
            activeDot={{ r: 6, fill: '#39FF14', strokeWidth: 2, stroke: '#ffffff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceTrends;
