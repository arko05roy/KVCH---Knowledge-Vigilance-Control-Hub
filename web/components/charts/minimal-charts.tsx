"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

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

/** Interactive Semi-Circle Gauge Meter (Linear-inspired Cyber Risk & Compliance Index) */
export function SemiCircleGaugeChart({
  value = 68,
  max = 100,
  title = "Insider Risk & Audit Index",
  statusLabel = "HIGH RISK EXPOSURE",
  history = [
    { label: "Prev Audit", score: 70 },
    { label: "30-Day Avg", score: 50 },
    { label: "Target", score: 20 }
  ]
}: {
  value?: number;
  max?: number;
  title?: string;
  statusLabel?: string;
  history?: { label: string; score: number }[];
}) {
  const [activeTab, setActiveTab] = useState("1W");

  // Dynamic values per time-range filter
  const rangeValues: Record<string, { val: number; label: string }> = {
    "1D": { val: 64, label: "ELEVATED RISK" },
    "1W": { val: value, label: statusLabel },
    "1M": { val: 52, label: "MODERATE RISK" },
    "1Y": { val: 38, label: "LOW EXPOSURE" }
  };

  const currentVal = rangeValues[activeTab]?.val ?? value;
  const currentLabel = rangeValues[activeTab]?.label ?? statusLabel;

  const percentage = Math.min(Math.max(currentVal / max, 0), 1);
  // Radius = 84, center = (110, 100).
  // Arc runs from 180° (left) to 0° (right). Angle in radians:
  const angle = Math.PI * (1 - percentage);
  const needleX = 110 - 84 * Math.cos(percentage * Math.PI);
  const needleY = 100 - 84 * Math.sin(percentage * Math.PI);

  const getStatusColor = (val: number) => {
    if (val >= 80) return "text-[#ff5555] bg-[#ff5555]/10 border-[#ff5555]/30";
    if (val >= 60) return "text-[#f2c94c] bg-[#f2c94c]/10 border-[#f2c94c]/30";
    return "text-[#2ea043] bg-[#2ea043]/10 border-[#2ea043]/30";
  };

  return (
    <div className="bg-[#0c0d0e] border border-[#23252a] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
      {/* Header with Title and Linear Segmented Range Pills */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#f2c94c]" />
          <span className="text-[13.5px] font-semibold text-[#f7f8f8] tracking-tight">{title}</span>
        </div>
        <div className="flex items-center gap-1 bg-[#141516] border border-[#23252a] p-0.5 rounded-full">
          {["1D", "1W", "1M", "1Y"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-full transition-all duration-200 active:scale-95 ${
                activeTab === t
                  ? "bg-[#282a30] text-[#f7f8f8] border border-[#383b42] shadow-sm"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Semi-Circle Gauge with Linear Hairline Arc & Glowing Indicator */}
      <div className="relative flex flex-col items-center justify-center my-2 select-none">
        <svg viewBox="0 0 220 120" className="w-56 h-32 overflow-visible">
          <defs>
            {/* Linear-grade gradient tailored to risk spectrum */}
            <linearGradient id="linearGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2ea043" />
              <stop offset="40%" stopColor="#5e6ad2" />
              <stop offset="70%" stopColor="#f2c94c" />
              <stop offset="100%" stopColor="#ff5555" />
            </linearGradient>
            <filter id="needleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Faint Outer Perimeter Track */}
          <path
            d="M 18 100 A 92 92 0 0 1 202 100"
            fill="none"
            stroke="#16171a"
            strokeWidth="1"
            strokeDasharray="2 6"
          />

          {/* Main Background Arc Track (Hairline 6px) */}
          <path
            d="M 26 100 A 84 84 0 0 1 194 100"
            fill="none"
            stroke="#1c1e23"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Active Gradient Arc Track (Hairline 6px) */}
          <path
            d="M 26 100 A 84 84 0 0 1 194 100"
            fill="none"
            stroke="url(#linearGaugeGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="263.9"
            strokeDashoffset={263.9 * (1 - percentage)}
            className="transition-all duration-700 ease-out"
          />

          {/* Glowing Pinpoint Marker - Positioned cleanly on the arc perimeter */}
          <circle
            cx={needleX}
            cy={needleY}
            r="7"
            fill="#5e6ad2"
            fillOpacity="0.25"
            className="transition-all duration-700 ease-out"
          />
          <circle
            cx={needleX}
            cy={needleY}
            r="4"
            fill="#ffffff"
            stroke="#121316"
            strokeWidth="1.5"
            filter="url(#needleGlow)"
            className="transition-all duration-700 ease-out cursor-pointer"
          />

          {/* Scale Labels */}
          <text x="24" y="115" fill="#62666d" fontSize="9" fontFamily="monospace" textAnchor="middle">0</text>
          <text x="110" y="24" fill="#62666d" fontSize="8" fontFamily="monospace" textAnchor="middle">50</text>
          <text x="196" y="115" fill="#62666d" fontSize="9" fontFamily="monospace" textAnchor="middle">100</text>
        </svg>

        {/* Center Typography & Badge with Generous Breathing Room */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className="text-[38px] font-bold text-[#f7f8f8] leading-none tracking-tight font-sans">
            {currentVal}
          </span>
          <span className={`text-[9.5px] font-mono font-semibold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full border ${getStatusColor(currentVal)}`}>
            {currentLabel}
          </span>
        </div>
      </div>

      {/* Historical Sub-Pills */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#1e2024]">
        {history.map((h, i) => (
          <div
            key={i}
            className="bg-[#121316] border border-[#23252a] hover:border-[#34373c] transition-colors rounded-xl p-2 flex flex-col items-center hover-lift"
          >
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
  const [mounted, setMounted] = useState(false);
  const [selectedBar, setSelectedBar] = useState<number | null>(2);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const bars = [
    { label: "Min Loss", amount: "₹15.0L", valLakhs: 15, color: "#38bdf8", badge: "Baseline Min" },
    { label: "Most Likely", amount: "₹48.0L", valLakhs: 48, color: "#f2c94c", badge: "Likely Exposure" },
    { label: "EAL (Annual)", amount: "₹38.4L", valLakhs: 38.4, color: "#828fff", badge: "Expected Loss" },
    { label: "Max Exposure", amount: "₹120.0L", valLakhs: 120, color: "#ff5555", badge: "Tail Risk VaR" },
  ];

  const CustomExposureTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c0d0e] border border-[#23252a] rounded-lg p-2.5 shadow-2xl text-[11px] font-mono">
          <div className="text-[#f7f8f8] font-bold border-b border-[#1f2125] pb-1 mb-1">
            {data.label}
          </div>
          <div className="text-[#828fff]">
            Value: <strong className="text-[#f7f8f8]">{data.amount}</strong>
          </div>
          <div className="text-[10px] text-[#8a8f98] mt-0.5">{data.badge}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-[#0c0d0e] border border-[#23252a] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover-lift">
      <div className="flex items-center justify-between mb-3 border-b border-[#1e2024] pb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[#f7f8f8] tracking-tight">
            FAIR Probabilistic Financial Loss Distribution
          </h3>
          <p className="text-[11.5px] text-[#8a8f98]">10,000 Monte Carlo draws for Incident #INC-2026-8891</p>
        </div>
        <span className="px-2.5 py-1 bg-[#18191d] border border-[#2b2d32] text-[#828fff] text-[11px] font-mono rounded-full font-semibold">
          10k Draws Monte Carlo
        </span>
      </div>

      <div className="h-48 w-full pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bars}
              onClick={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setSelectedBar(Number(e.activeTooltipIndex));
                }
              }}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#18191c" vertical={false} />
              <XAxis dataKey="label" stroke="#62666d" fontSize={11} tickLine={false} axisLine={{ stroke: "#1f2125" }} />
              <YAxis stroke="#62666d" fontSize={10} tickLine={false} axisLine={{ stroke: "#1f2125" }} unit="L" />
              <Tooltip content={<CustomExposureTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.04)" }} />
              <Bar dataKey="valLakhs" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {bars.map((entry, index) => (
                  <Cell
                    key={`cell-bar-${index}`}
                    fill={entry.color}
                    stroke={selectedBar === index ? "#ffffff" : "transparent"}
                    strokeWidth={selectedBar === index ? 1.5 : 0}
                    className="cursor-pointer transition-all"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-[#62666d] font-mono">
            Loading Exposure Chart...
          </div>
        )}
      </div>

      <div className="flex justify-between gap-2 pt-3 border-t border-[#1e2024] text-[11.5px] text-[#8a8f98] font-mono">
        {bars.map((bar, i) => (
          <span
            key={i}
            onClick={() => setSelectedBar(i)}
            className={`flex-1 text-center truncate cursor-pointer transition-colors ${
              selectedBar === i ? "text-[#f7f8f8] font-bold" : "hover:text-[#d0d6e0]"
            }`}
          >
            {bar.amount}
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

