import Link from "next/link";
import { ArrowRight, Boxes, CircleAlert, Clock3, Fingerprint } from "lucide-react";
import { UploadArtifactForm } from "@/components/extensions/upload-artifact-form";
import { requireCompanyId } from "@/lib/auth/company";
import { prisma } from "@/lib/db/client";
import { ExtensionRepository } from "@/lib/db/extensions";

export const dynamic = "force-dynamic";

const stateStyle: Record<string, string> = { uploaded: "bg-[#27325a] text-[#b9c8ff]", evaluating: "bg-[#3e3320] text-[#ffd995]", deployable: "bg-[#173d2b] text-[#a6efca]", evaluation_failed: "bg-[#4b272b] text-[#ffb6b6]", runtime_unsupported: "bg-[#342b42] text-[#d7bcff]" };

export default async function ExtensionsPage() {
  let artifacts: Awaited<ReturnType<ExtensionRepository["listArtifacts"]>> = [];
  let error: string | undefined;
  try { artifacts = await new ExtensionRepository(prisma).listArtifacts(requireCompanyId()); } catch (reason) { error = reason instanceof Error ? reason.message : "Artifacts are unavailable"; }
  return <main className="min-h-screen bg-[#080b10] px-5 py-8 text-[#eef1f6] sm:px-8 lg:px-12">
    <div className="mx-auto max-w-6xl">
      <nav className="mb-10 flex items-center gap-2 text-sm text-[#8e99ac]"><Boxes size={15} /><span>KVCH Judge</span><span className="text-[#465166]">/</span><span className="text-[#d6ddea]">Extensions</span></nav>
      <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 font-mono text-xs tracking-[.16em] text-[#91a5ef]">ARTIFACT REGISTRY</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Exact bytes. Durable evidence.</h1><p className="mt-3 max-w-2xl text-[15px] leading-6 text-[#9da7b8]">Every extension here is an immutable package. KVCH evaluates and schedules the hash shown on its detail page.</p></div><div className="flex items-center gap-2 rounded-lg border border-[#293143] bg-[#0e131c] px-3 py-2 text-xs text-[#9da7b8]"><Fingerprint size={14} className="text-[#91a5ef]" /> Server-calculated SHA-256</div></header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 rounded-2xl border border-[#252c38] bg-[#0e1219]">
          <div className="flex items-center justify-between border-b border-[#252c38] px-5 py-4"><h2 className="font-semibold">Stored artifacts</h2><span className="font-mono text-xs text-[#79869b]">{artifacts.length} total</span></div>
          {error ? <div className="m-5 flex gap-3 rounded-xl border border-[#58383a] bg-[#24171b] p-4 text-sm text-[#ffb6b6]"><CircleAlert className="shrink-0" size={18} /><p>{error}. Configure the local environment and database before using the registry.</p></div> : artifacts.length === 0 ? <div className="px-5 py-16 text-center"><p className="font-medium text-[#d9dfea]">No artifacts stored yet</p><p className="mx-auto mt-2 max-w-sm text-sm leading-5 text-[#8792a5]">Upload a package to establish its server tracking ID and preflight state.</p></div> : <ul className="divide-y divide-[#202733]">{artifacts.map((artifact) => <li key={artifact.id}><Link href={`/extensions/${artifact.id}`} className="group block px-5 py-4 transition hover:bg-[#131925]"><div className="flex gap-3"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-[#e9edf5]">{artifact.extension.name}</span><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${stateStyle[artifact.state]}`}>{artifact.state.replace("_", " ")}</span></div><p className="mt-1 font-mono text-xs text-[#8797b8]">{artifact.sha256}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8792a5]"><span>{artifact.adapterKey ?? "No supported adapter"}</span><span>{artifact.size.toLocaleString()} bytes</span><span className="inline-flex items-center gap-1"><Clock3 size={12} />{artifact.createdAt.toLocaleString()}</span></div></div><ArrowRight className="mt-1 shrink-0 text-[#62708a] transition group-hover:translate-x-1 group-hover:text-[#c4d0fa]" size={18} /></div></Link></li>)}</ul>}
        </section>
        <aside><UploadArtifactForm /><p className="mt-4 px-1 text-xs leading-5 text-[#758196]">Upload never executes package code. Evaluation happens later in an isolated, fresh workspace through the server worker.</p></aside>
      </div>
    </div>
  </main>;
}
