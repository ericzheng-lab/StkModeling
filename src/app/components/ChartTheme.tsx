// Shared premium chart styling
export const CHART_COLORS = {
  indigo: "#6366f1",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  teal: "#14b8a6",
  sky: "#0ea5e9",
  pink: "#ec4899",
  orange: "#f97316",
};

export const GRADIENT_PAIRS = [
  { start: "#6366f1", end: "#818cf8" },
  { start: "#06b6d4", end: "#22d3ee" },
  { start: "#8b5cf6", end: "#a78bfa" },
  { start: "#10b981", end: "#34d399" },
  { start: "#f59e0b", end: "#fbbf24" },
  { start: "#f43f5e", end: "#fb7185" },
  { start: "#14b8a6", end: "#2dd4bf" },
  { start: "#0ea5e9", end: "#38bdf8" },
];

export const tooltipStyle = {
  background: "rgba(255,255,255,0.96)",
  border: "none",
  borderRadius: "12px",
  fontSize: "12px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  padding: "10px 14px",
};

export const axisStyle = {
  fontSize: 11,
  fill: "#94a3b8",
  fontFamily: "Inter, sans-serif",
};

export function ChartGradients() {
  return (
    <defs>
      {GRADIENT_PAIRS.map((pair, i) => (
        <linearGradient key={i} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pair.start} stopOpacity={0.9} />
          <stop offset="100%" stopColor={pair.end} stopOpacity={0.6} />
        </linearGradient>
      ))}
      <linearGradient id="gradient-area-indigo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="gradient-area-emerald" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="gradient-area-cyan" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
      </linearGradient>
      <linearGradient id="gradient-area-violet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
      </linearGradient>
    </defs>
  );
}
