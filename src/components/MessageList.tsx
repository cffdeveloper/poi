import { useEffect, useRef } from "react";
import type { Message } from "@/hooks/useNexusChat";
import { Bot, User, Atom, Search, BarChart3, Target, ArrowRight } from "lucide-react";

function formatContent(content: string) {
  return content
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="my-3 p-3 rounded-md bg-muted/50 border border-border/40 overflow-x-auto"><code class="text-xs font-mono text-card-foreground">$2</code></pre>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-foreground mt-4 mb-1.5 font-mono tracking-wide">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-bold text-primary mt-5 mb-2 font-mono tracking-wide uppercase">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-base font-bold text-primary mt-5 mb-2 font-mono tracking-wide">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-card-foreground/90">$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-primary/90 text-[11px] font-mono border border-border/30">$1</code>')
    .replace(/^\d+\.\s(.+)$/gm, '<div class="flex gap-2 ml-1 mb-1"><span class="text-primary/50 font-mono text-xs">▸</span><span class="text-card-foreground">$1</span></div>')
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 ml-1 mb-1"><span class="text-primary/40 text-xs">●</span><span class="text-card-foreground">$1</span></div>')
    .replace(/\n\n/g, '<div class="h-3"></div>')
    .replace(/\n/g, "<br />");
}

const quickPrompts = [
  { text: "Analyze the global AI market landscape and key players in 2026", icon: BarChart3 },
  { text: "Research breakthroughs in quantum computing this year", icon: Search },
  { text: "Build a go-to-market strategy for a fintech startup", icon: Target },
  { text: "Explain how fusion energy progress will reshape energy markets", icon: Atom },
];

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
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-lg w-full">
          {/* Logo mark */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/10 animate-pulse-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="w-9 h-9 text-primary/80" />
            </div>
            {/* Orbiting dot */}
            <div className="absolute inset-0" style={{ animation: "orbit 6s linear infinite" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold font-mono tracking-widest text-gradient-primary">
              NEXUS READY
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Your AI research analyst. Ask me to investigate any topic, analyze data patterns, or build strategic frameworks.
            </p>
          </div>

          {/* Quick prompts as cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
            {quickPrompts.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.text}
                  className="group flex items-start gap-3 p-3.5 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/20 hover:bg-muted/40 transition-all duration-200 text-left"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("nexus-quick-prompt", { detail: q.text }));
                  }}
                >
                  <div className="w-7 h-7 rounded-md bg-primary/8 border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary/90 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      {q.text}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-all mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-5 py-2">
      {messages.map((msg, idx) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          style={{ animation: `fade-in-up 0.3s ease-out ${Math.min(idx * 0.05, 0.3)}s both` }}
        >
          {msg.role === "assistant" && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-4 h-4 text-primary/80" />
            </div>
          )}
          <div
            className={`max-w-[82%] rounded-xl text-[13px] leading-relaxed ${
              msg.role === "user"
                ? "bg-primary/8 text-foreground border border-primary/15 px-4 py-3"
                : "glass-panel px-5 py-4"
            }`}
          >
            {msg.role === "assistant" ? (
              <div
                className="[&>div.h-3]:block [&_pre]:my-2"
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
            ) : (
              <span className="font-mono text-sm">{msg.content}</span>
            )}
            {msg.role === "assistant" && isStreaming && messages[messages.length - 1]?.id === msg.id && (
              <span className="typing-cursor" />
            )}
          </div>
          {msg.role === "user" && (
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-4 h-4 text-accent/80" />
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
