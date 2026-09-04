"use client";

import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div 
      className="fixed inset-0 w-full h-full flex flex-col overflow-hidden"
      style={{
        backgroundImage: `url('/images/mock404.png')`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,100..1000&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0');
        
        .float-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }
        .float-slow-delayed {
          animation: floatSlow 4.5s ease-in-out infinite;
          animation-delay: 1s;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .text-gradient {
          background: linear-gradient(to bottom, #F7B2FB 50%, #786EF1 80%, #5588FB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 2px rgba(255,255,255,0.2));
        }
      `}} />

      <main className="flex-1 flex flex-col items-center justify-between max-w-[700px] mx-auto w-full px-5 py-12 relative z-10 text-center">
        
        {/* Top Text Section */}
        <div className="flex flex-col items-center translate-y-[40px]">
          <p className="text-[15px] font-normal text-gray-300 mb-3">
            Seems you&apos;ve stepped outside the secure perimeter...
          </p>

          <div className="relative inline-block mb-3.5">
            <h1 className="text-[clamp(26px,5vw,52px)] font-medium tracking-[-1.5px] leading-[1.08] text-white m-0 relative z-10">
              Whoops! Nothing here yet
            </h1>
          </div>

          <p className="text-[14px] text-gray-300 leading-[1.7] max-w-[470px] mb-7">
            Return to your <span className="inline-flex bg-white/20 text-white text-[12.5px] font-semibold px-3 py-0.5 rounded-md">dashboard</span> to monitor active threats, policies, and workflows. We&apos;ll keep things secure while you <span className="inline-flex bg-white/20 text-white text-[12.5px] font-semibold px-3 py-0.5 rounded-md">realign</span> your coordinates.
          </p>
        </div>

        {/* Spacer for UFO */}
        <div className="flex-1 min-h-[150px]"></div>

        {/* Bottom Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-[460px] pb-6 -translate-y-[40px]">
          <Link href="/" className="bg-white/5 backdrop-blur-md rounded-[18px] p-[18px_22px] flex items-center justify-between border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)] transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" fill="#fff"/>
                  <path d="M9 21V12h6v9" fill="#222"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[15px] font-semibold text-white">Main Dashboard</div>
                <div className="text-[12px] text-gray-400">Back to your control plane...</div>
              </div>
            </div>
            <span className="text-gray-400 text-[21px] font-medium group-hover:translate-x-1.5 transition-transform duration-300">&rsaquo;</span>
          </Link>

          <Link href="/intern/marketplace" className="bg-white/5 backdrop-blur-md rounded-[18px] p-[18px_22px] flex items-center justify-between border border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:bg-white/10 hover:-translate-y-[3px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)] transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9" fill="#fff"/>
                  <circle cx="12" cy="12" r="3.5" fill="#222"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[15px] font-semibold text-white">Plugin Marketplace</div>
                <div className="text-[12px] text-gray-400">Extend your armor&apos;s capabilities</div>
              </div>
            </div>
            <span className="text-gray-400 text-[21px] font-medium group-hover:translate-x-1.5 transition-transform duration-300">&rsaquo;</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
