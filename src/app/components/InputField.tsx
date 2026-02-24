import React from "react";

interface InputFieldProps {
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  unit?: string;
  tooltip?: string;
  step?: number;
  min?: number;
  placeholder?: string;
}

export function InputField({
  label,
  value,
  onChange,
  unit,
  tooltip,
  step = 0.01,
  min,
  placeholder,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-muted-foreground tracking-wide uppercase">
          {label}
        </label>
        {tooltip && (
          <div className="group relative">
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-primary/10 text-primary text-[9px] cursor-help">
              ?
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1a1d2e] text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 max-w-[240px] shadow-xl">
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#1a1d2e]" />
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="relative group">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          placeholder={placeholder}
          className="w-full h-9 px-3 rounded-lg border border-border/60 bg-white/80 text-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 hover:border-primary/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground/60 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
