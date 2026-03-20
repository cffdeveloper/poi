import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send, Loader2, ArrowUp } from "lucide-react";

export function ChatInput({
  onSend,
  isStreaming,
}: {
  onSend: (msg: string) => void;
  isStreaming: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string") {
        onSend(detail);
      }
    };
    window.addEventListener("maverick-quick-prompt", handler);
    return () => window.removeEventListener("maverick-quick-prompt", handler);
  }, [onSend]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  const hasValue = value.trim().length > 0;

  return (
    <form onSubmit={submit} className="relative">
      <div className="glass-panel-strong glow-border-strong p-2.5 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Maverick anything..."
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-2 px-3 font-mono leading-relaxed"
          style={{ minHeight: "2.5rem" }}
          disabled={isStreaming}
          autoFocus
        />
        <button
          type="submit"
          disabled={!hasValue || isStreaming}
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            hasValue && !isStreaming
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-muted text-muted-foreground/40 cursor-not-allowed"
          }`}
          style={
            hasValue && !isStreaming
              ? { boxShadow: "0 0 15px hsl(185 100% 50% / 0.2)" }
              : undefined
          }
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4.5 h-4.5" strokeWidth={2.5} />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between mt-1.5 px-1">
        <p className="text-[10px] font-mono text-muted-foreground/30">
          Press Enter to send · Shift+Enter for new line
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/30">
          AI-generated · Verify important information
        </p>
      </div>
    </form>
  );
}
