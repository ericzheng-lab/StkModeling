import React, { useState } from "react";
import { ValueStockValuation } from "./components/ValueStockValuation";
import { DividendStockValuation } from "./components/DividendStockValuation";
import { GrowthStockValuation } from "./components/GrowthStockValuation";
import { TrendingUp, Coins, Zap, BarChart3 } from "lucide-react";

const tabs = [
  {
    id: "value",
    label: "价值股",
    sublabel: "Value",
    icon: BarChart3,
    gradient: "from-indigo-500 to-blue-600",
    lightGradient: "from-indigo-500/10 to-blue-500/5",
    ring: "ring-indigo-500/20",
    text: "text-indigo-600",
    models: "格雷厄姆数 · P/E · P/B · DCF · NCAV · 剩余收益",
  },
  {
    id: "dividend",
    label: "股息股",
    sublabel: "Dividend",
    icon: Coins,
    gradient: "from-emerald-500 to-teal-600",
    lightGradient: "from-emerald-500/10 to-teal-500/5",
    ring: "ring-emerald-500/20",
    text: "text-emerald-600",
    models: "GGM · 两阶段DDM · H模型 · 股息分析 · DRIP模拟",
  },
  {
    id: "growth",
    label: "成长股",
    sublabel: "Growth",
    icon: Zap,
    gradient: "from-violet-500 to-purple-600",
    lightGradient: "from-violet-500/10 to-purple-500/5",
    ring: "ring-violet-500/20",
    text: "text-violet-600",
    models: "PEG · 三阶段DCF · EV/EBITDA · P/S · 40法则 · 反向DCF",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("value");
  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div>
                <h1 className="text-lg tracking-tight text-foreground">
                  ValuX <span className="text-muted-foreground/40">|</span>{" "}
                  <span className="text-muted-foreground text-base">股票估值分析</span>
                </h1>
                <p className="text-[11px] text-muted-foreground/50 tracking-wide">
                  PROFESSIONAL MULTI-MODEL VALUATION SYSTEM
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-[73px] z-30 bg-white/60 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center gap-1.5 py-2.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${tab.lightGradient} ring-1 ${tab.ring} ${tab.text} shadow-sm`
                      : "text-muted-foreground/60 hover:text-muted-foreground hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br ${tab.gradient} shadow-sm`
                        : "bg-slate-100"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  </div>
                  <div className="text-left">
                    <span className="text-[13px] block leading-tight">{tab.label}</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-50">{tab.sublabel}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Description Bar */}
      <div className="max-w-6xl mx-auto px-5 pt-5">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${currentTab.lightGradient} border border-border/30`}>
          <div className={`w-1.5 h-8 rounded-full bg-gradient-to-b ${currentTab.gradient}`} />
          <div>
            <p className={`text-[11px] uppercase tracking-widest ${currentTab.text} opacity-60 mb-0.5`}>
              估值模型
            </p>
            <p className="text-[13px] text-foreground/70">
              {currentTab.models}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-5 pb-16 pt-2">
        {activeTab === "value" && <ValueStockValuation />}
        {activeTab === "dividend" && <DividendStockValuation />}
        {activeTab === "growth" && <GrowthStockValuation />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-white/50 backdrop-blur-sm py-5">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <p className="text-[11px] text-muted-foreground/40 leading-relaxed">
            本工具仅供学习和研究参考，不构成投资建议。投资有风险，决策需谨慎。估值模型基于理论假设，实际投资需结合多维度分析。
          </p>
        </div>
      </footer>
    </div>
  );
}
