import Link from "next/link";
import { ZkNavHeader } from "@/components/zk-nav";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-[#010102] text-[#f7f8f8] selection:bg-[#5e6ad2]/30">
      <ZkNavHeader />

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="space-y-1.5 border-b border-[#23252a] pb-6">
          <h1 className="text-xl font-semibold tracking-tight text-[#f7f8f8]">
            Join Verification Network
          </h1>
          <p className="text-[13px] text-[#8a8f98]">
            Select your role in the decentralized security posture mesh. Zero raw findings or witness material ever leave your premises.
          </p>
        </div>

        {/* 2 Roles Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          
          {/* Company */}
          <div className="flex flex-col justify-between rounded-lg border border-[#23252a] bg-[#0f1011] p-6 space-y-6 hover:border-[#34343a] transition-colors">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Role 01</span>
                <h2 className="text-[16px] font-semibold text-[#f7f8f8]">Company Publisher</h2>
              </div>
              <p className="text-[13px] text-[#8a8f98] leading-relaxed">
                Anchor ZK-proven claims about your security posture and compliance on Celo without exposing underlying vulnerability telemetry.
              </p>
              <ul className="space-y-1.5 text-[12.5px] text-[#d0d6e0]">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#5e6ad2]" />
                  <span>Register company code on-chain</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#5e6ad2]" />
                  <span>Synthesize 1-click UltraHonk proofs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#5e6ad2]" />
                  <span>Publish claims through verifier council</span>
                </li>
              </ul>
            </div>

            <Link
              href="/zk/join/company"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#5e6ad2] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#828fff] transition-colors"
            >
              <span>Register Company</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Verifier */}
          <div className="flex flex-col justify-between rounded-lg border border-[#23252a] bg-[#0f1011] p-6 space-y-6 hover:border-[#34343a] transition-colors">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#8a8f98]">Role 02</span>
                <h2 className="text-[16px] font-semibold text-[#f7f8f8]">Verifier Council</h2>
              </div>
              <p className="text-[13px] text-[#8a8f98] leading-relaxed">
                Join the independent verification council. Re-verify UltraHonk SNARK proofs off-chain, sign EIP-712 attestations, and vote in the quorum.
              </p>
              <ul className="space-y-1.5 text-[12.5px] text-[#d0d6e0]">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#5e6ad2]" />
                  <span>Connect Web3 wallet</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#5e6ad2]" />
                  <span>Submit seat request to governance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-[#5e6ad2]" />
                  <span>Vote in M-of-N attestation quorum</span>
                </li>
              </ul>
            </div>

            <Link
              href="/zk/join/verifier"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#23252a] bg-[#141516] px-3.5 py-2 text-[13px] font-medium text-[#f7f8f8] hover:bg-[#18191a] transition-colors"
            >
              <span>Request Verifier Seat</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#8a8f98]" />
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}
