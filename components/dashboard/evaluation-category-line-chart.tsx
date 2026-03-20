"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RADAR_CATEGORY_ORDER, getCategoryLabel } from "@/lib/evaluation-rubric";

const COLORS = [
  "#0066CC",
  "#001F3F",
  "#22c55e",
  "#eab308",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export function EvaluationCategoryLineChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <div className="h-72 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {RADAR_CATEGORY_ORDER.map((id, i) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={getCategoryLabel(id)}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
