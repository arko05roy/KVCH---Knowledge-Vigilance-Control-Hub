"use client";

import React, { useState } from "react";

interface TaskTag {
  label: string;
  color: string;
}

interface TaskItem {
  id: string;
  title: string;
  stateTag?: string;
  icon: string;
  tags?: TaskTag[];
  pr?: string;
  hasAvatars?: boolean;
}

// Mock data
const INITIAL_TASKS: Record<string, TaskItem> = {
  "ENG-2749": { id: "ENG-2749", title: "Show last known vehicle location", stateTag: "Working...", icon: "yellow-circle", tags: [], hasAvatars: true },
  "ENG-2755": { id: "ENG-2755", title: "Graceful error state when network drops", stateTag: "Working...", icon: "yellow-circle", tags: [{ label: "Design", color: "#5e6ad2" }] },
  "ENG-2692": { id: "ENG-2692", title: "Indicate offline status clearly in the UI", icon: "purple-check", tags: [{ label: "Design", color: "#5e6ad2" }], pr: "#55234", hasAvatars: true },
  "ENG-2690": { id: "ENG-2690", title: "Cache recent trip history for offline access", icon: "purple-check", tags: [{ label: "Design", color: "#5e6ad2" }], pr: "#55449", hasAvatars: true },
  
  "ENG-2703": { id: "ENG-2703", title: "Faster app launch", stateTag: "Working...", icon: "yellow-circle", tags: [{ label: "Performance", color: "#2ea043" }, { label: "iOS", color: "#f2c94c" }], hasAvatars: true },
  "ENG-2699": { id: "ENG-2699", title: "Optimize state hydration", stateTag: "Waiting", icon: "yellow-circle", tags: [{ label: "Performance", color: "#2ea043" }], pr: "#56995", hasAvatars: true },
  "ENG-1882": { id: "ENG-1882", title: "Optimize load times", icon: "purple-check", tags: [{ label: "Android", color: "#5e6ad2" }, { label: "Performance", color: "#2ea043" }], pr: "#57291", hasAvatars: true },
  
  "ENG-2753": { id: "ENG-2753", title: "Refresh ride status screen visuals", stateTag: "Error", icon: "yellow-circle", tags: [{ label: "Design", color: "#5e6ad2" }], hasAvatars: true },
  "ENG-2691": { id: "ENG-2691", title: "Improved empty states", stateTag: "Finished", icon: "green-check", tags: [{ label: "Android", color: "#5e6ad2" }], pr: "#55559", hasAvatars: true },
  "ENG-1337": { id: "ENG-1337", title: "Align typography with updated system", icon: "purple-check", tags: [{ label: "iOS", color: "#f2c94c" }, { label: "System2026", color: "#eb5757" }], pr: "#56998", hasAvatars: true },
  "ENG-2050": { id: "ENG-2050", title: "Polish animations on core transitions", icon: "purple-check", pr: "#50048", hasAvatars: true },
};

const INITIAL_COLUMNS = [
  { id: "offline", title: "Offline Mode", icon: "wifi-off", taskIds: ["ENG-2749", "ENG-2755", "ENG-2692", "ENG-2690"] },
  { id: "performance", title: "Core Performance", icon: "zap", taskIds: ["ENG-2703", "ENG-2699", "ENG-1882"] },
  { id: "refresh", title: "UI Refresh", icon: "scissors", taskIds: ["ENG-2753", "ENG-2691", "ENG-1337", "ENG-2050"] },
];

