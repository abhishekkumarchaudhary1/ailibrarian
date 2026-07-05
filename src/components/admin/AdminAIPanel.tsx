"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InlineCharts } from "@/components/admin/InlineCharts";
import {
  getSpeechRecognition,
  type SpeechRecognitionInstance,
} from "@/lib/speech-recognition";

interface ChartItem {
  label: string;
  value: number;
  color?: string;
}

interface ChartData {
  type: "bar" | "donut" | "progress";
  title: string;
  items: ChartItem[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  charts?: ChartData[];
}

const SUGGESTIONS = [
  "Give me a full analytics overview",
  "Which books have the highest demand?",
  "Are there any overdue loans right now?",
  "How are courses performing?",
  "Show reader activity breakdown",
  "What inventory needs attention?",
];

export function AdminAIPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can help you analyze library data — loans, book utilization, reader activity, course stats, and more. Ask me anything or pick a suggestion below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
  }, []);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text?: string) => {
      const userMsg = (text ?? input).trim();
      if (!userMsg || loading) return;
      setInput("");
      setExpanded(true);
      const history: Message[] = [
        ...messages,
        { role: "user", content: userMsg },
      ];
      setMessages(history);
      setLoading(true);

      try {
        const res = await fetch("/api/ai/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
        const data = await res.json();
        setMessages((m) => [
          ...m,
          {
            role: "assistant" as const,
            content: data.reply ?? data.error ?? "Something went wrong.",
            charts: data.charts ?? undefined,
          },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            role: "assistant" as const,
            content: "Failed to reach AI assistant.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        recognition.stop();
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function formatBlock(text: string) {
    const lines = text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .split("\n");

    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    function flushList() {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-1.5 pl-1">
            {listItems.map((item, j) => (
              <li key={j} className="flex gap-2 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    }

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        continue;
      }
      if (/^[-•]\s+/.test(trimmed)) {
        listItems.push(trimmed.replace(/^[-•]\s+/, ""));
      } else {
        flushList();
        elements.push(
          <p key={`p-${elements.length}`} className="text-sm">
            {trimmed}
          </p>
        );
      }
    }
    flushList();
    return elements;
  }

  return (
    <div className="gradient-card overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-2 px-3 py-3 sm:px-5 sm:py-4"
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-slate-800">
              AI Analytics Assistant
            </p>
            <p className="truncate text-xs text-slate-500">
              Ask about stats, loans, utilization, trends
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <>
          <div className="max-h-[400px] space-y-3 overflow-y-auto overflow-x-hidden border-t border-slate-100 px-3 py-3 sm:px-5 sm:py-4">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      msg.role === "assistant"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="h-3.5 w-3.5" />
                    ) : (
                      <User className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[calc(100%-2.5rem)] space-y-2 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 ${
                      msg.role === "assistant"
                        ? "bg-slate-50 text-slate-700"
                        : "bg-blue-600 text-sm text-white"
                    }`}
                  >
                    {msg.role === "assistant"
                      ? formatBlock(msg.content)
                      : msg.content}
                  </div>
                </div>
                {msg.charts && msg.charts.length > 0 && (
                  <div className="mt-2 sm:ml-9">
                    <InlineCharts charts={msg.charts} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-2.5 text-sm text-slate-400">
                  Analyzing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {!loading && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-50 px-3 py-2 sm:gap-2 sm:px-5 sm:py-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 border-t border-slate-100 px-3 py-2 sm:px-4 sm:py-3">
            {voiceSupported && (
              <Button
                type="button"
                size="sm"
                variant={listening ? "primary" : "secondary"}
                onClick={toggleListening}
                disabled={loading}
                title={listening ? "Stop listening" : "Voice input"}
                className={listening ? "animate-pulse" : ""}
              >
                {listening ? (
                  <MicOff className="h-3.5 w-3.5" />
                ) : (
                  <Mic className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={
                listening ? "Listening..." : "Ask about library analytics..."
              }
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <Button
              size="sm"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
