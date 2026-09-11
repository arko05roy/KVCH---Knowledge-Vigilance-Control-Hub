"use client";

import React, { useEffect, useState } from 'react';
import { IntelligentPerformanceStage } from '@/components/intelligent-performance-stage';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeString, setTimeString] = useState("9:47 PM\u00A0 • \u00A014 July 2026");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const day = now.getDate();
      const month = now.toLocaleString('en-US', { month: 'long' });
      const year = now.getFullYear();
      setTimeString(`${timeStr}\u00A0 • \u00A0${day} ${month} ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('motion-pending');
      const fallback = setTimeout(() => {
        document.documentElement.classList.remove('motion-pending');
      }, 3500);
      
      const card = document.querySelector('.demo-card');
      if(card) {
        card.addEventListener('animationend', () => {
          document.documentElement.classList.remove('motion-pending');
          clearTimeout(fallback);
        }, { once: true });
      }
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
    @font-face {
      font-family: 'Reference Sans';
      src: local('Reference Sans'), local('Helvetica Neue'), local('Arial');
      font-weight: 100 900;
    }
    @font-face {
      font-family: 'Reference Display';
      src: local('Reference Display'), local('Helvetica Neue'), local('Arial');
      font-weight: 400 900;
    }
    
    :root {
      font-family: "Reference Sans", Arial, sans-serif;
      color-scheme: dark;
    }

    html, body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      overflow-y: auto;
      background: #000;
      width: 100%;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .viewport {
      position: relative;
      width: 100%;
      min-height: 100vh;
      isolation: isolate;
      background: #000;
    }

    .screen {
      position: relative;
      width: 100%;
      min-height: 100vh;
      background: #000;
      
      --gutter-start: clamp(36px, 4.177vw, 96px);
      --gutter-end: clamp(36px, 4.04vw, 96px);
      --header-top: clamp(20px, 2.264vh, 30px);
      --hero-bottom: clamp(34px, 5.19vh, 64px);
      --display-size: clamp(58px, 7.64vh, 88px);
      --display-leading: clamp(72px, 9.34vh, 106px);
      --copy-size: clamp(14px, 1.70vh, 19px);
      --copy-leading: clamp(19px, 2.17vh, 24px);
      --title-copy-gap: clamp(15px, 2.08vh, 24px);
      --copy-cta-gap: clamp(24px, 3.11vh, 36px);
      --cta-width: clamp(142px, 15.09vh, 168px);
      --cta-height: clamp(38px, 3.96vh, 44px);
      --compact-control-font-size: clamp(17px, 1.75vh, 19px);
      --action-control-font-size: clamp(17px, 1.78vh, 19.5px);
      --primary-control-font-size: clamp(17px, 1.77vh, 19.25px);
      --control-inline-nudge: -1px;
      --control-baseline-shift: clamp(1px, .19vh, 2px);
      --copy-optical-shift: clamp(0px, .1vh, 1px);
      --watch-baseline-shift: clamp(2px, .38vh, 4px);
      --card-width: clamp(150px, 18.96vh, 215px);
    }

    .screen::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -2;
      background:
        linear-gradient(180deg, rgba(0,0,0,.03), transparent 24%, transparent 82%, rgba(0,0,0,.05)),
        radial-gradient(ellipse at 44% 54%, transparent 30%, rgba(0,0,0,.055) 100%);
      pointer-events: none;
    }

    .background {
      position: absolute;
      inset: 0;
      z-index: -3;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      pointer-events: none;
      user-select: none;
      background: #000000 url("https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/5c3ec08f-2dbf-4c0a-8588-f6106a789443.webp") center / cover no-repeat;
    }

    /* HEADER */
    .header {
      position: absolute;
      inset: var(--header-top) var(--gutter-end) auto var(--gutter-start);
      height: 48px;
      display: flex;
      align-items: flex-start;
      white-space: nowrap;
      z-index: 10;
    }

    .brand {
      position: relative;
      top: 10px;
      width: 25px;
      height: 25px;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.3));
      display: flex;
      cursor: pointer;
    }
    
    .brand svg {
      width: 100%;
      height: 100%;
    }

    .header-actions {
      display: flex;
      flex: 1;
    }

    .nav {
      margin-left: clamp(36px, 3.03vw, 48px);
      display: flex;
      gap: clamp(32px, 2.9vw, 43px);
      position: relative;
      top: 9px;
    }

    .nav a {
      font-size: 16px;
      font-weight: 430;
      letter-spacing: -.36px;
      color: rgba(229,229,230,.77);
      text-shadow: 0 1px 3px rgba(0,0,0,.55);
      text-decoration: none;
      position: relative;
      transition: filter 140ms, opacity 140ms;
    }

    .nav a:hover {
      filter: brightness(1.08);
      color: #fff;
    }

    .nav a.active {
      color: #fff;
    }

    .nav a.active::after {
      content: "";
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 44px;
      height: 2px;
      background: rgba(255,255,255,.82);
    }
    
    .nav a:first-child { top: -3px; }
    .nav a:nth-child(4) { margin-left: 1px; }

    .time-panel {
      margin-left: auto;
      width: 211px;
      height: 48px;
      padding-left: 8px;
      border-left: 2px solid rgba(230,230,230,.52);
      display: flex;
      flex-direction: column;
      justify-content: center;
      line-height: 1.2;
    }

    .time-label {
      font-size: 15px;
      font-weight: 420;
      color: rgba(240,240,240,.77);
    }

    .time-value {
      font-size: 15px;
      font-weight: 440;
      color: rgba(255,255,255,.93);
    }

    .sign-up {
      width: 109px;
      height: 42px;
      border-radius: 7px;
      background: #fff;
      color: #101010;
      font-weight: 460;
      letter-spacing: -.34px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.72), 0 1px 5px rgba(0,0,0,.34);
      margin-left: clamp(20px, 1.95vw, 29px);
      border: none;
      font-family: inherit;
      font-size: 15px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: filter 140ms;
    }

    .sign-up:hover {
      filter: brightness(0.9);
    }

    .menu-toggle {
      display: none;
    }

    /* HERO CONTENT */
    .hero {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .hero-content {
      position: absolute;
      left: var(--gutter-start);
      bottom: var(--hero-bottom);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      pointer-events: auto;
    }

    .hero-title {
      font-family: "Reference Display", "Reference Sans", Arial, sans-serif;
      font-weight: 500;
      font-optical-sizing: auto;
      letter-spacing: -2.1px;
      -webkit-text-stroke: .12px currentColor;
      white-space: nowrap;
      text-shadow: 0 2px 2px rgba(0,0,0,.44);
      margin: 0;
      font-size: var(--display-size);
      line-height: var(--display-leading);
      display: flex;
      flex-direction: column;
    }

    .line {
      display: inline-flex;
      overflow: hidden;
      transform-origin: left center;
    }
    
    .line-one {
      color: #fff;
      transform: scaleX(.775);
    }
    
    .line-two {
      color: rgba(211, 207, 207, .78);
      transform: scaleX(.793);
    }
    
    .line-reveal {
      display: inline-block;
    }

    .hero-copy {
      color: rgba(226, 229, 228, .84);
      font-weight: 350;
      letter-spacing: .13px;
      width: clamp(390px, 31.67vw, 500px);
      position: relative;
      left: 1px;
      text-shadow: 0 1px 3px rgba(0,0,0,.7);
      font-size: var(--copy-size);
      line-height: var(--copy-leading);
      margin: var(--title-copy-gap) 0 var(--copy-cta-gap) 0;
    }

    .primary-cta {
      width: var(--cta-width);
      height: var(--cta-height);
      border-radius: 7px;
      background: #fff;
      color: #111;
      box-shadow: 0 1px 5px rgba(0,0,0,.38);
      border: none;
      position: relative;
      cursor: pointer;
      font-family: inherit;
      transition: filter 140ms;
    }

    .primary-cta:hover {
      filter: brightness(0.9);
    }

    .primary-cta .label {
      position: absolute;
      left: 8.125%;
      top: 50%;
      transform: translateY(-50%);
      font-weight: 450;
      letter-spacing: -.3px;
      font-size: 15px;
    }

    .primary-cta .arrow-box {
      position: absolute;
      right: 3.125%;
      top: 14.286%;
      width: 20.625%;
      height: 71.429%;
      border-radius: 7px;
      background: #070909;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* DEMO CARD */
    .demo-card {
      position: absolute;
      right: var(--gutter-end);
      bottom: var(--hero-bottom);
      width: var(--card-width);
      aspect-ratio: 201 / 265;
      container-type: inline-size;
      pointer-events: auto;
      
      border: 1px solid rgba(255,255,255,.13);
      border-radius: clamp(12px, 1.52vh, 18px);
      background: linear-gradient(145deg, rgba(24,22,20,.80), rgba(5,12,14,.86));
      box-shadow:
        0 2px 10px rgba(0,0,0,.44),
        0 0 0 3px rgba(255,255,255,.035) inset,
        0 0 0 1px rgba(0,0,0,.9);
      backdrop-filter: blur(14px) saturate(108%);
      -webkit-backdrop-filter: blur(14px) saturate(108%);
      
      display: flex;
      flex-direction: column;
    }

    .demo-visual {
      position: absolute;
      left: 3.5cqw;
      top: 4cqw;
      width: 92.5cqw;
      height: 92cqw;
      border-radius: 4cqw;
      background: #101a1e;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .demo-visual button.play {
      position: absolute;
      width: 29cqw;
      height: 29cqw;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.34);
      background: rgba(3,5,7,.47);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: filter 140ms;
    }
    
    .demo-visual button.play:hover {
      filter: brightness(1.2);
    }

    .watch-button {
      position: absolute;
      bottom: 3.5cqw;
      left: 3.5cqw;
      width: 92.5cqw;
      height: 26cqw;
      border-radius: 4cqw;
      background: linear-gradient(145deg, rgba(26,34,36,.86), rgba(16,29,33,.9));
      border: 1px solid rgba(255,255,255,.21);
      color: #fff;
      font-weight: 430;
      font-size: 11cqw;
      font-family: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: filter 140ms;
    }
    
    .watch-button:hover {
      filter: brightness(1.2);
    }

    button:focus-visible, a:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }

    /* Modal */
    .login-modal {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0,0,0,0.7);
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
      font-family: "Reference Display", "Reference Sans", Arial, sans-serif;
      font-weight: 500;
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
      font-weight: 350;
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

    /* ANIMATIONS */
    .motion-pending .brand { opacity: 0; animation: entrance-brand 580ms cubic-bezier(.16,1,.3,1) 60ms forwards; }
    .motion-pending .nav a:nth-child(1) { opacity: 0; animation: entrance-nav 480ms cubic-bezier(.16,1,.3,1) 130ms forwards; }
    .motion-pending .nav a:nth-child(2) { opacity: 0; animation: entrance-nav 480ms cubic-bezier(.16,1,.3,1) 175ms forwards; }
    .motion-pending .nav a:nth-child(3) { opacity: 0; animation: entrance-nav 480ms cubic-bezier(.16,1,.3,1) 220ms forwards; }
    .motion-pending .nav a:nth-child(4) { opacity: 0; animation: entrance-nav 480ms cubic-bezier(.16,1,.3,1) 265ms forwards; }
    .motion-pending .time-panel { opacity: 0; animation: entrance-nav 520ms cubic-bezier(.16,1,.3,1) 180ms forwards; }
    .motion-pending .sign-up { opacity: 0; animation: entrance-action 520ms cubic-bezier(.16,1,.3,1) 220ms forwards; }
    .motion-pending .menu-toggle { opacity: 0; animation: entrance-action 520ms cubic-bezier(.16,1,.3,1) 140ms forwards; }
    
    .motion-pending .line-one .line-reveal { transform: translate3d(0,110%,0) skewY(2deg); animation: entrance-line 800ms cubic-bezier(.22,1,.36,1) 300ms forwards; }
    .motion-pending .line-two .line-reveal { transform: translate3d(0,110%,0) skewY(2deg); animation: entrance-line 850ms cubic-bezier(.22,1,.36,1) 440ms forwards; }
    
    .motion-pending .hero-copy { opacity: 0; transform: translateY(12px) scale(.98); animation: entrance-copy 620ms cubic-bezier(.16,1,.3,1) 740ms forwards; }
    .motion-pending .primary-cta { opacity: 0; animation: entrance-action 560ms cubic-bezier(.16,1,.3,1) 960ms forwards; }
    
    .motion-pending .demo-card { opacity: 0; transform-origin: 82% 50%; animation: entrance-card 920ms cubic-bezier(.22,1,.36,1) 1040ms forwards; }

    @keyframes entrance-brand {
      0% { opacity: 0; transform: translateY(7px) scale(.94); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes entrance-nav {
      0% { opacity: 0; transform: translateY(6px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes entrance-action {
      0% { opacity: 0; transform: translateY(8px) scale(.985); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes entrance-line {
      0% { transform: translate3d(0,110%,0) skewY(2deg); }
      100% { transform: translate3d(0,0,0) skewY(0); }
    }
    @keyframes entrance-copy {
      0% { opacity: 0; transform: translateY(12px) scale(.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes entrance-card {
      0% { opacity: 0; transform: translateY(12px) scale(.968); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* RESPONSIVE */
    @media (max-width: 790px), (min-width: 620px) and (max-width: 1100px) and (orientation: portrait) {
      .header-actions {
        display: none;
      }
      .menu-toggle {
        display: block;
        margin-left: auto;
        width: 46px;
        height: 46px;
        border-radius: 11px;
        background: rgba(255,255,255,.1);
        border: 1px solid rgba(255,255,255,.2);
        backdrop-filter: blur(14px);
        color: #fff;
      }
    }
    @media (max-width: 619px) {
      .hero-content {
        bottom: 24px;
      }
      .hero-title .line-one { transform: scaleX(.78); }
      .hero-title .line-two { transform: scaleX(.55); }
      .hero-copy br { display: none; }
      .demo-card {
        top: clamp(176px, 32svh, 300px);
        bottom: auto;
        right: var(--gutter-end);
      }
    }
  ` }} />
      
  <div className="landing-page-wrapper w-full min-h-screen bg-[#000000]">
    <main className="viewport">
      <section className="screen" id="screen">
        <video 
          className="background" 
          autoPlay 
          muted 
          loop 
          playsInline 
          preload="auto" 
          disablePictureInPicture 
          aria-hidden="true"
          poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/5c3ec08f-2dbf-4c0a-8588-f6106a789443.webp"
          onCanPlay={(e) => { e.currentTarget.play().catch(() => {}); }}
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_064556_051587f1-74a1-4336-8c05-4dde3594ed05.mp4" type="video/mp4" />
        </video>
        
        <header className="header">
          <a className="brand" aria-label="Vantage home">
            <svg viewBox="0 0 25 25" fill="none">
              <clipPath id="circleClip"><circle cx="12.5" cy="12.5" r="12.5"/></clipPath>
              <g clipPath="url(#circleClip)">
                <rect width="25" height="25" fill="#ededed"/>
                <path d="M12.5 5 L20 12.5 L12.5 20 L5 12.5 Z" fill="#050606" opacity="0.9"/>
                <path d="M12.5 5 L20 12.5 L12.5 12.5 Z" fill="#737778"/>
              </g>
            </svg>
          </a>
          
          <div className="header-actions" id="tablet-navigation">
            <nav className="nav">
              <a href="#" className="active">Home</a>
              <a href="#">About</a>
              <a href="#">Services</a>
              <a href="#">Contact</a>
            </nav>
            
            <div className="time-panel">
              <span className="time-label">Timezone</span>
              <span className="time-value">{timeString}</span>
            </div>
            
            <button className="sign-up" onClick={() => setIsModalOpen(true)}>Log in</button>
          </div>
          
          <button className="menu-toggle" aria-label="Toggle menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </header>

        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="line line-one"><span className="line-reveal">Sovereign AI.</span></span>
              <span className="line line-two"><span className="line-reveal">Enterprise Armor.</span></span>
            </h1>
            <p className="hero-copy">
              Your company&apos;s work is scattered across disconnected systems.<br />
              KVCH brings it into one intelligent control plane, so every<br />
              employee gets a workbench and the enterprise gets armor.
            </p>
            <button className="primary-cta" onClick={() => setIsModalOpen(true)}>
              <span className="label">Get Started</span>
              <span className="arrow-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </button>
          </div>

          <article className="demo-card">
            <div className="demo-visual">
              <div style={{width: '100%', height: '100%', background: 'radial-gradient(circle at top right, #9b2c3a, #1a2a3a)', filter: 'brightness(.89) saturate(.93) contrast(1.03)'}}></div>
              <button className="play" aria-label="Play demo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
            </div>
            <button className="watch-button">Watch Demo</button>
          </article>
        </section>
      </section>
    </main>

    {/* SCROLLABLE STAGE SECTION: Built for Intelligent Performance */}
    <IntelligentPerformanceStage />

    {/* Login Modal */}
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
