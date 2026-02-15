
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { UserStats } from '../types';

interface Props {
  stats: UserStats;
}

const PlayerRadar: React.FC<Props> = ({ stats }) => {
  const data = [
    { subject: 'Technical', A: stats.technical, fullMark: 100 },
    { subject: 'Physical', A: stats.physical, fullMark: 100 },
    { subject: 'Tactical', A: stats.tactical, fullMark: 100 },
    { subject: 'Mental', A: stats.mental, fullMark: 100 },
    { subject: 'Speed', A: stats.speed, fullMark: 100 },
    { subject: 'Stamina', A: stats.stamina, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Player"
            dataKey="A"
            stroke="#39FF14"
            fill="#39FF14"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerRadar;
