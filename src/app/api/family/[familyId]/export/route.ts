import { strToU8, zipSync } from "fflate";
import { NextResponse } from "next/server";
import { getExportData } from "@/features/export/data";
import { createClient } from "@/lib/supabase/server";
import {
  toExportJson,
  toPeopleCsv,
} from "../../../../../features/export/format";

const MAX_ZIP_BYTES = 50 * 1024 * 1024;

function responseHeaders(filename: string, type: string) {
  return {
    "Content-Type": type,
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "private, no-store",
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> },
) {
  const { familyId } = await params;
  const format = new URL(request.url).searchParams.get("format") ?? "json";
  if (!["json", "csv", "zip"].includes(format)) {
    return NextResponse.json(
      { error: "Nieprawidłowy format eksportu." },
      { status: 400 },
    );
  }
  const data = await getExportData(familyId);
  if (!data)
    return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
  if (format === "json") {
    return new Response(toExportJson(data), {
      headers: responseHeaders(
        `family-${familyId}.json`,
        "application/json; charset=utf-8",
      ),
    });
  }
  if (format === "csv") {
    return new Response(toPeopleCsv(data), {
      headers: responseHeaders(
        `family-${familyId}-people.csv`,
        "text/csv; charset=utf-8",
      ),
    });
  }

  const supabase = await createClient();
  const files: Record<string, Uint8Array> = {
    "genealogy.json": strToU8(toExportJson(data)),
    "people.csv": strToU8(toPeopleCsv(data)),
  };
  let totalBytes =
    files["genealogy.json"].byteLength + files["people.csv"].byteLength;
  for (const photo of data.photos) {
    const storagePath = photo.storage_path;
    if (typeof storagePath !== "string") continue;
    const downloaded = await supabase.storage
      .from("family-private")
      .download(storagePath);
    if (downloaded.error || !downloaded.data) {
      return NextResponse.json(
        { error: "Nie udało się pobrać zdjęć do eksportu." },
        { status: 502 },
      );
    }
    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    totalBytes += bytes.byteLength;
    if (totalBytes > MAX_ZIP_BYTES) {
      return NextResponse.json(
        { error: "Eksport zdjęć przekracza limit 50 MB." },
        { status: 413 },
      );
    }
    const extension =
      storagePath
        .split(".")
        .pop()
        ?.replace(/[^a-z0-9]/gi, "") || "bin";
    files[`photos/${photo.id}.${extension}`] = bytes;
  }
  return new Response(zipSync(files), {
    headers: responseHeaders(`family-${familyId}.zip`, "application/zip"),
  });
}
