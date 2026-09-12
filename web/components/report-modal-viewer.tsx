"use client";

import React, { useState, useEffect } from "react";
import { SimpleMarkdownRenderer } from "./markdown-renderer";

interface ReportModalViewerProps {
  isOpen: boolean;
  onClose: () => void;
  reportName: string;
  roleTitle: string;
}

export function ReportModalViewer({
  isOpen,
  onClose,
  reportName,
  roleTitle,
}: ReportModalViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/reports?name=${encodeURIComponent(reportName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.success && data.content) {
            setContent(data.content);
          } else {
            setContent(`# Error\nCould not load report: ${data.error || "Unknown error"}`);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setContent(`# Fetch Error\n${err.message}`);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, reportName]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = reportName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0c0d0e] border border-[#232529] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232529] bg-[#0f1013] shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5e6ad2] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-[#f7f8f8] tracking-tight">
                  {roleTitle} Security Intelligence Report
                </h2>
                <span className="px-2 py-0.5 bg-[#1a1c22] border border-[#2b2d32] text-[10.5px] font-mono text-[#828fff] rounded">
                  {reportName}
                </span>
              </div>
              <span className="text-[11.5px] text-[#8a8f98] font-mono flex items-center gap-1.5 mt-0.5">
                <span>Verified by KVCH Execution Kernel</span>
                <span>·</span>
                <span className="text-[#2ea043]">120-Min Sandbox Run (Just Now)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Tab switch */}
            <div className="flex items-center bg-[#14161a] border border-[#232529] p-0.5 rounded-lg">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1 text-[11.5px] font-medium rounded-md transition-all ${
                  activeTab === "preview"
                    ? "bg-[#232529] text-[#f7f8f8] shadow-sm"
                    : "text-[#8a8f98] hover:text-[#d0d6e0]"
                }`}
              >
                Rendered Preview
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-3 py-1 text-[11.5px] font-medium rounded-md transition-all ${
                  activeTab === "raw"
                    ? "bg-[#232529] text-[#f7f8f8] shadow-sm"
                    : "text-[#8a8f98] hover:text-[#d0d6e0]"
                }`}
              >
                Raw Document
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#18191c] hover:bg-[#232529] border border-[#2b2d32] text-[11.5px] font-medium text-[#d0d6e0] rounded-lg transition-all active:scale-95"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#f7f8f8] hover:bg-[#e0e0e0] text-[11.5px] font-medium text-[#0c0d0e] rounded-lg transition-all active:scale-95 shadow-sm"
            >
              Download
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#18191c] hover:bg-[#282a30] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#08090a] text-[#d0d6e0]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3 text-[#8a8f98]">
              <span className="w-6 h-6 border-2 border-[#5e6ad2] border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] font-mono">Loading report from `/final reports/${reportName}`...</span>
            </div>
          ) : activeTab === "preview" ? (
            <div className="max-w-4xl mx-auto space-y-4">
              <SimpleMarkdownRenderer content={content} />
            </div>
          ) : (
            <pre className="p-4 bg-[#0c0d0e] border border-[#232529] rounded-xl font-mono text-[12px] text-[#828fff] overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {content}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-[#232529] bg-[#0c0d0e] flex items-center justify-between text-[11px] text-[#62666d] font-mono shrink-0">
          <span>Source: `/final reports/${reportName}`</span>
          <span>10 Extensions Correlated: attack-surface, vpn-crypto, phishing, threat-hunter, malware, creds, supply-chain, cookie-xss, aegisdb, edgeguard</span>
        </div>

      </div>
    </div>
  );
}
