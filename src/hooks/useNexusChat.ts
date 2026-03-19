import { useState, useRef, useCallback } from "react";
import { streamChat } from "@/lib/streaming";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type AnalysisMode = "general" | "research" | "analyze" | "strategize";

export function useNexusChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AnalysisMode>("general");
  const abortRef = useRef(false);

  const send = useCallback(async (input: string) => {
    if (!input.trim() || isStreaming) return;
    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    abortRef.current = false;

    let soFar = "";
    const assistantId = crypto.randomUUID();

    const apiMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await streamChat({
        messages: apiMessages,
        mode,
        onDelta: (chunk) => {
          if (abortRef.current) return;
          soFar += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id === assistantId) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: soFar } : m);
            }
            return [...prev, { id: assistantId, role: "assistant", content: soFar, timestamp: new Date() }];
          });
        },
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          setError(err);
          setIsStreaming(false);
        },
      });
    } catch {
      setError("Connection failed. Please try again.");
      setIsStreaming(false);
    }
  }, [messages, isStreaming, mode]);

  const clear = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, mode, setMode, send, clear };
}
