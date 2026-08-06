import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const peakHoursData = [
  { hour: '08:00', appointments: 12 },
  { hour: '09:00', appointments: 25 },
  { hour: '10:00', appointments: 38 },
  { hour: '11:00', appointments: 45 },
  { hour: '12:00', appointments: 20 },
  { hour: '13:00', appointments: 15 },
  { hour: '14:00', appointments: 30 },
  { hour: '15:00', appointments: 28 },
  { hour: '16:00', appointments: 18 },
];

const visitReasonsData = [
  { name: 'Routine Checkup', value: 400 },
  { name: 'Fever/Cold', value: 300 },
  { name: 'Injury/Trauma', value: 150 },
  { name: 'Immunization', value: 200 },
  { name: 'Consultation', value: 100 },
];

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];

export function PeakAppointmentHoursChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="hour" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#64748b' }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#64748b' }} 
        />
        <Tooltip 
          cursor={{ fill: '#f1f5f9' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Bar dataKey="appointments" fill="#0f766e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VisitReasonsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={visitReasonsData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {visitReasonsData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Generate Heatmap Data
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];

const heatmapData = weeks.flatMap((week, xIndex) => 
  days.map((day, yIndex) => {
    // Generate some fake demand that peaks around mid-terms (W6) and finals (W12)
    let base = 10 + Math.random() * 15;
    if (week === 'W6' || week === 'W7') base += 25; // Midterms peak
    if (week === 'W12') base += 35; // Finals peak
    if (day === 'Mon' || day === 'Fri') base += 10; // Mondays and Fridays are busier

    return {
      week,
      day,
      x: xIndex,
      y: yIndex,
      load: Math.floor(base)
    };
  })
);

const CustomShape = (props: any) => {
  const { cx, cy, payload } = props;
  const load = payload.load;
  
  // Color scale for heatmap
  let fill = '#f8fafc'; // slate-50
  if (load > 60) fill = '#e11d48'; // rose-600
  else if (load > 45) fill = '#fb7185'; // rose-400
  else if (load > 30) fill = '#fda4af'; // rose-300
  else if (load > 15) fill = '#ffe4e6'; // rose-100

  // Calculate size to fill the grid cells appropriately
  // Assuming a chart width of ~600px (600/12 = 50px width) and height ~250px (250/5 = 50px height)
  // We'll use fixed dimensions that are responsive if we just center the rects
  const size = 32;

  return (
    <rect 
      x={cx - size/2} 
      y={cy - size/2} 
      width={size} 
      height={size} 
      fill={fill}
      rx={4}
      className="transition-colors duration-300 hover:opacity-80 cursor-pointer"
    />
  );
};

export function ClinicLoadHeatmap() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 40 }}>
        <XAxis 
          type="category" 
          dataKey="week" 
          name="Week" 
          axisLine={false} 
          tickLine={false} 
          tick={{fontSize: 12, fill: '#64748b'}} 
          allowDuplicatedCategory={false}
        />
        <YAxis 
          type="category" 
          dataKey="day" 
          name="Day" 
          reversed 
          axisLine={false} 
          tickLine={false} 
          tick={{fontSize: 12, fill: '#64748b'}} 
          allowDuplicatedCategory={false}
        />
        <ZAxis type="number" dataKey="load" range={[100, 100]} />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }} 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {data.week} - {data.day}
                  </p>
                  <p className="text-rose-600 font-medium">
                    {data.load} appointments
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Scatter data={heatmapData} shape={<CustomShape />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
