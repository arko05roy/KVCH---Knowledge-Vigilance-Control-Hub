const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// Extract the body inner HTML and script
const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);

if (!bodyMatch) process.exit(1);

let jsx = bodyMatch[1];
let style = styleMatch ? styleMatch[1] : '';

// Convert class to className
jsx = jsx.replace(/class=/g, 'className=');

// Convert inline styles if any (only one in demo-visual)
jsx = jsx.replace(/style="width: 100%; height: 100%; background: radial-gradient\(circle at top right, #9b2c3a, #1a2a3a\); filter: brightness\(\.89\) saturate\(\.93\) contrast\(1\.03\);"/g, "style={{width: '100%', height: '100%', background: 'radial-gradient(circle at top right, #9b2c3a, #1a2a3a)', filter: 'brightness(.89) saturate(.93) contrast(1.03)'}}");

// Self close SVG elements
jsx = jsx.replace(/<source(.*?)>/g, '<source$1 />');
jsx = jsx.replace(/<br>/g, '<br />');

// Convert SVG properties
jsx = jsx.replace(/clip-path/g, 'clipPath');
jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');
jsx = jsx.replace(/onclick="openModal\(\)"/g, 'onClick={() => setIsModalOpen(true)}');
jsx = jsx.replace(/onclick="closeModal\(\)"/g, 'onClick={() => setIsModalOpen(false)}');

// Fix the video tag since we self-closed source properly
jsx = jsx.replace(/<source(.*?)\s*\/\s*>\s*<\/source>/g, '<source$1 />');
// Wait, my regex might just leave <source ... />
// No, the original HTML had `<source src="..." type="video/mp4">`.

// Wrap in component
const component = `
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      <style dangerouslySetInnerHTML={{ __html: \`${style.replace(/`/g, '\\`')}\` }} />
      ${jsx}
    </>
  );
}
`;

fs.writeFileSync('app/page.tsx', component);
