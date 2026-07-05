"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChatMessage } from "@/components/reader/ChatMessage";
import type { Book } from "@/lib/types";
import {
  getSpeechRecognition,
  type SpeechRecognitionInstance,
} from "@/lib/speech-recognition";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const READER_SUGGESTIONS = [
  "Explain neural networks simply",
  "Summarize my course progress",
  "Recommend books on AI",
  "Help me understand design thinking",
  "What books are available right now?",
  "Quiz me on clean code principles",
];

export function AIChat({ courseId }: { courseId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey there! I'm your AI study tutor. Ask me anything about your courses, a topic you're curious about, or books from our library — I'm here to help you learn.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [latestReplyIndex, setLatestReplyIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => setBooks(d.books ?? []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text?: string) => {
      const userMsg = (text ?? input).trim();
      if (!userMsg || loading) return;
      setInput("");
      const history: Message[] = [
        ...messages,
        { role: "user", content: userMsg },
      ];
      setMessages(history);
      setLoading(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, courseId }),
        });
        const data = await res.json();
        setMessages((m) => {
          const next = [
            ...m,
            {
              role: "assistant" as const,
              content: data.reply ?? data.error ?? "Something went wrong.",
            },
          ];
          setLatestReplyIndex(next.length - 1);
          return next;
        });
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Failed to reach AI assistant." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, courseId]
  );

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

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

  return (
    <Card className="flex h-[min(65vh,calc(100dvh-14rem))] w-full flex-col overflow-hidden p-0 sm:h-[calc(100vh-12rem)]">
      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-3 sm:p-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 sm:gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
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
              className={`max-w-[calc(100%-3rem)] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
                msg.role === "assistant"
                  ? "bg-slate-50 text-slate-700"
                  : "bg-blue-600 text-white text-sm leading-relaxed"
              }`}
            >
              {msg.role === "assistant" ? (
                <ChatMessage
                  content={msg.content}
                  books={books}
                  animate={i === latestReplyIndex}
                />
              ) : (
                msg.content
              )}
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

      {!loading && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-50 px-3 py-2 sm:gap-2 sm:px-4 sm:py-3">
          {READER_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:px-3 sm:py-1.5 sm:text-xs"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 border-t border-slate-100 p-3 sm:p-4">
        {voiceSupported && (
          <Button
            type="button"
            variant={listening ? "primary" : "secondary"}
            onClick={toggleListening}
            disabled={loading}
            title={listening ? "Stop listening" : "Voice input"}
            className={listening ? "animate-pulse" : ""}
          >
            {listening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={
            listening ? "Listening..." : "Ask about your courses or books..."
          }
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <Button onClick={() => send()} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
