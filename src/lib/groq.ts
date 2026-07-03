const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function chatWithGroq(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
): Promise<string> {
  const apiKey = process.env.NEXT_AI_LIBRARIAN_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not configured");
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No response generated.";
}
