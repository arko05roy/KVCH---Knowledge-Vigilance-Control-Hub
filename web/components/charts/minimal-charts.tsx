"use client";

import React from "react";

/** Sparkline Line Chart for Risk Metrics */
export function MinimalSparklineChart({ data, color = "#5e6ad2" }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const height = 40;
  const width = 180;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (max - min || 1)) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex items-center gap-3">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`sparkline-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#sparkline-grad-${color.replace('#', '')})`}
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

/** FAIR Financial Exposure Bar Chart */
export function FinancialExposureBarChart() {
  const bars = [
    { label: "Min Loss", value: "₹15L", heightPercent: 20, color: "#38bdf8" },
    { label: "Most Likely", value: "₹48L", heightPercent: 55, color: "#f2c94c" },
    { label: "EAL (Annual)", value: "₹38.4L", heightPercent: 45, color: "#5e6ad2" },
    { label: "Max Exposure", value: "₹1.2Cr", heightPercent: 95, color: "#ff5555" },
  ];

  return (
    <div className="w-full bg-[#111213] border border-[#2b2c2e] rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12.5px] font-medium text-[#f7f8f8]">FAIR Financial Loss Distribution</span>
        <span className="text-[11px] text-[#8a8f98] font-mono">INC-2026-8891</span>
      </div>
      <div className="h-32 flex items-end justify-between gap-3 pt-4 px-2 border-b border-[#2b2c2e]">
        {bars.map((bar, i) => (
          <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
            <span className="text-[11px] font-semibold text-[#f7f8f8] mb-1 opacity-90 group-hover:scale-110 transition-transform">
              {bar.value}
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-500 ease-out hover:brightness-125 shadow-lg"
              style={{
                height: `${bar.heightPercent}%`,
                backgroundColor: bar.color,
                boxShadow: `0 0 12px ${bar.color}33`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-2 pt-2 text-[11px] text-[#8a8f98] font-mono">
        {bars.map((bar, i) => (
          <span key={i} className="flex-1 text-center truncate">{bar.label}</span>
        ))}
      </div>
    </div>
  );
}

/** Compliance Radar & Audit Progress Meters */
export function ComplianceFrameworkChart() {
  const frameworks = [
    { name: "ISO/IEC 27001", control: "A.8.28 / A.12.6", score: 45, status: "Deficient", color: "#ff5555" },
    { name: "SEBI CSCRF", control: "Sec 3.2 Access", score: 60, status: "Partial", color: "#f2c94c" },
    { name: "DPDP Act 2023", control: "Sec 8 Personal Data", score: 30, status: "High Risk", color: "#ff5555" },
    { name: "NIST CSF v2.0", control: "PR.IP-1 Baseline", score: 88, status: "Compliant", color: "#2ea043" },
  ];

  return (
    <div className="w-full bg-[#111213] border border-[#2b2c2e] rounded-xl p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-[#f7f8f8]">Regulatory Audit Compliance Status</span>
        <span className="text-[11px] text-[#8a8f98]">Framework Audit</span>
      </div>
      <div className="space-y-2.5">
        {frameworks.map((f, i) => (
          <div key={i} className="flex flex-col space-y-1">
            <div className="flex justify-between text-[11.5px]">
              <span className="text-[#f7f8f8] font-medium">{f.name} <span className="text-[#8a8f98] text-[10.5px]">({f.control})</span></span>
              <span style={{ color: f.color }} className="font-semibold text-[11px]">{f.status} ({f.score}%)</span>
            </div>
            <div className="w-full bg-[#1e1f22] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${f.score}%`, backgroundColor: f.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Entropy & Threat Severity Radial Gauge */
export function ThreatGaugeMeter({ score = 92, label = "Threat Severity Score" }: { score?: number; label?: string }) {
  const strokeDashoffset = 283 - (283 * score) / 100;
  const color = score > 80 ? "#ff5555" : score > 50 ? "#f2c94c" : "#5e6ad2";

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#111213] border border-[#2b2c2e] rounded-xl">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="38"
            stroke="#1e1f22"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r="38"
            stroke={color}
            strokeWidth="6"
            strokeDasharray="238"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[22px] font-bold text-[#f7f8f8] tracking-tight">{score}</span>
          <span className="text-[9px] text-[#8a8f98] uppercase tracking-wider font-semibold">/100</span>
        </div>
      </div>
      <span className="text-[12px] font-medium text-[#d0d6e0] mt-2">{label}</span>
      <span className="text-[10.5px] text-[#ff5555] font-mono mt-0.5">CRITICAL EXPOSURE</span>
    </div>
  );
}
