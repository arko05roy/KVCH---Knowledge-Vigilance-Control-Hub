"use client";

import React, { useEffect, useState } from 'react';
import { IntelligentPerformanceStage } from '@/components/intelligent-performance-stage';

interface StatItemProps {
  icon: string;
  target: number;
  suffix: string;
  decimals: number;
  label: string;
  index: number;
}

function StatCounter({ icon, target, suffix, decimals, label, index }: StatItemProps) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const delay = 480 + index * 90;
    const duration = 1500 + index * 80;
    let startTime: number | null = null;
    let animationFrameId: number;

    const timer = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // easeOutCubic
        const ease = 1 - Math.pow(1 - progress, 3);
        setValue(target * ease);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setValue(target);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, index]);

  return (
    <div className="stat-item">
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">
        {value.toFixed(decimals)}
        {suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Font & Font Awesome Preloads */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #000000;
          --text: #ffffff;
          --muted: #8e8e8e;
          --nav-text: #2e2e2e;
          --pill-dark: #28282a;
          --sign-in-text: #c8c8c8;
          --nav-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
          --trust-bg: #28282a;
          --trust-border: rgba(255, 255, 255, 0.4);
          --trust-text: #c4c2c3;
          --font-sans: "Inter", "Segoe UI", system-ui, sans-serif;
          --font-display: "BubbledotICG-FinePos", "Geist Pixel Circle", monospace;
        }

        @font-face {
          font-family: "Geist Pixel Circle";
          src: url("/fonts/GeistPixel-Circle.woff2") format("woff2");
          font-weight: 400;
          font-display: swap;
        }

        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: #000000;
          color: #ffffff;
          font-family: var(--font-sans);
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        /* Hero Viewport Container */
        .hero-viewport {
          position: relative;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          background: var(--bg);
          color: var(--text);
          overflow: hidden;
          isolation: isolate;
        }

        .bg-video-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          background: #000000;
        }

        .bg-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
          z-index: 0;
        }

        .hero-page {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px);
          height: 100vh;
          height: 100dvh;
          width: 100%;
          overflow: hidden;
        }

        /* 1) HEADER */
        .hero-header {
          width: 100%;
          max-width: 720px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(18px, 2.8vw, 28px);
          margin-top: clamp(4px, 1vh, 12px);
          flex-shrink: 0;
          animation: slideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .logo-btn {
          width: clamp(40px, 4.4vw, 46px);
          height: clamp(40px, 4.4vw, 46px);
          border-radius: 50%;
          background: #ffffff;
          box-shadow: var(--nav-shadow);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
          flex-shrink: 0;
        }

        .logo-btn:hover {
          transform: scale(1.04);
        }

        .logo-btn svg {
          width: 72%;
          height: 72%;
          object-fit: contain;
        }

        .nav-pill {
          height: clamp(44px, 5.2vw, 48px);
          max-width: 430px;
          flex: 1;
          background: #ffffff;
          border-radius: 999px;
          padding: 4px 8px;
          box-shadow: var(--nav-shadow);
          display: flex;
          align-items: center;
          justify-content: space-around;
        }

        .nav-link {
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: clamp(13px, 1.4vw, 15px);
          letter-spacing: -0.01em;
          color: var(--nav-text);
          text-decoration: none;
          opacity: 0.5;
          position: relative;
          padding: 6px 12px;
          transition: opacity 0.2s ease;
        }

        .nav-link:hover {
          opacity: 0.75;
        }

        .nav-link.active {
          opacity: 1;
        }

        .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 3px;
          background: #000000;
          border-radius: 50%;
          box-shadow: -5px 0 0 #000000, 5px 0 0 #000000;
        }

        .sign-in-pill {
          height: clamp(44px, 5.2vw, 48px);
          background: var(--pill-dark);
          color: var(--sign-in-text);
          border-radius: 999px;
          padding: 0 20px;
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: clamp(13px, 1.4vw, 15px);
          box-shadow: var(--nav-shadow);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }

        .sign-in-pill:hover {
          background: #323234;
          color: #ffffff;
          transform: translateY(-1px);
        }

        /* Mobile burger button */
        .mobile-burger-btn {
          display: none;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--pill-dark);
          border: none;
          cursor: pointer;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          z-index: 100;
        }

        .mobile-burger-btn span {
          width: 18px;
          height: 1.5px;
          background: #ffffff;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .mobile-burger-btn.open span:nth-child(1) {
          transform: translateY(6.5px) rotate(45deg);
        }
        .mobile-burger-btn.open span:nth-child(2) {
          opacity: 0;
        }
        .mobile-burger-btn.open span:nth-child(3) {
          transform: translateY(-6.5px) rotate(-45deg);
        }

        /* Mobile Overlay & Menu Sheet */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 90;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.28s ease;
        }

        .mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-menu-sheet {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%) translateY(-10px) scale(0.96);
          width: calc(100% - 32px);
          max-width: 400px;
          background: #ffffff;
          border-radius: 28px;
          padding: 22px 18px 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          z-index: 95;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-menu-sheet.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateX(-50%) translateY(0) scale(1);
        }

        .mobile-menu-sheet a, .mobile-menu-sheet button {
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: 16px;
          color: #2e2e2e;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 14px;
          text-align: center;
          transition: background 0.15s ease;
        }

        .mobile-menu-sheet a:hover {
          background: rgba(0,0,0,0.05);
        }

        .mobile-menu-sheet .mobile-signin-btn {
          background: var(--pill-dark);
          color: #ffffff;
          border: none;
          margin-top: 6px;
          cursor: pointer;
        }

        /* 2) HERO CENTER */
        .hero-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 900px;
          width: 100%;
          margin: auto;
          z-index: 1;
        }

        .trust-row {
          display: inline-flex;
          align-items: center;
          --trust-size: clamp(36px, 4.5vw, 42px);
          margin-bottom: clamp(16px, 2.5vh, 26px);
          animation: reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
        }

        .avatar-ring {
          width: var(--trust-size);
          height: var(--trust-size);
          background: var(--trust-bg);
          border: 1px solid var(--trust-border);
          border-radius: 50%;
          padding: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111111;
          font-size: calc(var(--trust-size) * 0.34);
        }

        .avatar-ring:nth-child(1) { z-index: 1; }
        .avatar-ring:nth-child(2) { z-index: 2; margin-left: calc(var(--trust-size) * -0.42); }
        .avatar-ring:nth-child(3) { z-index: 4; margin-left: calc(var(--trust-size) * -0.42); }

        .avatar-ring:nth-child(1):hover { transform: translateY(-2px); }
        .avatar-ring:nth-child(2):hover { transform: translateY(-4px); }
        .avatar-ring:nth-child(3):hover { transform: translateY(-2px); }

        .trust-pill {
          height: var(--trust-size);
          background: var(--trust-bg);
          border: 1px solid var(--trust-border);
          border-radius: 999px;
          margin-left: calc(var(--trust-size) * -0.42);
          padding-left: calc(var(--trust-size) * 0.58);
          padding-right: 16px;
          display: flex;
          align-items: center;
          color: var(--trust-text);
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: clamp(12px, 1.4vw, 13.5px);
          z-index: 0;
          white-space: nowrap;
        }

        .hero-headline {
          margin: 0;
          color: #ffffff;
          font-family: var(--font-display);
          font-size: clamp(28px, 6.2vw, 80px);
          letter-spacing: -0.04em;
          line-height: 1.12;
          white-space: nowrap;
          overflow: hidden;
        }

        .headline-line {
          display: block;
          opacity: 0;
          transform: translateY(14px);
          animation: headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .headline-line:nth-child(1) { animation-delay: 0.12s; }
        .headline-line:nth-child(2) { animation-delay: 0.3s; }

        .hero-subhead {
          max-width: min(500px, 92%);
          margin: clamp(12px, 2vh, 18px) auto clamp(20px, 2.8vh, 30px);
          font-family: var(--font-sans);
          font-size: clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16.5px + 2pt));
          color: #d0d0d0;
          opacity: 0.8;
          line-height: 1.55;
          font-weight: 400;
          animation: reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both;
        }

        .hero-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #000000;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: clamp(13.5px, 1.5vw, 14.5px);
          padding: clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px);
          border-radius: 999px;
          border: none;
          cursor: pointer;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
          animation: revealPulse 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
        }

        .hero-cta:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.25), 0 0 28px rgba(255,255,255,0.48), 0 0 56px rgba(255,255,255,0.22);
        }

        /* 3) STATS FOOTER */
        .stats-footer {
          width: 100%;
          max-width: 920px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(12px, 2vw, 24px);
          margin-bottom: clamp(4px, 1vh, 12px);
          flex-shrink: 0;
          z-index: 1;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .stat-item:nth-child(1) { animation-delay: 0.5s; }
        .stat-item:nth-child(2) { animation-delay: 0.58s; }
        .stat-item:nth-child(3) { animation-delay: 0.66s; }
        .stat-item:nth-child(4) { animation-delay: 0.74s; }

        .stat-icon {
          font-family: var(--font-display);
          font-size: clamp(22px, 3vw, 33px);
          color: #ffffff;
          margin-bottom: 2px;
          line-height: 1;
        }

        .stat-value {
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: clamp(18px, 2.2vw, 26px);
          letter-spacing: -0.025em;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
          line-height: 1.2;
        }

        .stat-label {
          font-family: var(--font-sans);
          font-weight: 400;
          font-size: clamp(11px, 1.2vw, 12.5px);
          color: var(--muted);
          margin-top: 2px;
        }

        /* Animations */
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(22px) scale(0.98); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes revealPulse {
          from { opacity: 0; transform: translateY(22px) scale(0.98); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        @keyframes headlineFade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile Breakpoints */
        @media (max-width: 720px) {
          .nav-pill, .sign-in-pill {
            display: none;
          }
          .mobile-burger-btn {
            display: flex;
          }
          .hero-header {
            max-width: 100%;
          }
          .stats-footer {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px 12px;
          }
          .hero-headline {
            font-size: clamp(28px, 9vw, 44px);
            letter-spacing: -0.08em;
            line-height: 1.05;
          }
        }

        @media (max-width: 420px) {
          .hero-headline {
            letter-spacing: -0.09em;
            line-height: 1.04;
          }
          .trust-row {
            --trust-size: 34px;
          }
          .trust-pill {
            font-size: 12px;
          }
        }

        /* KVCH Login Modal */
        .login-modal {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(14px) saturate(108%);
          -webkit-backdrop-filter: blur(14px) saturate(108%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
        }

        .login-modal.active {
          opacity: 1;
          pointer-events: auto;
        }

        .modal-content {
          background: linear-gradient(145deg, rgba(18, 16, 15, 0.95), rgba(8, 14, 18, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 24px;
          padding: 44px 36px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          width: 92%;
          max-width: 920px;
          text-align: center;
          position: relative;
          transform: translateY(20px) scale(0.95);
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .login-modal.active .modal-content {
          transform: translateY(0) scale(1);
        }

        .modal-content h2 {
          font-family: var(--font-sans);
          font-weight: 600;
          color: #fff;
          margin-top: 0;
          margin-bottom: 6px;
          font-size: 28px;
          letter-spacing: -0.5px;
        }

        .modal-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-top: 0;
          margin-bottom: 32px;
          font-weight: 400;
        }

        .roles-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          width: 100%;
        }

        .role-card {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 32px 16px;
          color: #fff;
          text-decoration: none;
          font-weight: 500;
          font-size: 16px;
          transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          min-height: 220px;
          position: relative;
          overflow: hidden;
        }

        .role-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top, rgba(255, 255, 255, 0.15), transparent 70%);
          opacity: 0;
          transition: opacity 250ms ease;
        }

        .role-card:hover {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 255, 255, 0.1);
        }

        .role-card:hover::before {
          opacity: 1;
        }

        .role-card .role-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: transform 250ms ease, background 250ms ease;
        }

        .role-card:hover .role-icon {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.2);
        }

        .role-card .role-title {
          font-size: 16px;
          font-weight: 500;
          color: #fff;
        }

        .role-card .role-desc {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 400;
          line-height: 1.35;
          text-align: center;
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: #858688;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: color 150ms, background 150ms;
        }
        .modal-close:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }
      ` }} />

      <div className="landing-page-wrapper w-full bg-[#000000]">
        
        {/* REBUILT HERO SECTION */}
        <section className="hero-viewport">
          {/* Background Video */}
          <div className="bg-video-container">
            <video
              className="bg-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onCanPlay={(e) => { e.currentTarget.play().catch(() => {}); }}
            >
              <source
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          <div className="hero-page">
            {/* 1) HEADER */}
            <header className="hero-header">
              <button className="logo-btn" aria-label="KVCH Home">
                <svg viewBox="0 0 25 25" fill="none">
                  <clipPath id="circleClip"><circle cx="12.5" cy="12.5" r="12.5"/></clipPath>
                  <g clipPath="url(#circleClip)">
                    <rect width="25" height="25" fill="#111111"/>
                    <path d="M12.5 5 L20 12.5 L12.5 20 L5 12.5 Z" fill="#000000"/>
                    <path d="M12.5 5 L20 12.5 L12.5 12.5 Z" fill="#737778"/>
                  </g>
                </svg>
              </button>

              <nav className="nav-pill">
                <a href="#" className="nav-link active">Home</a>
                <a href="#" className="nav-link">Product</a>
                <a href="#" className="nav-link">Case Studies</a>
                <a href="#" className="nav-link">Contact</a>
              </nav>

              <button className="sign-in-pill" onClick={() => setIsModalOpen(true)}>
                Sign in
              </button>

              <button
                className={`mobile-burger-btn ${isMobileMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation"
                aria-expanded={isMobileMenuOpen}
              >
                <span />
                <span />
                <span />
              </button>
            </header>

            {/* Mobile Navigation Sheet */}
            <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
            <div className={`mobile-menu-sheet ${isMobileMenuOpen ? 'open' : ''}`}>
              <a href="#" className="active" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
              <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Product</a>
              <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Case Studies</a>
              <a href="#" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
              <button className="mobile-signin-btn" onClick={() => { setIsMobileMenuOpen(false); setIsModalOpen(true); }}>
                Sign in
              </button>
            </div>

            {/* 2) HERO CENTER */}
            <div className="hero-center">
              {/* Trust Row */}
              <div className="trust-row">
                <div className="avatar-ring">
                  <div className="avatar-inner">
                    <i className="fa-brands fa-microsoft" />
                  </div>
                </div>
                <div className="avatar-ring">
                  <div className="avatar-inner">
                    <i className="fa-brands fa-amazon" />
                  </div>
                </div>
                <div className="avatar-ring">
                  <div className="avatar-inner">
                    <i className="fa-brands fa-google" />
                  </div>
                </div>
                <div className="trust-pill">
                  Protected by KVCH Security Control Hub
                </div>
              </div>

              {/* Headline (BubbledotICG-FinePos font, exact 2 lines, solid white) */}
              <h1 className="hero-headline">
                <span className="headline-line">Sovereign AI</span>
                <span className="headline-line">Enterprise Armor</span>
              </h1>

              {/* Subhead (KVCH copy) */}
              <p className="hero-subhead">
                Unify security telemetry, threat intelligence, and automated compliance into one control plane—giving your team a workbench and your enterprise armor.
              </p>

              {/* CTA Button */}
              <button className="hero-cta" onClick={() => setIsModalOpen(true)}>
                Get Started
              </button>
            </div>

            {/* 3) STATS FOOTER */}
            <footer className="stats-footer">
              <StatCounter
                icon="<"
                target={120}
                suffix="ms"
                decimals={0}
                label="Threat Detection Speed"
                index={0}
              />
              <StatCounter
                icon="%"
                target={99.99}
                suffix="%"
                decimals={2}
                label="Security Posture Uptime"
                index={1}
              />
              <StatCounter
                icon="*"
                target={24}
                suffix="/7"
                decimals={0}
                label="Autonomous EDR Shield"
                index={2}
              />
              <StatCounter
                icon="#"
                target={2.4}
                suffix="M"
                decimals={1}
                label="Audited Telemetry Events"
                index={3}
              />
            </footer>
          </div>
        </section>

        {/* SCROLLABLE STAGE SECTION: Built for Intelligent Performance */}
        <IntelligentPerformanceStage />

        {/* Login Modal for Role Selection */}
        <div className={`login-modal ${isModalOpen ? 'active' : ''}`} id="loginModal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2>Select Your Portal</h2>
            <p className="modal-subtitle">Choose your role to access the KVCH Control Hub</p>
            <div className="roles-grid">
              <a href="/intern/dashboard" className="role-card">
                <div className="role-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <span className="role-title">Intern</span>
                <span className="role-desc">Triage Queue & Fix Lab Workspace</span>
              </a>
              <a href="/sr-dev/dashboard" className="role-card">
                <div className="role-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span className="role-title">Senior Dev</span>
                <span className="role-desc">Sandbox Evaluator & Patch Approvals</span>
              </a>
              <a href="/hr/dashboard" className="role-card">
                <div className="role-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <span className="role-title">HR</span>
                <span className="role-desc">Policy Compliance & Access Governance</span>
              </a>
              <a href="/management/dashboard" className="role-card">
                <div className="role-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                </div>
                <span className="role-title">Management</span>
                <span className="role-desc">CISO Posture & Crisis Escalations</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
