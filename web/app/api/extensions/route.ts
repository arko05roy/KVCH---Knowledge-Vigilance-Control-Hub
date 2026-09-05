import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { requireCompanyId } from "@/lib/auth/company";
import { readKvchConfig } from "@/lib/config";
import { prisma } from "@/lib/db/client";
import { ExtensionRepository } from "@/lib/db/extensions";
import { ArtifactIntakeService } from "@/lib/extensions/artifacts";
import { LocalArtifactStorage } from "@/lib/storage/artifacts";

function failure(error: unknown, status = 400) {
  return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status });
}

export async function GET() {
  try {
    const artifacts = await new ExtensionRepository(prisma).listArtifacts(requireCompanyId());
    return NextResponse.json({ artifacts });
  } catch (error) { return failure(error, 500); }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const upload = form.get("artifact");
    if (!(upload instanceof File)) throw new Error("Choose one .kvch.tgz artifact file");
    if (!upload.name.endsWith(".kvch.tgz")) throw new Error("Artifact file must end in .kvch.tgz");
    if (upload.size === 0) throw new Error("Artifact file is empty");
    const config = readKvchConfig();
    const result = await new ArtifactIntakeService(
      new LocalArtifactStorage(config.artifactStorageDir, config.maxArtifactBytes),
      new ExtensionRepository(prisma),
    ).intake(requireCompanyId(), Readable.fromWeb(upload.stream() as import("node:stream/web").ReadableStream));
    return NextResponse.json({ artifact: result.artifact, created: result.created }, { status: result.created ? 201 : 200 });
  } catch (error) { return failure(error); }
}
