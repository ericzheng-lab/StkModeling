import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface ResultCardProps {
  title: string;
  value: string;
  subtitle?: string;
  signal?: "buy" | "sell" | "hold" | "neutral";
  description?: string;
  details?: { label: string; value: string }[];
}

const signalConfig = {
  buy: {
    gradient: "from-emerald-500/8 to-teal-500/4",
    border: "border-emerald-500/20",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600",
    badgeDot: "bg-emerald-500",
    label: "低估 · 买入",
    icon: ArrowUpRight,
  },
  sell: {
    gradient: "from-rose-500/8 to-orange-500/4",
    border: "border-rose-500/20",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-600",
    badgeDot: "bg-rose-500",
    label: "高估 · 卖出",
    icon: ArrowDownRight,
  },
  hold: {
    gradient: "from-amber-500/8 to-yellow-500/4",
    border: "border-amber-500/20",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600",
    badgeDot: "bg-amber-500",
    label: "合理 · 持有",
    icon: Minus,
  },
  neutral: {
    gradient: "from-slate-500/5 to-slate-400/3",
    border: "border-slate-300/30",
    badgeBg: "bg-slate-500/8",
    badgeText: "text-slate-500",
    badgeDot: "bg-slate-400",
    label: "参考",
    icon: Minus,
  },
};

export function ResultCard({
  title,
  value,
  subtitle,
  signal = "neutral",
  description,
  details,
}: ResultCardProps) {
  const config = signalConfig[signal];
  const Icon = config.icon;

  return (
    <div
      className={`relative rounded-2xl border ${config.border} bg-gradient-to-br ${config.gradient} p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-[13px] text-muted-foreground">{title}</h4>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${config.badgeBg} ${config.badgeText} backdrop-blur-sm`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${config.badgeDot} animate-pulse`} />
          {config.label}
        </span>
      </div>
      <p className="text-[28px] tracking-tight text-foreground mb-0.5">{value}</p>
      {subtitle && (
        <p className="text-[13px] text-muted-foreground/80 mb-1">{subtitle}</p>
      )}
      {description && (
        <p className="text-[12px] text-muted-foreground/70 mt-3 leading-relaxed">
          {description}
        </p>
      )}
      {details && details.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
          {details.map((d, i) => (
            <div key={i} className="flex justify-between items-center text-[12px]">
              <span className="text-muted-foreground/70">{d.label}</span>
              <span className="text-foreground/90 tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
