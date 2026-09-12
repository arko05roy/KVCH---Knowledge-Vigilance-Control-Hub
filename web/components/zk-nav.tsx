"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowUpRight } from "lucide-react";

export const ZK_NAV_ITEMS = [
  { label: "Overview", href: "/zk" },
  { label: "Join", href: "/zk/join" },
  { label: "Council", href: "/zk/council" },
];

export function ZkNavHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#23252a] bg-[#010102]/85 backdrop-blur-md">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-4 sm:px-6">
        
        {/* Left: Minimal Wordmark & Subsystem Link */}
        <div className="flex items-center gap-6">
          <Link
            href="/zk"
            className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-[#f7f8f8] hover:text-white transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#5e6ad2] text-[11px] font-bold text-white">
              Z
            </span>
            <span>KVCH ZK</span>
          </Link>

          {/* Minimal Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {ZK_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/zk"
                  ? pathname === "/zk" || pathname.startsWith("/zk/claims")
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-2.5 py-1 text-[13px] transition-colors ${
                    isActive
                      ? "text-[#f7f8f8] font-medium bg-[#141516]"
                      : "text-[#8a8f98] hover:text-[#f7f8f8]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Wallet & Return */}
        <div className="flex items-center gap-4">
          <Link
            href="/intern/dashboard"
            className="hidden items-center gap-1 text-[12px] text-[#8a8f98] hover:text-[#f7f8f8] transition-colors sm:inline-flex"
          >
            <span>Hub</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <div className="scale-85 origin-right">
            <ConnectButton
              showBalance={false}
              chainStatus="none"
              accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
            />
          </div>
        </div>

      </div>
    </header>
  );
}
