export type SubFlow = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  moneyFlow: string;
  keywords: string[]; // For AI/news search
  dataApis: string[]; // Types of live data to fetch
};

export type Industry = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string; // Tailwind color token
  description: string;
  subFlows: SubFlow[];
};

export const industries: Industry[] = [
  {
    id: 1,
    slug: "technology",
    name: "Technology & Software",
    icon: "💻",
    color: "cyan",
    description: "Hardware, software, SaaS, mobile apps, IT services, cybersecurity, AI/data, cloud, semiconductors.",
    subFlows: [
      { id: "1.1", name: "Hardware Manufacturing", shortName: "Hardware", description: "Raw materials to consumer devices", moneyFlow: "Raw Materials → Semiconductor Fab → Component Makers → Contract Manufacturer → Brand Owner → Distributor → Retailer → Consumer", keywords: ["semiconductor", "chip manufacturing", "hardware", "TSMC", "Apple", "Samsung", "Foxconn"], dataApis: ["stocks", "news", "commodities"] },
      { id: "1.2", name: "Software / SaaS", shortName: "SaaS", description: "Software as a Service value chain", moneyFlow: "Developer → Cloud Hosted → Subscription Revenue → Investors → Scale → Exit", keywords: ["SaaS", "software", "cloud computing", "subscription", "ARR", "MRR"], dataApis: ["stocks", "news", "funding"] },
      { id: "1.3", name: "Mobile Applications", shortName: "Mobile Apps", description: "App store ecosystem and monetization", moneyFlow: "Developer → App Store → Downloads → Revenue (ads/IAP/subs) → Store takes 15-30%", keywords: ["mobile apps", "app store", "Google Play", "iOS", "Android"], dataApis: ["news", "stocks"] },
      { id: "1.4", name: "IT Services & Managed Services", shortName: "IT Services", description: "Consulting, implementation, managed services, BPO", moneyFlow: "Client need → IT firm scopes → Contract → Execution → Invoice → Payment", keywords: ["IT consulting", "managed services", "BPO", "outsourcing", "cybersecurity"], dataApis: ["news", "stocks"] },
      { id: "1.5", name: "Device Distribution", shortName: "Distribution", description: "Agent model for technology distribution in Africa", moneyFlow: "Manufacturer → Master Distributor → Sub-Distributor → Dealer → Retail → Consumer", keywords: ["phone distribution", "Tecno", "Samsung Africa", "device retail"], dataApis: ["news"] },
      { id: "1.6", name: "AI & Data Services", shortName: "AI/Data", description: "Artificial intelligence and data analytics", moneyFlow: "Data Collection → Processing → AI Model → API/Platform → Enterprise Client", keywords: ["artificial intelligence", "machine learning", "data analytics", "OpenAI", "Google AI"], dataApis: ["stocks", "news", "funding"] },
      { id: "1.7", name: "Cybersecurity", shortName: "Cybersecurity", description: "Security services and products", moneyFlow: "Threat Detection → Security Products → Enterprise Deployment → Managed Security", keywords: ["cybersecurity", "data breach", "ransomware", "security"], dataApis: ["news", "stocks"] },
      { id: "1.8", name: "Cloud Infrastructure", shortName: "Cloud", description: "Cloud computing providers and services", moneyFlow: "Data Center → Cloud Platform → IaaS/PaaS/SaaS → Enterprise/SMB Clients", keywords: ["cloud computing", "AWS", "Azure", "Google Cloud", "data center"], dataApis: ["stocks", "news"] },
      { id: "1.9", name: "Semiconductors", shortName: "Chips", description: "Chip design and fabrication", moneyFlow: "Silicon → Wafer Processing → Chip Design → Fabrication → Packaging → Device Integration", keywords: ["semiconductor", "NVIDIA", "TSMC", "Intel", "chip shortage"], dataApis: ["stocks", "news", "commodities"] },
    ],
  },
  {
    id: 2,
    slug: "telecommunications",
    name: "Telecommunications",
    icon: "📡",
    color: "blue",
    description: "MNO infrastructure, ISP, MVNO, device distribution, mobile money, content delivery, submarine cables.",
    subFlows: [
      { id: "2.1", name: "Mobile Network Operator (MNO)", shortName: "MNO", description: "Spectrum, towers, subscribers, ARPU", moneyFlow: "Spectrum → Towers → Network → Subscribers → Airtime/Data/Mobile Money → Revenue", keywords: ["Safaricom", "Airtel", "telecom", "5G", "mobile network"], dataApis: ["stocks", "news"] },
      { id: "2.2", name: "Airtime & Data Distribution", shortName: "Airtime", description: "The distribution chain from MNO to consumer", moneyFlow: "MNO → National Distributor → Regional → Retailer → Consumer", keywords: ["airtime distribution", "M-Pesa agents", "mobile money"], dataApis: ["news"] },
      { id: "2.3", name: "Internet Service Provider (ISP)", shortName: "ISP", description: "Submarine cable to last-mile delivery", moneyFlow: "Submarine Cable → Tier 1 → National ISP → Last-Mile → Consumer", keywords: ["ISP", "broadband", "fibre", "internet access", "Starlink"], dataApis: ["news"] },
      { id: "2.4", name: "MVNO", shortName: "MVNO", description: "Virtual network operators", moneyFlow: "MNO wholesale → MVNO brands → Niche market → Subscriber", keywords: ["MVNO", "virtual network", "telecom"], dataApis: ["news"] },
      { id: "2.5", name: "Tower Companies", shortName: "Towers", description: "Infrastructure sharing model", moneyFlow: "Build/Buy Towers → Lease to MNOs → Co-location Revenue", keywords: ["tower company", "IHS Towers", "Helios", "cell tower"], dataApis: ["stocks", "news"] },
      { id: "2.6", name: "Submarine Cable & CDN", shortName: "Cable/CDN", description: "International connectivity and content delivery", moneyFlow: "Submarine Cable → IXP → CDN → Data Center → End User", keywords: ["submarine cable", "CDN", "data center", "internet exchange"], dataApis: ["news"] },
    ],
  },
  {
    id: 3,
    slug: "financial-services",
    name: "Financial Services",
    icon: "🏦",
    color: "emerald",
    description: "Banking, insurance, capital markets, forex, fintech, payment processing, leasing.",
    subFlows: [
      { id: "3.1", name: "Commercial Banking", shortName: "Banking", description: "Deposits, lending, NII", moneyFlow: "Deposits → Lending → Net Interest Income + Fee Income", keywords: ["banking", "interest rates", "central bank", "lending", "deposits"], dataApis: ["stocks", "news", "forex", "rates"] },
      { id: "3.2", name: "Insurance", shortName: "Insurance", description: "Underwriting and claims", moneyFlow: "Premium Collection → Risk Pool → Claims Payment → Investment Income", keywords: ["insurance", "underwriting", "claims", "reinsurance"], dataApis: ["stocks", "news"] },
      { id: "3.3", name: "Capital Markets", shortName: "Markets", description: "Stock exchange, bonds, trading", moneyFlow: "Issuers → IPO/Bonds → Exchange → Brokers → Investors", keywords: ["stock market", "IPO", "bonds", "NSE", "NYSE"], dataApis: ["stocks", "news", "crypto"] },
      { id: "3.4", name: "Forex & Remittance", shortName: "Forex", description: "Currency exchange and money transfer", moneyFlow: "Sender → Forex Bureau/App → Cross-border Transfer → Recipient", keywords: ["forex", "remittance", "Western Union", "exchange rate", "currency"], dataApis: ["forex", "news"] },
      { id: "3.5", name: "Fintech & Payments", shortName: "Fintech", description: "Digital payments and financial technology", moneyFlow: "Merchant/Consumer → Payment Platform → Processing → Settlement", keywords: ["fintech", "payments", "Stripe", "PayPal", "M-Pesa", "digital banking"], dataApis: ["stocks", "news", "funding"] },
      { id: "3.6", name: "Microfinance & SACCOs", shortName: "Microfinance", description: "Community-level financial services", moneyFlow: "Member Savings → Lending → Interest Income → Dividends", keywords: ["microfinance", "SACCO", "community banking", "financial inclusion"], dataApis: ["news"] },
      { id: "3.7", name: "Development Finance", shortName: "DFI", description: "Impact investing and development capital", moneyFlow: "DFI Capital → Project Finance → Development Impact → Returns", keywords: ["World Bank", "IFC", "AfDB", "development finance", "impact investing"], dataApis: ["news"] },
    ],
  },
  {
    id: 4,
    slug: "energy",
    name: "Energy",
    icon: "⚡",
    color: "amber",
    description: "Oil & gas, solar, wind, hydro, nuclear, biogas, LPG, electricity grid, carbon markets.",
    subFlows: [
      { id: "4.1", name: "Oil & Gas", shortName: "Oil & Gas", description: "Exploration to retail pump", moneyFlow: "Exploration → Production → Refining → Distribution → Petrol Station → Consumer", keywords: ["oil price", "crude oil", "OPEC", "petroleum", "refinery"], dataApis: ["commodities", "stocks", "news"] },
      { id: "4.2", name: "Electricity Grid", shortName: "Power Grid", description: "Generation to meter", moneyFlow: "Generator (KenGen/IPP) → Transmission → Distribution → Meter → Consumer", keywords: ["electricity", "power generation", "grid", "Kenya Power", "energy"], dataApis: ["news", "commodities"] },
      { id: "4.3", name: "Solar Energy", shortName: "Solar", description: "Panel manufacturing to PAYG", moneyFlow: "Panel Manufacturer → Importer → Distributor → PAYG Company → Consumer", keywords: ["solar energy", "solar panel", "M-KOPA", "renewable energy"], dataApis: ["stocks", "news", "commodities"] },
      { id: "4.4", name: "Mini-Grid Development", shortName: "Mini-Grid", description: "Off-grid community power", moneyFlow: "Developer → Finance → Build → Operate → Tariff Collection", keywords: ["mini-grid", "off-grid", "rural electrification"], dataApis: ["news"] },
      { id: "4.5", name: "Carbon Markets", shortName: "Carbon", description: "Emissions credits trading", moneyFlow: "Clean Project → Verification → Credits Issued → Broker → Corporate Buyer", keywords: ["carbon credits", "carbon market", "net zero", "emissions", "Verra"], dataApis: ["news", "commodities"] },
      { id: "4.6", name: "LPG Distribution", shortName: "LPG", description: "Cooking gas supply chain", moneyFlow: "Import/Refinery → Bulk Storage → Cylinder Filling → Distributor → Consumer", keywords: ["LPG", "cooking gas", "propane", "butane"], dataApis: ["commodities", "news"] },
    ],
  },
  {
    id: 5,
    slug: "agriculture",
    name: "Agriculture & Food",
    icon: "🌾",
    color: "green",
    description: "Input supply, farming, aggregation, processing, export, cold chain, agri-finance, food retail.",
    subFlows: [
      { id: "5.1", name: "Food Value Chain", shortName: "Food Chain", description: "Input to consumer", moneyFlow: "Input Manufacturer → Agrovet → Farmer → Aggregator → Processor → Wholesaler → Retailer → Consumer", keywords: ["agriculture", "food production", "farming", "crop prices"], dataApis: ["commodities", "news", "weather"] },
      { id: "5.2", name: "Input Supply Chain", shortName: "Inputs", description: "Seeds, fertilizer, agrochemicals", moneyFlow: "Manufacturer → Importer → National Distributor → Agrovet → Farmer", keywords: ["fertilizer", "seeds", "agrochemicals", "Syngenta", "Bayer"], dataApis: ["commodities", "news", "stocks"] },
      { id: "5.3", name: "Export & Cold Chain", shortName: "Export", description: "Fresh produce export logistics", moneyFlow: "Farm → Packhouse → Cold Chain → Airport/Port → International Market", keywords: ["agricultural exports", "cold chain", "fresh produce", "horticulture"], dataApis: ["commodities", "news"] },
      { id: "5.4", name: "Agri-Finance", shortName: "Agri-Finance", description: "Agricultural lending and insurance", moneyFlow: "Financial Institution → Agri Loan → Farmer → Harvest → Repayment", keywords: ["agricultural finance", "crop insurance", "farm credit"], dataApis: ["news"] },
      { id: "5.5", name: "Food Processing", shortName: "Processing", description: "Raw commodity to packaged product", moneyFlow: "Raw Commodity → Processing Plant → Branding → Distribution → Retail", keywords: ["food processing", "FMCG", "beverage", "dairy"], dataApis: ["stocks", "news", "commodities"] },
    ],
  },
  {
    id: 6,
    slug: "real-estate",
    name: "Real Estate & Construction",
    icon: "🏗️",
    color: "orange",
    description: "Land, development, contracting, materials, agents, property management, REIT.",
    subFlows: [
      { id: "6.1", name: "Land & Development", shortName: "Land Dev", description: "Land acquisition to building", moneyFlow: "Land Purchase → Planning → Development → Sales/Leasing", keywords: ["real estate development", "land prices", "housing", "property market"], dataApis: ["news"] },
      { id: "6.2", name: "Construction Contracting", shortName: "Construction", description: "Building and civil works", moneyFlow: "Client Tender → Contractor Bid → Materials + Labour → Completion → Payment", keywords: ["construction", "infrastructure", "building", "contractor"], dataApis: ["news", "commodities"] },
      { id: "6.3", name: "Building Materials", shortName: "Materials", description: "Cement, steel, timber supply chain", moneyFlow: "Manufacturer → Distributor → Hardware Store → Contractor/Consumer", keywords: ["cement", "steel", "building materials", "Bamburi", "timber"], dataApis: ["commodities", "stocks", "news"] },
      { id: "6.4", name: "Property Management & REIT", shortName: "PropMgt/REIT", description: "Rental income and property funds", moneyFlow: "Property → Management → Rent Collection → Maintenance → Returns", keywords: ["property management", "REIT", "rental income", "commercial property"], dataApis: ["stocks", "news"] },
    ],
  },
  {
    id: 7,
    slug: "trade-retail",
    name: "Trade, Retail & FMCG",
    icon: "🛒",
    color: "pink",
    description: "Manufacturing, distribution, wholesale, retail, e-commerce, private label, franchise.",
    subFlows: [
      { id: "7.1", name: "FMCG Distribution", shortName: "FMCG", description: "Fast-moving consumer goods chain", moneyFlow: "Manufacturer → National Distributor → Wholesaler → Retailer → Consumer", keywords: ["FMCG", "consumer goods", "Unilever", "P&G", "distribution"], dataApis: ["stocks", "news"] },
      { id: "7.2", name: "E-Commerce", shortName: "E-Commerce", description: "Online retail and marketplaces", moneyFlow: "Seller → Platform → Logistics → Consumer → Payment Settlement", keywords: ["e-commerce", "online shopping", "Jumia", "Amazon", "marketplace"], dataApis: ["stocks", "news"] },
      { id: "7.3", name: "Franchise & Informal Trade", shortName: "Franchise", description: "Franchise models and informal sector", moneyFlow: "Brand → Franchise Agreement → Local Operator → Consumer", keywords: ["franchise", "retail", "informal trade", "kiosk"], dataApis: ["news"] },
    ],
  },
  {
    id: 8,
    slug: "transport-logistics",
    name: "Transport & Logistics",
    icon: "🚛",
    color: "indigo",
    description: "Road freight, shipping, air cargo, rail, last-mile, ride-hailing, 3PL, freight forwarding.",
    subFlows: [
      { id: "8.1", name: "Road Freight & Trucking", shortName: "Trucking", description: "Long-haul and regional trucking", moneyFlow: "Shipper → Freight Forwarder → Trucker → Delivery → Payment", keywords: ["trucking", "freight", "road transport", "logistics"], dataApis: ["news", "commodities"] },
      { id: "8.2", name: "Shipping & Ports", shortName: "Shipping", description: "Maritime logistics", moneyFlow: "Shipper → Shipping Line → Port → Customs → Clearing Agent → Consignee", keywords: ["shipping", "container", "port", "maritime", "Mombasa port"], dataApis: ["news", "stocks"] },
      { id: "8.3", name: "Air Cargo & Aviation", shortName: "Aviation", description: "Air freight and passenger aviation", moneyFlow: "Shipper → Air Cargo Agent → Airline → Airport → Consignee", keywords: ["air cargo", "aviation", "airline", "airport", "flight"], dataApis: ["flights", "news", "stocks"] },
      { id: "8.4", name: "Last-Mile & Ride-Hailing", shortName: "Last-Mile", description: "Urban delivery and transport", moneyFlow: "Consumer Order → Platform → Driver/Rider → Delivery → Settlement", keywords: ["ride-hailing", "Uber", "Bolt", "delivery", "last-mile"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 9,
    slug: "health",
    name: "Health & Pharmaceuticals",
    icon: "🏥",
    color: "red",
    description: "Pharma manufacturing, distribution, hospitals, diagnostics, insurance, medtech, digital health.",
    subFlows: [
      { id: "9.1", name: "Pharmaceutical Manufacturing & Distribution", shortName: "Pharma", description: "API to patient", moneyFlow: "API Manufacturer → Finished Dose → Distributor → Pharmacy → Patient", keywords: ["pharmaceutical", "drug manufacturing", "pharmacy", "Cipla", "medicine"], dataApis: ["stocks", "news"] },
      { id: "9.2", name: "Hospital & Clinic Revenue", shortName: "Hospitals", description: "Clinical care revenue model", moneyFlow: "Patient → Consultation → Diagnosis → Treatment → Billing → Payment/Insurance", keywords: ["hospital", "healthcare", "clinic", "NHIF", "health insurance"], dataApis: ["news", "stocks"] },
      { id: "9.3", name: "Diagnostic Laboratory", shortName: "Diagnostics", description: "Hub-and-spoke lab model", moneyFlow: "Collection Point → Sample Transport → Hub Lab → Results → Invoice", keywords: ["diagnostic lab", "pathology", "medical testing", "Lancet"], dataApis: ["news"] },
      { id: "9.4", name: "Medical Equipment", shortName: "MedTech", description: "Equipment supply chain", moneyFlow: "Global Manufacturer → Importer → Hospital Procurement → Maintenance", keywords: ["medical equipment", "GE Healthcare", "Siemens", "medtech"], dataApis: ["stocks", "news"] },
      { id: "9.5", name: "Digital Health", shortName: "Digital Health", description: "Telemedicine and health tech", moneyFlow: "Platform → Consultation → Prescription → Payment → Follow-up", keywords: ["digital health", "telemedicine", "healthtech", "e-health"], dataApis: ["news", "funding"] },
    ],
  },
  {
    id: 10,
    slug: "education",
    name: "Education",
    icon: "📚",
    color: "violet",
    description: "Private schools, universities, EdTech, vocational, corporate training, study-abroad.",
    subFlows: [
      { id: "10.1", name: "Private School Revenue", shortName: "Schools", description: "Fee-based education model", moneyFlow: "Parent Pays Fees → School Provides Education → Operating Costs → Surplus", keywords: ["private school", "education", "school fees", "K-12"], dataApis: ["news"] },
      { id: "10.2", name: "EdTech & Online Learning", shortName: "EdTech", description: "Digital education platforms", moneyFlow: "Content Creator → LMS Platform → Learner Enrollment → Revenue", keywords: ["EdTech", "online learning", "Coursera", "Udemy", "e-learning"], dataApis: ["stocks", "news", "funding"] },
      { id: "10.3", name: "Vocational & Skills Training", shortName: "Vocational", description: "Skills and professional training", moneyFlow: "Training Need → Provider → Course → Certification → Employment", keywords: ["vocational training", "skills", "bootcamp", "certification"], dataApis: ["news"] },
      { id: "10.4", name: "Corporate Training", shortName: "Corporate", description: "Enterprise L&D", moneyFlow: "HR Identifies Need → RFP → Training Firm → Delivery → Invoice", keywords: ["corporate training", "L&D", "leadership", "compliance training"], dataApis: ["news"] },
    ],
  },
  {
    id: 11,
    slug: "media-entertainment",
    name: "Media, Content & Entertainment",
    icon: "🎬",
    color: "fuchsia",
    description: "TV/radio, digital publishing, music, film, gaming, events, advertising, streaming.",
    subFlows: [
      { id: "11.1", name: "Television & Radio", shortName: "TV/Radio", description: "Broadcasting and advertising", moneyFlow: "Content Creation → Broadcast → Audience → Advertising Revenue", keywords: ["television", "radio", "broadcasting", "advertising", "media"], dataApis: ["stocks", "news"] },
      { id: "11.2", name: "Digital Content & Social Media", shortName: "Digital", description: "Creator economy", moneyFlow: "Creator → Platform → Audience → Ad Revenue/Sponsorship", keywords: ["social media", "YouTube", "TikTok", "influencer", "creator economy"], dataApis: ["news", "stocks"] },
      { id: "11.3", name: "Music Industry", shortName: "Music", description: "Recording to streaming", moneyFlow: "Artist → Recording → Distribution → Streaming → Royalties", keywords: ["music industry", "Spotify", "streaming", "royalties", "live events"], dataApis: ["stocks", "news"] },
      { id: "11.4", name: "Film & Gaming", shortName: "Film/Gaming", description: "Production and distribution", moneyFlow: "Production → Distribution → Exhibition/Platform → Revenue", keywords: ["film industry", "gaming", "Netflix", "box office", "esports"], dataApis: ["stocks", "news"] },
    ],
  },
  {
    id: 12,
    slug: "hospitality-tourism",
    name: "Hospitality, Tourism & Food Service",
    icon: "🏨",
    color: "teal",
    description: "Hotels, safari/tours, restaurants, airlines, travel agencies, cruise, events.",
    subFlows: [
      { id: "12.1", name: "Hotels & Accommodation", shortName: "Hotels", description: "Lodging revenue model", moneyFlow: "Guest Booking → Check-in → Room + Services → Checkout → Payment", keywords: ["hotel", "accommodation", "hospitality", "Airbnb", "tourism"], dataApis: ["stocks", "news"] },
      { id: "12.2", name: "Safari & Tours", shortName: "Safari/Tours", description: "Tourism experiences", moneyFlow: "Tourist → Travel Agent → Tour Operator → Safari Lodge → Experience", keywords: ["safari", "tourism", "tour operator", "wildlife", "national park"], dataApis: ["news"] },
      { id: "12.3", name: "Restaurant & Food Service", shortName: "Restaurants", description: "Food service industry", moneyFlow: "Supplier → Kitchen → Menu → Dine-in/Delivery → Payment", keywords: ["restaurant", "food service", "fast food", "delivery"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 13,
    slug: "mining",
    name: "Mining & Natural Resources",
    icon: "⛏️",
    color: "stone",
    description: "Large-scale mining, artisanal, quarrying, gemstones, mineral processing, trading.",
    subFlows: [
      { id: "13.1", name: "Large-Scale Mining", shortName: "Mining", description: "Industrial mineral extraction", moneyFlow: "Exploration → Licence → Development → Extraction → Processing → Export", keywords: ["mining", "gold", "copper", "lithium", "mineral extraction"], dataApis: ["commodities", "stocks", "news"] },
      { id: "13.2", name: "Artisanal & Gemstones", shortName: "ASM/Gems", description: "Small-scale and gemstone mining", moneyFlow: "ASM Miner → Local Buyer → Cutter/Polisher → Exporter → International Market", keywords: ["artisanal mining", "gemstones", "tsavorite", "gold panning"], dataApis: ["commodities", "news"] },
      { id: "13.3", name: "Sand, Stone & Construction Minerals", shortName: "Quarry", description: "Construction minerals supply", moneyFlow: "Quarry Operator → Extraction → Lorry Transport → Construction Site", keywords: ["quarrying", "sand", "ballast", "construction minerals"], dataApis: ["news"] },
    ],
  },
  {
    id: 14,
    slug: "water-environment",
    name: "Water & Environment",
    icon: "💧",
    color: "sky",
    description: "Water utilities, bottled water, waste collection, recycling, e-waste, carbon forestry.",
    subFlows: [
      { id: "14.1", name: "Water Supply Chain", shortName: "Water", description: "Source to consumer", moneyFlow: "Source → Treatment → Storage → Distribution → Consumer Pays", keywords: ["water supply", "water utility", "borehole", "bottled water"], dataApis: ["news"] },
      { id: "14.2", name: "Waste Management & Recycling", shortName: "Waste/Recycle", description: "Collection to recycling", moneyFlow: "Waste Generated → Collection → Sorting → Recycling/Landfill", keywords: ["waste management", "recycling", "plastic waste", "e-waste", "circular economy"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 15,
    slug: "professional-services",
    name: "Professional Services",
    icon: "👔",
    color: "slate",
    description: "Law, accounting, consulting, HR/recruitment, marketing, PR, architecture, engineering.",
    subFlows: [
      { id: "15.1", name: "Legal, Accounting & Consulting", shortName: "Consulting", description: "Knowledge-based services", moneyFlow: "Client Need → Engagement → Hourly/Project Fee → Delivery → Invoice", keywords: ["consulting", "law firm", "Big Four", "accounting", "McKinsey", "Deloitte"], dataApis: ["news", "stocks"] },
      { id: "15.2", name: "HR, Recruitment & Marketing", shortName: "HR/Marketing", description: "People and brand services", moneyFlow: "Client Brief → Service Delivery → Placement/Campaign → Fee", keywords: ["recruitment", "HR", "marketing agency", "advertising", "PR"], dataApis: ["news"] },
    ],
  },
  {
    id: 16,
    slug: "fashion-textiles",
    name: "Fashion & Textiles",
    icon: "👗",
    color: "rose",
    description: "Cotton farming, spinning, garment manufacturing, brands, retail, second-hand, fast fashion.",
    subFlows: [
      { id: "16.1", name: "Textile Value Chain", shortName: "Textiles", description: "Cotton to garment", moneyFlow: "Cotton Farming → Ginning → Spinning → Weaving → Garment Mfg → Brand → Retail → Consumer", keywords: ["textile", "cotton", "garment", "fashion manufacturing", "fast fashion"], dataApis: ["commodities", "news", "stocks"] },
      { id: "16.2", name: "Mitumba (Second-Hand)", shortName: "Mitumba", description: "Second-hand clothing trade", moneyFlow: "Donations → Recycler Sorts → Baled → Importer → Wholesale → Retail → Consumer", keywords: ["second-hand clothing", "mitumba", "Gikomba", "textile imports"], dataApis: ["news"] },
    ],
  },
  {
    id: 17,
    slug: "automotive",
    name: "Automotive",
    icon: "🚗",
    color: "zinc",
    description: "Vehicle manufacturing, parts supply, distribution, dealerships, insurance, EV transition.",
    subFlows: [
      { id: "17.1", name: "New Vehicle Distribution", shortName: "New Cars", description: "Factory to showroom", moneyFlow: "Manufacturer → Regional Distributor → National Dealer → Finance → Consumer → After-Market", keywords: ["automotive", "Toyota", "car sales", "vehicle dealer", "EV"], dataApis: ["stocks", "news"] },
      { id: "17.2", name: "Used Vehicle Import", shortName: "Used Cars", description: "Second-hand vehicle trade", moneyFlow: "Japan Auction → Exporter → Importer → Clearing → Dealer → Consumer", keywords: ["used cars", "vehicle import", "Japan auction", "car dealer"], dataApis: ["news"] },
      { id: "17.3", name: "Auto Parts & Service", shortName: "Parts/Service", description: "Aftermarket parts and repair", moneyFlow: "Parts Manufacturer → Importer → Wholesaler → Garage/Mechanic → Consumer", keywords: ["auto parts", "car repair", "spare parts", "aftermarket"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 18,
    slug: "aerospace-defence",
    name: "Aerospace & Defence",
    icon: "✈️",
    color: "neutral",
    description: "Aircraft manufacturing, MRO, defence procurement, satellite, space, security services.",
    subFlows: [
      { id: "18.1", name: "Aircraft Manufacturing & MRO", shortName: "Aircraft/MRO", description: "Aircraft lifecycle", moneyFlow: "Manufacturer (Boeing/Airbus) → Airline Purchase/Lease → MRO → Retirement", keywords: ["Boeing", "Airbus", "aircraft", "MRO", "aviation"], dataApis: ["stocks", "news", "flights"] },
      { id: "18.2", name: "Defence & Security", shortName: "Defence", description: "Military procurement and security", moneyFlow: "Government Budget → Procurement → Defence Contractor → Equipment → Deployment", keywords: ["defence", "military", "security", "weapons", "procurement"], dataApis: ["stocks", "news"] },
      { id: "18.3", name: "Space & Satellite", shortName: "Space", description: "Satellite and space industry", moneyFlow: "Launch Provider → Satellite Manufacturer → Operator → Service Revenue", keywords: ["SpaceX", "satellite", "space industry", "rocket launch"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 19,
    slug: "consumer-electronics",
    name: "Consumer Electronics",
    icon: "📱",
    color: "lime",
    description: "Semiconductor, component manufacturing, device assembly, brands, distribution, retail, repair.",
    subFlows: [
      { id: "19.1", name: "Device Manufacturing & Assembly", shortName: "Manufacturing", description: "Components to finished device", moneyFlow: "Components → Assembly → Brand → Distribution → Retail → Consumer", keywords: ["electronics manufacturing", "consumer electronics", "Apple", "Samsung"], dataApis: ["stocks", "news"] },
      { id: "19.2", name: "Electronics Retail & Repair", shortName: "Retail/Repair", description: "Sales and aftermarket service", moneyFlow: "Distributor → Retailer → Consumer → Repair/Recycling", keywords: ["electronics retail", "phone repair", "e-waste recycling"], dataApis: ["news"] },
    ],
  },
  {
    id: 20,
    slug: "chemicals",
    name: "Chemicals & Petrochemicals",
    icon: "🧪",
    color: "yellow",
    description: "Extraction, refining, industrial chemicals, fertilisers, plastics, pharma chemicals.",
    subFlows: [
      { id: "20.1", name: "Industrial Chemicals", shortName: "Chemicals", description: "Basic and specialty chemicals", moneyFlow: "Feedstock → Chemical Plant → Distribution → Industrial Consumer", keywords: ["chemicals", "petrochemicals", "industrial chemicals", "BASF", "Dow"], dataApis: ["commodities", "stocks", "news"] },
      { id: "20.2", name: "Fertilisers & Plastics", shortName: "Fertiliser/Plastic", description: "Agricultural and consumer chemicals", moneyFlow: "Raw Material → Processing → Product → Distribution → End User", keywords: ["fertiliser", "plastics", "polymer", "urea", "phosphate"], dataApis: ["commodities", "news", "stocks"] },
    ],
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getSubFlow(industrySlug: string, subFlowId: string): { industry: Industry; subFlow: SubFlow } | undefined {
  const industry = getIndustryBySlug(industrySlug);
  if (!industry) return undefined;
  const subFlow = industry.subFlows.find((sf) => sf.id === subFlowId);
  if (!subFlow) return undefined;
  return { industry, subFlow };
}

export function getAllKeywords(): string[] {
  const keywords = new Set<string>();
  for (const ind of industries) {
    for (const sf of ind.subFlows) {
      for (const kw of sf.keywords) {
        keywords.add(kw);
      }
    }
  }
  return Array.from(keywords);
}
