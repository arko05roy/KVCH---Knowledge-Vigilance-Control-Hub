import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("name");
  const reportDir = path.resolve(process.cwd(), "..", "final reports");

  try {
    if (!fs.existsSync(reportDir)) {
      return NextResponse.json({ error: "Final reports directory not found" }, { status: 404 });
    }

    // If no specific file requested, return list of available reports
    if (!fileName) {
      const files = fs.readdirSync(reportDir).map((f) => {
        const filePath = path.join(reportDir, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          sizeBytes: stats.size,
          updatedAt: stats.mtime.toISOString(),
          format: f.endsWith(".json") ? "json" : f.endsWith(".md") ? "markdown" : "text",
        };
      });
      return NextResponse.json({ success: true, reports: files });
    }

    // Sanitize fileName to prevent directory traversal
    const safeName = path.basename(fileName);
    const targetFile = path.join(reportDir, safeName);

    if (!fs.existsSync(targetFile)) {
      return NextResponse.json({ error: `Report ${safeName} not found` }, { status: 404 });
    }

    const content = fs.readFileSync(targetFile, "utf-8");
    const isJson = safeName.endsWith(".json");

    return NextResponse.json({
      success: true,
      name: safeName,
      content,
      isJson,
      sizeBytes: Buffer.byteLength(content, "utf-8"),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to read report" }, { status: 500 });
  }
}
