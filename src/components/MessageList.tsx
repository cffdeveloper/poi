import { useEffect, useRef } from "react";
import type { Message } from "@/hooks/useMaverickChat";
import { Bot, User, Atom, Search, BarChart3, Target, ArrowRight, Sparkles } from "lucide-react";
import { parseBlocks } from "@/lib/parseBlocks";
import { BlockRenderer } from "@/components/BlockRenderer";

const quickPrompts = [
  { text: "Analyze the global AI market — key players, market size, growth trends, and investment landscape for 2026", icon: BarChart3, label: "AI Market Intel" },
  { text: "Research the current state of quantum computing: breakthroughs, commercial applications, and which companies are leading", icon: Search, label: "Quantum Research" },
  { text: "Build a complete go-to-market strategy for a B2B SaaS startup entering the healthcare analytics space", icon: Target, label: "GTM Strategy" },
  { text: "Compare the top 5 cloud providers (AWS, Azure, GCP, Oracle, IBM) across pricing, AI/ML capabilities, and enterprise features", icon: Atom, label: "Cloud Comparison" },
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
        <div className="text-center space-y-8 max-w-xl w-full">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/10 animate-pulse-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary/80" />
            </div>
            <div className="absolute inset-0" style={{ animation: "orbit 6s linear infinite" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold font-mono tracking-widest text-gradient-primary">
              INTELLIGENCE ENGINE
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Not a chatbot — an analytical engine. Ask me to research, analyze, compare, or strategize. I produce structured intelligence with visual data blocks, scored insights, and actionable frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
            {quickPrompts.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.label}
                  className="group flex items-start gap-3 p-4 rounded-lg bg-muted/20 border border-border/30 hover:border-primary/20 hover:bg-muted/40 transition-all duration-200 text-left"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("maverick-quick-prompt", { detail: q.text }));
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-4 h-4 text-primary/60 group-hover:text-primary/90 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-semibold text-foreground/80 mb-1">{q.label}</p>
                    <p className="text-[11px] text-muted-foreground group-hover:text-foreground/70 transition-colors leading-relaxed">
                      {q.text.length > 80 ? q.text.slice(0, 80) + "…" : q.text}
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
    <div className="flex-1 overflow-y-auto space-y-6 py-2">
      {messages.map((msg, idx) => {
        const segments = msg.role === "assistant" ? parseBlocks(msg.content) : null;
        const isLastAssistant = msg.role === "assistant" && messages[messages.length - 1]?.id === msg.id;

        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            style={{ animation: `fade-in-up 0.3s ease-out ${Math.min(idx * 0.05, 0.2)}s both` }}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-primary/80" />
              </div>
            )}
            <div
              className={`min-w-0 ${
                msg.role === "user"
                  ? "max-w-[75%] bg-primary/8 text-foreground border border-primary/15 px-4 py-3 rounded-xl"
                  : "max-w-[90%] flex-1"
              }`}
            >
              {msg.role === "assistant" && segments ? (
                <div>
                  <BlockRenderer segments={segments} />
                  {isStreaming && isLastAssistant && <span className="typing-cursor" />}
                </div>
              ) : (
                <span className="font-mono text-sm">{msg.content}</span>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-4 h-4 text-accent/80" />
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
