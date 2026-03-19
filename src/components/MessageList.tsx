import { useEffect, useRef } from "react";
import type { Message } from "@/hooks/useNexusChat";
import { Bot, User } from "lucide-react";

function formatContent(content: string) {
  // Simple markdown-ish rendering
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-primary mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-primary mt-4 mb-1.5">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-primary mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1 py-0.5 rounded bg-secondary text-primary text-xs font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-card-foreground">$1</li>')
    .replace(/\n/g, "<br />");
}

export function MessageList({
  messages,
  isStreaming,
}: {
  messages: Message[];
  isStreaming: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse-glow">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold font-mono glow-text text-primary">
            NEXUS READY
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ask me to research any topic, analyze data, build strategies,
            or explore complex questions. I'll provide deep, structured intelligence.
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {[
              "Analyze the current state of quantum computing",
              "Research the top AI startups in 2026",
              "Build a market entry strategy for EVs in India",
              "Explain CRISPR gene editing breakthroughs",
            ].map((q) => (
              <button
                key={q}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors font-mono"
                onClick={() => {
                  const event = new CustomEvent("nexus-quick-prompt", { detail: q });
                  window.dispatchEvent(event);
                }}
              >
                {q.length > 40 ? q.slice(0, 40) + "…" : q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 animate-fade-in-up ${
            msg.role === "user" ? "justify-end" : ""
          }`}
        >
          {msg.role === "assistant" && (
            <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-primary" />
            </div>
          )}
          <div
            className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary/10 text-foreground border border-primary/20"
                : "glass-panel"
            }`}
          >
            {msg.role === "assistant" ? (
              <div
                className="prose-nexus [&>br]:block [&>br]:mb-1"
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
            ) : (
              <span>{msg.content}</span>
            )}
            {msg.role === "assistant" && isStreaming && messages[messages.length - 1]?.id === msg.id && (
              <span className="typing-cursor" />
            )}
          </div>
          {msg.role === "user" && (
            <div className="w-7 h-7 rounded-md bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-4 h-4 text-accent" />
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
