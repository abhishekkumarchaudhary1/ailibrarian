"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChat({ courseId }: { courseId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI study assistant. Ask me about your courses, assignments, or library resources.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const history: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(history);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          courseId,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "Something went wrong.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Failed to reach AI assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col p-0 overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === "assistant"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-slate-50 text-slate-700"
                  : "bg-blue-600 text-white"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-2.5 text-sm text-slate-400">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-slate-100 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about your courses or books..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <Button onClick={send} disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
