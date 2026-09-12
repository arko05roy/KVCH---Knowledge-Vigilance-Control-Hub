"use client";

import React from "react";
import { CodeDiffViewer } from "./code-diff-viewer";

export function SimpleMarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code blocks ```
    if (trimmed.startsWith("```")) {
      const codeBlockLang = trimmed.replace("```", "").trim();
      const codeBlockBuffer: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeBlockBuffer.push(lines[i]);
        i++;
      }
      i++; // Skip closing ```
      const codeText = codeBlockBuffer.join("\n");
      if (
        codeBlockLang === "diff" ||
        codeText.includes("--- a/") ||
        codeText.includes("+++ b/")
      ) {
        elements.push(
          <CodeDiffViewer
            key={`diff-${i}`}
            filename="Configuration & Dependency Patch Diff"
            codeString={codeText}
          />
        );
      } else {
        elements.push(
          <div
            key={`code-${i}`}
            className="my-3 bg-[#08090a] border border-[#232529] rounded-lg p-3 font-mono text-[12px] overflow-x-auto"
          >
            {codeBlockLang && (
              <span className="text-[10px] uppercase text-[#8a8f98] font-semibold block mb-1 font-mono">
                {codeBlockLang}
              </span>
            )}
            <pre className="text-[#e2e8f0] leading-relaxed">{codeText}</pre>
          </div>
        );
      }
      continue;
    }

    // 2. Markdown Tables (lines starting with |)
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length > 0) {
        // Find delimiter row (e.g. |:---|:---| or |---|---|)
        const delimiterIdx = tableLines.findIndex((l) => {
          const stripped = l.replace(/^\|/, "").replace(/\|$/, "").trim();
          return /^[:\-\|\s]+$/.test(stripped) && stripped.includes("-");
        });

        let headerRows: string[] = [];
        let bodyRows: string[] = [];

        if (delimiterIdx > 0) {
          headerRows = tableLines.slice(0, delimiterIdx);
          bodyRows = tableLines.slice(delimiterIdx + 1);
        } else if (delimiterIdx === 0) {
          bodyRows = tableLines.slice(1);
        } else {
          if (tableLines.length > 1) {
            headerRows = [tableLines[0]];
            bodyRows = tableLines.slice(1);
          } else {
            bodyRows = tableLines;
          }
        }

        const parseRowCells = (rowStr: string) => {
          let cleaned = rowStr;
          if (cleaned.startsWith("|")) cleaned = cleaned.slice(1);
          if (cleaned.endsWith("|")) cleaned = cleaned.slice(0, -1);
          return cleaned.split("|").map((c) => c.trim());
        };

        elements.push(
          <div
            key={`tbl-${i}`}
            className="my-3.5 overflow-x-auto rounded-lg border border-[#232529] bg-[#090a0b] shadow-sm"
          >
            <table className="w-full text-left border-collapse text-[12.5px]">
              {headerRows.length > 0 && (
                <thead className="bg-[#121316] text-[#8a8f98] text-[11px] uppercase tracking-wider border-b border-[#232529]">
                  {headerRows.map((hRow, hIdx) => (
                    <tr key={`th-row-${hIdx}`}>
                      {parseRowCells(hRow).map((cell, cIdx) => (
                        <th
                          key={`th-${cIdx}`}
                          className="px-3.5 py-2.5 font-semibold text-[#9ea4b0] border-r border-[#232529] last:border-r-0 text-left"
                        >
                          {formatInline(cell)}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
              )}
              <tbody className="divide-y divide-[#1f2125]">
                {bodyRows.map((bRow, rIdx) => (
                  <tr
                    key={`tr-${rIdx}`}
                    className="hover:bg-[#131417]/60 transition-colors"
                  >
                    {parseRowCells(bRow).map((cell, cIdx) => (
                      <td
                        key={`td-${cIdx}`}
                        className="px-3.5 py-2.5 text-[#d0d6e0] border-r border-[#232529] last:border-r-0 leading-relaxed text-[12px]"
                      >
                        {formatInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // 3. Empty lines
    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // 4. Headers ###, ####, ##, #
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-[14.5px] font-semibold text-[#f7f8f8] tracking-tight mt-5 mb-2 border-b border-[#232529] pb-1"
        >
          {formatInline(trimmed.replace("### ", ""))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-[13px] font-medium text-[#d0d6e0] mt-3 mb-1.5"
        >
          {formatInline(trimmed.replace("#### ", ""))}
        </h4>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-[16px] font-semibold text-[#f7f8f8] tracking-tight mt-6 mb-2 border-b border-[#232529] pb-1"
        >
          {formatInline(trimmed.replace("## ", ""))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-[18px] font-bold text-[#f7f8f8] tracking-tight mt-6 mb-3 border-b border-[#232529] pb-1"
        >
          {formatInline(trimmed.replace("# ", ""))}
        </h1>
      );
      i++;
      continue;
    }

    // 5. Checkbox items - [ ] or - [x]
    if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
      const isChecked = trimmed.startsWith("- [x]");
      const text = trimmed.replace(/- \[[ x]\]/, "").trim();
      elements.push(
        <div
          key={`chk-${i}`}
          className="flex items-center gap-2.5 my-1.5 text-[12.5px] text-[#d0d6e0]"
        >
          <span
            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
              isChecked
                ? "bg-[#2ea043]/20 border border-[#2ea043] text-[#2ea043]"
                : "border border-[#34373c] text-transparent"
            }`}
          >
            ✓
          </span>
          <span>{formatInline(text)}</span>
        </div>
      );
      i++;
      continue;
    }

    // 6. Numbered list items e.g., "1. "
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div
          key={`ol-${i}`}
          className="flex items-start gap-2 text-[12.5px] text-[#d0d6e0] my-1 font-sans"
        >
          <span className="font-semibold text-[#8a8f98] min-w-[18px] text-right font-mono text-[11.5px]">
            {numMatch[1]}.
          </span>
          <div className="flex-1">{formatInline(numMatch[2])}</div>
        </div>
      );
      i++;
      continue;
    }

    // 7. Unordered list items - or *
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.substring(2);
      elements.push(
        <li
          key={`li-${i}`}
          className="ml-4 text-[12.5px] text-[#d0d6e0] my-1 list-disc"
        >
          {formatInline(text)}
        </li>
      );
      i++;
      continue;
    }

    // 8. Standard paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="text-[12.5px] text-[#d0d6e0] leading-relaxed my-1"
      >
        {formatInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

/** Helper to format inline bold, code, and markdown links */
function formatInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[[^\]]+\]\([^)]+\))/g);
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
        <code
          key={i}
          className="px-1.5 py-0.5 bg-[#18191c] border border-[#2b2d31] text-[#828fff] rounded text-[11.5px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const [, linkText, href] = match;
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#828fff] hover:underline font-mono text-[11.5px] font-medium inline-flex items-center gap-1 bg-[#828fff]/10 px-1.5 py-0.5 rounded border border-[#828fff]/20"
          >
            {linkText}
          </a>
        );
      }
    }
    return part;
  });
}

