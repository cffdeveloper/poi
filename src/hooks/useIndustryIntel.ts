import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const REFRESH_MS = 180_000;

export function useIndustryIntel(industryName: string, keywords: string[], geoContext?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    if (!industryName) return;
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("industry-intel", {
        body: { industry: industryName, keywords, geoContext: geoContext || "global" },
      });
      if (error) throw error;
      setData(result);
    } catch (e) {
      console.error("Industry intel error:", e);
    } finally {
      setLoading(false);
    }
  }, [industryName, keywords.join(","), geoContext]);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetch_]);

  return { data, loading, refresh: fetch_ };
}
