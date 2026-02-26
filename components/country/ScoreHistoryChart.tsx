'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

interface ScorePoint {
  year: number;
  score: number;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const score = payload[0].value as number;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="text-lg font-bold text-indigo-600">{score.toFixed(1)}<span className="text-sm text-gray-400 ml-1">/100</span></div>
    </div>
  );
}

export default function ScoreHistoryChart({ data }: { data: ScorePoint[] }) {
  const filteredData = data.filter((d) => d.year >= 2016);
  if (filteredData.length < 2) return null;

  const scores = filteredData.map((d) => d.score);
  const min = Math.max(0, Math.floor(Math.min(...scores) / 10) * 10 - 10);
  const max = Math.min(100, Math.ceil(Math.max(...scores) / 10) * 10 + 10);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={filteredData} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[min, max]}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#6366f1' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
