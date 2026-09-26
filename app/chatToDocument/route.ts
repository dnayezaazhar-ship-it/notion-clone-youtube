import { createOpenRouterCompletion } from "@/lib/openrouter";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("documentData" in body) ||
    typeof body.documentData !== "string" ||
    !("question" in body) ||
    typeof body.question !== "string" ||
    !body.question.trim()
  ) {
    return NextResponse.json(
      { message: "Document content and a question are required." },
      { status: 400 }
    );
  }

  try {
    const message = await createOpenRouterCompletion([
      {
        role: "system",
        content:
          "Answer the user's question using the provided document. Be accurate and concise, and say when the document does not contain the answer.",
      },
      {
        role: "user",
        content: `Document:\n${body.documentData}\n\nQuestion:\n${body.question}`,
      },
    ]);

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Document chat request failed:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Document chat request failed.",
      },
      { status: 500 }
    );
  }
}
