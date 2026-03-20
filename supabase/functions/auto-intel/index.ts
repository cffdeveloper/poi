import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Full industry registry — mirrors industryData.ts
const INDUSTRIES = [
  { slug: "technology", name: "Technology & Software", subFlows: [
    { id: "1.1", name: "Hardware Manufacturing", keywords: ["semiconductor", "chip manufacturing", "hardware", "TSMC", "Apple", "Samsung"] },
    { id: "1.2", name: "Software / SaaS", keywords: ["SaaS", "software", "cloud computing", "ARR", "vertical SaaS"] },
    { id: "1.3", name: "Mobile Applications", keywords: ["mobile apps", "app store", "Google Play", "iOS", "Android"] },
    { id: "1.4", name: "IT Services & Managed Services", keywords: ["IT consulting", "managed services", "BPO", "cloud migration"] },
    { id: "1.5", name: "Device Distribution", keywords: ["phone distribution", "Tecno", "Samsung Africa", "device retail"] },
    { id: "1.6", name: "AI & Data Services", keywords: ["artificial intelligence", "machine learning", "OpenAI", "data analytics"] },
    { id: "1.7", name: "Cybersecurity", keywords: ["cybersecurity", "data breach", "ransomware", "SIEM"] },
    { id: "1.8", name: "Cloud Infrastructure", keywords: ["cloud computing", "AWS", "Azure", "Google Cloud", "data center"] },
    { id: "1.9", name: "Semiconductors", keywords: ["semiconductor", "NVIDIA", "TSMC", "Intel", "chip shortage"] },
  ]},
  { slug: "telecommunications", name: "Telecommunications", subFlows: [
    { id: "2.1", name: "Mobile Network Operator (MNO)", keywords: ["Safaricom", "Airtel", "telecom", "5G", "mobile network"] },
    { id: "2.2", name: "Airtime & Data Distribution", keywords: ["airtime distribution", "M-Pesa agents", "mobile money"] },
    { id: "2.3", name: "Internet Service Provider (ISP)", keywords: ["ISP", "broadband", "fibre", "Starlink"] },
    { id: "2.4", name: "MVNO", keywords: ["MVNO", "virtual network", "telecom"] },
    { id: "2.5", name: "Tower Companies", keywords: ["tower company", "IHS Towers", "cell tower", "co-location"] },
    { id: "2.6", name: "Submarine Cable & CDN", keywords: ["submarine cable", "CDN", "data center", "SEACOM"] },
    { id: "2.7", name: "Mobile Money & Digital Payments", keywords: ["M-Pesa", "mobile money", "digital wallet", "agent network"] },
  ]},
  { slug: "financial-services", name: "Financial Services", subFlows: [
    { id: "3.1", name: "Commercial Banking", keywords: ["banking", "interest rates", "central bank", "lending", "NII"] },
    { id: "3.2", name: "Insurance", keywords: ["insurance", "underwriting", "claims", "reinsurance"] },
    { id: "3.3", name: "Capital Markets", keywords: ["stock market", "IPO", "bonds", "securities"] },
    { id: "3.4", name: "Forex & Remittance", keywords: ["forex", "remittance", "exchange rate", "currency"] },
    { id: "3.5", name: "Fintech & Payments", keywords: ["fintech", "payments", "digital banking", "neobank"] },
    { id: "3.6", name: "Microfinance & SACCOs", keywords: ["microfinance", "SACCO", "financial inclusion"] },
    { id: "3.7", name: "Development Finance", keywords: ["World Bank", "IFC", "development finance", "impact investing"] },
    { id: "3.8", name: "Asset Leasing & Hire Purchase", keywords: ["leasing", "hire purchase", "asset finance"] },
  ]},
  { slug: "energy", name: "Energy", subFlows: [
    { id: "4.1", name: "Oil & Gas", keywords: ["oil price", "crude oil", "OPEC", "petroleum"] },
    { id: "4.2", name: "Electricity Grid", keywords: ["electricity", "power generation", "Kenya Power", "IPP"] },
    { id: "4.3", name: "Solar Energy", keywords: ["solar energy", "solar panel", "M-KOPA", "PAYG"] },
    { id: "4.4", name: "Wind & Hydro Power", keywords: ["wind energy", "hydropower", "geothermal", "renewable"] },
    { id: "4.5", name: "Carbon Markets", keywords: ["carbon credits", "carbon market", "net zero", "emissions"] },
    { id: "4.6", name: "LPG Distribution", keywords: ["LPG", "cooking gas", "propane"] },
    { id: "4.7", name: "Mini-Grid & Off-Grid", keywords: ["mini-grid", "off-grid", "rural electrification"] },
    { id: "4.8", name: "Biogas & Biomass", keywords: ["biogas", "biomass", "waste-to-energy"] },
  ]},
  { slug: "agriculture", name: "Agriculture & Food", subFlows: [
    { id: "5.1", name: "Food Value Chain", keywords: ["agriculture", "food production", "farming", "crop prices"] },
    { id: "5.2", name: "Input Supply Chain", keywords: ["fertilizer", "seeds", "agrochemicals"] },
    { id: "5.3", name: "Export & Cold Chain", keywords: ["agricultural exports", "cold chain", "horticulture"] },
    { id: "5.4", name: "Agri-Finance & Insurance", keywords: ["agricultural finance", "crop insurance"] },
    { id: "5.5", name: "Food Processing & FMCG", keywords: ["food processing", "FMCG", "dairy", "milling"] },
    { id: "5.6", name: "Restaurant & Food Service", keywords: ["restaurant", "food delivery", "cloud kitchen"] },
    { id: "5.7", name: "Livestock & Dairy", keywords: ["livestock", "dairy", "poultry", "meat processing"] },
  ]},
  { slug: "real-estate", name: "Real Estate & Construction", subFlows: [
    { id: "6.1", name: "Land & Development", keywords: ["real estate development", "housing", "property market"] },
    { id: "6.2", name: "Construction Contracting", keywords: ["construction", "infrastructure", "contractor"] },
    { id: "6.3", name: "Building Materials", keywords: ["cement", "steel", "building materials"] },
    { id: "6.4", name: "Property Management & REIT", keywords: ["property management", "REIT", "rental income"] },
    { id: "6.5", name: "Real Estate Agency & Valuation", keywords: ["real estate agent", "property valuation"] },
  ]},
  { slug: "trade-retail", name: "Trade, Retail & FMCG", subFlows: [
    { id: "7.1", name: "FMCG Distribution", keywords: ["FMCG", "consumer goods", "Unilever", "distribution"] },
    { id: "7.2", name: "E-Commerce & Marketplaces", keywords: ["e-commerce", "online shopping", "Jumia", "marketplace"] },
    { id: "7.3", name: "Franchise & Chain Retail", keywords: ["franchise", "retail chain", "supermarket"] },
    { id: "7.4", name: "Informal Trade & Jua Kali", keywords: ["informal trade", "jua kali", "kiosk"] },
    { id: "7.5", name: "Private Label & Contract Manufacturing", keywords: ["private label", "contract manufacturing"] },
  ]},
  { slug: "transport-logistics", name: "Transport & Logistics", subFlows: [
    { id: "8.1", name: "Road Freight & Trucking", keywords: ["trucking", "freight", "road transport", "logistics"] },
    { id: "8.2", name: "Shipping & Ports", keywords: ["shipping", "container", "port", "maritime"] },
    { id: "8.3", name: "Air Cargo & Aviation", keywords: ["air cargo", "aviation", "airline", "Kenya Airways"] },
    { id: "8.4", name: "Last-Mile & Ride-Hailing", keywords: ["ride-hailing", "Uber", "Bolt", "last-mile"] },
    { id: "8.5", name: "Railway & SGR", keywords: ["railway", "SGR", "rail freight"] },
    { id: "8.6", name: "Customs Clearing & Forwarding", keywords: ["customs clearing", "freight forwarding"] },
    { id: "8.7", name: "3PL & Warehousing", keywords: ["3PL", "warehousing", "fulfillment"] },
  ]},
  { slug: "health", name: "Health & Pharmaceuticals", subFlows: [
    { id: "9.1", name: "Pharmaceutical Manufacturing & Distribution", keywords: ["pharmaceutical", "medicine", "pharmacy"] },
    { id: "9.2", name: "Hospital & Clinic Revenue", keywords: ["hospital", "healthcare", "NHIF"] },
    { id: "9.3", name: "Diagnostic Laboratory", keywords: ["diagnostic lab", "pathology", "medical testing"] },
    { id: "9.4", name: "Medical Equipment", keywords: ["medical equipment", "medtech", "GE Healthcare"] },
    { id: "9.5", name: "Digital Health & Telemedicine", keywords: ["digital health", "telemedicine", "healthtech"] },
    { id: "9.6", name: "Health Insurance", keywords: ["NHIF", "SHA", "health insurance", "managed care"] },
    { id: "9.7", name: "Mental Health Services", keywords: ["mental health", "therapy", "psychiatry"] },
  ]},
  { slug: "education", name: "Education", subFlows: [
    { id: "10.1", name: "Private School Revenue", keywords: ["private school", "education", "school fees"] },
    { id: "10.2", name: "EdTech & Online Learning", keywords: ["EdTech", "online learning", "e-learning"] },
    { id: "10.3", name: "Vocational & Skills Training", keywords: ["vocational training", "bootcamp", "skills"] },
    { id: "10.4", name: "Corporate Training", keywords: ["corporate training", "L&D", "leadership"] },
    { id: "10.5", name: "University & Higher Education", keywords: ["university", "higher education", "scholarship"] },
    { id: "10.6", name: "Study-Abroad & Education Consulting", keywords: ["study abroad", "education consulting"] },
  ]},
  { slug: "media-entertainment", name: "Media, Content & Entertainment", subFlows: [
    { id: "11.1", name: "Television & Radio", keywords: ["television", "radio", "broadcasting", "advertising"] },
    { id: "11.2", name: "Digital Content & Social Media", keywords: ["social media", "YouTube", "TikTok", "influencer"] },
    { id: "11.3", name: "Music Industry", keywords: ["music industry", "Spotify", "streaming", "royalties"] },
    { id: "11.4", name: "Film & Production", keywords: ["film industry", "Nollywood", "Netflix", "production"] },
    { id: "11.5", name: "Gaming & Esports", keywords: ["gaming", "esports", "mobile gaming"] },
    { id: "11.6", name: "Events & Exhibitions", keywords: ["events", "exhibition", "conference"] },
    { id: "11.7", name: "Out-of-Home Advertising", keywords: ["billboard", "OOH advertising", "digital signage"] },
  ]},
  { slug: "hospitality-tourism", name: "Hospitality, Tourism & Food Service", subFlows: [
    { id: "12.1", name: "Hotels & Accommodation", keywords: ["hotel", "hospitality", "Airbnb", "tourism"] },
    { id: "12.2", name: "Safari & Tours", keywords: ["safari", "tourism", "tour operator", "wildlife"] },
    { id: "12.3", name: "Restaurant & Food Service", keywords: ["restaurant", "food service", "QSR"] },
    { id: "12.4", name: "Travel Agency & OTA", keywords: ["travel agency", "Booking.com", "online travel"] },
    { id: "12.5", name: "Short-Let & Serviced Apartments", keywords: ["Airbnb", "serviced apartments", "short-term rental"] },
    { id: "12.6", name: "MICE & Conference Tourism", keywords: ["MICE", "conference", "convention"] },
  ]},
  { slug: "mining", name: "Mining & Natural Resources", subFlows: [
    { id: "13.1", name: "Large-Scale Mining", keywords: ["mining", "gold", "copper", "lithium"] },
    { id: "13.2", name: "Artisanal & Gemstones", keywords: ["artisanal mining", "gemstones", "ruby"] },
    { id: "13.3", name: "Sand, Stone & Construction Minerals", keywords: ["quarrying", "sand", "construction minerals"] },
    { id: "13.4", name: "Mineral Processing & Smelting", keywords: ["mineral processing", "smelting", "refining"] },
  ]},
  { slug: "water-environment", name: "Water & Environment", subFlows: [
    { id: "14.1", name: "Water Supply Chain", keywords: ["water supply", "water utility", "borehole"] },
    { id: "14.2", name: "Waste Management & Recycling", keywords: ["waste management", "recycling", "e-waste"] },
    { id: "14.3", name: "Irrigation & Water Infrastructure", keywords: ["irrigation", "drip irrigation", "dam"] },
    { id: "14.4", name: "Carbon Forestry & Green Economy", keywords: ["carbon forestry", "reforestation", "REDD+"] },
  ]},
  { slug: "professional-services", name: "Professional Services", subFlows: [
    { id: "15.1", name: "Law Firms", keywords: ["law firm", "legal services", "corporate law"] },
    { id: "15.2", name: "Accounting & Audit", keywords: ["accounting", "audit", "Big Four", "tax advisory"] },
    { id: "15.3", name: "Management Consulting", keywords: ["consulting", "McKinsey", "strategy consulting"] },
    { id: "15.4", name: "HR, Recruitment & Staffing", keywords: ["recruitment", "HR", "staffing"] },
    { id: "15.5", name: "Marketing, PR & Advertising", keywords: ["marketing agency", "PR", "advertising"] },
    { id: "15.6", name: "Architecture & Engineering", keywords: ["architecture", "engineering consultancy"] },
    { id: "15.7", name: "Research & Market Intelligence", keywords: ["market research", "data analytics"] },
  ]},
  { slug: "fashion-textiles", name: "Fashion & Textiles", subFlows: [
    { id: "16.1", name: "Textile Value Chain", keywords: ["textile", "cotton", "garment", "fashion manufacturing"] },
    { id: "16.2", name: "Mitumba (Second-Hand Clothing)", keywords: ["second-hand clothing", "mitumba"] },
    { id: "16.3", name: "Fashion Brands & Design", keywords: ["fashion brand", "African fashion"] },
    { id: "16.4", name: "Shoe & Leather Industry", keywords: ["leather", "shoes", "footwear"] },
  ]},
  { slug: "automotive", name: "Automotive", subFlows: [
    { id: "17.1", name: "New Vehicle Distribution", keywords: ["automotive", "Toyota", "car sales"] },
    { id: "17.2", name: "Used Vehicle Import", keywords: ["used cars", "Japan auction", "car dealer"] },
    { id: "17.3", name: "Auto Parts & Service", keywords: ["auto parts", "car repair", "spare parts"] },
    { id: "17.4", name: "Electric Vehicles (EV)", keywords: ["electric vehicle", "EV", "BYD", "EV charging"] },
    { id: "17.5", name: "Motor Insurance & Leasing", keywords: ["motor insurance", "car leasing"] },
  ]},
  { slug: "aerospace-defence", name: "Aerospace & Defence", subFlows: [
    { id: "18.1", name: "Civil Aviation", keywords: ["Boeing", "Airbus", "aviation", "Kenya Airways"] },
    { id: "18.2", name: "Defence & Security", keywords: ["defence", "military", "security"] },
    { id: "18.3", name: "Space & Satellite", keywords: ["SpaceX", "satellite", "Starlink"] },
    { id: "18.4", name: "Drones & UAV", keywords: ["drone", "UAV", "aerial survey"] },
    { id: "18.5", name: "Private Security", keywords: ["private security", "G4S", "surveillance"] },
  ]},
  { slug: "consumer-electronics", name: "Consumer Electronics", subFlows: [
    { id: "19.1", name: "Device Manufacturing & Assembly", keywords: ["electronics manufacturing", "Apple", "Samsung"] },
    { id: "19.2", name: "Electronics Retail & Repair", keywords: ["electronics retail", "phone repair", "e-waste"] },
    { id: "19.3", name: "Smart Home & IoT", keywords: ["smart home", "IoT", "fleet tracking"] },
  ]},
  { slug: "chemicals", name: "Chemicals & Petrochemicals", subFlows: [
    { id: "20.1", name: "Industrial Chemicals", keywords: ["chemicals", "petrochemicals", "BASF"] },
    { id: "20.2", name: "Fertilisers & Agrochemicals", keywords: ["fertiliser", "urea", "DAP", "NPK"] },
    { id: "20.3", name: "Plastics & Polymers", keywords: ["plastics", "polymer", "PET", "packaging"] },
    { id: "20.4", name: "Pharmaceutical Chemicals", keywords: ["pharmaceutical chemicals", "API"] },
  ]},
  { slug: "politics-government", name: "Politics & Government", subFlows: [
    { id: "21.1", name: "Elections & Political Campaigns", keywords: ["election", "voting", "campaign finance", "political party", "polling", "democracy"] },
    { id: "21.2", name: "Legislation & Regulation", keywords: ["legislation", "regulation", "parliament", "congress", "bill", "policy reform", "executive order"] },
    { id: "21.3", name: "Geopolitics & Diplomacy", keywords: ["geopolitics", "sanctions", "trade war", "NATO", "BRICS", "G7", "diplomacy", "UN", "African Union"] },
    { id: "21.4", name: "Public Procurement & Government Spending", keywords: ["government procurement", "tender", "public spending", "fiscal policy", "budget", "PPP"] },
    { id: "21.5", name: "Lobbying & Interest Groups", keywords: ["lobbying", "interest group", "think tank", "PAC", "political donation"] },
    { id: "21.6", name: "Governance & Anti-Corruption", keywords: ["corruption", "governance", "transparency", "anti-corruption", "whistleblower", "judicial reform"] },
    { id: "21.7", name: "Tax Policy & Revenue", keywords: ["tax policy", "KRA", "IRS", "VAT", "income tax", "tax incentive", "digital tax"] },
  ]},
  { slug: "climate-sustainability", name: "Climate & Sustainability", subFlows: [
    { id: "22.1", name: "Climate Policy & Agreements", keywords: ["climate change", "COP", "Paris Agreement", "net zero", "NDC", "IPCC"] },
    { id: "22.2", name: "ESG & Sustainable Finance", keywords: ["ESG", "sustainable finance", "green bond", "impact investing", "TCFD"] },
    { id: "22.3", name: "Disaster & Climate Adaptation", keywords: ["climate adaptation", "flood", "drought", "disaster preparedness", "El Nino"] },
    { id: "22.4", name: "Circular Economy & Waste-to-Value", keywords: ["circular economy", "recycling", "upcycling", "waste-to-energy", "plastic credits"] },
  ]},
  { slug: "sports-leisure", name: "Sports & Leisure", subFlows: [
    { id: "23.1", name: "Professional Sports & Leagues", keywords: ["Premier League", "NFL", "NBA", "FIFA", "CAF", "athletics", "transfer fee"] },
    { id: "23.2", name: "Sports Betting & Gaming", keywords: ["sports betting", "Betika", "SportPesa", "DraftKings", "gambling regulation"] },
    { id: "23.3", name: "Sponsorship & Sports Marketing", keywords: ["sponsorship", "endorsement", "Nike", "Adidas", "sports marketing"] },
    { id: "23.4", name: "Fitness & Wellness", keywords: ["fitness", "gym", "wellness", "Peloton", "health supplements"] },
  ]},
  { slug: "non-profit-development", name: "Non-Profit & Development", subFlows: [
    { id: "24.1", name: "International Aid & Multilaterals", keywords: ["USAID", "World Bank", "IMF", "UNDP", "foreign aid", "development finance"] },
    { id: "24.2", name: "NGOs & Civil Society", keywords: ["NGO", "civil society", "charity", "Gates Foundation", "Oxfam", "philanthropy"] },
    { id: "24.3", name: "Social Enterprise & Impact", keywords: ["social enterprise", "B-Corp", "impact measurement", "SDGs"] },
    { id: "24.4", name: "Humanitarian & Emergency Response", keywords: ["humanitarian", "refugee", "UNHCR", "disaster relief", "famine", "crisis"] },
  ]},
];

