"use client";

import React, { useEffect, useRef } from "react";

const GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["010", "110", "010", "010", "010", "010", "111"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ".": ["0", "0", "0", "0", "0", "0", "1"],
  "I": ["111", "010", "010", "010", "010", "010", "111"],
  "a": ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
  "e": ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
  "g": ["00000", "00000", "01111", "10001", "01111", "00001", "01110"],
  "i": ["1", "0", "1", "1", "1", "1", "1"],
  "l": ["10", "10", "10", "10", "10", "10", "01"],
  "n": ["00000", "00000", "11110", "10001", "10001", "10001", "10001"],
  "t": ["010", "010", "111", "010", "010", "010", "001"],
  "r": ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
};

export function LedDotText({ text, dotRadius = 1.55, pitchX = 5, pitchY = 4, className = "" }: { text: string; dotRadius?: number; pitchX?: number; pitchY?: number; className?: string }) {
  const circles: { cx: number; cy: number; r: number }[] = [];
  let currentX = 0;

  for (let charIndex = 0; charIndex < text.length; charIndex++) {
    const char = text[charIndex];
    const glyph = GLYPHS[char];
    if (!glyph) {
      currentX += pitchX * 2;
      continue;
    }

    const cols = glyph[0].length;
    for (let r = 0; r < 7; r++) {
      const rowStr = glyph[r];
      for (let c = 0; c < cols; c++) {
        if (rowStr[c] === "1") {
          circles.push({
            cx: currentX + c * pitchX + dotRadius,
            cy: r * pitchY + dotRadius,
            r: dotRadius,
          });
        }
      }
    }

    currentX += cols * pitchX + pitchX;
  }

  const viewBoxWidth = Math.max(currentX, 10);
  const viewBoxHeight = 7 * pitchY;

  return (
    <svg className={`dot-svg ${className}`} viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} fill="currentColor">
      {circles.map((circle, i) => (
        <circle key={i} cx={circle.cx} cy={circle.cy} r={circle.r} fillOpacity={1} />
      ))}
    </svg>
  );
}

