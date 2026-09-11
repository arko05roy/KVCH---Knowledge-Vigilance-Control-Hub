"use client";

import React from "react";
import { CodeDiffViewer } from "./code-diff-viewer";

export function SimpleMarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockBuffer: string[] = [];

  lines.forEach((line, idx) => {
    // Handle code blocks ```
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBlockBuffer.join("\n");
        if (codeBlockLang === "diff" || codeText.includes("--- a/") || codeText.includes("+++ b/")) {
          elements.push(
            <CodeDiffViewer
              key={`diff-${idx}`}
              filename="Configuration & Dependency Patch Diff"
              codeString={codeText}
            />
          );
        } else {
          elements.push(
            <div key={`code-${idx}`} className="my-3 bg-[#08090a] border border-[#232529] rounded-lg p-3 font-mono text-[12px] overflow-x-auto">
              {codeBlockLang && (
                <span className="text-[10px] uppercase text-[#8a8f98] font-semibold block mb-1 font-mono">
                  {codeBlockLang}
                </span>
              )}
              <pre className="text-[#e2e8f0] leading-relaxed">
                {codeText}
              </pre>
            </div>
          );
        }
        codeBlockBuffer = [];
        inCodeBlock = false;
        codeBlockLang = "";
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLang = line.trim().replace("```", "");
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} className="h-2" />);
      return;
    }

    // Headers ###, ####, ##
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${idx}`} className="text-[14.5px] font-semibold text-[#f7f8f8] tracking-tight mt-5 mb-2 border-b border-[#232529] pb-1">
          {formatInline(trimmed.replace("### ", ""))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4 key={`h4-${idx}`} className="text-[13px] font-medium text-[#d0d6e0] mt-3 mb-1.5">
          {formatInline(trimmed.replace("#### ", ""))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${idx}`} className="text-[16px] font-semibold text-[#f7f8f8] tracking-tight mt-6 mb-2 border-b border-[#232529] pb-1">
          {formatInline(trimmed.replace("## ", ""))}
        </h2>
      );
      return;
    }

    // Checkbox items - [ ] or - [x]
    if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
      const isChecked = trimmed.startsWith("- [x]");
      const text = trimmed.replace(/- \[[ x]\]/, "").trim();
      elements.push(
        <div key={`chk-${idx}`} className="flex items-center gap-2.5 my-1.5 text-[12.5px] text-[#d0d6e0]">
          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${isChecked ? "bg-[#2ea043]/20 border border-[#2ea043] text-[#2ea043]" : "border border-[#34373c] text-transparent"}`}>
            ✓
          </span>
          <span>{formatInline(text)}</span>
        </div>
      );
      return;
    }

    // Unordered list items - or *
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.substring(2);
      elements.push(
        <li key={`li-${idx}`} className="ml-4 text-[12.5px] text-[#d0d6e0] my-1 list-disc">
          {formatInline(text)}
        </li>
      );
      return;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${idx}`} className="text-[12.5px] text-[#d0d6e0] leading-relaxed my-1">
        {formatInline(trimmed)}
      </p>
    );
  });

  return <div className="space-y-1">{elements}</div>;
}

/** Helper to format inline bold and code */
function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[#f7f8f8]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-[#18191c] border border-[#2b2d31] text-[#828fff] rounded text-[11.5px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
