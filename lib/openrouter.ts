type OpenRouterMessage = {
  role: "system" | "user";
  content: string;
};

type OpenRouterResponse = {
  choices?: {
    message?: {
      content?: string | null;
    };
  }[];
  error?: {
    message?: string;
  };
};

export async function createOpenRouterCompletion(
  messages: OpenRouterMessage[]
) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured on the server.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages,
    }),
  });

  const result = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    throw new Error(
      result.error?.message ?? `OpenRouter request failed (${response.status}).`
    );
  }

  const content = result.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return content;
}
