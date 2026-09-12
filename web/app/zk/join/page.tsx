import Link from "next/link";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  return (
    <main className="mx-auto max-w-4xl p-8 font-mono text-sm">
      <Link href="/zk" className="text-sky-400">← zk dashboard</Link>
      <h1 className="mb-2 mt-6 text-xl font-bold">Join the KVCH verification network</h1>
      <p className="mb-8 text-neutral-500">
        Two ways in — pick the role that fits you. No raw data ever leaves your side:
        claims are minimized, proofs are verified off-chain.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/zk/join/company"
          className="block border border-neutral-700 p-6 transition-colors hover:border-sky-500"
        >
          <h2 className="mb-2 font-bold text-sky-400">I&apos;m a company</h2>
          <p className="mb-4 text-neutral-400">
            Anchor minimized, ZK-proven claims about your security posture on Celo —
            without exposing findings, witnesses, or raw risk values.
          </p>
          <ul className="mb-4 list-inside list-disc text-neutral-500">
            <li>register a company code</li>
            <li>prove your first claim in one click</li>
            <li>publish through the verifier council</li>
          </ul>
          <span className="text-sky-400">start publishing →</span>
        </Link>

        <Link
          href="/zk/join/verifier"
          className="block border border-neutral-700 p-6 transition-colors hover:border-sky-500"
        >
          <h2 className="mb-2 font-bold text-sky-400">I&apos;m a stakeholder / verifier</h2>
          <p className="mb-4 text-neutral-400">
            Join the independent verification council — re-verify UltraHonk proofs,
            sign attestations, and vote claims on-chain as part of the M-of-N quorum.
          </p>
          <ul className="mb-4 list-inside list-disc text-neutral-500">
            <li>connect your wallet</li>
            <li>request a council seat</li>
            <li>governance activates you in the next set</li>
          </ul>
          <span className="text-sky-400">request a seat →</span>
        </Link>
      </div>
    </main>
  );
}
