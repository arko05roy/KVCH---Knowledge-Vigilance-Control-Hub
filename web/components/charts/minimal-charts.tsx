"use client";

import React, { useState } from "react";

/** Sparkline Line Chart for Risk & Policy Metrics */
export function MinimalSparklineChart({
  data,
  color = "#828fff",
  height = 45,
  width = 180
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (max - min || 1)) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  const colorClean = color.replace("#", "");

  return (
    <div className="flex items-center gap-2 overflow-visible">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`sparkline-grad-${colorClean}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#sparkline-grad-${colorClean})`}
        />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

/** Interactive Semi-Circle Gauge Meter (Fear & Greed / Risk Index style) */
export function SemiCircleGaugeChart({
  value = 68,
  max = 100,
  title = "Cyber Risk & Compliance Index",
  statusLabel = "HIGH EXPOSURE",
  history = [
    { label: "Yesterday", score: 70 },
    { label: "Last Week", score: 50 },
    { label: "Last Month", score: 54 }
  ]
}: {
  value?: number;
  max?: number;
  title?: string;
  statusLabel?: string;
  history?: { label: string; score: number }[];
}) {
  const [activeTab, setActiveTab] = useState("1W");
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const angle = Math.PI * (1 - percentage);
  const needleX = 100 + 65 * Math.cos(angle);
  const needleY = 95 - 65 * Math.sin(angle);

  const getStatusColor = (val: number) => {
    if (val >= 80) return "text-[#ff5555] bg-[#ff5555]/10 border-[#ff5555]/30";
    if (val >= 60) return "text-[#f2c94c] bg-[#f2c94c]/10 border-[#f2c94c]/30";
    return "text-[#2ea043] bg-[#2ea043]/10 border-[#2ea043]/30";
  };

  return (
    <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[13.5px] font-semibold text-[#f7f8f8] tracking-tight">{title}</span>
        <div className="flex items-center gap-1 bg-[#14161a] border border-[#232529] p-0.5 rounded-full">
          {["1D", "1W", "1M", "1Y"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-full transition-colors ${
                activeTab === t
                  ? "bg-[#282a30] text-[#f7f8f8] border border-[#383b42]"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Semi-Circle Gauge */}
      <div className="relative flex flex-col items-center justify-center my-3">
        <svg viewBox="0 0 200 115" className="w-52 h-30 overflow-visible">
          <defs>
            <linearGradient id="gauge-grad-full" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2ea043" />
              <stop offset="35%" stopColor="#828fff" />
              <stop offset="70%" stopColor="#f2c94c" />
              <stop offset="100%" stopColor="#ff5555" />
            </linearGradient>
          </defs>
          {/* Background Arc */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="#1a1c20"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Colored Gradient Arc */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="url(#gauge-grad-full)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 * (1 - percentage)}
            className="transition-all duration-1000 ease-out"
          />
          {/* Glowing Needle Indicator Marker */}
          <circle cx={needleX} cy={needleY} r="8" fill="#ffffff" className="shadow-lg shadow-white/50 transition-all duration-700" />
          <circle cx={needleX} cy={needleY} r="4" fill="#0c0d0e" />
        </svg>

        <div className="absolute bottom-0 flex flex-col items-center">
          <span className="text-[34px] font-extrabold text-[#f7f8f8] leading-none tracking-tight">
            {value}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full border ${getStatusColor(value)}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Historical Sub-Pills */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#1e2024]">
        {history.map((h, i) => (
          <div key={i} className="bg-[#121316] border border-[#232529] hover:border-[#2f3238] transition-colors rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] text-[#8a8f98] font-medium">{h.label}</span>
            <span className="text-[13px] font-bold text-[#f7f8f8] mt-0.5 font-mono">{h.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** FAIR Financial Exposure Bar Chart */
export function FinancialExposureBarChart() {
  const [selectedBar, setSelectedBar] = useState<number | null>(2);

  const bars = [
    { label: "Min Loss", value: "₹15,00,000", heightPercent: 25, color: "#38bdf8", badge: "Baseline Min" },
    { label: "Most Likely", value: "₹48,00,000", heightPercent: 60, color: "#f2c94c", badge: "Likely Exposure" },
    { label: "EAL (Annual)", value: "₹38,40,000", heightPercent: 48, color: "#828fff", badge: "Expected Loss" },
    { label: "Max Exposure", value: "₹1,20,00,000", heightPercent: 95, color: "#ff5555", badge: "Tail Risk VaR" },
  ];

  return (
    <div className="w-full bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-[#1e2024] pb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[#f7f8f8] tracking-tight">FAIR Probabilistic Financial Loss Distribution</h3>
          <p className="text-[11.5px] text-[#8a8f98]">10,000 Monte Carlo draws for Incident #INC-2026-8891</p>
        </div>
        <span className="px-2.5 py-1 bg-[#18191d] border border-[#2b2d32] text-[#828fff] text-[11px] font-mono rounded-full font-semibold">
          10k Draws Monte Carlo
        </span>
      </div>

      <div className="h-44 flex items-end justify-between gap-4 pt-6 pb-2 px-3 border-b border-[#1e2024]">
        {bars.map((bar, i) => (
          <div
            key={i}
            onClick={() => setSelectedBar(i)}
            className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
          >
            <div className={`text-[11.5px] font-bold font-mono mb-1.5 transition-all ${selectedBar === i ? "text-[#f7f8f8] scale-110" : "text-[#8a8f98]"}`}>
              {bar.value}
            </div>
            <div
              className={`w-full rounded-t-lg transition-all duration-500 ease-out group-hover:brightness-125 shadow-lg relative ${selectedBar === i ? "ring-2 ring-white/50" : ""}`}
              style={{
                height: `${bar.heightPercent}%`,
                backgroundColor: bar.color,
                boxShadow: `0 0 16px ${bar.color}40`,
              }}
            >
              {selectedBar === i && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#18191d] text-[10px] text-[#f7f8f8] font-mono px-2 py-0.5 rounded border border-[#34373c] whitespace-nowrap shadow-xl">
                  {bar.badge}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between gap-2 pt-3 text-[11.5px] text-[#8a8f98] font-mono">
        {bars.map((bar, i) => (
          <span
            key={i}
            onClick={() => setSelectedBar(i)}
            className={`flex-1 text-center truncate cursor-pointer transition-colors ${selectedBar === i ? "text-[#f7f8f8] font-bold" : "hover:text-[#d0d6e0]"}`}
          >
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Regulatory Audit Compliance Status Bar Chart */
export function ComplianceFrameworkChart() {
  const frameworks = [
    { name: "ISO/IEC 27001:2022", control: "A.8.28 Secure Coding", score: 45, status: "Deficient", color: "#ff5555" },
    { name: "SEBI CSCRF Framework", control: "Sec 3.2 Access Governance", score: 60, status: "Partial", color: "#f2c94c" },
    { name: "Digital DPDP Act 2023", control: "Sec 8 Breach Notification", score: 30, status: "High Risk", color: "#ff5555" },
    { name: "NIST CSF v2.0", control: "PR.IP-1 Control Baseline", score: 88, status: "Compliant", color: "#2ea043" },
  ];

  return (
    <div className="w-full bg-[#121316] border border-[#232529] rounded-xl p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#f7f8f8]">Regulatory Framework Audit Status</span>
        <span className="text-[10.5px] font-mono text-[#8a8f98] uppercase">Automated GRC Crosswalk</span>
      </div>
      <div className="space-y-3">
        {frameworks.map((f, i) => (
          <div key={i} className="flex flex-col space-y-1">
            <div className="flex justify-between text-[11.5px]">
              <span className="text-[#f7f8f8] font-medium">
                {f.name} <span className="text-[#8a8f98] text-[10.5px]">({f.control})</span>
              </span>
              <span style={{ color: f.color }} className="font-bold font-mono text-[11px]">
                {f.status} ({f.score}%)
              </span>
            </div>
            <div className="w-full bg-[#1c1e22] h-2 rounded-full overflow-hidden p-0.5 border border-[#27292f]">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${f.score}%`, backgroundColor: f.color, boxShadow: `0 0 8px ${f.color}66` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

