type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nexus-ai`;

export async function streamChat({
  messages,
  mode = "general",
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  mode?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, mode }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({ error: "Request failed" }));
    onError?.(data.error || `Error ${resp.status}`);
    onDone();
    return;
  }

  if (!resp.body) {
    onError?.("No response body");
    onDone();
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }

      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }

  // flush
  if (buf.trim()) {
    for (let raw of buf.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const j = raw.slice(6).trim();
      if (j === "[DONE]") continue;
      try {
        const p = JSON.parse(j);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {}
    }
  }

  onDone();
}
