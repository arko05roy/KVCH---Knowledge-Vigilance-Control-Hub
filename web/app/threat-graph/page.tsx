"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Layers, Zap } from "lucide-react";
import ThreatReactFlowDiagram from "@/components/threat-reactflow-diagram";

export default function ThreatGraphPage() {
  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100 selection:bg-indigo-500 selection:text-white pb-20">
      {/* Sticky Header Navigation */}
      <header className="border-b border-zinc-800/80 bg-[#0d0e12]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/threat-studio"
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 transition flex items-center gap-1.5 text-xs font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Threat Studio
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white">KVCH Threat Architecture &amp; Attack Chain Visualizer</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  ReactFlow Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">Node-Based Step-by-Step Multi-Stage Threat Vector &amp; Active Defense Illustration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition"
            >
              Main Dashboard
            </Link>
            <Link
              href="/threat-studio"
              className="text-xs font-mono px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-950 transition flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Execute Pipeline
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-indigo-950/40 via-[#0f1118] to-purple-950/40 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                ReactFlow Active Defense &amp; Node Attack Chain Visualizer
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Visualizing Multi-Stage Threat Vectors &amp; Active Mitigations
              </h1>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Interactive Directed Acyclic Graph (DAG) for process hollowing, AegisDB-ZeroTrust database socket AST interception, and EdgeGuard-Sentinel WAF micro-fuzzing—with full telemetry inspectability at every node.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono shrink-0">
              <div className="bg-[#0b0c10]/80 p-3 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">SCENARIOS</span>
                <span className="text-white font-bold text-base">3 ReactFlow DAGs</span>
              </div>
              <div className="bg-[#0b0c10]/80 p-3 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">PIPELINE STAGES</span>
                <span className="text-emerald-400 font-bold text-base">8-Stage CTDE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Step-by-Step Interactive Component */}
        <ThreatReactFlowDiagram />

      </main>
    </div>
  );
}
