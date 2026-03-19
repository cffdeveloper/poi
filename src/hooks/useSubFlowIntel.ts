import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const REFRESH_MS = 180_000; // 3 minutes

export function useSubFlowIntel(subFlowName: string, keywords: string[], industryName: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    if (!subFlowName) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("industry-intel", {
        body: { industry: industryName, subFlow: subFlowName, keywords, detailed: true },
      });
      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error("SubFlow intel error:", e);
    } finally {
      setLoading(false);
    }
  }, [subFlowName, industryName, keywords.join(",")]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetch_]);

  return { data, loading, refresh: fetch_ };
}
