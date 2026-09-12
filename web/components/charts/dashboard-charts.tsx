"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Layers,
  BarChart3,
  TrendingDown,
  Activity,
  CheckCircle2,
  Lock,
} from "lucide-react";

/** 1. INTERN DASHBOARD: Interactive Triage Velocity & Skill Progression Chart using Recharts */
export function InternTriageVelocityChart() {
  const [mounted, setMounted] = useState(false);
  const [activeRange, setActiveRange] = useState<"7D" | "14D">("7D");
  const [activeDayIdx, setActiveDayIdx] = useState<number>(4); // Default to Friday
  const [metricView, setMetricView] = useState<"alerts" | "accuracy" | "speed">("alerts");
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);
  const [verifiedDays, setVerifiedDays] = useState<Record<string, boolean>>({ Fri: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  const sevenDays = [
    { day: "Mon", date: "Sep 08", alerts: 3, accuracy: 72, speed: 42, focus: "SQLi Basics", difficulty: "Moderate" },
    { day: "Tue", date: "Sep 09", alerts: 5, accuracy: 79, speed: 35, focus: "XSS Triage", difficulty: "Moderate" },
    { day: "Wed", date: "Sep 10", alerts: 4, accuracy: 84, speed: 28, focus: "Socket Match", difficulty: "High" },
    { day: "Thu", date: "Sep 11", alerts: 6, accuracy: 91, speed: 21, focus: "Hash Lookup", difficulty: "Critical" },
    { day: "Fri", date: "Sep 12", alerts: 8, accuracy: 96, speed: 14, focus: "C2 Infiltration", difficulty: "Critical" },
    { day: "Sat", date: "Sep 13", alerts: 2, accuracy: 100, speed: 11, focus: "Lab Review", difficulty: "Low" },
    { day: "Sun", date: "Sep 14", alerts: 1, accuracy: 100, speed: 9, focus: "Mentorship Prep", difficulty: "Low" },
  ];

  const fourteenDays = [
    { day: "M1", date: "Sep 01", alerts: 2, accuracy: 65, speed: 48, focus: "Git Forensics", difficulty: "Low" },
    { day: "T1", date: "Sep 02", alerts: 3, accuracy: 70, speed: 44, focus: "Port Recon", difficulty: "Moderate" },
    { day: "W1", date: "Sep 03", alerts: 4, accuracy: 74, speed: 39, focus: "Lockfile Diff", difficulty: "Moderate" },
    { day: "T1", date: "Sep 04", alerts: 3, accuracy: 78, speed: 36, focus: "Log Aggregation", difficulty: "Moderate" },
    { day: "F1", date: "Sep 05", alerts: 5, accuracy: 82, speed: 31, focus: "C2 Signatures", difficulty: "High" },
    { day: "S1", date: "Sep 06", alerts: 1, accuracy: 100, speed: 18, focus: "Weekly Retrospective", difficulty: "Low" },
    { day: "U1", date: "Sep 07", alerts: 1, accuracy: 100, speed: 15, focus: "Module Refresh", difficulty: "Low" },
    ...sevenDays,
  ];

  const currentDataset = activeRange === "7D" ? sevenDays : fourteenDays;
  const safeIdx = Math.min(activeDayIdx, currentDataset.length - 1);
  const current = currentDataset[safeIdx] || currentDataset[0];

  const targetVal = metricView === "alerts" ? 6 : metricView === "accuracy" ? 85 : 20;

  const toggleVerifyCurrentDay = () => {
    setVerifiedDays((prev) => ({
      ...prev,
      [current.day]: !prev[current.day],
    }));
  };

  // Recharts Custom Tooltip Component
  const CustomRechartsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c0d0e] border border-[#23252a] rounded-lg p-3 shadow-2xl text-[11px] font-mono z-50">
          <div className="flex items-center justify-between gap-4 border-b border-[#1f2125] pb-1.5 mb-1.5">
            <span className="text-[#f7f8f8] font-bold">{data.day} ({data.date})</span>
            <span className="text-[#828fff]">{data.difficulty}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[#8a8f98]">
              <span>Alerts Resolved:</span>
              <span className="text-[#f7f8f8] font-bold">{data.alerts}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[#8a8f98]">
              <span>Accuracy:</span>
              <span className="text-[#2ea043] font-bold">{data.accuracy}%</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[#8a8f98]">
              <span>MTTT Speed:</span>
              <span className="text-[#f2c94c] font-bold">{data.speed}m avg</span>
            </div>
            <div className="pt-1 text-[#828fff] text-[10px]">
              Focus: {data.focus}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl border border-[#23252a] bg-[#0c0d0e] p-6 shadow-2xl hover:border-[#34373c] transition-all hover-lift">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2125] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#5e6ad2] animate-pulse" />
            <h3 className="text-[15px] font-bold text-[#f7f8f8] tracking-tight">
              Weekly Triage Velocity &amp; Accuracy Spectrum
            </h3>
            <span className="px-2 py-0.5 text-[10.5px] font-mono text-[#5e6ad2] bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 rounded-full font-semibold">
              Live Interactive Telemetry
            </span>
          </div>
          <p className="text-[12px] text-[#8a8f98] mt-0.5">
            Real-time interactive chart tracking analyst resolution velocity, accuracy percentage, and MTTT latency
          </p>
        </div>

        {/* Action Toggles: Metric & Range */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 7D vs 14D Range Filter */}
          <div className="flex items-center bg-[#141516] border border-[#23252a] p-0.5 rounded-lg text-[11px] font-mono">
            <button
              onClick={() => {
                setActiveRange("7D");
                setActiveDayIdx(4);
              }}
              className={`px-2.5 py-1 rounded-md transition-all active:scale-95 ${
                activeRange === "7D"
                  ? "bg-[#282a30] text-[#f7f8f8] font-bold shadow-sm"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => {
                setActiveRange("14D");
                setActiveDayIdx(11);
              }}
              className={`px-2.5 py-1 rounded-md transition-all active:scale-95 ${
                activeRange === "14D"
                  ? "bg-[#282a30] text-[#f7f8f8] font-bold shadow-sm"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              14 Days
            </button>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center bg-[#141516] border border-[#23252a] p-0.5 rounded-lg text-[11px] font-mono">
            <button
              onClick={() => setMetricView("alerts")}
              className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
                metricView === "alerts"
                  ? "bg-[#5e6ad2] text-[#ffffff] font-bold shadow-md shadow-[#5e6ad2]/20"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              Alerts Resolved
            </button>
            <button
              onClick={() => setMetricView("accuracy")}
              className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
                metricView === "accuracy"
                  ? "bg-[#2ea043] text-[#ffffff] font-bold shadow-md shadow-[#2ea043]/20"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              Accuracy %
            </button>
            <button
              onClick={() => setMetricView("speed")}
              className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
                metricView === "speed"
                  ? "bg-[#f2c94c] text-[#0c0d0e] font-bold shadow-md shadow-[#f2c94c]/20"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              MTTT Speed
            </button>
          </div>

          {/* Target Baseline Toggle */}
          <button
            onClick={() => setShowTargetLine(!showTargetLine)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all active:scale-95 ${
              showTargetLine
                ? "bg-[#18191c] border-[#383b42] text-[#f7f8f8]"
                : "bg-transparent border-[#23252a] text-[#62666d] hover:text-[#8a8f98]"
            }`}
          >
            {showTargetLine ? "✓ Target Line" : "+ Target Line"}
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Linear Visualization, Right = Interactive Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left Chart Area */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#08090a] border border-[#1f2125] rounded-xl p-5 relative overflow-hidden">
          
          {/* Metric Scale Guide */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#62666d] mb-2 px-1">
            <span>
              Metric Stream:{" "}
              <strong className="text-[#f7f8f8]">
                {metricView === "alerts"
                  ? "Daily Alert Volume (Peak: 10)"
                  : metricView === "accuracy"
                  ? "Triage Accuracy Rate (100% Scale)"
                  : "Mean Time To Triage (Lower is Faster)"}
              </strong>
            </span>
            <span className="text-[10px] text-[#8a8f98]">Hover &amp; click bar to inspect</span>
          </div>

          {/* Container with Long / Tall Vertical Canvas */}
          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={currentDataset}
                  onClick={(e) => {
                    if (e && e.activeTooltipIndex !== undefined) {
                      setActiveDayIdx(Number(e.activeTooltipIndex));
                    }
                  }}
                  margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="linearAlertsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#828fff" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#5e6ad2" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="linearAccuracyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#42c55c" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#2ea043" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="linearSpeedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f2c94c" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#16181c" vertical={false} />
                  
                  <XAxis
                    dataKey="day"
                    stroke="#62666d"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1f2125" }}
                  />
                  <YAxis
                    stroke="#62666d"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: "#1f2125" }}
                    domain={metricView === "alerts" ? [0, 10] : metricView === "accuracy" ? [0, 100] : [0, 50]}
                  />

                  <Tooltip content={<CustomRechartsTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />

                  {/* Slender, Compressed Linear Bars */}
                  <Bar
                    dataKey={metricView}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={activeRange === "7D" ? 22 : 14}
                    className="cursor-pointer transition-all duration-300"
                  >
                    {currentDataset.map((entry, index) => {
                      const isSelected = index === safeIdx;
                      let fillColor =
                        metricView === "alerts"
                          ? isSelected
                            ? "#828fff"
                            : "url(#linearAlertsGrad)"
                          : metricView === "accuracy"
                          ? isSelected
                            ? "#42c55c"
                            : "url(#linearAccuracyGrad)"
                          : isSelected
                          ? "#f2c94c"
                          : "url(#linearSpeedGrad)";

                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={fillColor}
                          stroke={isSelected ? "#ffffff" : "transparent"}
                          strokeWidth={isSelected ? 1.5 : 0}
                        />
                      );
                    })}
                  </Bar>

                  {/* Trajectory Spline Curve */}
                  <Line
                    type="monotone"
                    dataKey={metricView}
                    stroke={metricView === "alerts" ? "#828fff" : metricView === "accuracy" ? "#42c55c" : "#f2c94c"}
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0c0d0e", stroke: metricView === "alerts" ? "#828fff" : metricView === "accuracy" ? "#42c55c" : "#f2c94c", strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: "#ffffff", strokeWidth: 2 }}
                  />

                  {/* Target SLA Reference Line */}
                  {showTargetLine && (
                    <ReferenceLine
                      y={targetVal}
                      stroke="#5e6ad2"
                      strokeDasharray="4 4"
                      label={{
                        value: `Target (${targetVal}${metricView === "accuracy" ? "%" : metricView === "speed" ? "m" : ""})`,
                        fill: "#828fff",
                        fontSize: 9,
                        position: "right",
                      }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-[#62666d] font-mono">
                Streaming Analyst Telemetry...
              </div>
            )}
          </div>

          {/* Bottom Trajectory Spark Summary */}
          <div className="flex items-center justify-between pt-3 border-t border-[#18191c] text-[11.5px] font-mono text-[#8a8f98] mt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2ea043]" />
              Velocity Stream: <strong className="text-[#f7f8f8]">+38% vs baseline</strong>
            </span>
            <span className="text-[#828fff] flex items-center gap-1">
              Top 5% Cohort Speed · MTTT 14m
            </span>
          </div>

        </div>

        {/* Right Interactive Day Inspector & Milestone Card */}
        <div className="lg:col-span-4 bg-[#121316] border border-[#232529] hover:border-[#34373c] rounded-xl p-5 flex flex-col justify-between h-full space-y-4 shadow-lg">
          <div>
            {/* Inspector Header */}
            <div className="flex items-center justify-between border-b border-[#232529] pb-3">
              <div>
                <span className="text-[10.5px] font-mono text-[#8a8f98] uppercase tracking-wider block">
                  Interactive Telemetry Inspector
                </span>
                <h4 className="text-[16px] font-bold text-[#f7f8f8] tracking-tight mt-0.5">
                  {current.day} ({current.date})
                </h4>
              </div>
              <span className={`px-2.5 py-1 text-[10.5px] font-mono font-bold rounded-full border ${
                current.difficulty === "Critical"
                  ? "text-[#ff5555] bg-[#ff5555]/10 border-[#ff5555]/30"
                  : current.difficulty === "High"
                  ? "text-[#f2c94c] bg-[#f2c94c]/10 border-[#f2c94c]/30"
                  : "text-[#2ea043] bg-[#2ea043]/10 border-[#2ea043]/30"
              }`}>
                {current.difficulty} Risk
              </span>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mt-3.5">
              <div className="bg-[#08090a] border border-[#1f2125] p-3 rounded-lg">
                <span className="text-[11px] text-[#8a8f98] font-mono block">Alerts Resolved</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[22px] font-bold text-[#f7f8f8]">{current.alerts}</span>
                  <span className="text-[11px] text-[#2ea043] font-mono font-semibold">+2 vs avg</span>
                </div>
              </div>

              <div className="bg-[#08090a] border border-[#1f2125] p-3 rounded-lg">
                <span className="text-[11px] text-[#8a8f98] font-mono block">Accuracy Precision</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[22px] font-bold text-[#2ea043]">{current.accuracy}%</span>
                  <span className="text-[11px] text-[#828fff] font-mono">Verified</span>
                </div>
              </div>
            </div>

            {/* Speed & Focus Tag */}
            <div className="bg-[#08090a] border border-[#1f2125] p-3 rounded-lg mt-3 space-y-2">
              <div className="flex items-center justify-between text-[11.5px] font-mono">
                <span className="text-[#8a8f98]">Average Resolution Speed:</span>
                <span className="text-[#f7f8f8] font-bold">{current.speed} minutes</span>
              </div>
              <div className="w-full bg-[#18191c] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#5e6ad2] to-[#2ea043] transition-all duration-300"
                  style={{ width: `${Math.max(100 - (current.speed * 1.8), 20)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                <span className="text-[#8a8f98]">Core Domain Focus:</span>
                <span className="text-[#828fff] font-semibold bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 px-2 py-0.5 rounded">
                  {current.focus}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Milestone Action Button */}
          <div className="space-y-2 pt-2">
            <button
              onClick={toggleVerifyCurrentDay}
              className={`w-full py-2.5 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border ${
                verifiedDays[current.day]
                  ? "bg-[#2ea043]/15 border-[#2ea043]/40 text-[#2ea043] shadow-sm shadow-[#2ea043]/10"
                  : "bg-[#18191c] hover:bg-[#23252a] border-[#2b2d31] text-[#f7f8f8]"
              }`}
            >
              {verifiedDays[current.day] ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#2ea043]" />
                  <span>Verified by Senior Mentor</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#828fff]" />
                  <span>Mark Day Milestone Verified</span>
                </>
              )}
            </button>
            <p className="text-[10.5px] text-[#62666d] text-center font-mono">
              Mentorship signature recorded in audit hash trail
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

/** 2. SR-DEV DASHBOARD: Attack Surface & Port Threat Breakdown Chart using Recharts */
export function AttackSurfaceExposureChart() {
  const [mounted, setMounted] = useState(false);
  const [selectedPort, setSelectedPort] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const portFindings = [
    {
      port: "5432/TCP",
      service: "PostgreSQL Listener",
      process: "postgres.bin",
      severity: "CRITICAL",
      deviation: "+140% abnormal socket IO",
      riskScore: 92,
      color: "#ff5555",
      remediation: "iptables -A INPUT -p tcp --dport 5432 -s 127.0.0.1 -j ACCEPT",
    },
    {
      port: "443/TCP",
      service: "Outbound C2 Reverse Shell",
      process: "telemetry_worker.js",
      severity: "CRITICAL",
      deviation: "Non-TLS payload on 443 to foreign Tor relay",
      riskScore: 98,
      color: "#ff5555",
      remediation: "kill -9 14209 && iptables -I OUTPUT -d 185.220.101.5 -j DROP",
    },
    {
      port: "22/TCP",
      service: "OpenSSH Daemon",
      process: "sshd",
      severity: "LOW",
      deviation: "Authorized bastion host keypair active",
      riskScore: 12,
      color: "#2ea043",
      remediation: "PasswordAuthentication no (Enforced)",
    },
    {
      port: "8080/TCP",
      service: "Envoy Proxy Sidecar",
      process: "envoy",
      severity: "MEDIUM",
      deviation: "HTTP/1.1 fallback detected on internal mesh",
      riskScore: 45,
      color: "#f2c94c",
      remediation: "Enforce mTLS strict mode in mesh config",
    },
  ];

  const current = portFindings[selectedPort];

  const CustomPortTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c0d0e] border border-[#23252a] rounded-lg p-2.5 shadow-2xl text-[11px] font-mono z-50">
          <div className="text-[#f7f8f8] font-bold border-b border-[#1f2125] pb-1 mb-1">
            {data.port} · {data.service}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[#8a8f98]">
              <span>Severity:</span>
              <span style={{ color: data.color }} className="font-bold">{data.severity}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[#8a8f98]">
              <span>Risk Score:</span>
              <span className="text-[#f7f8f8] font-bold">{data.riskScore}/100</span>
            </div>
            <div className="text-[10px] text-[#828fff] pt-0.5">
              Deviation: {data.deviation}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl border border-[#23252a] bg-[#0c0d0e] p-6 shadow-2xl hover:border-[#34373c] transition-all hover-lift">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2125] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5555] animate-pulse" />
            <h3 className="text-[15px] font-bold text-[#f7f8f8] tracking-tight">
              Active Attack Surface &amp; Port Binding Baseline
            </h3>
          </div>
          <p className="text-[12px] text-[#8a8f98] mt-0.5">
            Real-time port telemetry differential vs hardened organizational baseline
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#8a8f98] bg-[#141516] border border-[#23252a] px-2.5 py-1 rounded-md">
          4 Listening Daemons
        </span>
      </div>

      {/* Horizontal Threat Distribution Bar Chart */}
      <div className="h-44 w-full my-3 bg-[#08090a] border border-[#1f2125] rounded-xl p-3">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={portFindings}
              layout="vertical"
              onClick={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setSelectedPort(Number(e.activeTooltipIndex));
                }
              }}
              margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#16181c" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#62666d" fontSize={10} tickLine={false} axisLine={{ stroke: "#1f2125" }} unit=" pts" />
              <YAxis dataKey="port" type="category" stroke="#8a8f98" fontSize={11} tickLine={false} axisLine={{ stroke: "#1f2125" }} />
              <Tooltip content={<CustomPortTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />
              <Bar dataKey="riskScore" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {portFindings.map((entry, index) => (
                  <Cell
                    key={`port-cell-${index}`}
                    fill={entry.color}
                    stroke={selectedPort === index ? "#ffffff" : "transparent"}
                    strokeWidth={selectedPort === index ? 1.5 : 0}
                    className="cursor-pointer transition-all"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-[#62666d] font-mono">
            Loading Port Telemetry...
          </div>
        )}
      </div>

      {/* Port Pill Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {portFindings.map((pf, idx) => {
          const isSelected = selectedPort === idx;
          return (
            <button
              key={pf.port}
              onClick={() => setSelectedPort(idx)}
              className={`rounded-lg border p-2.5 text-left transition-all ${
                isSelected
                  ? "border-[#5e6ad2] bg-[#5e6ad2]/10 ring-1 ring-[#5e6ad2]/40"
                  : "border-[#23252a] bg-[#141516] hover:border-[#34343a]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-mono font-semibold text-[#f7f8f8]">{pf.port}</span>
                <span
                  style={{ color: pf.color }}
                  className="text-[10px] font-mono font-bold uppercase"
                >
                  {pf.severity}
                </span>
              </div>
              <p className="text-[11px] text-[#8a8f98] truncate">{pf.service}</p>
            </button>
          );
        })}
      </div>

      {/* Active Port Interactive Inspector */}
      <div className="rounded-lg border border-[#23252a] bg-[#121316] p-4 space-y-3 font-mono text-[12px]">
        <div className="flex items-center justify-between border-b border-[#1f2125] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[#8a8f98]">Service:</span>
            <span className="text-[#f7f8f8] font-semibold">{current.service} ({current.port})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#8a8f98]">Risk Score:</span>
            <span style={{ color: current.color }} className="font-bold">{current.riskScore}/100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11.5px]">
          <div>
            <span className="text-[#8a8f98] block">Bound Binary:</span>
            <code className="text-[#828fff]">{current.process}</code>
          </div>
          <div>
            <span className="text-[#8a8f98] block">Baseline Deviation:</span>
            <span className="text-[#d0d6e0]">{current.deviation}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1f2125] flex items-center justify-between">
          <span className="text-[11px] text-[#8a8f98]">Suggested Containment:</span>
          <code className="text-[11px] text-[#2ea043] bg-[#2ea043]/10 px-2 py-0.5 rounded border border-[#2ea043]/20">
            {current.remediation}
          </code>
        </div>
      </div>
    </div>
  );
}

/** 3. HR DASHBOARD: Insider Risk Activity & Workstation Policy Heatmap */
export function PolicyViolationHeatmapChart() {
  const [mounted, setMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("Fri");
  const [activeFilter, setActiveFilter] = useState<"all" | "usb" | "vpn">("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const heatmapDays = [
    {
      day: "Mon",
      status: "Compliant",
      count: 0,
      trackSlot: 5,
      color: "#2ea043",
      topViolation: "None recorded",
      affectedUsers: 0,
      vector: "Clean Baseline",
    },
    {
      day: "Tue",
      status: "Notice",
      count: 1,
      trackSlot: 5,
      color: "#f2c94c",
      topViolation: "Personal USB peripheral detected",
      affectedUsers: 1,
      vector: "USB / Removable Media",
    },
    {
      day: "Wed",
      status: "Compliant",
      count: 0,
      trackSlot: 5,
      color: "#2ea043",
      topViolation: "None recorded",
      affectedUsers: 0,
      vector: "Clean Baseline",
    },
    {
      day: "Thu",
      status: "Warning",
      count: 2,
      trackSlot: 5,
      color: "#f2c94c",
      topViolation: "Unapproved file sync to cloud storage",
      affectedUsers: 2,
      vector: "Cloud Storage Sync",
    },
    {
      day: "Fri",
      status: "Breach Detected",
      count: 4,
      trackSlot: 5,
      color: "#ff5555",
      topViolation: "External VPN file exfiltration & unencrypted socket",
      affectedUsers: 3,
      vector: "VPN & Socket Exfil",
    },
  ];

  const current = heatmapDays.find((h) => h.day === selectedDay) || heatmapDays[4];

  const CustomHeatmapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c0d0e] border border-[#23252a] rounded-lg p-3 shadow-2xl text-[11px] font-mono z-50 min-w-[210px]">
          <div className="flex items-center justify-between text-[#f7f8f8] font-bold border-b border-[#1f2125] pb-1.5 mb-1.5">
            <span>{data.day} Policy Audit</span>
            <span
              style={{ color: data.color }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#18191c] border border-[#26282e]"
            >
              {data.status}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[#8a8f98]">
              <span>Violations:</span>
              <span style={{ color: data.color }} className="font-bold text-[12px]">{data.count} detected</span>
            </div>
            <div className="flex items-center justify-between text-[#8a8f98]">
              <span>Primary Vector:</span>
              <span className="text-[#d0d6e0]">{data.vector}</span>
            </div>
            <div className="flex items-center justify-between text-[#8a8f98]">
              <span>Affected Committers:</span>
              <span className="text-[#f7f8f8] font-bold">{data.affectedUsers} users</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl border border-[#23252a] bg-[#0c0d0e] p-6 shadow-2xl hover:border-[#34373c] transition-all hover-lift">
      {/* Header Bar with Linear Styling and Telemetry Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2125] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f2c94c] animate-pulse" />
            <h3 className="text-[15px] font-bold text-[#f7f8f8] tracking-tight">
              Weekly Insider Risk &amp; Workstation Policy Stream
            </h3>
          </div>
          <p className="text-[12px] text-[#8a8f98] mt-0.5">
            Cross-departmental telemetry audited against ISO 27001 &amp; DPDP compliance controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Vector Filter Toggle */}
          <div className="flex items-center bg-[#141516] border border-[#23252a] p-0.5 rounded-lg text-[11px] font-mono">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-all active:scale-95 ${
                activeFilter === "all"
                  ? "bg-[#282a30] text-[#f7f8f8] font-bold shadow-sm"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              All Vectors
            </button>
            <button
              onClick={() => setActiveFilter("usb")}
              className={`px-2.5 py-1 rounded-md transition-all active:scale-95 ${
                activeFilter === "usb"
                  ? "bg-[#282a30] text-[#f7f8f8] font-bold shadow-sm"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              USB Media
            </button>
            <button
              onClick={() => setActiveFilter("vpn")}
              className={`px-2.5 py-1 rounded-md transition-all active:scale-95 ${
                activeFilter === "vpn"
                  ? "bg-[#282a30] text-[#f7f8f8] font-bold shadow-sm"
                  : "text-[#8a8f98] hover:text-[#d0d6e0]"
              }`}
            >
              VPN &amp; Socket
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#2ea043] bg-[#2ea043]/10 border border-[#2ea043]/20 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043] animate-ping" />
            Continuous Scan
          </span>
        </div>
      </div>

      {/* Linear Composite Visualization Canvas with Structured Background Tracks & Area Trajectory */}
      <div className="h-48 w-full my-3 bg-[#090a0c] border border-[#1e2025] rounded-xl p-4 relative overflow-hidden shadow-inner">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={heatmapDays}
              onClick={(e) => {
                if (e && e.activeTooltipIndex !== undefined) {
                  setSelectedDay(heatmapDays[Number(e.activeTooltipIndex)].day);
                }
              }}
              margin={{ top: 12, right: 15, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="hrRiskLinearArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5555" stopOpacity={0.24} />
                  <stop offset="50%" stopColor="#f2c94c" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#5e6ad2" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="friBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5555" stopOpacity={1} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="warnBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f2c94c" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#16181c" vertical={false} />
              <XAxis dataKey="day" stroke="#62666d" fontSize={11} tickLine={false} axisLine={{ stroke: "#1f2125" }} />
              <YAxis stroke="#62666d" fontSize={10} tickLine={false} axisLine={{ stroke: "#1f2125" }} domain={[0, 5]} allowDecimals={false} />
              
              <Tooltip content={<CustomHeatmapTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />

              {/* Architectural Background Track Pillars: Eliminates the empty void */}
              <Bar
                dataKey="trackSlot"
                radius={[6, 6, 6, 6]}
                maxBarSize={28}
                fill="rgba(255, 255, 255, 0.022)"
                stroke="#1c1e23"
                strokeWidth={1}
                isAnimationActive={false}
                className="pointer-events-none"
              />

              {/* Slender Foreground Incident Count Bars */}
              <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={16}>
                {heatmapDays.map((entry, index) => (
                  <Cell
                    key={`heatmap-cell-${index}`}
                    fill={entry.count >= 4 ? "url(#friBarGrad)" : entry.count > 0 ? "url(#warnBarGrad)" : "#2ea043"}
                    fillOpacity={entry.count === 0 ? 0.35 : 1}
                    stroke={selectedDay === entry.day ? "#ffffff" : "transparent"}
                    strokeWidth={selectedDay === entry.day ? 1.5 : 0}
                    className="cursor-pointer transition-all duration-200"
                  />
                ))}
              </Bar>

              {/* Continuous Smoothed Spline Curve with Gradient Area */}
              <Area
                type="monotone"
                dataKey="count"
                stroke="#828fff"
                strokeWidth={2}
                fill="url(#hrRiskLinearArea)"
                dot={{ r: 3.5, fill: "#0c0d0e", stroke: "#828fff", strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: "#ffffff", stroke: "#5e6ad2", strokeWidth: 2 }}
              />

              {/* Target Tolerance Limit Reference Line */}
              <ReferenceLine
                y={1}
                stroke="#5e6ad2"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: "Policy Tolerance Limit (1)",
                  fill: "#828fff",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-[#62666d] font-mono">
            Loading Risk Heatmap Stream...
          </div>
        )}
      </div>

      {/* Heatmap Blocks */}
      <div className="grid grid-cols-5 gap-2.5 mb-4">
        {heatmapDays.map((h) => {
          const isSelected = selectedDay === h.day;
          return (
            <div
              key={h.day}
              onClick={() => setSelectedDay(h.day)}
              className={`rounded-xl border p-3 cursor-pointer transition-all duration-200 hover-lift ${
                isSelected
                  ? "border-[#5e6ad2] bg-[#5e6ad2]/10 ring-1 ring-[#5e6ad2]/40 shadow-md shadow-[#5e6ad2]/10"
                  : "border-[#23252a] bg-[#141516] hover:border-[#34343a]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-mono font-semibold text-[#f7f8f8]">{h.day}</span>
                <span
                  style={{ backgroundColor: h.color }}
                  className="h-2 w-2 rounded-full shadow-sm"
                />
              </div>
              <div className="text-[20px] font-semibold font-mono text-[#f7f8f8]">{h.count}</div>
              <span className="text-[10px] text-[#8a8f98] block mt-0.5 truncate">{h.status}</span>
            </div>
          );
        })}
      </div>

      {/* Day Detail Findings Card */}
      <div className="rounded-xl border border-[#23252a] bg-[#121316] p-4 text-[12px] space-y-2.5 font-mono shadow-sm">
        <div className="flex items-center justify-between border-b border-[#1f2125] pb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#f7f8f8]">{current.day} Policy Audit Findings:</span>
            <span className="text-[10.5px] text-[#8a8f98]">· Vector: {current.vector}</span>
          </div>
          <span
            style={{ color: current.color }}
            className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#18191c] border border-[#24262c]"
          >
            {current.status} ({current.count} incidents)
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[#8a8f98] text-[11.5px]">
          <span>Primary Flag: <strong className="text-[#d0d6e0]">{current.topViolation}</strong></span>
          <span>Affected Committers: <strong className="text-[#f7f8f8] font-mono">{current.affectedUsers}</strong></span>
        </div>
      </div>
    </div>
  );
}

/** 4. MANAGEMENT DASHBOARD: Monte Carlo Loss Exceedance & Budget Simulator using Recharts */
export function MonteCarloVaRCurveChart() {
  const [mounted, setMounted] = useState(false);
  const [budgetSlider, setBudgetSlider] = useState<number>(150000); // Default ₹1.5L
  const [scenarioView, setScenarioView] = useState<"current" | "remediated" | "both">("both");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Monte Carlo Calculation:
  // Base Expected Annual Loss (EAL): ₹38,40,000
  const baseEAL = 3840000;
  const reductionRate = Math.min(0.968, (budgetSlider / 150000) * 0.968);
  const netEAL = Math.round(baseEAL * (1 - reductionRate));
  const lossAvoided = baseEAL - netEAL;
  const rosiPercent = budgetSlider > 0 ? Math.round((lossAvoided / budgetSlider) * 100) : 0;

  // Dynamic Recharts dataset representing loss exceedance probability
  const varPoints = [
    { loss: "₹5L", lossVal: 5, unmitigated: 96, remediated: Math.round(92 * (1 - reductionRate * 0.3)) },
    { loss: "₹15L", lossVal: 15, unmitigated: 86, remediated: Math.round(62 * (1 - reductionRate * 0.5)) },
    { loss: "₹25L", lossVal: 25, unmitigated: 72, remediated: Math.round(38 * (1 - reductionRate * 0.7)) },
    { loss: "₹38L", lossVal: 38, unmitigated: 58, remediated: Math.round(18 * (1 - reductionRate * 0.85)) },
    { loss: "₹50L", lossVal: 50, unmitigated: 44, remediated: Math.round(8 * (1 - reductionRate * 0.9)) },
    { loss: "₹75L", lossVal: 75, unmitigated: 28, remediated: Math.round(3 * (1 - reductionRate * 0.95)) },
    { loss: "₹1.0Cr", lossVal: 100, unmitigated: 16, remediated: Math.round(1 * (1 - reductionRate * 0.98)) },
    { loss: "₹1.5Cr", lossVal: 150, unmitigated: 8, remediated: 0 },
    { loss: "₹2.0Cr", lossVal: 200, unmitigated: 3, remediated: 0 },
  ];

  const CustomVaRTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0c0d0e] border border-[#23252a] rounded-lg p-3 shadow-2xl text-[11px] font-mono z-50">
          <div className="text-[#f7f8f8] font-bold border-b border-[#1f2125] pb-1 mb-1">
            Loss Exceedance: {data.loss}
          </div>
          <div className="space-y-1">
            {(scenarioView === "current" || scenarioView === "both") && (
              <div className="flex items-center justify-between gap-3 text-[#ff5555]">
                <span>Unmitigated Prob:</span>
                <span className="font-bold">{data.unmitigated}%</span>
              </div>
            )}
            {(scenarioView === "remediated" || scenarioView === "both") && (
              <div className="flex items-center justify-between gap-3 text-[#2ea043]">
                <span>Remediated Prob:</span>
                <span className="font-bold">{data.remediated}%</span>
              </div>
            )}
            <div className="text-[10px] text-[#8a8f98] pt-1">
              Delta: -{Math.max(0, data.unmitigated - data.remediated)}% Risk Compression
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl border border-[#23252a] bg-[#0c0d0e] p-6 shadow-2xl hover:border-[#34373c] transition-all hover-lift">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2125] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#828fff] animate-pulse" />
            <h3 className="text-[15px] font-bold text-[#f7f8f8] tracking-tight">
              FAIR Monte Carlo Loss Exceedance &amp; Security ROI Simulator
            </h3>
          </div>
          <p className="text-[12px] text-[#8a8f98] mt-0.5">
            10,000 statistical iterations quantifying Value at Risk (VaR) reduction across confidence intervals
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-[#23252a] bg-[#141516] p-0.5 text-[11px] font-mono">
          <button
            onClick={() => setScenarioView("both")}
            className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
              scenarioView === "both"
                ? "bg-[#282a30] text-[#f7f8f8] font-bold shadow-sm"
                : "text-[#8a8f98] hover:text-[#d0d6e0]"
            }`}
          >
            Comparative View
          </button>
          <button
            onClick={() => setScenarioView("current")}
            className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
              scenarioView === "current"
                ? "bg-[#ff5555]/20 text-[#ff5555] font-bold shadow-sm border border-[#ff5555]/40"
                : "text-[#8a8f98] hover:text-[#d0d6e0]"
            }`}
          >
            Unmitigated
          </button>
          <button
            onClick={() => setScenarioView("remediated")}
            className={`px-3 py-1 rounded-md transition-all active:scale-95 ${
              scenarioView === "remediated"
                ? "bg-[#2ea043]/20 text-[#2ea043] font-bold shadow-sm border border-[#2ea043]/40"
                : "text-[#8a8f98] hover:text-[#d0d6e0]"
            }`}
          >
            Remediated
          </button>
        </div>
      </div>

      {/* Area Curve Graphic */}
      <div className="h-56 w-full my-2 bg-[#090a0c] border border-[#1e2025] rounded-xl p-3 shadow-inner">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={varPoints} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="linearVarUnmitigated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5555" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ff5555" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="linearVarRemediated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ea043" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#2ea043" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#16181c" vertical={false} />
              
              <XAxis
                dataKey="loss"
                stroke="#62666d"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "#1f2125" }}
              />
              <YAxis
                stroke="#62666d"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "#1f2125" }}
                domain={[0, 100]}
                unit="%"
              />

              <Tooltip content={<CustomVaRTooltip />} />

              {(scenarioView === "current" || scenarioView === "both") && (
                <Area
                  type="monotone"
                  dataKey="unmitigated"
                  stroke="#ff5555"
                  strokeWidth={2}
                  fill="url(#linearVarUnmitigated)"
                  name="Unmitigated Risk"
                />
              )}

              {(scenarioView === "remediated" || scenarioView === "both") && (
                <Area
                  type="monotone"
                  dataKey="remediated"
                  stroke="#2ea043"
                  strokeWidth={2.5}
                  fill="url(#linearVarRemediated)"
                  name="Remediated Profile"
                />
              )}

              <ReferenceLine
                x="₹38L"
                stroke="#828fff"
                strokeDasharray="4 4"
                label={{
                  value: "Base EAL (₹38.4L)",
                  fill: "#828fff",
                  fontSize: 10,
                  position: "top",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-[#62666d] font-mono">
            Loading Monte Carlo Engine...
          </div>
        )}
      </div>

      {/* Interactive Investment Slider with Recharts Real-Time Feedback */}
      <div className="rounded-xl border border-[#23252a] bg-[#121316] p-4 space-y-3 text-[12px] font-mono mt-4">
        <div className="flex items-center justify-between">
          <span className="text-[#8a8f98]">
            Remediation Budget Allocation (Slide to simulate live ROSI curve):
          </span>
          <span className="text-[#f7f8f8] font-bold bg-[#1e2025] px-2.5 py-1 rounded border border-[#2b2d32]">
            ₹{(budgetSlider / 100000).toFixed(1)} Lakhs
          </span>
        </div>

        <input
          type="range"
          min="50000"
          max="500000"
          step="25000"
          value={budgetSlider}
          onChange={(e) => setBudgetSlider(Number(e.target.value))}
          className="w-full accent-[#5e6ad2] cursor-pointer"
        />

        <div className="grid grid-cols-4 gap-3 pt-2.5 border-t border-[#1f2125] text-center text-[11.5px]">
          <div className="bg-[#0c0d0e] p-2.5 rounded-lg border border-[#1f2125]">
            <span className="text-[#8a8f98] block text-[10.5px]">Net EAL:</span>
            <span className="text-[#2ea043] font-bold text-[14px]">₹{(netEAL / 100000).toFixed(1)}L</span>
          </div>
          <div className="bg-[#0c0d0e] p-2.5 rounded-lg border border-[#1f2125]">
            <span className="text-[#8a8f98] block text-[10.5px]">Gross Loss Avoided:</span>
            <span className="text-[#828fff] font-bold text-[14px]">₹{(lossAvoided / 100000).toFixed(1)}L</span>
          </div>
          <div className="bg-[#0c0d0e] p-2.5 rounded-lg border border-[#1f2125]">
            <span className="text-[#8a8f98] block text-[10.5px]">Risk Reduction:</span>
            <span className="text-[#f2c94c] font-bold text-[14px]">{(reductionRate * 100).toFixed(1)}%</span>
          </div>
          <div className="bg-[#0c0d0e] p-2.5 rounded-lg border border-[#1f2125]">
            <span className="text-[#8a8f98] block text-[10.5px]">ROSI Multiplier:</span>
            <span className="text-[#2ea043] font-bold text-[14px]">{rosiPercent}% ROI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