async function generateReport(
  sb: any,
  LOVABLE_API_KEY: string,
  scopeType: "industry" | "subflow",
  scopeKey: string,
  industryName: string,
  subFlowName: string | null,
  keywords: string[]
): Promise<void> {
  // Check if we already have a recent report (< 30 min old)
  const { data: existing } = await sb.from("intel_snapshots")
    .select("created_at")
    .eq("scope_type", scopeType)
    .eq("scope_key", scopeKey)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existing?.[0]) {
    const age = Date.now() - new Date(existing[0].created_at).getTime();
    if (age < 30 * 60 * 1000) return; // Skip if < 30min old
  }

  // Fetch recent raw signals from DB for this industry
  const { data: rawSignals } = await sb.from("raw_market_data")
    .select("payload, source, created_at, geo_scope")
    .or(`industry.eq.${industryName},tags.cs.{${keywords.slice(0, 3).join(",")}}`)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch recent insights
  const { data: recentInsights } = await sb.from("intel_insights")
    .select("title, detail, insight_type, urgency, tags, created_at")
    .eq("source_industry", industryName)
    .order("created_at", { ascending: false })
    .limit(20);

  const signalSummary = (rawSignals || []).map((r: any) => {
    const p = r.payload;
    return `[${r.source} ${r.geo_scope}] ${p.title || p.text || JSON.stringify(p).slice(0, 150)}`;
  }).join("\n");

  const insightSummary = (recentInsights || []).map((i: any) =>
    `[${i.insight_type} ${i.urgency || ""}] ${i.title}: ${(i.detail || "").slice(0, 100)}`
  ).join("\n");

  const scope = subFlowName ? `"${subFlowName}" sub-flow in ${industryName}` : industryName;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an autonomous market intelligence engine generating the DEFINITIVE current state report for ${scope}. This report will be stored and used as the reference document for this sector. Be comprehensive, specific, and forward-looking. Include WHO is doing WHAT, market sizes, growth rates, key players and their recent moves, regulatory changes, emerging threats, and opportunities. Always cite time references (today, this week, this month). Return valid JSON.`
          },
          {
            role: "user",
            content: `Generate a comprehensive intelligence report for ${scope}.\n\nRecent raw signals:\n${signalSummary || "No recent signals available"}\n\nRecent insights:\n${insightSummary || "No recent insights"}\n\nKeywords: ${keywords.join(", ")}\n\nReturn JSON:\n{"summary":"300-word executive summary of current state","analysis":"500-word deep analysis with specific data points, player moves, and market dynamics","key_players":[{"name":"...","role":"...","recent_activity":"...","outlook":"..."}],"gaps":[{"title":"...","detail":"...","estimated_value":"...","urgency":"critical|high|medium"}],"alerts":[{"title":"...","severity":"critical|warning|info","detail":"...","affected_players":["..."]}],"connections":[{"from_sector":"...","to_sector":"...","mechanism":"...","strength":"strong|moderate|weak"}],"news_highlights":[{"headline":"...","source":"...","impact":"...","date":"..."}],"live_data":{"market_size":"...","growth_rate":"...","key_metrics":{}},"outlook":{"short_term":"...","medium_term":"...","long_term":"..."}}`
          }
        ],
      }),
    });

    if (!response.ok) { console.error(`AI failed for ${scopeKey}: ${response.status}`); return; }
    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let report: any;
    try { report = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()); } catch { return; }

    // Store snapshot
    await sb.from("intel_snapshots").insert({
      scope_type: scopeType,
      scope_key: scopeKey,
      summary: report.summary,
      analysis: report.analysis,
      gaps: report.gaps || [],
      alerts: report.alerts || [],
      connections: report.connections || [],
      news: report.news_highlights || [],
      live_data: report.live_data || {},
    });

    console.log(`✅ Report generated: ${scopeKey}`);
  } catch (e) {
    console.error(`Report gen failed for ${scopeKey}:`, e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Determine which batch to process this run
    // We rotate through industries — each 5-min run processes 2 industries + their subflows
    const { data: lastRun } = await sb.from("raw_market_data")
      .select("payload")
      .eq("source", "auto_intel_cursor")
      .order("created_at", { ascending: false })
      .limit(1);

    let cursor = lastRun?.[0]?.payload?.cursor || 0;
    const batchSize = 2;
    const batch = INDUSTRIES.slice(cursor, cursor + batchSize);
    const nextCursor = (cursor + batchSize) >= INDUSTRIES.length ? 0 : cursor + batchSize;

    // Save cursor
    await sb.from("raw_market_data").insert({
      source: "auto_intel_cursor",
      data_type: "system",
      payload: { cursor: nextCursor, processed_at: new Date().toISOString(), batch: batch.map(b => b.name) },
      tags: ["system", "cursor"],
    });

    let reportsGenerated = 0;

    for (const industry of batch) {
      // Generate industry-level report
      const allKeywords = industry.subFlows.flatMap(sf => sf.keywords).slice(0, 15);
      await generateReport(sb, LOVABLE_API_KEY, "industry", industry.name, industry.name, null, allKeywords);
      reportsGenerated++;

      // Generate sub-flow reports
      for (const sf of industry.subFlows) {
        await generateReport(sb, LOVABLE_API_KEY, "subflow", `${industry.name}::${sf.name}`, industry.name, sf.name, sf.keywords);
        reportsGenerated++;
      }
    }

    return new Response(JSON.stringify({
      reports_generated: reportsGenerated,
      industries_processed: batch.map(b => b.name),
      next_cursor: nextCursor,
      next_batch: INDUSTRIES.slice(nextCursor, nextCursor + batchSize).map(b => b.name),
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("auto-intel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
