import React from "react";

interface SensitivityTableProps {
  title: string;
  rowLabel: string;
  colLabel: string;
  rowValues: number[];
  colValues: number[];
  calculateValue: (row: number, col: number) => number;
  currentPrice?: number;
  formatValue?: (v: number) => string;
}

export function SensitivityTable({
  title,
  rowLabel,
  colLabel,
  rowValues,
  colValues,
  calculateValue,
  currentPrice,
  formatValue = (v) => v.toFixed(2),
}: SensitivityTableProps) {
  return (
    <div className="mt-5">
      <h4 className="text-[13px] text-foreground/80 mb-3">{title}</h4>
      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr>
              <th className="p-2.5 bg-slate-100/80 text-left text-muted-foreground/70 rounded-tl-xl">
                <span className="text-[10px] uppercase tracking-wider">{rowLabel} \ {colLabel}</span>
              </th>
              {colValues.map((c, i) => (
                <th
                  key={c}
                  className={`p-2.5 bg-slate-100/80 text-center text-muted-foreground/70 ${i === colValues.length - 1 ? "rounded-tr-xl" : ""}`}
                >
                  {(c * 100).toFixed(1)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowValues.map((r, ri) => (
              <tr key={r}>
                <td className={`p-2.5 bg-slate-50/60 text-muted-foreground/70 ${ri === rowValues.length - 1 ? "rounded-bl-xl" : ""}`}>
                  {(r * 100).toFixed(1)}%
                </td>
                {colValues.map((c, ci) => {
                  const val = calculateValue(r, c);
                  const isAbove = currentPrice ? val > currentPrice : false;
                  const isLast = ri === rowValues.length - 1 && ci === colValues.length - 1;
                  return (
                    <td
                      key={ci}
                      className={`p-2.5 text-center tabular-nums transition-colors ${isLast ? "rounded-br-xl" : ""} ${
                        isAbove
                          ? "bg-emerald-50/80 text-emerald-700/90"
                          : "bg-rose-50/60 text-rose-600/80"
                      }`}
                    >
                      {formatValue(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {currentPrice && (
        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground/60">
          <span>当前股价: ¥{currentPrice.toFixed(2)}</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-400/60" /> 低估
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-rose-400/60" /> 高估
          </span>
        </div>
      )}
    </div>
  );
}