export function IntelligentPerformanceStage() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gauge tick generator for Card 1
    const gaugeTicksGroup = document.getElementById("gaugeTicks");
    if (gaugeTicksGroup && gaugeTicksGroup.children.length === 0) {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i <= 22; i++) {
        const angle = (190 + i * 5) * (Math.PI / 180);
        const isMajor = i % 5 === 0;
        const outerR = 142;
        const innerR = isMajor ? 129 : 133;
        const cx = 163;
        const cy = 163;

        const x1 = cx + outerR * Math.cos(angle);
        const y1 = cy + outerR * Math.sin(angle);
        const x2 = cx + innerR * Math.cos(angle);
        const y2 = cy + innerR * Math.sin(angle);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1.toFixed(2));
        line.setAttribute("y1", y1.toFixed(2));
        line.setAttribute("x2", x2.toFixed(2));
        line.setAttribute("y2", y2.toFixed(2));
        line.setAttribute("stroke", "rgba(255,188,210,.34)");
        line.setAttribute("stroke-width", isMajor ? "1.5" : "1");
        fragment.appendChild(line);
      }
      gaugeTicksGroup.appendChild(fragment);
    }
  }, []);

  return (
    <div ref={stageRef} className="intelligent-stage-wrapper relative w-full bg-[#000000] text-[#f7f8f8]">
      {/* Hidden Filter Definitions */}
      <svg className="filter-defs absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="cardNoise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.54" numOctaves="3" seed="27" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.8" intercept="-0.25" />
              <feFuncG type="linear" slope="1.8" intercept="-0.25" />
              <feFuncB type="linear" slope="1.8" intercept="-0.25" />
              <feFuncA type="table" tableValues="0 0.52" />
            </feComponentTransfer>
          </filter>

          <filter id="radarSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.35" />
          </filter>
          <filter id="radarHalo" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5.2" />
          </filter>
          <filter id="gaugeBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>
      </svg>

      <main className="stage relative isolate flex flex-col w-full min-h-screen overflow-hidden py-[clamp(20px,9.6vh,94px)] px-[clamp(14px,3.6vw,54px)] pb-[clamp(16px,3vh,52px)] bg-[#000000]">
        {/* Full Black Canvas Background */}
        <div className="absolute inset-0 -z-10 bg-[#000000] pointer-events-none" />

        {/* MASTHEAD SECTION */}
        <div className="masthead grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,clamp(260px,32vw,483px))] gap-[clamp(16px,3vw,40px)] items-start z-10 shrink-0 w-full max-w-[calc(3*429px+2*clamp(8px,1.5vw,23px))] mx-auto">
          <h1 className="headline m-0 max-w-full text-[#ffffff] text-[clamp(24px,min(3.1vw,5.9vh),47px)] font-normal tracking-[0.015em] leading-[1.223]">
            <span className="headline__line flex flex-nowrap items-center">
              Built for
              <span className="dot-word inline-block shrink-0 w-[4.851em] h-[0.766em] ml-[0.319em] text-[#ff3b5c] translate-y-[0.085em] drop-shadow-[0_0_12px_rgba(255,59,92,0.6)]">
                <LedDotText text="Intelligent" dotRadius={1.8} pitchX={4} pitchY={4} className="w-full h-full" />
              </span>
            </span>
            <span className="headline__line flex flex-nowrap items-center mt-1 text-[#f7f8f8]">
              Performance
            </span>
          </h1>

          <p className="intro w-full m-0 mt-[0.34em] text-[#8a8f98] text-[clamp(13px,min(1.36vw,2.6vh),20.6px)] font-normal tracking-[-0.017em] leading-[1.62]">
            Every security capability is engineered for real-time threat detection, automated patch<br className="hidden md:inline" /> validation, and role-based governance—giving your enterprise<br className="hidden md:inline" /> the armor to reason, adapt, and perform in production.
          </p>
        </div>

        {/* CARDS ROW SECTION */}
        <section className="cards flex-1 flex flex-col md:flex-row justify-between items-center gap-[clamp(8px,1.5vw,23px)] min-h-0 mt-[clamp(14px,9.4vh,92px)] w-full max-w-[calc(3*429px+2*clamp(8px,1.5vw,23px))] mx-auto" aria-label="Performance capabilities">
          
          {/* CARD 1: INFERENCE SPEED */}
          <div className="card card--speed relative shrink-0 overflow-hidden w-full md:w-[min(calc((100%-2*clamp(8px,1.5vw,23px))/3),429px)] aspect-[429/554] border border-[rgba(255,255,255,.24)] rounded-[17px] text-white shadow-[0_4px_24px_rgba(0,0,0,.60),inset_0_1px_0_rgba(255,255,255,.30)]">
            <video
              className="card__media absolute inset-0 z-0 w-full h-full object-fill pointer-events-none"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/167977c6-8539-46b1-9a15-8dba566f50b8.png"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_130045_1a612b69-4854-4b34-8043-ccb91f2c60af.mp4"
            />
            
            <h2 className="card__title absolute z-10 top-[6.3%] left-[5%] w-[90%] m-0 text-[#ffffff] text-[22.7px] font-semibold tracking-normal leading-[1.48] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">
              Inference Speed<br />AI Response Latency
            </h2>

            {/* Gauge SVG */}
            <svg className="gauge absolute z-10 top-[27.63%] left-[10.5%] w-[79%] h-[59%] overflow-visible pointer-events-none" viewBox="0 0 326 326">
              <defs>
                <linearGradient id="gaugeArc" x1="7" y1="136" x2="312" y2="109" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ff9ab7" stopOpacity="0.06" />
                  <stop offset="0.08" stopColor="#ff8caf" stopOpacity="0.44" />
                  <stop offset="0.34" stopColor="#ff6796" stopOpacity="0.94" />
                  <stop offset="0.58" stopColor="#ff6796" stopOpacity="1" />
                  <stop offset="0.82" stopColor="#ffe7ed" stopOpacity="0.74" />
                  <stop offset="0.94" stopColor="#fff8fa" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="gaugeShadow" x1="11" y1="136" x2="308" y2="110" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#6e1639" stopOpacity="0.04" />
                  <stop offset="0.09" stopColor="#6e1639" stopOpacity="0.17" />
                  <stop offset="0.52" stopColor="#72163d" stopOpacity="0.18" />
                  <stop offset="0.78" stopColor="#7b1a43" stopOpacity="0.1" />
                  <stop offset="1" stopColor="#7b1a43" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="radarBeam" cx="163" cy="163" r="145" gradientUnits="userSpaceOnUse">
                  <stop offset="0.3" stopColor="#650f35" stopOpacity="0" />
                  <stop offset="0.45" stopColor="#650f35" stopOpacity="0.025" />
                  <stop offset="0.7" stopColor="#650f35" stopOpacity="0.065" />
                  <stop offset="0.9" stopColor="#650f35" stopOpacity="0.08" />
                  <stop offset="1" stopColor="#650f35" stopOpacity="0.05" />
                </radialGradient>
                <linearGradient id="radarBeamEdge" x1="238" y1="33" x2="190.5" y2="115.4" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ffe7ef" stopOpacity="0.19" />
                  <stop offset="0.48" stopColor="#ffd1df" stopOpacity="0.11" />
                  <stop offset="0.82" stopColor="#ffc6d7" stopOpacity="0.045" />
                  <stop offset="1" stopColor="#ffc6d7" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d="M11.34 136.26A154 154 0 0 1 307.71 110.33" fill="none" strokeWidth="3.2" strokeLinecap="round" stroke="url(#gaugeShadow)" />
              <path d="M6.91 135.48A158.5 158.5 0 0 1 311.94 108.79" fill="none" strokeWidth="2.2" strokeLinecap="round" stroke="url(#gaugeArc)" />
              <path d="M19.22 137.65A146 146 0 0 1 236 36.56" fill="none" strokeWidth="1.15" stroke="rgba(255,166,194,.31)" />
              <path d="M238 33.1A150 150 0 0 1 277.9 66.6L199.8 119.5A55 55 0 0 0 190.5 115.4Z" fill="#6a1238" opacity="0.022" filter="url(#radarHalo)" />
              <path d="M238 33.1A150 150 0 0 1 277.9 66.6L199.8 119.5A55 55 0 0 0 190.5 115.4Z" fill="url(#radarBeam)" filter="url(#radarSoft)" />
              <path d="M238 33.1L190.5 115.4" stroke="url(#radarBeamEdge)" strokeWidth="1.25" strokeLinecap="round" filter="url(#radarSoft)" />
              <g id="gaugeTicks"></g>
              <ellipse cx="225" cy="166" rx="92" ry="76" fill="#fff" opacity="0.055" filter="url(#gaugeBlur)" />
            </svg>

            {/* Metric Display */}
            <div className="metric metric--speed absolute z-10 top-[48.6%] left-0 w-full flex items-baseline justify-center text-[rgba(255,255,255,.97)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              <div className="dot-number inline-block w-[31.2%]">
                <LedDotText text="118" dotRadius={1.55} pitchX={5} pitchY={4} className="w-full" />
              </div>
              <span className="metric__unit ml-[1%] text-[30.6px] font-normal leading-none tracking-tight">ms</span>
            </div>

            <p className="caption absolute z-10 top-[64.75%] left-[10%] w-[80%] text-[rgba(255,255,255,.87)] text-[20.33px] font-normal tracking-[-0.018em] leading-[1.45] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">
              Average global<br />response
            </p>

            <div className="learn-more absolute z-20 top-[83.9%] left-1/2 -translate-x-1/2">
              <button
                type="button"
                className="w-[111px] h-[44px] border-0 rounded-full bg-[rgba(255,255,255,.97)] text-[#101010] text-[14px] font-medium tracking-[-0.018em] shadow-[inset_0_1px_0_rgba(255,255,255,.50),0_2px_8px_rgba(0,0,0,.40)] transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-white cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* CARD 2: CONTEXT WINDOW */}
          <div className="card card--context relative shrink-0 overflow-hidden w-full md:w-[min(calc((100%-2*clamp(8px,1.5vw,23px))/3),429px)] aspect-[429/554] border border-[rgba(255,255,255,.24)] rounded-[17px] text-white shadow-[0_4px_24px_rgba(0,0,0,.60),inset_0_1px_0_rgba(255,255,255,.30)]">
            <video
              className="card__media absolute inset-0 z-0 w-full h-full object-fill pointer-events-none"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/0446d1d5-e65e-4db5-8090-3e30d09afc43.png"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_130054_dd005674-d693-4d81-80a5-357f7f10b3a3.mp4"
            />
            
            <h2 className="card__title absolute z-10 top-[6.1%] left-[5%] w-[90%] m-0 text-[#ffffff] text-[23px] font-semibold tracking-normal leading-[1.48] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">
              Context Window<br />Long-form Understanding
            </h2>

            {/* Context Window Glass Panel Visual */}
            <div className="context-window absolute z-10 top-[32.4%] left-[20.4%] w-[59%] h-[30.1%] overflow-hidden rounded-[10px] bg-gradient-to-t from-[rgba(255,255,255,.30)] via-[rgba(255,255,255,.15)] to-transparent border border-white/20 shadow-xl backdrop-blur-md">
              <div className="window-lines absolute top-[9%] left-[6.7%] w-[87%] h-[24%] flex flex-col justify-between">
                <span className="h-[6px] rounded-[2.5px] bg-white/70 w-[29%] mb-1" />
                <span className="w-full h-[22px] rounded-[6px] bg-gradient-to-r from-[rgba(255,240,253,.72)] via-[rgba(255,170,242,.75)] to-[rgba(255,108,235,.78)]" />
                <span className="w-[86%] h-[4px] rounded bg-white/60 mt-1" />
              </div>
            </div>

            {/* Metric Display */}
            <div className="metric metric--context absolute z-10 top-[48.0%] left-0 w-full flex items-baseline justify-center text-[rgba(255,255,255,.97)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              <div className="dot-number inline-block w-[30.5%]">
                <LedDotText text="2.4" dotRadius={2.32} pitchX={5} pitchY={4} className="w-full" />
              </div>
              <span className="metric__unit ml-[1%] text-[30.6px] font-normal leading-none tracking-tight">M</span>
            </div>

            <p className="caption absolute z-10 top-[65.72%] left-[10%] w-[80%] text-[rgba(255,255,255,.84)] text-[19.1px] font-normal tracking-[-0.018em] leading-[1.38] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">
              Tokens processed<br />simultaneously
            </p>

            <div className="learn-more absolute z-20 top-[83.9%] left-1/2 -translate-x-1/2">
              <button
                type="button"
                className="w-[111px] h-[44px] border-0 rounded-full bg-[rgba(255,255,255,.97)] text-[#101010] text-[14px] font-medium tracking-[-0.018em] shadow-[inset_0_1px_0_rgba(255,255,255,.50),0_2px_8px_rgba(0,0,0,.40)] transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-white cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* CARD 3: INTELLIGENT CONNECTIONS */}
          <div className="card card--connections relative shrink-0 overflow-hidden w-full md:w-[min(calc((100%-2*clamp(8px,1.5vw,23px))/3),429px)] aspect-[429/554] border border-[rgba(255,255,255,.24)] rounded-[17px] text-white shadow-[0_4px_24px_rgba(0,0,0,.60),inset_0_1px_0_rgba(255,255,255,.30)]">
            <video
              className="card__media absolute inset-0 z-0 w-full h-full object-fill pointer-events-none"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/da8d0242-4dee-4f6d-813f-a5887e86ad77.png"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_130103_7550f407-f14b-40a6-9616-7a26d7a8bd9f.mp4"
            />
            
            <h2 className="card__title absolute z-10 top-[6.1%] left-[5%] w-[90%] m-0 text-[#ffffff] text-[22.95px] font-semibold tracking-normal leading-[1.48] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">
              Intelligent Connections<br />Cross-Source Context
            </h2>

            {/* Connections Map SVG */}
            <svg className="connections-map absolute z-10 top-[21.7%] left-0 w-full h-[43%] opacity-80 pointer-events-none" viewBox="0 0 429 238" preserveAspectRatio="none">
              <path opacity="0.2" fill="none" stroke="#ffffff" strokeWidth="1" d="M0 5H128c27 0 36 7 39 26 2 16 9 22 24 22h106c16 0 23-8 25-25 2-16 10-23 31-23h76" />
              <path opacity="0.3" fill="none" stroke="#ffffff" strokeWidth="1" d="M0 117h46c15 0 22 8 26 25 5 23 12 31 31 31h174c18 0 25-8 30-31 4-17 11-25 26-25h96" />
              <path opacity="0.34" fill="none" stroke="#ffffff" strokeWidth="1" d="M0 173h87c15 0 22 7 27 25 4 15 11 22 28 22h140c17 0 25-7 29-22 5-18 12-25 28-25h90" />
              <path opacity="0.16" fill="none" stroke="#ffffff" strokeWidth="1" d="M0 228h120c17 0 25-5 28-18 4-15 10-20 28-20h81c18 0 25 6 28 20 4 13 11 18 28 18h116" />
              <path opacity="0.26" fill="none" stroke="#ffffff" strokeWidth="1" d="M0 5H429M0 61H429M0 117H429" />
              <path opacity="0.52" fill="none" stroke="#fff8dd" strokeWidth="1.15" d="M0 61h95c14 0 22-6 27-20 4-13 12-20 27-20h115c15 0 23 6 27 20 5 14 13 20 28 20h110" />
              <path opacity="0.94" fill="none" stroke="#fff8dd" strokeWidth="1.15" d="M0 117h88c15 0 22-8 25-25 4-24 12-31 31-31h129c20 0 27 7 31 31 3 17 10 25 26 25h99" />
              
              <circle cx="45" cy="117" r="6.5" fill="#ffffff" />
              <circle cx="133" cy="61" r="6.5" fill="#fff4a7" />
              <circle cx="189" cy="61" r="6.5" fill="#fff1a4" />
              <circle cx="319" cy="61" r="6.5" fill="#fff4a6" />
              <circle cx="319" cy="117" r="6.5" fill="#fff2a0" />
            </svg>

            {/* Metric Display */}
            <div className="metric metric--connections absolute z-10 top-[48.5%] left-0 w-full flex items-baseline justify-center text-[rgba(255,255,255,.97)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              <div className="dot-number inline-block w-[23%]">
                <LedDotText text="16" dotRadius={1.55} pitchX={5} pitchY={4} className="w-full" />
              </div>
              <span className="metric__unit ml-[1.3%] text-[30.46px] font-normal leading-none tracking-tight">K</span>
            </div>

            <p className="caption absolute z-10 top-[65.1%] left-[10%] w-[80%] text-[rgba(255,255,255,.87)] text-[19.95px] font-normal tracking-[-0.018em] leading-[1.45] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,.6)]">
              Connected data<br />sources
            </p>

            <div className="learn-more absolute z-20 top-[83.75%] left-1/2 -translate-x-1/2">
              <button
                type="button"
                className="w-[111px] h-[45px] border-0 rounded-full bg-[rgba(255,255,255,.97)] text-[#101010] text-[14px] font-medium tracking-[-0.018em] shadow-[inset_0_1px_0_rgba(255,255,255,.50),0_2px_8px_rgba(0,0,0,.40)] transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-white cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
