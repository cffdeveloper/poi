import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSocialIntel(industry: string, subFlow: string | null, keywords: string[], geoContext?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    if (!industry && !keywords.length) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("social-intel", {
        body: { industry, subFlow, keywords: keywords.slice(0, 8), geoContext: geoContext || "global" },
      });
      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error("Social intel error:", e);
    } finally {
      setLoading(false);
    }
  }, [industry, subFlow, keywords.join(","), geoContext]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, 120_000); // 2 min refresh
    return () => clearInterval(id);
  }, [fetch_]);

  return { data, loading, refresh: fetch_ };
}
