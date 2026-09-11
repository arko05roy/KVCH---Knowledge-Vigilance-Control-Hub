"use client";

import React from "react";

interface DiffLine {
  lineNo: number;
  type: "add" | "remove" | "normal";
  content: string;
  wordHighlights?: { word: string; color: "green" | "red" }[];
}

interface CodeDiffViewerProps {
  filename?: string;
  lines?: DiffLine[];
  codeString?: string;
}

export function CodeDiffViewer({ filename, lines, codeString }: CodeDiffViewerProps) {
  // If raw diff codeString passed, parse into lines
  const parsedLines: DiffLine[] = lines || (codeString ? parseDiffString(codeString) : sampleDiffLines);

  return (
    <div className="w-full bg-[#08090a] border border-[#232529] rounded-lg overflow-hidden font-mono text-[12.5px] my-3">
      {filename && (
        <div className="px-3.5 py-2 bg-[#0c0d0e] border-b border-[#232529] flex items-center justify-between text-[11px] text-[#8a8f98]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5e6ad2]" />
            {filename}
          </span>
          <span className="text-[#62666d]">Git Diff View</span>
        </div>
      )}

      <div className="divide-y divide-transparent overflow-x-auto py-1">
        {parsedLines.map((line, idx) => {
          const isAdd = line.type === "add";
          const isRemove = line.type === "remove";

          return (
            <div
              key={idx}
              className={`flex items-start px-3 py-1 font-mono transition-colors ${
                isAdd
                  ? "bg-[#14261c]/80 text-[#d0d6e0]"
                  : isRemove
                  ? "bg-[#33171b]/80 text-[#d0d6e0]"
                  : "hover:bg-[#121316] text-[#8a8f98]"
              }`}
            >
              {/* Line Number */}
              <span className="w-9 shrink-0 text-right pr-3 select-none text-[#525660] text-[11px]">
                {line.lineNo}
              </span>

              {/* Diff Symbol (+ / -) */}
              <span
                className={`w-5 shrink-0 text-center font-bold text-[12px] select-none ${
                  isAdd ? "text-[#2ea043]" : isRemove ? "text-[#ff5555]" : "text-transparent"
                }`}
              >
                {isAdd ? "+" : isRemove ? "-" : " "}
              </span>

              {/* Line Content with Token Syntax Formatting */}
              <div className="flex-1 whitespace-pre leading-relaxed">
                {renderSyntaxTokens(line.content, isAdd, isRemove)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Render syntax highlighted code tokens with green/red inline word highlights */
function renderSyntaxTokens(text: string, isAdd: boolean, isRemove: boolean) {
  // Common JS/TS keywords
  const keywords = ["import", "export", "const", "let", "var", "from", "return", "if", "else", "function"];

  // Split into tokens
  const words = text.split(/(\s+|[(),={}:;<>'"])/);

  return words.map((token, i) => {
    if (keywords.includes(token.trim())) {
      return (
        <span key={i} className="text-[#c084fc] font-semibold">
          {token}
        </span>
      );
    }

    if (token.startsWith("'") || token.startsWith('"') || token.startsWith("`")) {
      return (
        <span key={i} className="text-[#f2c94c]">
          {token}
        </span>
      );
    }

    // Highlighting specific changed words
    if (isAdd && (token === "SyncStatus" || token === "syncStatus" || token === "localhost, 10.0.4.15" || token === "1.4.1")) {
      return (
        <span key={i} className="px-1 py-0.5 bg-[#2ea043]/30 border border-[#2ea043]/50 text-[#2ea043] rounded font-semibold text-[11.5px]">
          {token}
        </span>
      );
    }

    if (isRemove && (token === "isFullySynced" || token === "*" || token === "^1.4.2")) {
      return (
        <span key={i} className="px-1 py-0.5 bg-[#ff5555]/30 border border-[#ff5555]/50 text-[#ff6b6b] rounded font-semibold text-[11.5px]">
          {token}
        </span>
      );
    }

    if (token === "React" || token === "HomeScreen" || token === "Dashboard" || token === "View") {
      return (
        <span key={i} className="text-[#60a5fa]">
          {token}
        </span>
      );
    }

    return <span key={i}>{token}</span>;
  });
}

function parseDiffString(diffText: string): DiffLine[] {
  const lines = diffText.split("\n");
  let lineNo = 1;
  return lines.map((line) => {
    let type: "add" | "remove" | "normal" = "normal";
    let content = line;

    if (line.startsWith("+")) {
      type = "add";
      content = line.substring(1);
    } else if (line.startsWith("-")) {
      type = "remove";
      content = line.substring(1);
    }

    return {
      lineNo: lineNo++,
      type,
      content,
    };
  });
}

const sampleDiffLines: DiffLine[] = [
  { lineNo: 1, type: "normal", content: "import React from 'react'" },
  { lineNo: 2, type: "normal", content: "import { View, ActivityIndicator } from 'react-native'" },
  { lineNo: 3, type: "remove", content: "import { useVehicleState } from '@hooks/useVehicleState'" },
  { lineNo: 3, type: "add", content: "import { useVehicleState, SyncStatus } from '@hooks/useVehicleState'" },
  { lineNo: 4, type: "normal", content: "import { Dashboard } from '@components/Dashboard'" },
  { lineNo: 5, type: "normal", content: "import { EmptyState } from '@components/EmptyState'" },
  { lineNo: 6, type: "normal", content: "" },
  { lineNo: 7, type: "normal", content: "export const HomeScreen = () => {" },
  { lineNo: 8, type: "remove", content: "  const { vehicleState, isFullySynced } = useVehicleState()" },
  { lineNo: 8, type: "add", content: "  const { vehicleState, syncStatus } = useVehicleState()" },
  { lineNo: 9, type: "normal", content: "" },
  { lineNo: 10, type: "remove", content: "  if (!isFullySynced) {" },
  { lineNo: 10, type: "add", content: "  if (syncStatus === SyncStatus.PENDING) {" },
  { lineNo: 11, type: "normal", content: "    return <ActivityIndicator size=\"large\" />" },
  { lineNo: 12, type: "normal", content: "  }" },
  { lineNo: 13, type: "normal", content: "  if (!vehicleState) {" },
  { lineNo: 14, type: "normal", content: "    return null" },
  { lineNo: 15, type: "normal", content: "  }" },
  { lineNo: 16, type: "normal", content: "  return (" },
  { lineNo: 17, type: "normal", content: "    <View>" },
  { lineNo: 18, type: "remove", content: "      <Dashboard state={vehicleState} />" },
  { lineNo: 18, type: "add", content: "      <Dashboard state={vehicleState} syncStatus={syncStatus} />" },
  { lineNo: 19, type: "normal", content: "    </View>" },
  { lineNo: 20, type: "normal", content: "  )" },
  { lineNo: 21, type: "normal", content: "}" },
];
