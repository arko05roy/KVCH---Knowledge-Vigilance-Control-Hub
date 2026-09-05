"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, FileArchive, Upload } from "lucide-react";

export function UploadArtifactForm() {
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(undefined);
    const response = await fetch("/api/extensions", { method: "POST", body: new FormData(event.currentTarget) });
    const payload = await response.json() as { artifact?: { id: string }; error?: string };
    setBusy(false);
    if (!response.ok || !payload.artifact) { setMessage(payload.error ?? "Upload could not be stored"); return; }
    router.push(`/extensions/${payload.artifact.id}`);
    router.refresh();
  }

  return (
    <form ref={form} onSubmit={submit} className="rounded-2xl border border-[#2d3442] bg-[#10141b] p-5 shadow-[0_18px_50px_rgba(0,0,0,.22)]">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#27325a] text-[#b5c5ff]"><FileArchive size={19} /></div>
        <div><h2 className="font-semibold text-[#f1f4f9]">Upload a packaged extension</h2><p className="mt-1 text-sm leading-5 text-[#929bad]">KVCH stores the file first, then calculates its tracking hash and reads the manifest without running it.</p></div>
      </div>
      <label className="mt-5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-[#3c4962] bg-[#0c1016] px-4 py-3 text-sm transition hover:border-[#6577bb]">
        <span className="min-w-0 truncate text-[#cbd2df]">Choose a <code className="font-mono text-[#91a5ef]">.kvch.tgz</code> artifact</span>
        <span className="flex shrink-0 items-center gap-1.5 text-[#b8c8ff]"><Upload size={15} /> Browse</span>
        <input name="artifact" type="file" accept=".kvch.tgz,application/gzip" className="sr-only" required />
      </label>
      {message && <p role="alert" className="mt-3 text-sm text-[#ff9d9d]">{message}</p>}
      <button disabled={busy} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#c9d6ff] px-4 text-sm font-semibold text-[#11182b] transition hover:bg-[#dde5ff] disabled:cursor-wait disabled:opacity-60">
        {busy ? "Storing artifact…" : "Store and inspect"}<ArrowUpRight size={16} />
      </button>
    </form>
  );
}
