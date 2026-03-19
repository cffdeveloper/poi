import { useNexusChat } from "@/hooks/useNexusChat";
import { TopNav } from "@/components/TopNav";
import { StatusBar } from "@/components/StatusBar";
import { ModeSelector } from "@/components/ModeSelector";
import { MessageList } from "@/components/MessageList";
import { ChatInput } from "@/components/ChatInput";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useEffect } from "react";

const NexusDashboard = () => {
  const { messages, isStreaming, error, mode, setMode, send, clear } = useNexusChat();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col bg-background grid-bg overflow-hidden relative">
      {/* Scan line effect */}
      <div className="scan-line absolute inset-0 pointer-events-none z-50 h-[200%]" />

      <TopNav onClear={clear} hasMessages={messages.length > 0} />
      <StatusBar />

      <div className="flex-1 flex flex-col min-h-0 max-w-5xl w-full mx-auto px-4 py-4 gap-3">
        <ModeSelector mode={mode} onChange={setMode} />

        <div className="flex-1 flex flex-col min-h-0">
          <MessageList messages={messages} isStreaming={isStreaming} />
        </div>

        <ChatInput onSend={send} isStreaming={isStreaming} />

        <p className="text-center text-[10px] font-mono text-muted-foreground/50">
          NEXUS v1.0 · Powered by AI · All analysis is generated and should be verified
        </p>
      </div>
    </div>
  );
};

const Index = NexusDashboard;
export default Index;
