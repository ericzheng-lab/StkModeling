import React, { useState, useMemo } from "react";
import { InputField } from "./InputField";
import { ResultCard } from "./ResultCard";
import { SensitivityTable } from "./SensitivityTable";
import { tooltipStyle, axisStyle } from "./ChartTheme";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Legend,
} from "recharts";
import { ChevronDown, ChevronUp, Coins } from "lucide-react";

export function DividendStockValuation() {
  const [currentPrice, setCurrentPrice] = useState(30);
  const [annualDividend, setAnnualDividend] = useState(1.5);
  const [eps, setEps] = useState(3);
  const [requiredReturn, setRequiredReturn] = useState(0.1);
  const [dividendGrowthRate, setDividendGrowthRate] = useState(0.05);
  const [highGrowthRate, setHighGrowthRate] = useState(0.12);
  const [highGrowthYears, setHighGrowthYears] = useState(5);
  const [stableGrowthRate, setStableGrowthRate] = useState(0.04);
  const [retentionRate, setRetentionRate] = useState(0.5);
  const [roe, setRoe] = useState(0.15);
  const [costOfEquity, setCostOfEquity] = useState(0.1);
  const [riskFreeRate, setRiskFreeRate] = useState(0.035);
  const [yearsToProject, setYearsToProject] = useState(20);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gordon: true, twostage: true, hmodel: true, yield: true, sustainable: true, reinvestment: true,
  });
  const toggleSection = (key: string) => setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  const ggmValue = useMemo(() => {
    if (requiredReturn <= dividendGrowthRate) return Infinity;
    return annualDividend * (1 + dividendGrowthRate) / (requiredReturn - dividendGrowthRate);
  }, [annualDividend, requiredReturn, dividendGrowthRate]);
  const ggmSignal = useMemo(() => {
    if (!isFinite(ggmValue) || ggmValue <= 0) return "neutral" as const;
    const r = currentPrice / ggmValue;
    return r < 0.8 ? "buy" as const : r > 1.2 ? "sell" as const : "hold" as const;
  }, [currentPrice, ggmValue]);

  const twoStageDDM = useMemo(() => {
    let totalPV = 0;
    const projections: { year: number; dividend: number; pv: number }[] = [];
    let currentDiv = annualDividend;
    for (let i = 1; i <= highGrowthYears; i++) {
      currentDiv *= (1 + highGrowthRate);
      const pv = currentDiv / Math.pow(1 + requiredReturn, i);
      totalPV += pv;
      projections.push({ year: i, dividend: parseFloat(currentDiv.toFixed(3)), pv: parseFloat(pv.toFixed(3)) });
    }
    const terminalDiv = currentDiv * (1 + stableGrowthRate);
    const terminalValue = requiredReturn > stableGrowthRate ? terminalDiv / (requiredReturn - stableGrowthRate) : 0;
    const terminalPV = terminalValue / Math.pow(1 + requiredReturn, highGrowthYears);
    totalPV += terminalPV;
    for (let i = highGrowthYears + 1; i <= highGrowthYears + 10; i++) {
      currentDiv *= (1 + stableGrowthRate);
      const pv = currentDiv / Math.pow(1 + requiredReturn, i);
      projections.push({ year: i, dividend: parseFloat(currentDiv.toFixed(3)), pv: parseFloat(pv.toFixed(3)) });
    }
    return { value: totalPV, terminalPV, projections };
  }, [annualDividend, highGrowthRate, highGrowthYears, stableGrowthRate, requiredReturn]);
  const twoStageSignal = useMemo(() => {
    if (twoStageDDM.value <= 0) return "neutral" as const;
    const r = currentPrice / twoStageDDM.value;
    return r < 0.8 ? "buy" as const : r > 1.2 ? "sell" as const : "hold" as const;
  }, [currentPrice, twoStageDDM.value]);

  const hModelValue = useMemo(() => {
    if (requiredReturn <= stableGrowthRate) return Infinity;
    const d0 = annualDividend;
    return d0 * (1 + stableGrowthRate) / (requiredReturn - stableGrowthRate) +
      d0 * (highGrowthYears / 2) * (highGrowthRate - stableGrowthRate) / (requiredReturn - stableGrowthRate);
  }, [annualDividend, highGrowthRate, highGrowthYears, stableGrowthRate, requiredReturn]);
  const hModelSignal = useMemo(() => {
    if (!isFinite(hModelValue) || hModelValue <= 0) return "neutral" as const;
    const r = currentPrice / hModelValue;
    return r < 0.8 ? "buy" as const : r > 1.2 ? "sell" as const : "hold" as const;
  }, [currentPrice, hModelValue]);

  const dividendYield = useMemo(() => currentPrice > 0 ? annualDividend / currentPrice : 0, [annualDividend, currentPrice]);
  const payoutRatio = useMemo(() => eps > 0 ? annualDividend / eps : 0, [annualDividend, eps]);
  const dividendCoverage = useMemo(() => annualDividend > 0 ? eps / annualDividend : 0, [eps, annualDividend]);
  const yieldSignal = useMemo(() => dividendYield > 0.06 ? "buy" as const : dividendYield < 0.02 ? "sell" as const : "hold" as const, [dividendYield]);
  const sustainableGrowth = useMemo(() => retentionRate * roe, [retentionRate, roe]);
  const sustainableDivGrowth = useMemo(() => roe * (1 - payoutRatio), [roe, payoutRatio]);

  const reinvestmentProjection = useMemo(() => {
    const data: { year: number; annualIncome: number; totalValue: number; yieldOnCost: number }[] = [];
    let shares = 1000;
    const buyPrice = currentPrice;
    let currentDiv = annualDividend;
    let price = currentPrice;
    for (let i = 0; i <= yearsToProject; i++) {
      if (i > 0) {
        currentDiv *= (1 + dividendGrowthRate);
        price *= (1 + dividendGrowthRate + 0.02);
        shares += (shares * currentDiv) / price;
      }
      data.push({
        year: i,
        annualIncome: parseFloat((shares * currentDiv).toFixed(0)),
        totalValue: parseFloat((shares * price).toFixed(0)),
        yieldOnCost: parseFloat(((shares * currentDiv) / (1000 * buyPrice) * 100).toFixed(2)),
      });
    }
    return data;
  }, [currentPrice, annualDividend, dividendGrowthRate, yearsToProject]);

  const SectionHeader = ({ id, title }: { id: string; title: string }) => (
    <button onClick={() => toggleSection(id)} className="flex items-center justify-between w-full py-3 text-left group">
      <h3 className="text-[15px] text-foreground/90 tracking-tight">{title}</h3>
      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
        {expandedSections[id] ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </div>
    </button>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm shadow-black/[0.03]">{children}</div>
  );
  const FormulaBox = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/30 border border-slate-100 px-4 py-3 text-[12px] text-muted-foreground/70 leading-relaxed">{children}</div>
  );

  return (
    <div className="space-y-5 pt-4">
      <Card>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Coins className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-[15px] text-foreground/90 tracking-tight">基础数据输入</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
          <InputField label="当前股价" value={currentPrice} onChange={setCurrentPrice} unit="¥" />
          <InputField label="年度股息" value={annualDividend} onChange={setAnnualDividend} unit="¥" tooltip="每股年度股息" />
          <InputField label="每股收益 EPS" value={eps} onChange={setEps} unit="¥" />
          <InputField label="要求回报率" value={(requiredReturn * 100).toFixed(1)} onChange={(v) => setRequiredReturn(v / 100)} unit="%" />
          <InputField label="股息增长率" value={(dividendGrowthRate * 100).toFixed(1)} onChange={(v) => setDividendGrowthRate(v / 100)} unit="%" />
          <InputField label="高增长率" value={(highGrowthRate * 100).toFixed(1)} onChange={(v) => setHighGrowthRate(v / 100)} unit="%" />
          <InputField label="高增长年限" value={highGrowthYears} onChange={setHighGrowthYears} unit="年" step={1} />
          <InputField label="稳定增长率" value={(stableGrowthRate * 100).toFixed(1)} onChange={(v) => setStableGrowthRate(v / 100)} unit="%" />
          <InputField label="留存收益率" value={(retentionRate * 100).toFixed(0)} onChange={(v) => setRetentionRate(v / 100)} unit="%" />
          <InputField label="ROE" value={(roe * 100).toFixed(1)} onChange={(v) => setRoe(v / 100)} unit="%" />
          <InputField label="股权成本" value={(costOfEquity * 100).toFixed(1)} onChange={(v) => setCostOfEquity(v / 100)} unit="%" />
          <InputField label="无风险利率" value={(riskFreeRate * 100).toFixed(1)} onChange={(v) => setRiskFreeRate(v / 100)} unit="%" />
        </div>
      </Card>

      {/* GGM */}
      <Card>
        <SectionHeader id="gordon" title="戈登增长模型 GGM / DDM" />
        {expandedSections.gordon && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">P = D₁ / (r - g) = D₀ × (1+g) / (r - g)</p>
              <p className="mt-1 opacity-70">适用于股息稳定增长的成熟公司，要求 r &gt; g</p>
            </FormulaBox>
            <ResultCard
              title="GGM 内在价值" value={isFinite(ggmValue) ? `¥${ggmValue.toFixed(2)}` : "r ≤ g 无法计算"}
              subtitle={isFinite(ggmValue) ? `偏离 ${((currentPrice / ggmValue - 1) * 100).toFixed(1)}%` : ""}
              signal={ggmSignal}
              details={[
                { label: "当前股息 D₀", value: `¥${annualDividend.toFixed(2)}` },
                { label: "预期股息 D₁", value: `¥${(annualDividend * (1 + dividendGrowthRate)).toFixed(2)}` },
                { label: "增长率 g", value: `${(dividendGrowthRate * 100).toFixed(1)}%` },
                { label: "要求回报率 r", value: `${(requiredReturn * 100).toFixed(1)}%` },
                { label: "隐含收益率", value: `${(dividendYield * 100).toFixed(2)}%` },
                { label: "隐含增长率", value: `${((requiredReturn - annualDividend / currentPrice) * 100).toFixed(2)}%` },
              ]}
            />
            <SensitivityTable
              title="GGM 敏感性 (回报率 vs 增长率)" rowLabel="回报率" colLabel="增长率"
              rowValues={[requiredReturn - 0.02, requiredReturn - 0.01, requiredReturn, requiredReturn + 0.01, requiredReturn + 0.02]}
              colValues={[dividendGrowthRate - 0.01, dividendGrowthRate - 0.005, dividendGrowthRate, dividendGrowthRate + 0.005, dividendGrowthRate + 0.01]}
              currentPrice={currentPrice}
              calculateValue={(r, g) => r > g ? annualDividend * (1 + g) / (r - g) : 0}
            />
          </div>
        )}
      </Card>

      {/* Two-Stage DDM */}
      <Card>
        <SectionHeader id="twostage" title="两阶段股息折现 Two-Stage DDM" />
        {expandedSections.twostage && (
          <div className="space-y-4">
            <FormulaBox>
              <p>阶段1: 高增长期逐年折现 → 阶段2: 稳定期用 GGM 计算终值</p>
            </FormulaBox>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard
                title="两阶段 DDM 估值" value={`¥${twoStageDDM.value.toFixed(2)}`}
                subtitle={`高增长 ${highGrowthYears}年 ${(highGrowthRate * 100).toFixed(0)}% → 稳定 ${(stableGrowthRate * 100).toFixed(0)}%`}
                signal={twoStageSignal}
                details={[
                  { label: "高增长阶段价值", value: `¥${(twoStageDDM.value - twoStageDDM.terminalPV).toFixed(2)}` },
                  { label: "终值部分", value: `¥${twoStageDDM.terminalPV.toFixed(2)}` },
                  { label: "终值占比", value: `${((twoStageDDM.terminalPV / twoStageDDM.value) * 100).toFixed(1)}%` },
                  { label: "偏离幅度", value: `${((currentPrice / twoStageDDM.value - 1) * 100).toFixed(1)}%` },
                ]}
              />
              <div>
                <h4 className="text-[13px] text-foreground/60 mb-2">股息预测</h4>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                    <AreaChart data={twoStageDDM.projections} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="dividend" name="股息" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth={2} />
                      <Area type="monotone" dataKey="pv" name="现值" fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* H-Model */}
      <Card>
        <SectionHeader id="hmodel" title="H 模型 H-Model" />
        {expandedSections.hmodel && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">V = D₀(1+gL)/(r-gL) + D₀×H×(gS-gL)/(r-gL)</p>
              <p className="mt-1 opacity-70">H = 高增长半衰期。增长率从高增长线性下降到稳定增长</p>
            </FormulaBox>
            <ResultCard
              title="H 模型估值" value={isFinite(hModelValue) ? `¥${hModelValue.toFixed(2)}` : "无法计算"}
              subtitle={`增长率 ${(highGrowthRate * 100).toFixed(0)}% → ${(stableGrowthRate * 100).toFixed(0)}% 线性递减`}
              signal={hModelSignal}
              details={[
                { label: "H 值(半衰期)", value: `${(highGrowthYears / 2).toFixed(1)} 年` },
                { label: "稳定增长部分", value: isFinite(hModelValue) ? `¥${(annualDividend * (1 + stableGrowthRate) / (requiredReturn - stableGrowthRate)).toFixed(2)}` : "N/A" },
                { label: "超常增长部分", value: isFinite(hModelValue) ? `¥${(annualDividend * (highGrowthYears / 2) * (highGrowthRate - stableGrowthRate) / (requiredReturn - stableGrowthRate)).toFixed(2)}` : "N/A" },
                { label: "偏离幅度", value: isFinite(hModelValue) ? `${((currentPrice / hModelValue - 1) * 100).toFixed(1)}%` : "N/A" },
              ]}
            />
          </div>
        )}
      </Card>

      {/* Yield & Coverage */}
      <Card>
        <SectionHeader id="yield" title="股息收益率与覆盖率" />
        {expandedSections.yield && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard title="股息收益率" value={`${(dividendYield * 100).toFixed(2)}%`}
              subtitle={dividendYield > 0.04 ? "高收益" : dividendYield > 0.02 ? "中等" : "低收益"}
              signal={yieldSignal}
              details={[
                { label: "年度股息", value: `¥${annualDividend.toFixed(2)}` },
                { label: "收益率", value: `${(dividendYield * 100).toFixed(2)}%` },
                { label: "vs 无风险", value: `+${((dividendYield - riskFreeRate) * 100).toFixed(2)}%` },
              ]}
            />
            <ResultCard title="派息率" value={`${(payoutRatio * 100).toFixed(1)}%`}
              subtitle={payoutRatio > 0.8 ? "过高风险" : payoutRatio > 0.5 ? "适中" : "保守"}
              signal={payoutRatio > 0.9 ? "sell" : payoutRatio > 0.7 ? "hold" : "buy"}
              details={[
                { label: "EPS", value: `¥${eps.toFixed(2)}` },
                { label: "股息", value: `¥${annualDividend.toFixed(2)}` },
                { label: "留存比率", value: `${((1 - payoutRatio) * 100).toFixed(1)}%` },
              ]}
            />
            <ResultCard title="股息覆盖率" value={`${dividendCoverage.toFixed(2)}x`}
              subtitle={dividendCoverage > 2 ? "覆盖充分" : dividendCoverage > 1.5 ? "适中" : "不足"}
              signal={dividendCoverage > 2 ? "buy" : dividendCoverage > 1.2 ? "hold" : "sell"}
              details={[
                { label: "覆盖倍数", value: `${dividendCoverage.toFixed(2)}x` },
                { label: "安全标准", value: "> 2x" },
                { label: "可持续增长率", value: `${(sustainableGrowth * 100).toFixed(1)}%` },
              ]}
            />
          </div>
        )}
      </Card>

      {/* Sustainable */}
      <Card>
        <SectionHeader id="sustainable" title="可持续增长率分析" />
        {expandedSections.sustainable && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">g = ROE × 留存收益率 = ROE × (1 - 派息率)</p>
            </FormulaBox>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard title="可持续增长率" value={`${(sustainableGrowth * 100).toFixed(2)}%`}
                subtitle={`ROE ${(roe * 100).toFixed(1)}% × 留存 ${(retentionRate * 100).toFixed(0)}%`}
                signal={sustainableGrowth > dividendGrowthRate ? "buy" : "hold"}
                details={[
                  { label: "ROE", value: `${(roe * 100).toFixed(1)}%` },
                  { label: "留存收益率", value: `${(retentionRate * 100).toFixed(0)}%` },
                  { label: "可持续增长率", value: `${(sustainableGrowth * 100).toFixed(2)}%` },
                  { label: "预期股息增长", value: `${(dividendGrowthRate * 100).toFixed(1)}%` },
                  { label: "可持续?", value: sustainableGrowth > dividendGrowthRate ? "是" : "可能不可持续" },
                ]}
              />
              <ResultCard title="隐含回报率分解" value={`${(requiredReturn * 100).toFixed(1)}%`}
                subtitle="总回报 = 股息收益率 + 资本增值" signal="neutral"
                details={[
                  { label: "股息收益率", value: `${(dividendYield * 100).toFixed(2)}%` },
                  { label: "预期增值", value: `${(dividendGrowthRate * 100).toFixed(1)}%` },
                  { label: "总预期回报", value: `${((dividendYield + dividendGrowthRate) * 100).toFixed(2)}%` },
                  { label: "超额回报", value: `${((dividendYield + dividendGrowthRate - requiredReturn) * 100).toFixed(2)}%` },
                ]}
              />
            </div>
          </div>
        )}
      </Card>

      {/* DRIP */}
      <Card>
        <SectionHeader id="reinvestment" title="股息再投资 DRIP 模拟" />
        {expandedSections.reinvestment && (
          <div className="space-y-4">
            <FormulaBox>
              <p>假设持有 1000 股，全部股息再投资 · 股息增长 {(dividendGrowthRate * 100).toFixed(1)}%/年</p>
            </FormulaBox>
            <InputField label="投影年限" value={yearsToProject} onChange={setYearsToProject} unit="年" step={1} min={5} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[13px] text-foreground/60 mb-2">年度股息收入</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={210}>
                    <AreaChart data={reinvestmentProjection} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="annualIncome" name="年度股息收入" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-[13px] text-foreground/60 mb-2">成本收益率 YOC</h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={210}>
                    <LineChart data={reinvestmentProjection} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={axisStyle} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="yieldOnCost" name="YOC %" dot={false} stroke="#8b5cf6" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {reinvestmentProjection.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "初始投入", value: `¥${(1000 * currentPrice).toLocaleString()}`, color: "from-slate-500/10 to-slate-400/5", text: "text-slate-600" },
                  { label: `${yearsToProject}年后总价值`, value: `¥${reinvestmentProjection[reinvestmentProjection.length - 1]?.totalValue.toLocaleString()}`, color: "from-indigo-500/10 to-blue-400/5", text: "text-indigo-600" },
                  { label: `${yearsToProject}年后年收入`, value: `¥${reinvestmentProjection[reinvestmentProjection.length - 1]?.annualIncome.toLocaleString()}`, color: "from-emerald-500/10 to-teal-400/5", text: "text-emerald-600" },
                  { label: `${yearsToProject}年后 YOC`, value: `${reinvestmentProjection[reinvestmentProjection.length - 1]?.yieldOnCost}%`, color: "from-violet-500/10 to-purple-400/5", text: "text-violet-600" },
                ].map((item) => (
                  <div key={item.label} className={`rounded-xl bg-gradient-to-br ${item.color} border border-border/30 p-3.5 text-center`}>
                    <p className="text-[11px] text-muted-foreground/60 mb-1">{item.label}</p>
                    <p className={`text-lg tabular-nums ${item.text}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}