export function KanbanBoard() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    // Slightly transparent ghost image can be set here if needed
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    setColumns(prevCols => {
      // Find source column and remove task
      const sourceColIdx = prevCols.findIndex(c => c.taskIds.includes(draggedTaskId));
      if (sourceColIdx === -1) return prevCols;
      
      const targetColIdx = prevCols.findIndex(c => c.id === targetColId);
      if (targetColIdx === -1) return prevCols;

      // If dropping in the same column, do nothing for now (basic implementation)
      if (sourceColIdx === targetColIdx) return prevCols;

      const newCols = [...prevCols];
      const sourceCol = { ...newCols[sourceColIdx], taskIds: [...newCols[sourceColIdx].taskIds] };
      const targetCol = { ...newCols[targetColIdx], taskIds: [...newCols[targetColIdx].taskIds] };

      sourceCol.taskIds = sourceCol.taskIds.filter(id => id !== draggedTaskId);
      targetCol.taskIds.push(draggedTaskId);

      newCols[sourceColIdx] = sourceCol;
      newCols[targetColIdx] = targetCol;

      return newCols;
    });
    setDraggedTaskId(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col px-8 pt-5 pb-4 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-10">
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <svg className="w-[18px] h-[18px] text-[#e8e8e8] p-0.5 rounded-[4px] bg-white text-[#111213] border border-[#111213]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
            <h2 className="text-[14px] font-medium text-[#e8e8e8] flex items-center gap-2">
              Agent tasks 
              <svg className="w-3.5 h-3.5 text-[#f2c94c]" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </h2>
            <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
          </div>
          <div className="flex items-center gap-4 text-[#858688]">
            <button className="hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
            <button className="hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#262729] rounded-full text-[13px] font-medium text-[#e8e8e8]">All tasks</button>
            <button className="px-3 py-1.5 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Active</button>
            <button className="px-3 py-1.5 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Backlog</button>
          </div>
          
          <div className="flex gap-2 text-[#858688]">
            <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></button>
            <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12H3"/><path d="M21 6H3"/><path d="M21 18H3"/></svg></button>
            <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg></button>
            <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg></button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full p-6 gap-6 w-max items-start">
          
          {columns.map(col => (
            <div 
              key={col.id} 
              className="flex flex-col w-[360px] h-full"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#e8e8e8]">
                  {col.icon === 'wifi-off' && <svg className="w-4 h-4 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>}
                  {col.icon === 'zap' && <svg className="w-4 h-4 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
                  {col.icon === 'scissors' && <svg className="w-4 h-4 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>}
                  <span>{col.title}</span>
                  <span className="text-[#858688] ml-1">{col.taskIds.length}</span>
                </div>
                <div className="flex items-center gap-1 text-[#858688]">
                  <button className="w-6 h-6 flex items-center justify-center hover:bg-[#262729] rounded-md transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
                  <button className="w-6 h-6 flex items-center justify-center hover:bg-[#262729] rounded-md transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto pb-20 px-1">
                {col.taskIds.map(taskId => {
                  const task = INITIAL_TASKS[taskId];
                  if (!task) return null;
                  
                  return (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-lg p-3 hover:border-[#424345] transition-colors cursor-grab active:cursor-grabbing shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex flex-col gap-2.5"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between text-[#858688]">
                        <span className="text-[12px] font-mono">{task.id}</span>
                        <div className="flex items-center gap-2">
                          {task.stateTag && (
                            <span className="text-[11px] text-[#e8e8e8] bg-[#262729] border border-[#2b2c2e] px-2 py-0.5 rounded-full flex items-center gap-1">
                              {task.stateTag === "Error" && <div className="w-1.5 h-1.5 rounded-full bg-[#eb5757]" />}
                              {task.stateTag}
                            </span>
                          )}
                          {task.hasAvatars && (
                            <div className="flex -space-x-1">
                              <div className="w-5 h-5 rounded-full bg-[#1a1b1d] border border-[#2b2c2e] text-[#858688] flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                              <div className="w-5 h-5 rounded-full bg-[#1a1b1d] border border-[#2b2c2e] text-[#858688] flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Title */}
                      <div className="flex items-start gap-2 text-[14px] font-medium text-[#e8e8e8] leading-tight">
                        {task.icon === 'yellow-circle' && <svg className="w-[15px] h-[15px] text-[#f2c94c] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 7v5"/></svg>}
                        {task.icon === 'purple-check' && <svg className="w-[15px] h-[15px] text-[#5e6ad2] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4" stroke="#111213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        {task.icon === 'green-check' && <svg className="w-[15px] h-[15px] text-[#2ea043] shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4" stroke="#111213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        <span>{task.title}</span>
                      </div>

                      {/* Card Footer */}
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <svg className="w-[14px] h-[14px] text-[#424345] shrink-0 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
                        
                        {task.tags?.map((tag: TaskTag, i: number) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#2b2c2e] text-[11px] text-[#858688] bg-[#161718]">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span>{tag.label}</span>
                          </div>
                        ))}

                        {task.pr && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 text-[#858688] text-[11px] hover:text-[#e8e8e8] cursor-pointer transition-colors">
                            <svg className="w-[12px] h-[12px] text-[#2ea043]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            <span>{task.pr}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
