import React, { useState, useMemo } from "react";
import { InputField } from "./InputField";
import { ResultCard } from "./ResultCard";
import { SensitivityTable } from "./SensitivityTable";
import { tooltipStyle, axisStyle } from "./ChartTheme";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, Cell, ReferenceLine, Legend,
} from "recharts";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";

export function GrowthStockValuation() {
  const [currentPrice, setCurrentPrice] = useState(80);
  const [eps, setEps] = useState(2);
  const [revenue, setRevenue] = useState(5000);
  const [revenueGrowthRate, setRevenueGrowthRate] = useState(0.3);
  const [sharesOutstanding, setSharesOutstanding] = useState(200);
  const [netIncome, setNetIncome] = useState(400);
  const [fcf, setFcf] = useState(300);
  const [highGrowthRate, setHighGrowthRate] = useState(0.25);
  const [highGrowthYears, setHighGrowthYears] = useState(5);
  const [fadeGrowthRate, setFadeGrowthRate] = useState(0.15);
  const [fadeYears, setFadeYears] = useState(5);
  const [terminalGrowthRate, setTerminalGrowthRate] = useState(0.03);
  const [wacc, setWacc] = useState(0.12);
  const [ebitda, setEbitda] = useState(600);
  const [totalDebt, setTotalDebt] = useState(500);
  const [cashEquivalents, setCashEquivalents] = useState(200);
  const [industryEVEBITDA, setIndustryEVEBITDA] = useState(15);
  const [industryPS, setIndustryPS] = useState(5);
  const [profitMargin, setProfitMargin] = useState(0.1);
  const [targetReturn, setTargetReturn] = useState(0.15);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    peg: true, dcf: true, evebitda: true, ps: true, rule40: true, reverse: true, scenario: true,
  });
  const toggleSection = (key: string) => setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  const currentPE = useMemo(() => eps > 0 ? currentPrice / eps : 0, [currentPrice, eps]);
  const pegRatio = useMemo(() => { const g = revenueGrowthRate * 100; return g > 0 ? currentPE / g : 0; }, [currentPE, revenueGrowthRate]);
  const pegSignal = useMemo(() => pegRatio <= 0 ? "neutral" as const : pegRatio < 0.75 ? "buy" as const : pegRatio > 1.5 ? "sell" as const : "hold" as const, [pegRatio]);
  const fairPE = useMemo(() => revenueGrowthRate * 100, [revenueGrowthRate]);
  const pegFairPrice = useMemo(() => fairPE * eps, [fairPE, eps]);

  const growthDCF = useMemo(() => {
    let totalPV = 0;
    const cashFlows: { year: string; cf: number; pv: number; growth: number; stage: string }[] = [];
    let currentCF = fcf;
    let year = 0;
    for (let i = 1; i <= highGrowthYears; i++) {
      year++;
      currentCF *= (1 + highGrowthRate);
      const pv = currentCF / Math.pow(1 + wacc, year);
      totalPV += pv;
      cashFlows.push({ year: `Y${year}`, cf: Math.round(currentCF), pv: Math.round(pv), growth: highGrowthRate * 100, stage: "高增长" });
    }
    for (let i = 1; i <= fadeYears; i++) {
      year++;
      const fg = highGrowthRate + (fadeGrowthRate - highGrowthRate) * (i / fadeYears);
      currentCF *= (1 + fg);
      const pv = currentCF / Math.pow(1 + wacc, year);
      totalPV += pv;
      cashFlows.push({ year: `Y${year}`, cf: Math.round(currentCF), pv: Math.round(pv), growth: parseFloat((fg * 100).toFixed(1)), stage: "过渡期" });
    }
    const terminalCF = currentCF * (1 + terminalGrowthRate);
    const terminalValue = wacc > terminalGrowthRate ? terminalCF / (wacc - terminalGrowthRate) : 0;
    const terminalPV = terminalValue / Math.pow(1 + wacc, year);
    totalPV += terminalPV;
    return { totalPV, terminalPV, perShare: totalPV / sharesOutstanding, cashFlows };
  }, [fcf, highGrowthRate, highGrowthYears, fadeGrowthRate, fadeYears, terminalGrowthRate, wacc, sharesOutstanding]);
  const dcfSignal = useMemo(() => {
    if (growthDCF.perShare <= 0) return "neutral" as const;
    const r = currentPrice / growthDCF.perShare;
    return r < 0.7 ? "buy" as const : r > 1.2 ? "sell" as const : "hold" as const;
  }, [currentPrice, growthDCF.perShare]);

  const marketCap = useMemo(() => currentPrice * sharesOutstanding, [currentPrice, sharesOutstanding]);
  const enterpriseValue = useMemo(() => marketCap + totalDebt - cashEquivalents, [marketCap, totalDebt, cashEquivalents]);
  const currentEVEBITDA = useMemo(() => ebitda > 0 ? enterpriseValue / ebitda : 0, [enterpriseValue, ebitda]);
  const evEbitdaFairValue = useMemo(() => (ebitda * industryEVEBITDA - totalDebt + cashEquivalents) / sharesOutstanding, [ebitda, industryEVEBITDA, totalDebt, cashEquivalents, sharesOutstanding]);
  const evSignal = useMemo(() => currentEVEBITDA < industryEVEBITDA * 0.8 ? "buy" as const : currentEVEBITDA > industryEVEBITDA * 1.3 ? "sell" as const : "hold" as const, [currentEVEBITDA, industryEVEBITDA]);

  const revenuePerShare = useMemo(() => revenue / sharesOutstanding, [revenue, sharesOutstanding]);
  const currentPS = useMemo(() => revenuePerShare > 0 ? currentPrice / revenuePerShare : 0, [currentPrice, revenuePerShare]);
  const psFairPrice = useMemo(() => revenuePerShare * industryPS, [revenuePerShare, industryPS]);
  const psSignal = useMemo(() => currentPS < industryPS * 0.7 ? "buy" as const : currentPS > industryPS * 1.5 ? "sell" as const : "hold" as const, [currentPS, industryPS]);

  const rule40Score = useMemo(() => (revenueGrowthRate + profitMargin) * 100, [revenueGrowthRate, profitMargin]);
  const rule40Signal = useMemo(() => rule40Score >= 50 ? "buy" as const : rule40Score >= 40 ? "hold" as const : "sell" as const, [rule40Score]);

  const reverseDCF = useMemo(() => {
    const totalValue = currentPrice * sharesOutstanding;
    let lo = -0.1, hi = 1.0;
    for (let iter = 0; iter < 100; iter++) {
      const mid = (lo + hi) / 2;
      let pv = 0, cf = fcf;
      for (let i = 1; i <= 10; i++) { cf *= (1 + mid); pv += cf / Math.pow(1 + wacc, i); }
      const tv = cf * (1 + terminalGrowthRate) / (wacc - terminalGrowthRate);
      pv += tv / Math.pow(1 + wacc, 10);
      if (pv < totalValue) lo = mid; else hi = mid;
    }
    const impliedGrowth = (lo + hi) / 2;
    return { impliedGrowth, impliedPE: currentPrice / eps, impliedRevenue5yr: revenue * Math.pow(1 + impliedGrowth, 5) };
  }, [currentPrice, sharesOutstanding, fcf, wacc, terminalGrowthRate, revenue, eps]);

  const scenarioAnalysis = useMemo(() => {
    const scenarios = [
      { name: "悲观", growthMult: 0.5, waccAdd: 0.02, color: "#f43f5e" },
      { name: "保守", growthMult: 0.75, waccAdd: 0.01, color: "#f59e0b" },
      { name: "基准", growthMult: 1, waccAdd: 0, color: "#6366f1" },
      { name: "乐观", growthMult: 1.25, waccAdd: -0.01, color: "#10b981" },
      { name: "极乐观", growthMult: 1.5, waccAdd: -0.02, color: "#06b6d4" },
    ];
    return scenarios.map((s) => {
      const g = highGrowthRate * s.growthMult, w = wacc + s.waccAdd;
      let total = 0, cf = fcf;
      for (let i = 1; i <= 10; i++) { cf *= (1 + (i <= highGrowthYears ? g : terminalGrowthRate)); total += cf / Math.pow(1 + w, i); }
      const tv = cf * (1 + terminalGrowthRate) / (w - terminalGrowthRate);
      total += tv / Math.pow(1 + w, 10);
      return { ...s, value: parseFloat((total / sharesOutstanding).toFixed(2)), upside: parseFloat((((total / sharesOutstanding) / currentPrice - 1) * 100).toFixed(1)) };
    });
  }, [highGrowthRate, highGrowthYears, wacc, fcf, terminalGrowthRate, sharesOutstanding, currentPrice]);

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
    <div className="rounded-xl bg-gradient-to-r from-slate-50 to-violet-50/30 border border-slate-100 px-4 py-3 text-[12px] text-muted-foreground/70 leading-relaxed">{children}</div>
  );

  return (
    <div className="space-y-5 pt-4">
      <Card>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-[15px] text-foreground/90 tracking-tight">基础数据输入</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
          <InputField label="当前股价" value={currentPrice} onChange={setCurrentPrice} unit="¥" />
          <InputField label="每股收益 EPS" value={eps} onChange={setEps} unit="¥" />
          <InputField label="总收入" value={revenue} onChange={setRevenue} unit="百万" />
          <InputField label="收入增长率" value={(revenueGrowthRate * 100).toFixed(0)} onChange={(v) => setRevenueGrowthRate(v / 100)} unit="%" />
          <InputField label="流通股数" value={sharesOutstanding} onChange={setSharesOutstanding} unit="百万" />
          <InputField label="净利润" value={netIncome} onChange={setNetIncome} unit="百万" />
          <InputField label="利润率" value={(profitMargin * 100).toFixed(0)} onChange={(v) => setProfitMargin(v / 100)} unit="%" />
          <InputField label="EBITDA" value={ebitda} onChange={setEbitda} unit="百万" />
          <InputField label="自由现金流 FCF" value={fcf} onChange={setFcf} unit="百万" />
          <InputField label="总负债" value={totalDebt} onChange={setTotalDebt} unit="百万" />
          <InputField label="现金及等价物" value={cashEquivalents} onChange={setCashEquivalents} unit="百万" />
          <InputField label="WACC" value={(wacc * 100).toFixed(1)} onChange={(v) => setWacc(v / 100)} unit="%" />
        </div>
      </Card>

      {/* PEG */}
      <Card>
        <SectionHeader id="peg" title="PEG 比率分析" />
        {expandedSections.peg && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">PEG = P/E ÷ 盈利增速(%)</p>
              <p className="mt-1 opacity-70">PEG &lt; 1 可能被低估，PEG &gt; 1.5 可能被高估</p>
            </FormulaBox>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard title="PEG 比率" value={pegRatio.toFixed(3)}
                subtitle={`P/E ${currentPE.toFixed(1)}x ÷ 增速 ${(revenueGrowthRate * 100).toFixed(0)}%`}
                signal={pegSignal}
                details={[
                  { label: "当前 P/E", value: `${currentPE.toFixed(1)}x` },
                  { label: "收入增速", value: `${(revenueGrowthRate * 100).toFixed(0)}%` },
                  { label: "PEG", value: pegRatio.toFixed(3) },
                  { label: "PEG=1 合理 P/E", value: `${fairPE.toFixed(0)}x` },
                  { label: "PEG=1 合理价", value: `¥${pegFairPrice.toFixed(2)}` },
                ]}
              />
              <ResultCard title="增长调整估值" value={`¥${pegFairPrice.toFixed(2)}`}
                subtitle="基于 PEG = 1 的合理价格"
                signal={currentPrice < pegFairPrice * 0.8 ? "buy" : currentPrice > pegFairPrice * 1.2 ? "sell" : "hold"}
                details={[
                  { label: "合理 P/E", value: `${fairPE.toFixed(0)}x` },
                  { label: "合理价格", value: `¥${pegFairPrice.toFixed(2)}` },
                  { label: "PEG=0.75 价", value: `¥${(fairPE * 0.75 * eps).toFixed(2)}` },
                  { label: "PEG=1.5 价", value: `¥${(fairPE * 1.5 * eps).toFixed(2)}` },
                  { label: "上行空间", value: `${((pegFairPrice / currentPrice - 1) * 100).toFixed(1)}%` },
                ]}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Three-Stage DCF */}
      <Card>
        <SectionHeader id="dcf" title="三阶段成长型 DCF" />
        {expandedSections.dcf && (
          <div className="space-y-4">
            <FormulaBox>
              <p>阶段1: 高增长 → 阶段2: 线性递减过渡 → 阶段3: 永续稳定增长</p>
            </FormulaBox>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3">
              <InputField label="高增长率" value={(highGrowthRate * 100).toFixed(0)} onChange={(v) => setHighGrowthRate(v / 100)} unit="%" />
              <InputField label="高增长年限" value={highGrowthYears} onChange={setHighGrowthYears} unit="年" step={1} />
              <InputField label="过渡期增长率" value={(fadeGrowthRate * 100).toFixed(0)} onChange={(v) => setFadeGrowthRate(v / 100)} unit="%" />
              <InputField label="过渡期年限" value={fadeYears} onChange={setFadeYears} unit="年" step={1} />
              <InputField label="永续增长率" value={(terminalGrowthRate * 100).toFixed(1)} onChange={(v) => setTerminalGrowthRate(v / 100)} unit="%" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard title="三阶段 DCF 估值" value={`¥${growthDCF.perShare.toFixed(2)}`}
                subtitle={`终值占比 ${((growthDCF.terminalPV / growthDCF.totalPV) * 100).toFixed(1)}%`}
                signal={dcfSignal}
                details={[
                  { label: "企业总价值", value: `¥${growthDCF.totalPV.toFixed(0)} 百万` },
                  { label: "经营价值", value: `¥${(growthDCF.totalPV - growthDCF.terminalPV).toFixed(0)} 百万` },
                  { label: "终值", value: `¥${growthDCF.terminalPV.toFixed(0)} 百万` },
                  { label: "每股价值", value: `¥${growthDCF.perShare.toFixed(2)}` },
                  { label: "上行空间", value: `${((growthDCF.perShare / currentPrice - 1) * 100).toFixed(1)}%` },
                ]}
              />
              <div>
                <h4 className="text-[13px] text-foreground/60 mb-2">现金流与增长率</h4>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                    <BarChart data={growthDCF.cashFlows} margin={{ top: 5, right: 5, left: -15, bottom: 5 }} barCategoryGap="18%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} unit="%" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "Inter" }} />
                      <Bar yAxisId="left" dataKey="cf" name="现金流" radius={[6, 6, 2, 2]} maxBarSize={22}>
                        {growthDCF.cashFlows.map((entry, index) => (
                          <Cell key={index} fill={entry.stage === "高增长" ? "#8b5cf6" : "#06b6d4"} />
                        ))}
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="growth" name="增长率%" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3, strokeWidth: 0 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <SensitivityTable title="DCF 敏感性 (WACC vs 高增长率)" rowLabel="WACC" colLabel="高增长率"
              rowValues={[wacc - 0.02, wacc - 0.01, wacc, wacc + 0.01, wacc + 0.02]}
              colValues={[highGrowthRate - 0.05, highGrowthRate - 0.025, highGrowthRate, highGrowthRate + 0.025, highGrowthRate + 0.05]}
              currentPrice={currentPrice}
              calculateValue={(w, g) => {
                let total = 0, cf = fcf;
                for (let i = 1; i <= highGrowthYears; i++) { cf *= (1 + g); total += cf / Math.pow(1 + w, i); }
                for (let i = 1; i <= fadeYears; i++) { const yr = highGrowthYears + i; const fg = g + (fadeGrowthRate - g) * (i / fadeYears); cf *= (1 + fg); total += cf / Math.pow(1 + w, yr); }
                const tv = cf * (1 + terminalGrowthRate) / (w - terminalGrowthRate);
                total += tv / Math.pow(1 + w, highGrowthYears + fadeYears);
                return total / sharesOutstanding;
              }}
            />
          </div>
        )}
      </Card>

      {/* EV/EBITDA */}
      <Card>
        <SectionHeader id="evebitda" title="EV/EBITDA 估值分析" />
        {expandedSections.evebitda && (
          <div className="space-y-4">
            <FormulaBox>
              <p>EV = 市值 + 总负债 - 现金 · EV/EBITDA 消除资本结构差异</p>
            </FormulaBox>
            <InputField label="行业 EV/EBITDA" value={industryEVEBITDA} onChange={setIndustryEVEBITDA} unit="x" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard title="EV/EBITDA" value={`${currentEVEBITDA.toFixed(1)}x`}
                subtitle={`行业 ${industryEVEBITDA}x · ${currentEVEBITDA < industryEVEBITDA ? "折价" : "溢价"}`}
                signal={evSignal}
                details={[
                  { label: "市值", value: `¥${marketCap.toFixed(0)} 百万` },
                  { label: "EV", value: `¥${enterpriseValue.toFixed(0)} 百万` },
                  { label: "EBITDA", value: `¥${ebitda} 百万` },
                  { label: "EV/EBITDA", value: `${currentEVEBITDA.toFixed(1)}x` },
                  { label: "偏离幅度", value: `${((currentEVEBITDA / industryEVEBITDA - 1) * 100).toFixed(1)}%` },
                ]}
              />
              <ResultCard title="EV/EBITDA 合理价" value={`¥${evEbitdaFairValue.toFixed(2)}`}
                subtitle={`基于行业 ${industryEVEBITDA}x`}
                signal={currentPrice < evEbitdaFairValue * 0.8 ? "buy" : currentPrice > evEbitdaFairValue * 1.2 ? "sell" : "hold"}
                details={[
                  { label: "合理 EV", value: `¥${(ebitda * industryEVEBITDA).toFixed(0)} 百万` },
                  { label: "减: 负债", value: `-¥${totalDebt} 百万` },
                  { label: "加: 现金", value: `+¥${cashEquivalents} 百万` },
                  { label: "合理价格", value: `¥${evEbitdaFairValue.toFixed(2)}` },
                  { label: "上行空间", value: `${((evEbitdaFairValue / currentPrice - 1) * 100).toFixed(1)}%` },
                ]}
              />
            </div>
          </div>
        )}
      </Card>

      {/* P/S */}
      <Card>
        <SectionHeader id="ps" title="市销率 P/S 估值分析" />
        {expandedSections.ps && (
          <div className="space-y-4">
            <FormulaBox>
              <p>P/S = 市值 ÷ 收入 · 适用于高增长但尚未盈利的公司</p>
            </FormulaBox>
            <InputField label="行业平均 P/S" value={industryPS} onChange={setIndustryPS} unit="x" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard title="P/S 比率" value={`${currentPS.toFixed(2)}x`}
                subtitle={`行业 ${industryPS}x · 每股收入 ¥${revenuePerShare.toFixed(2)}`}
                signal={psSignal}
                details={[
                  { label: "当前 P/S", value: `${currentPS.toFixed(2)}x` },
                  { label: "行业 P/S", value: `${industryPS}x` },
                  { label: "合理价格", value: `¥${psFairPrice.toFixed(2)}` },
                  { label: "净利润率", value: `${(profitMargin * 100).toFixed(1)}%` },
                  { label: "隐含 P/E", value: `${(currentPS / profitMargin).toFixed(1)}x` },
                ]}
              />
              <ResultCard title="P/S 合理价格" value={`¥${psFairPrice.toFixed(2)}`}
                subtitle={`基于行业 ${industryPS}x P/S`}
                signal={currentPrice < psFairPrice * 0.7 ? "buy" : currentPrice > psFairPrice * 1.5 ? "sell" : "hold"}
                details={[
                  { label: "总收入", value: `¥${revenue} 百万` },
                  { label: "收入增速", value: `${(revenueGrowthRate * 100).toFixed(0)}%` },
                  { label: "增长调整 P/S", value: `${(revenueGrowthRate * 100 / 10).toFixed(1)}x` },
                  { label: "偏离幅度", value: `${((currentPrice / psFairPrice - 1) * 100).toFixed(1)}%` },
                ]}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Rule of 40 */}
      <Card>
        <SectionHeader id="rule40" title="40法则 Rule of 40" />
        {expandedSections.rule40 && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">Score = 收入增长率(%) + 利润率(%) ≥ 40%</p>
            </FormulaBox>
            <ResultCard title="40法则得分" value={`${rule40Score.toFixed(1)}`}
              subtitle={`增长 ${(revenueGrowthRate * 100).toFixed(0)}% + 利润率 ${(profitMargin * 100).toFixed(0)}%`}
              signal={rule40Signal}
              description={rule40Score >= 60 ? "卓越 — 增长与盈利俱佳" : rule40Score >= 40 ? "达标 — 平衡良好" : "未达标 — 需改进"}
              details={[
                { label: "收入增长率", value: `${(revenueGrowthRate * 100).toFixed(0)}%` },
                { label: "利润率", value: `${(profitMargin * 100).toFixed(0)}%` },
                { label: "综合得分", value: `${rule40Score.toFixed(1)}` },
                { label: "标准线", value: "40" },
                { label: "评级", value: rule40Score >= 60 ? "卓越" : rule40Score >= 40 ? "达标" : "需改进" },
              ]}
            />
          </div>
        )}
      </Card>

      {/* Reverse DCF */}
      <Card>
        <SectionHeader id="reverse" title="反向 DCF Reverse DCF" />
        {expandedSections.reverse && (
          <div className="space-y-4">
            <FormulaBox>
              <p>反向推算当前股价隐含的增长预期 — 隐含增长率 vs 实际增速的差距</p>
            </FormulaBox>
            <ResultCard title="隐含增长率" value={`${(reverseDCF.impliedGrowth * 100).toFixed(1)}%`}
              subtitle={`当前 ¥${currentPrice} 隐含的年均 FCF 增长率`}
              signal={reverseDCF.impliedGrowth > revenueGrowthRate * 1.5 ? "sell" : reverseDCF.impliedGrowth < revenueGrowthRate * 0.5 ? "buy" : "hold"}
              description={reverseDCF.impliedGrowth > revenueGrowthRate
                ? `隐含增长 ${(reverseDCF.impliedGrowth * 100).toFixed(1)}% > 实际 ${(revenueGrowthRate * 100).toFixed(0)}%，可能高估`
                : `隐含增长 ${(reverseDCF.impliedGrowth * 100).toFixed(1)}% < 实际 ${(revenueGrowthRate * 100).toFixed(0)}%，可能低估`}
              details={[
                { label: "隐含增长率", value: `${(reverseDCF.impliedGrowth * 100).toFixed(1)}%` },
                { label: "实际增长率", value: `${(revenueGrowthRate * 100).toFixed(0)}%` },
                { label: "差距", value: `${((reverseDCF.impliedGrowth - revenueGrowthRate) * 100).toFixed(1)}%` },
                { label: "隐含 P/E", value: `${reverseDCF.impliedPE.toFixed(1)}x` },
                { label: "5年隐含收入", value: `¥${reverseDCF.impliedRevenue5yr.toFixed(0)} 百万` },
              ]}
            />
          </div>
        )}
      </Card>

      {/* Scenario */}
      <Card>
        <SectionHeader id="scenario" title="情景分析 Scenario Analysis" />
        {expandedSections.scenario && (
          <div className="space-y-4">
            <FormulaBox>
              <p>基于不同增长假设和折现率，计算多种情景下的股票价值</p>
            </FormulaBox>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={250}>
                <BarChart data={scenarioAnalysis} margin={{ top: 10, right: 10, left: -10, bottom: 5 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`¥${v.toFixed(2)}`, "估值"]} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                  <ReferenceLine y={currentPrice} stroke="#f43f5e" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: `当前 ¥${currentPrice}`, position: "right", fontSize: 11, fill: "#f43f5e" }} />
                  <Bar dataKey="value" radius={[8, 8, 4, 4]} maxBarSize={52}>
                    {scenarioAnalysis.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              {scenarioAnalysis.map((s) => (
                <div key={s.name} className="rounded-xl border border-border/30 p-3.5 text-center bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-[11px] text-muted-foreground/50 mb-1">{s.name}</p>
                  <p className="text-lg tabular-nums" style={{ color: s.color }}>¥{s.value}</p>
                  <p className={`text-[11px] tabular-nums ${s.upside >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {s.upside >= 0 ? "+" : ""}{s.upside}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}