"use client";

import React, { useState, useEffect } from "react";
import { ReportModalViewer } from "./report-modal-viewer";

interface SandboxRunBannerProps {
  role: "srDev" | "intern" | "hr" | "management";
  roleTitle: string;
  reportMarkdownFile: string;
  reportJsonFile: string;
}

export function SandboxRunBanner({
  roleTitle,
  reportMarkdownFile,
  reportJsonFile,
}: SandboxRunBannerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeReportName, setActiveReportName] = useState(reportMarkdownFile);
  const [mountedTime, setMountedTime] = useState<string>("");

  useEffect(() => {
    // Generate dynamic timestamp for "Observed Today"
    const now = new Date();
    setMountedTime(
      `Today at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (Just Concluded)`
    );
  }, []);

  const handleOpenReport = (fileName: string) => {
    setActiveReportName(fileName);
    setModalOpen(true);
  };

  return (
    <>
      <div className="mx-8 mt-5 p-4 bg-gradient-to-r from-[#12141a] via-[#0e1014] to-[#141217] border border-[#2b2d35] hover:border-[#383b45] transition-all rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5">
          <div className="mt-1 w-3 h-3 rounded-full bg-[#ff5555] animate-ping" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-[#ff5555]/15 border border-[#ff5555]/30 text-[#ff7777] text-[11px] font-mono font-bold uppercase rounded-full">
                ⚡ 120-Min Sandbox Attack Campaign Complete
              </span>
              <span className="text-[12px] text-[#8a8f98] font-mono">
                Incident <strong className="text-[#f7f8f8]">#INC-2026-8891</strong>
              </span>
              <span className="text-[#3a3d45]">·</span>
              <span className="text-[11.5px] text-[#2ea043] font-mono font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043]" />
                SOAR Mitigated at T+118m
              </span>
            </div>

            <p className="text-[13px] text-[#d0d6e0] mt-1 font-medium">
              Target: <code className="text-[#828fff] font-mono">MacBook-Pro-Dev03.lan</code> (192.168.31.204 / #WKSTN-0891) · Evaluated across all 10 Core Security Extensions
            </p>

            <div className="flex items-center gap-3 text-[11px] text-[#8a8f98] font-mono mt-1">
              <span>Simulation Run: {mountedTime || "Today (Just Concluded)"}</span>
              <span>·</span>
              <span>Defense Status: <strong className="text-[#2ea043]">10/10 Engines Active</strong></span>
              <span>·</span>
              <span>AegisDB Zero-Trust: <strong className="text-[#2ea043]">Dump Severed (FD 42)</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            onClick={() => handleOpenReport(reportMarkdownFile)}
            className="px-3.5 py-2 bg-[#1b1d24] hover:bg-[#252832] border border-[#2e323e] hover:border-[#424758] text-[#f7f8f8] text-[12px] font-semibold rounded-xl transition-all hover-lift active:scale-95 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>📄</span> View {roleTitle} Report (.md)
          </button>

          <button
            onClick={() => handleOpenReport(reportJsonFile)}
            className="px-3 py-2 bg-[#121316] hover:bg-[#181a1f] border border-[#232529] hover:border-[#34373c] text-[#828fff] text-[12px] font-mono rounded-xl transition-all hover-lift active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <span>💾</span> JSON
          </button>

          <button
            onClick={() => handleOpenReport("sandbox_120min_attack_simulation_master_report.md")}
            className="px-3 py-2 bg-[#5e6ad2] hover:bg-[#4f5ac0] text-white text-[12px] font-semibold rounded-xl transition-all hover-lift active:scale-95 shadow-md flex items-center gap-1 cursor-pointer"
          >
            <span>🛡️</span> Master 10-Engine Report
          </button>
        </div>

      </div>

      <ReportModalViewer
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        reportName={activeReportName}
        roleTitle={roleTitle}
      />
    </>
  );
}
