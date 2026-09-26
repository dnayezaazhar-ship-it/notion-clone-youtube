import { createOpenRouterCompletion } from "@/lib/openrouter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("documentData" in body) ||
    typeof body.documentData !== "string" ||
    !body.documentData.trim() ||
    !("targetLang" in body) ||
    typeof body.targetLang !== "string" ||
    !body.targetLang.trim()
  ) {
    return NextResponse.json(
      { error: "Document text and a target language are required." },
      { status: 400 }
    );
  }

  try {
    const translated_text = await createOpenRouterCompletion([
      {
        role: "system",
        content:
          "Translate the supplied text into the requested language. Preserve its meaning and formatting. Return only the translation.",
      },
      {
        role: "user",
        content: `Target language: ${body.targetLang}\n\nText:\n${body.documentData}`,
      },
    ]);

    return NextResponse.json({ translated_text });
  } catch (error) {
    console.error("Document translation request failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Document translation request failed.",
      },
      { status: 500 }
    );
  }
}
