import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";

export function ChatInput({
  onSend,
  isStreaming,
}: {
  onSend: (msg: string) => void;
  isStreaming: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string") {
        onSend(detail);
      }
    };
    window.addEventListener("nexus-quick-prompt", handler);
    return () => window.removeEventListener("nexus-quick-prompt", handler);
  }, [onSend]);

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

  return (
    <form onSubmit={submit} className="relative">
      <div className="glass-panel glow-border flex items-end gap-2 p-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask NEXUS anything — research, analyze, strategize..."
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2 px-2 font-mono max-h-32"
          style={{ minHeight: "2.25rem" }}
          disabled={isStreaming}
        />
        <button
          type="submit"
          disabled={!value.trim() || isStreaming}
          className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}
