import React, { useState, useMemo } from "react";
import { InputField } from "./InputField";
import { ResultCard } from "./ResultCard";
import { SensitivityTable } from "./SensitivityTable";
import { tooltipStyle, axisStyle } from "./ChartTheme";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend,
} from "recharts";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";

export function ValueStockValuation() {
  const [currentPrice, setCurrentPrice] = useState(25);
  const [eps, setEps] = useState(2.5);
  const [bvps, setBvps] = useState(15);
  const [totalRevenue, setTotalRevenue] = useState(1000);
  const [sharesOutstanding, setSharesOutstanding] = useState(100);
  const [fcf, setFcf] = useState(150);
  const [fcfGrowthRate, setFcfGrowthRate] = useState(0.08);
  const [wacc, setWacc] = useState(0.1);
  const [terminalGrowthRate, setTerminalGrowthRate] = useState(0.03);
  const [projectionYears, setProjectionYears] = useState(10);
  const [marginOfSafety, setMarginOfSafety] = useState(0.25);
  const [currentAssets, setCurrentAssets] = useState(500);
  const [totalLiabilities, setTotalLiabilities] = useState(300);
  const [preferredStock, setPreferredStock] = useState(0);
  const [industryPE, setIndustryPE] = useState(15);
  const [riskFreeRate, setRiskFreeRate] = useState(0.035);
  const [earningsGrowthRate, setEarningsGrowthRate] = useState(0.1);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    graham: true, pe: true, pb: true, dcf: true, netnet: true, eri: true,
  });
  const toggleSection = (key: string) =>
    setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  const grahamNumber = useMemo(() => {
    if (eps <= 0 || bvps <= 0) return 0;
    return Math.sqrt(22.5 * eps * bvps);
  }, [eps, bvps]);
  const grahamSignal = useMemo(() => {
    if (grahamNumber === 0) return "neutral" as const;
    const r = currentPrice / grahamNumber;
    return r < 0.8 ? "buy" as const : r > 1.2 ? "sell" as const : "hold" as const;
  }, [currentPrice, grahamNumber]);

  const currentPE = useMemo(() => (eps > 0 ? currentPrice / eps : 0), [currentPrice, eps]);
  const peBasedValue = useMemo(() => eps * industryPE, [eps, industryPE]);
  const peSignal = useMemo(() => {
    if (currentPE <= 0) return "neutral" as const;
    return currentPE < industryPE * 0.8 ? "buy" as const : currentPE > industryPE * 1.2 ? "sell" as const : "hold" as const;
  }, [currentPE, industryPE]);

  const currentPB = useMemo(() => (bvps > 0 ? currentPrice / bvps : 0), [currentPrice, bvps]);
  const pbSignal = useMemo(() => {
    return currentPB < 1 ? "buy" as const : currentPB > 3 ? "sell" as const : "hold" as const;
  }, [currentPB]);

  const dcfResult = useMemo(() => {
    let totalPV = 0;
    const cashFlows: { year: string; cf: number; pv: number }[] = [];
    for (let i = 1; i <= projectionYears; i++) {
      const cf = fcf * Math.pow(1 + fcfGrowthRate, i);
      const pv = cf / Math.pow(1 + wacc, i);
      totalPV += pv;
      cashFlows.push({ year: `Y${i}`, cf: Math.round(cf), pv: Math.round(pv) });
    }
    const terminalCF = fcf * Math.pow(1 + fcfGrowthRate, projectionYears) * (1 + terminalGrowthRate);
    const terminalValue = terminalCF / (wacc - terminalGrowthRate);
    const terminalPV = terminalValue / Math.pow(1 + wacc, projectionYears);
    totalPV += terminalPV;
    return { totalPV, terminalPV, intrinsicPerShare: totalPV / sharesOutstanding, safePrice: totalPV / sharesOutstanding * (1 - marginOfSafety), cashFlows };
  }, [fcf, fcfGrowthRate, wacc, terminalGrowthRate, projectionYears, sharesOutstanding, marginOfSafety]);
  const dcfSignal = useMemo(() => {
    return currentPrice < dcfResult.safePrice ? "buy" as const : currentPrice > dcfResult.intrinsicPerShare ? "sell" as const : "hold" as const;
  }, [currentPrice, dcfResult]);

  const ncav = useMemo(() => (currentAssets - totalLiabilities - preferredStock) / sharesOutstanding, [currentAssets, totalLiabilities, preferredStock, sharesOutstanding]);
  const ncavSignal = useMemo(() => {
    if (ncav <= 0) return "sell" as const;
    return currentPrice < ncav * 0.67 ? "buy" as const : currentPrice < ncav ? "hold" as const : "sell" as const;
  }, [currentPrice, ncav]);

  const eriValue = useMemo(() => {
    const requiredReturn = riskFreeRate + 0.05;
    const residualIncome = eps - bvps * requiredReturn;
    const riPV = residualIncome / (requiredReturn - earningsGrowthRate * 0.3);
    return bvps + riPV;
  }, [eps, bvps, riskFreeRate, earningsGrowthRate]);
  const eriSignal = useMemo(() => {
    if (eriValue <= 0) return "neutral" as const;
    const r = currentPrice / eriValue;
    return r < 0.8 ? "buy" as const : r > 1.2 ? "sell" as const : "hold" as const;
  }, [currentPrice, eriValue]);

  const comparisonData = useMemo(() => [
    { name: "当前股价", value: currentPrice, color: "#6366f1" },
    { name: "格雷厄姆", value: grahamNumber, color: "#10b981" },
    { name: "P/E估值", value: peBasedValue, color: "#f59e0b" },
    { name: "P/B(1x)", value: bvps, color: "#8b5cf6" },
    { name: "DCF估值", value: dcfResult.intrinsicPerShare, color: "#06b6d4" },
    { name: "安全边际价", value: dcfResult.safePrice, color: "#14b8a6" },
    { name: "NCAV", value: Math.max(ncav, 0), color: "#ec4899" },
    { name: "剩余收益", value: Math.max(eriValue, 0), color: "#f97316" },
  ], [currentPrice, grahamNumber, peBasedValue, bvps, dcfResult, ncav, eriValue]);

  const SectionHeader = ({ id, title }: { id: string; title: string }) => (
    <button onClick={() => toggleSection(id)} className="flex items-center justify-between w-full py-3 text-left group">
      <h3 className="text-[15px] text-foreground/90 tracking-tight">{title}</h3>
      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
        {expandedSections[id] ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </div>
    </button>
  );

  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-2xl border border-border/40 p-5 shadow-sm shadow-black/[0.03] ${className}`}>
      {children}
    </div>
  );

  const FormulaBox = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/30 border border-slate-100 px-4 py-3 text-[12px] text-muted-foreground/70 leading-relaxed">
      {children}
    </div>
  );

  return (
    <div className="space-y-5 pt-4">
      {/* Inputs */}
      <Card>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-[15px] text-foreground/90 tracking-tight">基础数据输入</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
          <InputField label="当前股价" value={currentPrice} onChange={setCurrentPrice} unit="¥" tooltip="股票当前市场价格" />
          <InputField label="每股收益 EPS" value={eps} onChange={setEps} unit="¥" tooltip="过去12个月的每股收益" />
          <InputField label="每股净资产 BVPS" value={bvps} onChange={setBvps} unit="¥" tooltip="每股账面价值" />
          <InputField label="总收入" value={totalRevenue} onChange={setTotalRevenue} unit="百万" tooltip="年度总收入" />
          <InputField label="流通股数" value={sharesOutstanding} onChange={setSharesOutstanding} unit="百万" tooltip="总流通股数" />
          <InputField label="行业平均 P/E" value={industryPE} onChange={setIndustryPE} unit="x" tooltip="同行业平均市盈率" />
          <InputField label="无风险利率" value={(riskFreeRate * 100).toFixed(1)} onChange={(v) => setRiskFreeRate(v / 100)} unit="%" tooltip="10年期国债收益率" />
          <InputField label="盈利增长率" value={(earningsGrowthRate * 100).toFixed(1)} onChange={(v) => setEarningsGrowthRate(v / 100)} unit="%" tooltip="预期年盈利增长率" />
        </div>
      </Card>

      {/* Comparison Chart */}
      <Card>
        <h3 className="text-[15px] text-foreground/90 tracking-tight mb-1">估值对比总览</h3>
        <p className="text-[12px] text-muted-foreground/50 mb-4">各模型估值结果与当前股价对比</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={280}>
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`¥${v.toFixed(2)}`, "估值"]} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
              <ReferenceLine y={currentPrice} stroke="#f43f5e" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: `当前 ¥${currentPrice}`, position: "right", fontSize: 11, fill: "#f43f5e", fontFamily: "Inter" }} />
              <Bar dataKey="value" radius={[8, 8, 4, 4]} maxBarSize={48}>
                {comparisonData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Graham */}
      <Card>
        <SectionHeader id="graham" title="格雷厄姆数 Graham Number" />
        {expandedSections.graham && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">V = √(22.5 × EPS × BVPS)</p>
              <p className="mt-1 opacity-70">合理 P/E ≤ 15，P/B ≤ 1.5，故 22.5 = 15 × 1.5</p>
            </FormulaBox>
            <ResultCard
              title="格雷厄姆数" value={`¥${grahamNumber.toFixed(2)}`}
              subtitle={`当前价 ¥${currentPrice} · ${currentPrice < grahamNumber ? "低于" : "高于"}格雷厄姆数 ${Math.abs(((currentPrice / grahamNumber - 1) * 100)).toFixed(1)}%`}
              signal={grahamSignal}
              details={[
                { label: "EPS", value: `¥${eps.toFixed(2)}` },
                { label: "BVPS", value: `¥${bvps.toFixed(2)}` },
                { label: "隐含 P/E", value: `${(grahamNumber / eps).toFixed(1)}x` },
                { label: "隐含 P/B", value: `${(grahamNumber / bvps).toFixed(2)}x` },
                { label: "安全边际", value: `${((1 - currentPrice / grahamNumber) * 100).toFixed(1)}%` },
              ]}
            />
          </div>
        )}
      </Card>

      {/* P/E */}
      <Card>
        <SectionHeader id="pe" title="市盈率 P/E 估值分析" />
        {expandedSections.pe && (
          <div className="space-y-4">
            <FormulaBox>
              <p>通过与行业平均 P/E 比较，判断估值合理性 · 合理估值 = EPS × 行业 P/E</p>
            </FormulaBox>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard
                title="P/E 比率分析" value={`${currentPE.toFixed(2)}x`}
                subtitle={`行业 ${industryPE.toFixed(1)}x · ${currentPE < industryPE ? "低于" : "高于"}行业 ${Math.abs(((currentPE / industryPE - 1) * 100)).toFixed(1)}%`}
                signal={peSignal}
                details={[
                  { label: "当前 P/E", value: `${currentPE.toFixed(2)}x` },
                  { label: "行业 P/E", value: `${industryPE.toFixed(1)}x` },
                  { label: "合理估值", value: `¥${peBasedValue.toFixed(2)}` },
                  { label: "偏离幅度", value: `${((currentPrice / peBasedValue - 1) * 100).toFixed(1)}%` },
                  { label: "E/P 收益率", value: `${((1 / currentPE) * 100).toFixed(2)}%` },
                ]}
              />
              <ResultCard
                title="PEG 快速判断"
                value={earningsGrowthRate > 0 ? `${(currentPE / (earningsGrowthRate * 100)).toFixed(2)}` : "N/A"}
                subtitle={`PEG = P/E ÷ 增速(%) · ${currentPE / (earningsGrowthRate * 100) < 1 ? "PEG<1 可能被低估" : "PEG>1 可能被高估"}`}
                signal={earningsGrowthRate > 0 ? (currentPE / (earningsGrowthRate * 100) < 0.8 ? "buy" : currentPE / (earningsGrowthRate * 100) > 1.5 ? "sell" : "hold") : "neutral"}
                details={[
                  { label: "P/E", value: `${currentPE.toFixed(2)}x` },
                  { label: "盈利增速", value: `${(earningsGrowthRate * 100).toFixed(1)}%` },
                  { label: "PEG", value: earningsGrowthRate > 0 ? (currentPE / (earningsGrowthRate * 100)).toFixed(3) : "N/A" },
                  { label: "林奇标准", value: "PEG < 1 为买入" },
                ]}
              />
            </div>
          </div>
        )}
      </Card>

      {/* P/B */}
      <Card>
        <SectionHeader id="pb" title="市净率 P/B 估值分析" />
        {expandedSections.pb && (
          <div className="space-y-4">
            <FormulaBox>
              <p>P/B = 市价 ÷ 每股净资产 · P/B &lt; 1 表示股价低于清算价值</p>
            </FormulaBox>
            <ResultCard
              title="P/B 比率分析" value={`${currentPB.toFixed(2)}x`}
              subtitle={`BVPS ¥${bvps.toFixed(2)} · ROE ${((eps / bvps) * 100).toFixed(1)}%`}
              signal={pbSignal}
              details={[
                { label: "当前 P/B", value: `${currentPB.toFixed(2)}x` },
                { label: "每股净资产", value: `¥${bvps.toFixed(2)}` },
                { label: "ROE", value: `${((eps / bvps) * 100).toFixed(1)}%` },
                { label: "合理 P/B (ROE法)", value: `${((eps / bvps) / (riskFreeRate + 0.05)).toFixed(2)}x` },
                { label: "溢价/折价", value: `${((currentPB - 1) * 100).toFixed(1)}%` },
                { label: "1x P/B 价格", value: `¥${bvps.toFixed(2)}` },
              ]}
            />
          </div>
        )}
      </Card>

      {/* DCF */}
      <Card>
        <SectionHeader id="dcf" title="现金流折现模型 DCF" />
        {expandedSections.dcf && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">DCF = Σ(FCFₜ / (1+WACC)ᵗ) + TV / (1+WACC)ⁿ</p>
              <p className="mt-1 opacity-70">终值 TV = FCFₙ × (1+g) / (WACC - g)</p>
            </FormulaBox>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-3">
              <InputField label="自由现金流 FCF" value={fcf} onChange={setFcf} unit="百万" />
              <InputField label="FCF增长率" value={(fcfGrowthRate * 100).toFixed(1)} onChange={(v) => setFcfGrowthRate(v / 100)} unit="%" />
              <InputField label="WACC" value={(wacc * 100).toFixed(1)} onChange={(v) => setWacc(v / 100)} unit="%" />
              <InputField label="永续增长率" value={(terminalGrowthRate * 100).toFixed(1)} onChange={(v) => setTerminalGrowthRate(v / 100)} unit="%" />
              <InputField label="安全边际" value={(marginOfSafety * 100).toFixed(0)} onChange={(v) => setMarginOfSafety(v / 100)} unit="%" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResultCard
                title="DCF 内在价值" value={`¥${dcfResult.intrinsicPerShare.toFixed(2)}`}
                subtitle={`安全边际价 ¥${dcfResult.safePrice.toFixed(2)} (${(marginOfSafety * 100).toFixed(0)}% MoS)`}
                signal={dcfSignal}
                details={[
                  { label: "企业总价值", value: `¥${dcfResult.totalPV.toFixed(0)} 百万` },
                  { label: "终值占比", value: `${((dcfResult.terminalPV / dcfResult.totalPV) * 100).toFixed(1)}%` },
                  { label: "每股内在价值", value: `¥${dcfResult.intrinsicPerShare.toFixed(2)}` },
                  { label: "安全边际价格", value: `¥${dcfResult.safePrice.toFixed(2)}` },
                  { label: "隐含上行空间", value: `${((dcfResult.intrinsicPerShare / currentPrice - 1) * 100).toFixed(1)}%` },
                ]}
              />
              <div>
                <h4 className="text-[13px] text-foreground/60 mb-2">预测现金流 (百万)</h4>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                    <BarChart data={dcfResult.cashFlows} margin={{ top: 5, right: 5, left: -15, bottom: 5 }} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="year" tick={axisStyle} axisLine={false} tickLine={false} />
                      <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                      <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "Inter" }} />
                      <Bar dataKey="cf" name="名义现金流" fill="#6366f1" radius={[6, 6, 2, 2]} maxBarSize={24} />
                      <Bar dataKey="pv" name="现值" fill="#06b6d4" radius={[6, 6, 2, 2]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <SensitivityTable
              title="DCF 敏感性分析 (WACC vs 永续增长率)"
              rowLabel="WACC" colLabel="永续增长率"
              rowValues={[wacc - 0.02, wacc - 0.01, wacc, wacc + 0.01, wacc + 0.02]}
              colValues={[terminalGrowthRate - 0.01, terminalGrowthRate - 0.005, terminalGrowthRate, terminalGrowthRate + 0.005, terminalGrowthRate + 0.01]}
              currentPrice={currentPrice}
              calculateValue={(r, c) => {
                if (r <= c) return 0;
                let total = 0;
                for (let i = 1; i <= projectionYears; i++) total += fcf * Math.pow(1 + fcfGrowthRate, i) / Math.pow(1 + r, i);
                const termCF = fcf * Math.pow(1 + fcfGrowthRate, projectionYears) * (1 + c);
                total += (termCF / (r - c)) / Math.pow(1 + r, projectionYears);
                return total / sharesOutstanding;
              }}
            />
          </div>
        )}
      </Card>

      {/* Net-Net */}
      <Card>
        <SectionHeader id="netnet" title="净流动资产价值 NCAV / Net-Net" />
        {expandedSections.netnet && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">NCAV = (流动资产 - 总负债 - 优先股) ÷ 流通股数</p>
              <p className="mt-1 opacity-70">格雷厄姆建议以 NCAV 的 2/3 以下买入</p>
            </FormulaBox>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
              <InputField label="流动资产" value={currentAssets} onChange={setCurrentAssets} unit="百万" />
              <InputField label="总负债" value={totalLiabilities} onChange={setTotalLiabilities} unit="百万" />
              <InputField label="优先股" value={preferredStock} onChange={setPreferredStock} unit="百万" />
            </div>
            <ResultCard
              title="每股 NCAV" value={`¥${ncav.toFixed(2)}`}
              subtitle={`2/3 NCAV 买入价: ¥${(ncav * 0.67).toFixed(2)}`}
              signal={ncavSignal}
              details={[
                { label: "流动资产", value: `¥${currentAssets} 百万` },
                { label: "总负债", value: `¥${totalLiabilities} 百万` },
                { label: "净流动资产", value: `¥${(currentAssets - totalLiabilities - preferredStock).toFixed(0)} 百万` },
                { label: "每股 NCAV", value: `¥${ncav.toFixed(2)}` },
                { label: "折价幅度", value: `${((1 - currentPrice / ncav) * 100).toFixed(1)}%` },
              ]}
            />
          </div>
        )}
      </Card>

      {/* Residual Income */}
      <Card>
        <SectionHeader id="eri" title="剩余收益模型 Residual Income" />
        {expandedSections.eri && (
          <div className="space-y-4">
            <FormulaBox>
              <p className="font-mono">V = BVPS + Σ(剩余收益ₜ / (1+r)ᵗ)</p>
              <p className="mt-1 opacity-70">剩余收益 = EPS - BVPS × 要求回报率</p>
            </FormulaBox>
            <ResultCard
              title="剩余收益估值" value={`¥${eriValue.toFixed(2)}`}
              subtitle="账面价值 + 超额收益现值"
              signal={eriSignal}
              details={[
                { label: "每股净资产", value: `¥${bvps.toFixed(2)}` },
                { label: "要求回报率", value: `${((riskFreeRate + 0.05) * 100).toFixed(1)}%` },
                { label: "每股剩余收益", value: `¥${(eps - bvps * (riskFreeRate + 0.05)).toFixed(2)}` },
                { label: "超额收益现值", value: `¥${(eriValue - bvps).toFixed(2)}` },
                { label: "偏离幅度", value: `${((currentPrice / eriValue - 1) * 100).toFixed(1)}%` },
              ]}
            />
          </div>
        )}
      </Card>
    </div>
  );
}