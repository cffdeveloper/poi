export type SubFlow = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  moneyFlow: string;
  keywords: string[];
  dataApis: string[];
};

export type Industry = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  color: string;
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
      { id: "1.1", name: "Hardware Manufacturing", shortName: "Hardware", description: "Raw materials → semiconductor fab → component makers → contract manufacturer → brand → distributor → retailer → consumer", moneyFlow: "Raw Materials → Semiconductor Fab → Component Makers → Contract Manufacturer → Brand Owner → Distributor → Retailer → Consumer", keywords: ["semiconductor", "chip manufacturing", "hardware", "TSMC", "Apple", "Samsung", "Foxconn", "rare earths", "silicon"], dataApis: ["stocks", "news", "commodities"] },
      { id: "1.2", name: "Software / SaaS", shortName: "SaaS", description: "Developer builds → cloud hosted → subscription revenue → scale → exit", moneyFlow: "Developer/Founder → Software Built → Cloud Hosted → Customer Subscribes → Revenue = MAU × ARPU → VC Capital → Scale → Exit", keywords: ["SaaS", "software", "cloud computing", "subscription", "ARR", "MRR", "vertical SaaS", "horizontal SaaS"], dataApis: ["stocks", "news", "funding"] },
      { id: "1.3", name: "Mobile Applications", shortName: "Mobile Apps", description: "Developer → app store → downloads → revenue (ads/IAP/subs) → store takes 15-30%", moneyFlow: "Developer → App Store → Downloads → Revenue (ads/IAP/subs) → Store takes 15-30%", keywords: ["mobile apps", "app store", "Google Play", "iOS", "Android", "in-app purchase", "AdMob"], dataApis: ["news", "stocks"] },
      { id: "1.4", name: "IT Services & Managed Services", shortName: "IT Services", description: "Consulting, implementation, managed services, BPO, cloud migration", moneyFlow: "Client Need → IT Firm Scopes → Contract → Execution → Invoice → Payment", keywords: ["IT consulting", "managed services", "BPO", "outsourcing", "system integration", "cloud migration", "cybersecurity services"], dataApis: ["news", "stocks"] },
      { id: "1.5", name: "Device Distribution", shortName: "Distribution", description: "Master distributor → sub-distributor → dealer → retail → consumer", moneyFlow: "Manufacturer → Master Distributor → Sub-Distributor → Dealer → Retail → Consumer", keywords: ["phone distribution", "Tecno", "Samsung Africa", "device retail", "Xiaomi", "Itel"], dataApis: ["news"] },
      { id: "1.6", name: "AI & Data Services", shortName: "AI/Data", description: "AI model providers, application builders, data labelling, AI consulting", moneyFlow: "Data Collection → Processing → AI Model → API/Platform → Enterprise Client", keywords: ["artificial intelligence", "machine learning", "data analytics", "OpenAI", "Google AI", "data labelling", "Sama", "AI consulting"], dataApis: ["stocks", "news", "funding"] },
      { id: "1.7", name: "Cybersecurity", shortName: "Cybersecurity", description: "Security audits, penetration testing, SIEM, incident response", moneyFlow: "Threat Detection → Security Products → Enterprise Deployment → Managed Security", keywords: ["cybersecurity", "data breach", "ransomware", "security", "penetration testing", "SIEM"], dataApis: ["news", "stocks"] },
      { id: "1.8", name: "Cloud Infrastructure", shortName: "Cloud", description: "Data center → cloud platform → IaaS/PaaS/SaaS → enterprise clients", moneyFlow: "Data Center → Cloud Platform → IaaS/PaaS/SaaS → Enterprise/SMB Clients", keywords: ["cloud computing", "AWS", "Azure", "Google Cloud", "data center"], dataApis: ["stocks", "news"] },
      { id: "1.9", name: "Semiconductors", shortName: "Chips", description: "Silicon → wafer processing → chip design → fabrication → packaging → device integration", moneyFlow: "Silicon → Wafer Processing → Chip Design → Fabrication → Packaging → Device Integration", keywords: ["semiconductor", "NVIDIA", "TSMC", "Intel", "chip shortage", "wafer"], dataApis: ["stocks", "news", "commodities"] },
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
      { id: "2.1", name: "Mobile Network Operator (MNO)", shortName: "MNO", description: "Spectrum → towers → network → subscribers → airtime/data/mobile money → revenue", moneyFlow: "Spectrum → Towers → Network → Subscribers → Airtime/Data/Mobile Money → Revenue", keywords: ["Safaricom", "Airtel", "telecom", "5G", "mobile network", "spectrum", "tower lease"], dataApis: ["stocks", "news"] },
      { id: "2.2", name: "Airtime & Data Distribution", shortName: "Airtime", description: "MNO → national distributor → regional → retailer → consumer", moneyFlow: "MNO → National Distributor → Regional → Retailer → Consumer", keywords: ["airtime distribution", "M-Pesa agents", "mobile money", "airtime dealer"], dataApis: ["news"] },
      { id: "2.3", name: "Internet Service Provider (ISP)", shortName: "ISP", description: "Submarine cable → tier 1 → national ISP → last-mile → consumer", moneyFlow: "Submarine Cable → Tier 1 → National ISP → Last-Mile → Consumer", keywords: ["ISP", "broadband", "fibre", "internet access", "Starlink", "Zuku", "Faiba", "Wi-Fi hotspot"], dataApis: ["news"] },
      { id: "2.4", name: "MVNO", shortName: "MVNO", description: "Buys wholesale capacity from MNO, resells under own brand", moneyFlow: "MNO Wholesale → MVNO Brand → Niche Market → Subscriber", keywords: ["MVNO", "virtual network", "telecom"], dataApis: ["news"] },
      { id: "2.5", name: "Tower Companies", shortName: "Towers", description: "Build/buy towers → lease to MNOs → co-location revenue", moneyFlow: "Build/Buy Towers → Lease to MNOs → Co-location Revenue", keywords: ["tower company", "IHS Towers", "Helios", "cell tower", "co-location"], dataApis: ["stocks", "news"] },
      { id: "2.6", name: "Submarine Cable & CDN", shortName: "Cable/CDN", description: "International connectivity and content delivery", moneyFlow: "Submarine Cable → IXP → CDN → Data Center → End User", keywords: ["submarine cable", "CDN", "data center", "internet exchange", "SEACOM", "EASSY"], dataApis: ["news"] },
      { id: "2.7", name: "Mobile Money & Digital Payments", shortName: "Mobile Money", description: "Agent network → digital wallet → transactions → float management", moneyFlow: "MNO/Fintech → Agent Network → Consumer Wallet → Transactions → Revenue from Fees", keywords: ["M-Pesa", "mobile money", "digital wallet", "agent network", "float management"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 3,
    slug: "financial-services",
    name: "Financial Services",
    icon: "🏦",
    color: "emerald",
    description: "Banking, insurance, capital markets, forex, fintech, payment processing, leasing, microfinance.",
    subFlows: [
      { id: "3.1", name: "Commercial Banking", shortName: "Banking", description: "Deposits → lending → NII + fee income", moneyFlow: "Deposits → Lending → Net Interest Income + Fee Income", keywords: ["banking", "interest rates", "central bank", "lending", "deposits", "NII", "treasury bills"], dataApis: ["stocks", "news", "forex", "rates"] },
      { id: "3.2", name: "Insurance", shortName: "Insurance", description: "Premium collection → risk pool → claims → investment income", moneyFlow: "Premium Collection → Risk Pool → Claims Payment → Investment Income", keywords: ["insurance", "underwriting", "claims", "reinsurance", "IRA"], dataApis: ["stocks", "news"] },
      { id: "3.3", name: "Capital Markets", shortName: "Markets", description: "Issuers → IPO/bonds → exchange → brokers → investors", moneyFlow: "Issuers → IPO/Bonds → Exchange → Brokers → Investors", keywords: ["stock market", "IPO", "bonds", "NSE", "NYSE", "CMA", "securities"], dataApis: ["stocks", "news", "crypto"] },
      { id: "3.4", name: "Forex & Remittance", shortName: "Forex", description: "Sender → forex bureau/app → cross-border transfer → recipient", moneyFlow: "Sender → Forex Bureau/App → Cross-border Transfer → Recipient", keywords: ["forex", "remittance", "Western Union", "exchange rate", "currency", "CBK"], dataApis: ["forex", "news"] },
      { id: "3.5", name: "Fintech & Payments", shortName: "Fintech", description: "Digital payments, lending platforms, neobanks", moneyFlow: "Merchant/Consumer → Payment Platform → Processing → Settlement", keywords: ["fintech", "payments", "Stripe", "PayPal", "M-Pesa", "digital banking", "neobank", "BNPL"], dataApis: ["stocks", "news", "funding"] },
      { id: "3.6", name: "Microfinance & SACCOs", shortName: "Microfinance", description: "Member savings → lending → interest → dividends", moneyFlow: "Member Savings → Lending → Interest Income → Dividends", keywords: ["microfinance", "SACCO", "community banking", "financial inclusion", "cooperative"], dataApis: ["news"] },
      { id: "3.7", name: "Development Finance", shortName: "DFI", description: "DFI capital → project finance → development impact → returns", moneyFlow: "DFI Capital → Project Finance → Development Impact → Returns", keywords: ["World Bank", "IFC", "AfDB", "development finance", "impact investing", "blended finance"], dataApis: ["news"] },
      { id: "3.8", name: "Asset Leasing & Hire Purchase", shortName: "Leasing", description: "Asset acquisition → lease agreement → monthly payments → ownership transfer", moneyFlow: "Financier Buys Asset → Lease to Client → Monthly Payments → Residual Value/Transfer", keywords: ["leasing", "hire purchase", "asset finance", "equipment leasing"], dataApis: ["news"] },
    ],
  },
  {
    id: 4,
    slug: "energy",
    name: "Energy",
    icon: "⚡",
    color: "amber",
    description: "Oil & gas, solar, wind, hydro, nuclear, biogas, LPG, electricity grid, carbon markets, energy services.",
    subFlows: [
      { id: "4.1", name: "Oil & Gas", shortName: "Oil & Gas", description: "Exploration → production → refining → distribution → petrol station → consumer", moneyFlow: "Exploration → Production → Refining → Distribution → Petrol Station → Consumer", keywords: ["oil price", "crude oil", "OPEC", "petroleum", "refinery", "Brent", "WTI"], dataApis: ["commodities", "stocks", "news"] },
      { id: "4.2", name: "Electricity Grid", shortName: "Power Grid", description: "Generator (KenGen/IPP) → transmission → distribution → meter → consumer", moneyFlow: "Generator (KenGen/IPP) → Transmission → Distribution → Meter → Consumer", keywords: ["electricity", "power generation", "grid", "Kenya Power", "energy", "IPP", "KenGen"], dataApis: ["news", "commodities"] },
      { id: "4.3", name: "Solar Energy", shortName: "Solar", description: "Panel manufacturer → importer → distributor → PAYG company → consumer", moneyFlow: "Panel Manufacturer → Importer → Distributor → PAYG Company → Consumer", keywords: ["solar energy", "solar panel", "M-KOPA", "renewable energy", "PAYG", "off-grid solar"], dataApis: ["stocks", "news", "commodities"] },
      { id: "4.4", name: "Wind & Hydro Power", shortName: "Wind/Hydro", description: "Turbine/dam development → IPP → grid connection → tariff revenue", moneyFlow: "Developer → Finance → Build → Grid Connection → PPA → Tariff Revenue", keywords: ["wind energy", "hydropower", "Lake Turkana Wind", "geothermal", "renewable"], dataApis: ["news"] },
      { id: "4.5", name: "Carbon Markets", shortName: "Carbon", description: "Clean project → verification → credits → broker → corporate buyer", moneyFlow: "Clean Project → Verification → Credits Issued → Broker → Corporate Buyer", keywords: ["carbon credits", "carbon market", "net zero", "emissions", "Verra", "Gold Standard"], dataApis: ["news", "commodities"] },
      { id: "4.6", name: "LPG Distribution", shortName: "LPG", description: "Import/refinery → bulk storage → cylinder filling → distributor → consumer", moneyFlow: "Import/Refinery → Bulk Storage → Cylinder Filling → Distributor → Consumer", keywords: ["LPG", "cooking gas", "propane", "butane", "gas cylinder"], dataApis: ["commodities", "news"] },
      { id: "4.7", name: "Mini-Grid & Off-Grid", shortName: "Mini-Grid", description: "Developer → finance → build → operate → tariff collection", moneyFlow: "Developer → Finance → Build → Operate → Tariff Collection", keywords: ["mini-grid", "off-grid", "rural electrification", "energy access"], dataApis: ["news"] },
      { id: "4.8", name: "Biogas & Biomass", shortName: "Biogas", description: "Organic waste → digester → gas production → energy/fertiliser", moneyFlow: "Organic Waste → Biodigester → Gas Production → Energy + Bio-Slurry Fertiliser", keywords: ["biogas", "biomass", "waste-to-energy", "biodigester"], dataApis: ["news"] },
    ],
  },
  {
    id: 5,
    slug: "agriculture",
    name: "Agriculture & Food",
    icon: "🌾",
    color: "green",
    description: "Input supply, farming, aggregation, processing, export, cold chain, agri-finance, food retail, restaurants.",
    subFlows: [
      { id: "5.1", name: "Food Value Chain", shortName: "Food Chain", description: "Input → farmer → aggregator → processor → wholesaler → retailer → consumer", moneyFlow: "Input Manufacturer → Agrovet → Farmer → Aggregator → Processor → Wholesaler → Retailer → Consumer", keywords: ["agriculture", "food production", "farming", "crop prices", "food security"], dataApis: ["commodities", "news", "weather"] },
      { id: "5.2", name: "Input Supply Chain", shortName: "Inputs", description: "Seeds, fertilizer, agrochemicals supply chain", moneyFlow: "Manufacturer → Importer → National Distributor → Agrovet → Farmer", keywords: ["fertilizer", "seeds", "agrochemicals", "Syngenta", "Bayer", "agrovet"], dataApis: ["commodities", "news", "stocks"] },
      { id: "5.3", name: "Export & Cold Chain", shortName: "Export", description: "Farm → packhouse → cold chain → airport/port → international market", moneyFlow: "Farm → Packhouse → Cold Chain → Airport/Port → International Market", keywords: ["agricultural exports", "cold chain", "fresh produce", "horticulture", "avocado export", "flower export"], dataApis: ["commodities", "news"] },
      { id: "5.4", name: "Agri-Finance & Insurance", shortName: "Agri-Finance", description: "Agricultural lending, crop insurance, warehouse receipts", moneyFlow: "Financial Institution → Agri Loan → Farmer → Harvest → Repayment", keywords: ["agricultural finance", "crop insurance", "farm credit", "warehouse receipt", "agri-fintech"], dataApis: ["news"] },
      { id: "5.5", name: "Food Processing & FMCG", shortName: "Processing", description: "Raw commodity → processing plant → branding → distribution → retail", moneyFlow: "Raw Commodity → Processing Plant → Branding → Distribution → Retail", keywords: ["food processing", "FMCG", "beverage", "dairy", "milling", "edible oil"], dataApis: ["stocks", "news", "commodities"] },
      { id: "5.6", name: "Restaurant & Food Service", shortName: "Food Service", description: "Supplier → kitchen → menu → dine-in/delivery → payment", moneyFlow: "Supplier → Kitchen → Menu → Dine-in/Delivery → Payment", keywords: ["restaurant", "food delivery", "catering", "fast food", "cloud kitchen"], dataApis: ["news"] },
      { id: "5.7", name: "Livestock & Dairy", shortName: "Livestock", description: "Breeding → rearing → slaughter/milking → processing → retail", moneyFlow: "Breeding → Rearing → Slaughter/Milking → Processing → Distribution → Retail", keywords: ["livestock", "dairy", "cattle", "poultry", "meat processing", "Brookside"], dataApis: ["commodities", "news"] },
    ],
  },
  {
    id: 6,
    slug: "real-estate",
    name: "Real Estate & Construction",
    icon: "🏗️",
    color: "orange",
    description: "Land, development, contracting, materials, agents, property management, REIT, facility management.",
    subFlows: [
      { id: "6.1", name: "Land & Development", shortName: "Land Dev", description: "Land acquisition → planning → development → sales/leasing", moneyFlow: "Land Purchase → Planning → Development → Sales/Leasing", keywords: ["real estate development", "land prices", "housing", "property market", "affordable housing"], dataApis: ["news"] },
      { id: "6.2", name: "Construction Contracting", shortName: "Construction", description: "Client tender → contractor bid → materials + labour → completion → payment", moneyFlow: "Client Tender → Contractor Bid → Materials + Labour → Completion → Payment", keywords: ["construction", "infrastructure", "building", "contractor", "civil works", "NCA"], dataApis: ["news", "commodities"] },
      { id: "6.3", name: "Building Materials", shortName: "Materials", description: "Manufacturer → distributor → hardware store → contractor/consumer", moneyFlow: "Manufacturer → Distributor → Hardware Store → Contractor/Consumer", keywords: ["cement", "steel", "building materials", "Bamburi", "timber", "hardware"], dataApis: ["commodities", "stocks", "news"] },
      { id: "6.4", name: "Property Management & REIT", shortName: "PropMgt/REIT", description: "Property → management → rent collection → maintenance → returns", moneyFlow: "Property → Management → Rent Collection → Maintenance → Returns", keywords: ["property management", "REIT", "rental income", "commercial property", "facility management"], dataApis: ["stocks", "news"] },
      { id: "6.5", name: "Real Estate Agency & Valuation", shortName: "Agents", description: "Listing → marketing → viewing → negotiation → commission", moneyFlow: "Seller Lists → Agent Markets → Buyer Views → Negotiation → Sale → Commission (2-5%)", keywords: ["real estate agent", "property valuation", "broker", "listing", "conveyancing"], dataApis: ["news"] },
    ],
  },
  {
    id: 7,
    slug: "trade-retail",
    name: "Trade, Retail & FMCG",
    icon: "🛒",
    color: "pink",
    description: "Manufacturing, distribution, wholesale, retail, e-commerce, private label, franchise, informal trade.",
    subFlows: [
      { id: "7.1", name: "FMCG Distribution", shortName: "FMCG", description: "Manufacturer → national distributor → wholesaler → retailer → consumer", moneyFlow: "Manufacturer → National Distributor → Wholesaler → Retailer → Consumer", keywords: ["FMCG", "consumer goods", "Unilever", "P&G", "distribution", "wholesaler"], dataApis: ["stocks", "news"] },
      { id: "7.2", name: "E-Commerce & Marketplaces", shortName: "E-Commerce", description: "Seller → platform → logistics → consumer → payment settlement", moneyFlow: "Seller → Platform → Logistics → Consumer → Payment Settlement", keywords: ["e-commerce", "online shopping", "Jumia", "Amazon", "marketplace", "dropshipping"], dataApis: ["stocks", "news"] },
      { id: "7.3", name: "Franchise & Chain Retail", shortName: "Franchise", description: "Brand → franchise agreement → local operator → consumer", moneyFlow: "Brand → Franchise Agreement → Local Operator → Consumer", keywords: ["franchise", "retail chain", "supermarket", "Naivas", "Carrefour"], dataApis: ["news", "stocks"] },
      { id: "7.4", name: "Informal Trade & Jua Kali", shortName: "Informal", description: "Manufacturing/trading in informal sector", moneyFlow: "Raw Material → Informal Workshop → Product → Street Sales → Consumer", keywords: ["informal trade", "jua kali", "kiosk", "hawker", "market trader"], dataApis: ["news"] },
      { id: "7.5", name: "Private Label & Contract Manufacturing", shortName: "Private Label", description: "Retailer designs → contract manufacturer produces → retailer sells under own brand", moneyFlow: "Retailer Brief → Contract Manufacturer → Private Label Product → Retail Shelf → Consumer", keywords: ["private label", "contract manufacturing", "white label", "own brand"], dataApis: ["news"] },
    ],
  },
  {
    id: 8,
    slug: "transport-logistics",
    name: "Transport & Logistics",
    icon: "🚛",
    color: "indigo",
    description: "Road freight, shipping, air cargo, rail, last-mile, ride-hailing, 3PL, freight forwarding, ports.",
    subFlows: [
      { id: "8.1", name: "Road Freight & Trucking", shortName: "Trucking", description: "Shipper → freight forwarder → trucker → delivery → payment", moneyFlow: "Shipper → Freight Forwarder → Trucker → Delivery → Payment", keywords: ["trucking", "freight", "road transport", "logistics", "truck fleet"], dataApis: ["news", "commodities"] },
      { id: "8.2", name: "Shipping & Ports", shortName: "Shipping", description: "Shipper → shipping line → port → customs → clearing agent → consignee", moneyFlow: "Shipper → Shipping Line → Port → Customs → Clearing Agent → Consignee", keywords: ["shipping", "container", "port", "maritime", "Mombasa port", "KPA"], dataApis: ["news", "stocks"] },
      { id: "8.3", name: "Air Cargo & Aviation", shortName: "Aviation", description: "Air freight and passenger aviation", moneyFlow: "Shipper → Air Cargo Agent → Airline → Airport → Consignee", keywords: ["air cargo", "aviation", "airline", "airport", "flight", "JKIA", "Kenya Airways"], dataApis: ["flights", "news", "stocks"] },
      { id: "8.4", name: "Last-Mile & Ride-Hailing", shortName: "Last-Mile", description: "Consumer order → platform → driver/rider → delivery → settlement", moneyFlow: "Consumer Order → Platform → Driver/Rider → Delivery → Settlement", keywords: ["ride-hailing", "Uber", "Bolt", "delivery", "last-mile", "Glovo", "boda boda"], dataApis: ["news", "stocks"] },
      { id: "8.5", name: "Railway & SGR", shortName: "Rail", description: "Cargo/passenger → railway operator → station → delivery/destination", moneyFlow: "Cargo/Passenger → Railway Operator → Station → Delivery/Destination", keywords: ["railway", "SGR", "rail freight", "standard gauge railway", "cargo train"], dataApis: ["news"] },
      { id: "8.6", name: "Customs Clearing & Forwarding", shortName: "Clearing", description: "Importer → clearing agent → customs → documentation → release", moneyFlow: "Importer → Clearing Agent → KRA Customs → Documentation → Goods Release", keywords: ["customs clearing", "freight forwarding", "KIFWA", "import duty", "bonded warehouse"], dataApis: ["news"] },
      { id: "8.7", name: "3PL & Warehousing", shortName: "3PL", description: "Client outsources logistics → 3PL stores/picks/packs/ships", moneyFlow: "Client → 3PL Provider → Warehouse → Pick/Pack → Ship → Consumer", keywords: ["3PL", "warehousing", "fulfillment", "logistics outsourcing", "cold storage"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 9,
    slug: "health",
    name: "Health & Pharmaceuticals",
    icon: "🏥",
    color: "red",
    description: "Pharma manufacturing, distribution, hospitals, diagnostics, insurance, medtech, digital health, mental health.",
    subFlows: [
      { id: "9.1", name: "Pharmaceutical Manufacturing & Distribution", shortName: "Pharma", description: "API manufacturer → finished dose → distributor → pharmacy → patient", moneyFlow: "API Manufacturer (India/China) → Finished Dose Manufacturer → Marketing Authorisation → Wholesale Distributor → Sub-distributor → Pharmacy → Patient/NHIF", keywords: ["pharmaceutical", "drug manufacturing", "pharmacy", "Cipla", "medicine", "PPB", "KEMSA"], dataApis: ["stocks", "news"] },
      { id: "9.2", name: "Hospital & Clinic Revenue", shortName: "Hospitals", description: "Patient → consultation → diagnosis → treatment → billing → payment/insurance", moneyFlow: "Patient → Consultation → Diagnosis (lab/imaging) → Treatment → Billing → NHIF/Insurer/Self-Pay", keywords: ["hospital", "healthcare", "clinic", "NHIF", "health insurance", "KMPDC"], dataApis: ["news", "stocks"] },
      { id: "9.3", name: "Diagnostic Laboratory", shortName: "Diagnostics", description: "Hub lab → spoke collection centres → sample transport → results → invoice", moneyFlow: "Hub Lab → Spoke Collection Centres → Sample Transport → Test Processed → Results → Invoice", keywords: ["diagnostic lab", "pathology", "medical testing", "Lancet", "hub-and-spoke"], dataApis: ["news"] },
      { id: "9.4", name: "Medical Equipment", shortName: "MedTech", description: "Global manufacturer → importer/distributor → hospital procurement → maintenance", moneyFlow: "Global Manufacturer (GE/Siemens/Mindray) → Importer/Distributor → Hospital Procurement → Maintenance Contract", keywords: ["medical equipment", "GE Healthcare", "Siemens", "medtech", "Mindray", "reagent supply"], dataApis: ["stocks", "news"] },
      { id: "9.5", name: "Digital Health & Telemedicine", shortName: "Digital Health", description: "Platform → consultation → prescription → payment → follow-up", moneyFlow: "Platform → Consultation → Prescription → Payment → Follow-up", keywords: ["digital health", "telemedicine", "healthtech", "e-health", "teleradiology"], dataApis: ["news", "funding"] },
      { id: "9.6", name: "Health Insurance", shortName: "Health Insurance", description: "Premium collection → risk pooling → claims adjudication → provider payment", moneyFlow: "Member Pays Premium → Risk Pool → Claims Submitted → Adjudication → Provider Payment", keywords: ["NHIF", "SHA", "health insurance", "managed care", "HMO", "capitation"], dataApis: ["news"] },
      { id: "9.7", name: "Mental Health Services", shortName: "Mental Health", description: "Therapist/psychiatrist → clinic/platform → sessions → insurance/self-pay", moneyFlow: "Patient → Therapist/Psychiatrist → Session → Invoice → Insurance/Self-Pay", keywords: ["mental health", "therapy", "psychiatry", "counseling", "wellness"], dataApis: ["news"] },
    ],
  },
  {
    id: 10,
    slug: "education",
    name: "Education",
    icon: "📚",
    color: "violet",
    description: "Private schools, universities, EdTech, vocational, corporate training, study-abroad, content publishing.",
    subFlows: [
      { id: "10.1", name: "Private School Revenue", shortName: "Schools", description: "Fee-based education from budget to premium/international", moneyFlow: "Parent Pays Fees → School Provides Education → Operating Costs → Surplus", keywords: ["private school", "education", "school fees", "K-12", "international school", "boarding school"], dataApis: ["news"] },
      { id: "10.2", name: "EdTech & Online Learning", shortName: "EdTech", description: "Course marketplace, own LMS, subscription learning apps", moneyFlow: "Content Creator → LMS Platform → Learner Enrollment → Revenue", keywords: ["EdTech", "online learning", "Coursera", "Udemy", "e-learning", "LMS", "Teachable"], dataApis: ["stocks", "news", "funding"] },
      { id: "10.3", name: "Vocational & Skills Training", shortName: "Vocational", description: "Driving schools, coding bootcamps, beauty schools, technical training", moneyFlow: "Training Need → Provider → Course → Certification → Employment", keywords: ["vocational training", "skills", "bootcamp", "certification", "NITA", "TVETA", "Moringa"], dataApis: ["news"] },
      { id: "10.4", name: "Corporate Training", shortName: "Corporate", description: "Leadership, technical skills, compliance training for enterprises", moneyFlow: "HR Identifies Need → RFP → Training Firm → Delivery → Invoice", keywords: ["corporate training", "L&D", "leadership", "compliance training", "AML training"], dataApis: ["news"] },
      { id: "10.5", name: "University & Higher Education", shortName: "University", description: "Undergraduate/postgraduate programs, research, grants", moneyFlow: "Student Applies → Admission → Tuition Payment → Education Delivery → Graduation", keywords: ["university", "higher education", "HELB", "scholarship", "research grants", "postgraduate"], dataApis: ["news"] },
      { id: "10.6", name: "Study-Abroad & Education Consulting", shortName: "Study Abroad", description: "Student → consultant → application → visa → placement → commission", moneyFlow: "Student → Education Consultant → University Application → Visa → Enrollment → Commission", keywords: ["study abroad", "education consulting", "student visa", "IELTS", "scholarship"], dataApis: ["news"] },
    ],
  },
  {
    id: 11,
    slug: "media-entertainment",
    name: "Media, Content & Entertainment",
    icon: "🎬",
    color: "fuchsia",
    description: "TV/radio, digital publishing, music, film, gaming, events, advertising, influencer, streaming.",
    subFlows: [
      { id: "11.1", name: "Television & Radio", shortName: "TV/Radio", description: "Content creation → broadcast → audience → advertising revenue", moneyFlow: "Content Creation → Broadcast → Audience → Advertising Revenue", keywords: ["television", "radio", "broadcasting", "advertising", "media", "Citizen TV", "NTV"], dataApis: ["stocks", "news"] },
      { id: "11.2", name: "Digital Content & Social Media", shortName: "Digital", description: "Creator → platform → audience → ad revenue/sponsorship", moneyFlow: "Creator → Platform → Audience → Ad Revenue/Sponsorship", keywords: ["social media", "YouTube", "TikTok", "influencer", "creator economy", "content creator"], dataApis: ["news", "stocks"] },
      { id: "11.3", name: "Music Industry", shortName: "Music", description: "Artist → recording → distribution → streaming → royalties → live events", moneyFlow: "Artist → Recording → Distribution → Streaming → Royalties", keywords: ["music industry", "Spotify", "streaming", "royalties", "live events", "MCSK", "KECOBO"], dataApis: ["stocks", "news"] },
      { id: "11.4", name: "Film & Production", shortName: "Film", description: "Pre-production → production → post-production → distribution → exhibition", moneyFlow: "Production → Distribution → Exhibition/Platform → Revenue", keywords: ["film industry", "Nollywood", "Netflix", "box office", "film commission", "production house"], dataApis: ["stocks", "news"] },
      { id: "11.5", name: "Gaming & Esports", shortName: "Gaming", description: "Game development → publishing → distribution → in-game purchases → esports", moneyFlow: "Game Studio → Publisher → Platform → Player → In-Game Revenue/Esports", keywords: ["gaming", "esports", "mobile gaming", "game development", "Twitch"], dataApis: ["stocks", "news"] },
      { id: "11.6", name: "Events & Exhibitions", shortName: "Events", description: "Event planning → venue → ticketing → sponsorship → execution", moneyFlow: "Event Concept → Sponsorship → Ticketing → Venue → Execution → Revenue", keywords: ["events", "exhibition", "conference", "KICC", "concert", "festival"], dataApis: ["news"] },
      { id: "11.7", name: "Out-of-Home Advertising", shortName: "OOH", description: "Billboard/digital screen → advertiser booking → campaign display", moneyFlow: "Ad Space Owner → Sales Team → Advertiser Booking → Campaign Display → Revenue", keywords: ["billboard", "OOH advertising", "digital signage", "outdoor advertising"], dataApis: ["news"] },
    ],
  },
  {
    id: 12,
    slug: "hospitality-tourism",
    name: "Hospitality, Tourism & Food Service",
    icon: "🏨",
    color: "teal",
    description: "Hotels, safari/tours, restaurants, airlines, travel agencies, cruise, events, sport tourism.",
    subFlows: [
      { id: "12.1", name: "Hotels & Accommodation", shortName: "Hotels", description: "Guest booking → check-in → room + services → checkout → payment", moneyFlow: "Guest Booking → Check-in → Room + Services → Checkout → Payment", keywords: ["hotel", "accommodation", "hospitality", "Airbnb", "tourism", "RevPAR", "occupancy rate"], dataApis: ["stocks", "news"] },
      { id: "12.2", name: "Safari & Tours", shortName: "Safari/Tours", description: "Tourist → travel agent → tour operator → safari lodge → experience", moneyFlow: "Tourist → Travel Agent → Tour Operator → Safari Lodge → Experience", keywords: ["safari", "tourism", "tour operator", "wildlife", "national park", "KWS", "Maasai Mara"], dataApis: ["news"] },
      { id: "12.3", name: "Restaurant & Food Service", shortName: "Restaurants", description: "Supplier → kitchen → menu → dine-in/delivery → payment", moneyFlow: "Supplier → Kitchen → Menu → Dine-in/Delivery → Payment", keywords: ["restaurant", "food service", "fast food", "delivery", "QSR", "food court"], dataApis: ["news", "stocks"] },
      { id: "12.4", name: "Travel Agency & OTA", shortName: "Travel Agency", description: "Traveller → agent/OTA → booking → airline/hotel → commission", moneyFlow: "Traveller → Agent/OTA → Booking → Airline/Hotel → Commission", keywords: ["travel agency", "Booking.com", "Expedia", "online travel", "flight booking"], dataApis: ["news", "stocks"] },
      { id: "12.5", name: "Short-Let & Serviced Apartments", shortName: "Short-Let", description: "Property owner → listing platform → guest booking → management", moneyFlow: "Property → Platform (Airbnb/Booking) → Guest → Nightly Rate → Management Fee", keywords: ["Airbnb", "serviced apartments", "short-term rental", "vacation rental"], dataApis: ["news"] },
      { id: "12.6", name: "MICE & Conference Tourism", shortName: "MICE", description: "Conference → venue → delegates → sponsorship → hospitality spend", moneyFlow: "Organiser → Venue Booking → Delegate Registration → Sponsorship → Execution", keywords: ["MICE", "conference", "convention", "trade show", "KICC", "business travel"], dataApis: ["news"] },
    ],
  },
  {
    id: 13,
    slug: "mining",
    name: "Mining & Natural Resources",
    icon: "⛏️",
    color: "stone",
    description: "Large-scale mining, artisanal, quarrying, gemstones, mineral processing, commodity trading.",
    subFlows: [
      { id: "13.1", name: "Large-Scale Mining", shortName: "Mining", description: "Exploration → licence → development → extraction → processing → export", moneyFlow: "Exploration → Licence → Development → Extraction → Processing → Export", keywords: ["mining", "gold", "copper", "lithium", "mineral extraction", "Glencore", "Trafigura", "Base Titanium"], dataApis: ["commodities", "stocks", "news"] },
      { id: "13.2", name: "Artisanal & Gemstones", shortName: "ASM/Gems", description: "ASM miner → local buyer → cutter/polisher → exporter → international market", moneyFlow: "ASM Miner → Local Buyer → Cutter/Polisher → Exporter → International Market", keywords: ["artisanal mining", "gemstones", "tsavorite", "gold panning", "Migori", "ruby"], dataApis: ["commodities", "news"] },
      { id: "13.3", name: "Sand, Stone & Construction Minerals", shortName: "Quarry", description: "Quarry operator → extraction → transport → construction site", moneyFlow: "Quarry Operator → Extraction → Lorry Transport → Construction Site", keywords: ["quarrying", "sand", "ballast", "construction minerals", "murram", "manufactured sand"], dataApis: ["news"] },
      { id: "13.4", name: "Mineral Processing & Smelting", shortName: "Processing", description: "Raw ore → concentration → smelting → refining → metal products", moneyFlow: "Raw Ore → Concentration Plant → Smelter → Refinery → Metal Products → Market", keywords: ["mineral processing", "smelting", "refining", "metal", "titanium", "fluorspar"], dataApis: ["commodities", "news"] },
    ],
  },
  {
    id: 14,
    slug: "water-environment",
    name: "Water & Environment",
    icon: "💧",
    color: "sky",
    description: "Water utilities, bottled water, waste collection, recycling, e-waste, carbon forestry, irrigation.",
    subFlows: [
      { id: "14.1", name: "Water Supply Chain", shortName: "Water", description: "Utility, water kiosk, borehole, bottled water, water tanker, treatment chemicals", moneyFlow: "Source → Treatment → Storage → Distribution → Consumer Pays", keywords: ["water supply", "water utility", "borehole", "bottled water", "water tanker", "water treatment"], dataApis: ["news"] },
      { id: "14.2", name: "Waste Management & Recycling", shortName: "Waste/Recycle", description: "Waste generated → collection → sorting → recycling/landfill", moneyFlow: "Waste Generated → Collection → Sorting → Recycling/Landfill", keywords: ["waste management", "recycling", "plastic waste", "e-waste", "circular economy", "scrap metal", "biogas"], dataApis: ["news", "stocks"] },
      { id: "14.3", name: "Irrigation & Water Infrastructure", shortName: "Irrigation", description: "Water source → infrastructure → distribution → farming", moneyFlow: "Water Source → Pump/Canal → Distribution Network → Farm → Crop Yield", keywords: ["irrigation", "drip irrigation", "water infrastructure", "dam", "water harvesting"], dataApis: ["news"] },
      { id: "14.4", name: "Carbon Forestry & Green Economy", shortName: "Carbon/Green", description: "Tree planting → carbon measurement → credits → corporate buyers", moneyFlow: "Tree Planting → Growth → Carbon Measurement → Credits Issued → Corporate Buyer", keywords: ["carbon forestry", "reforestation", "green economy", "REDD+", "afforestation"], dataApis: ["news"] },
    ],
  },
  {
    id: 15,
    slug: "professional-services",
    name: "Professional Services",
    icon: "👔",
    color: "slate",
    description: "Law, accounting, consulting, HR/recruitment, marketing, PR, architecture, engineering, research.",
    subFlows: [
      { id: "15.1", name: "Law Firms", shortName: "Legal", description: "Hourly rate, fixed fee, retainer, contingency", moneyFlow: "Client Need → Engagement → Hourly/Project Fee → Delivery → Invoice", keywords: ["law firm", "legal services", "LSK", "conveyancing", "corporate law", "fintech law"], dataApis: ["news"] },
      { id: "15.2", name: "Accounting & Audit", shortName: "Accounting", description: "Audit, tax advisory, bookkeeping retainer", moneyFlow: "Client → Engagement Letter → Audit/Tax Work → Report → Invoice", keywords: ["accounting", "audit", "Big Four", "ICPAK", "CPA", "tax advisory", "Deloitte", "PwC"], dataApis: ["news", "stocks"] },
      { id: "15.3", name: "Management Consulting", shortName: "Consulting", description: "Daily rate per consultant, fixed project fee", moneyFlow: "Client Problem → Proposal → Engagement → Consulting Work → Deliverable → Invoice", keywords: ["consulting", "McKinsey", "BCG", "Bain", "strategy consulting", "management consulting"], dataApis: ["news", "stocks"] },
      { id: "15.4", name: "HR, Recruitment & Staffing", shortName: "HR/Recruit", description: "Placement fee, temp staffing markup, HR outsourcing", moneyFlow: "Client Brief → Candidate Search → Interview → Placement → Commission (10-20% of salary)", keywords: ["recruitment", "HR", "staffing", "executive search", "headhunter", "manpower"], dataApis: ["news"] },
      { id: "15.5", name: "Marketing, PR & Advertising", shortName: "Marketing/PR", description: "Monthly retainer, campaign fee, media buying commission", moneyFlow: "Client Brief → Strategy → Campaign Creation → Media Placement → Results → Invoice", keywords: ["marketing agency", "PR", "advertising", "digital marketing", "media buying", "branding"], dataApis: ["news"] },
      { id: "15.6", name: "Architecture & Engineering", shortName: "Arch/Eng", description: "Professional fee as % of project cost (5-10%)", moneyFlow: "Client Brief → Design → Drawings → Approval → Construction Supervision → Fee", keywords: ["architecture", "engineering consultancy", "structural engineer", "BoRAQS", "EBK", "BIM"], dataApis: ["news"] },
      { id: "15.7", name: "Research & Market Intelligence", shortName: "Research", description: "Research projects, syndicated reports, subscriptions", moneyFlow: "Client Need → Research Design → Data Collection → Analysis → Report → Invoice", keywords: ["market research", "Ipsos", "Nielsen", "data analytics", "survey", "focus group"], dataApis: ["news"] },
    ],
  },
  {
    id: 16,
    slug: "fashion-textiles",
    name: "Fashion & Textiles",
    icon: "👗",
    color: "rose",
    description: "Cotton farming, spinning, weaving, garment manufacturing, brands, retail, second-hand, fast fashion.",
    subFlows: [
      { id: "16.1", name: "Textile Value Chain", shortName: "Textiles", description: "Cotton farming → ginning → spinning → weaving → garment mfg → brand → retail", moneyFlow: "Cotton Farming → Ginning → Spinning → Weaving → Garment Mfg → Brand → Retail → Consumer", keywords: ["textile", "cotton", "garment", "fashion manufacturing", "fast fashion", "CMT", "EPZ"], dataApis: ["commodities", "news", "stocks"] },
      { id: "16.2", name: "Mitumba (Second-Hand Clothing)", shortName: "Mitumba", description: "Donations → recycler sorts → baled → importer → wholesale → retail → consumer", moneyFlow: "Donations → Recycler Sorts → Baled → Importer → Wholesale → Retail → Consumer", keywords: ["second-hand clothing", "mitumba", "Gikomba", "textile imports", "bale import"], dataApis: ["news"] },
      { id: "16.3", name: "Fashion Brands & Design", shortName: "Fashion Brands", description: "Design → sourcing → production → marketing → retail/e-commerce", moneyFlow: "Designer → Collection → Sourcing → Production → Marketing → Retail/E-commerce → Consumer", keywords: ["fashion brand", "fashion design", "African fashion", "clothing brand", "lookbook"], dataApis: ["news"] },
      { id: "16.4", name: "Shoe & Leather Industry", shortName: "Leather/Shoes", description: "Hides → tanning → leather products → retail", moneyFlow: "Livestock → Slaughterhouse → Hides → Tannery → Leather → Shoe/Bag Manufacturer → Retail", keywords: ["leather", "shoes", "tannery", "footwear", "Bata", "leather goods"], dataApis: ["news"] },
    ],
  },
  {
    id: 17,
    slug: "automotive",
    name: "Automotive",
    icon: "🚗",
    color: "zinc",
    description: "Vehicle manufacturing, parts supply, distribution, dealerships, insurance, leasing, EV transition.",
    subFlows: [
      { id: "17.1", name: "New Vehicle Distribution", shortName: "New Cars", description: "Manufacturer → regional distributor → national dealer → finance → consumer", moneyFlow: "Manufacturer → Regional Distributor → National Dealer → Finance → Consumer → After-Market", keywords: ["automotive", "Toyota", "car sales", "vehicle dealer", "franchise dealer"], dataApis: ["stocks", "news"] },
      { id: "17.2", name: "Used Vehicle Import", shortName: "Used Cars", description: "Japan auction → exporter → importer → clearing → dealer → consumer", moneyFlow: "Japan Auction → Exporter → Importer → KRA Duties (60-80% CIF) → Clearing → Dealer → Consumer", keywords: ["used cars", "vehicle import", "Japan auction", "car dealer", "Mombasa clearing"], dataApis: ["news"] },
      { id: "17.3", name: "Auto Parts & Service", shortName: "Parts/Service", description: "Parts manufacturer → importer → wholesaler → garage/mechanic → consumer", moneyFlow: "Parts Manufacturer → Importer → Wholesaler → Garage/Mechanic → Consumer", keywords: ["auto parts", "car repair", "spare parts", "aftermarket", "garage", "mechanic"], dataApis: ["news", "stocks"] },
      { id: "17.4", name: "Electric Vehicles (EV)", shortName: "EV", description: "EV import, charging stations, conversion, battery swap, e-boda", moneyFlow: "EV Import → Dealer → Consumer + Charging Infrastructure + Battery Swap/Service", keywords: ["electric vehicle", "EV", "BYD", "EV charging", "e-motorbike", "boda EV", "battery swap"], dataApis: ["stocks", "news"] },
      { id: "17.5", name: "Motor Insurance & Leasing", shortName: "Insurance/Lease", description: "Premium/lease payment → cover/usage → claims/return", moneyFlow: "Vehicle Owner → Insurance Premium/Lease Payment → Coverage/Usage → Claims/Return", keywords: ["motor insurance", "car leasing", "vehicle financing", "comprehensive cover", "IRA"], dataApis: ["news"] },
    ],
  },
  {
    id: 18,
    slug: "aerospace-defence",
    name: "Aerospace & Defence",
    icon: "✈️",
    color: "neutral",
    description: "Aircraft manufacturing, MRO, defence procurement, satellite, space, drones, security services.",
    subFlows: [
      { id: "18.1", name: "Civil Aviation", shortName: "Aviation", description: "Aircraft manufacturer → lessor → airline → airport → ground handler → fuel → MRO", moneyFlow: "Manufacturer (Boeing/Airbus) → Lessor → Airline → Airport Authority → Ground Handler → MRO → Fuel Supplier", keywords: ["Boeing", "Airbus", "aircraft", "MRO", "aviation", "Kenya Airways", "JKIA", "KCAA"], dataApis: ["stocks", "news", "flights"] },
      { id: "18.2", name: "Defence & Security", shortName: "Defence", description: "Government budget → procurement → defence contractor → equipment → deployment", moneyFlow: "Government Budget → Procurement → Defence Contractor → Equipment → Deployment", keywords: ["defence", "military", "security", "weapons", "procurement", "KDF"], dataApis: ["stocks", "news"] },
      { id: "18.3", name: "Space & Satellite", shortName: "Space", description: "Launch provider → satellite manufacturer → operator → service revenue", moneyFlow: "Launch Provider → Satellite Manufacturer → Operator → Service Revenue", keywords: ["SpaceX", "satellite", "space industry", "rocket launch", "Starlink", "earth observation"], dataApis: ["news", "stocks"] },
      { id: "18.4", name: "Drones & UAV", shortName: "Drones", description: "Drone manufacturing → operator → services (survey, delivery, agriculture)", moneyFlow: "Drone Manufacturer → Importer → Operator → Service Delivery (Survey/Spray/Delivery)", keywords: ["drone", "UAV", "aerial survey", "drone delivery", "precision agriculture", "KCAA drone licence"], dataApis: ["news"] },
      { id: "18.5", name: "Private Security", shortName: "Security", description: "Guard services, surveillance, risk consulting", moneyFlow: "Client → Security Contract → Guard Deployment/Technology → Monthly Fee", keywords: ["private security", "G4S", "security guard", "CCTV", "surveillance", "risk consulting"], dataApis: ["news"] },
    ],
  },
  {
    id: 19,
    slug: "consumer-electronics",
    name: "Consumer Electronics",
    icon: "📱",
    color: "lime",
    description: "Smartphone, TV, laptop, smart home, wearables, gaming equipment, distribution, repair, e-waste.",
    subFlows: [
      { id: "19.1", name: "Device Manufacturing & Assembly", shortName: "Manufacturing", description: "Components → assembly → brand → distribution → retail → consumer", moneyFlow: "Components → Assembly → Brand → Distribution → Retail → Consumer", keywords: ["electronics manufacturing", "consumer electronics", "Apple", "Samsung", "smartphone"], dataApis: ["stocks", "news"] },
      { id: "19.2", name: "Electronics Retail & Repair", shortName: "Retail/Repair", description: "Distributor → retailer → consumer → repair/recycling", moneyFlow: "Distributor → Retailer → Consumer → Repair/Recycling", keywords: ["electronics retail", "phone repair", "e-waste recycling", "Luthuli Avenue", "accessories"], dataApis: ["news"] },
      { id: "19.3", name: "Smart Home & IoT", shortName: "IoT", description: "Smart meters, solar IoT, CCTV, fleet tracking", moneyFlow: "Device Manufacturer → Importer → Installer → Consumer → Monthly Subscription", keywords: ["smart home", "IoT", "CCTV", "fleet tracking", "GPS tracker", "smart meter", "home automation"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 20,
    slug: "chemicals",
    name: "Chemicals & Petrochemicals",
    icon: "🧪",
    color: "yellow",
    description: "Extraction, refining, industrial chemicals, fertilisers, plastics, pharma chemicals, distribution.",
    subFlows: [
      { id: "20.1", name: "Industrial Chemicals", shortName: "Chemicals", description: "Feedstock → chemical plant → distribution → industrial consumer", moneyFlow: "Feedstock → Chemical Plant → Distribution → Industrial Consumer", keywords: ["chemicals", "petrochemicals", "industrial chemicals", "BASF", "Dow", "caustic soda", "chlorine"], dataApis: ["commodities", "stocks", "news"] },
      { id: "20.2", name: "Fertilisers & Agrochemicals", shortName: "Fertiliser", description: "Raw material → processing → product → distribution → farmer", moneyFlow: "Raw Material → Processing → Product → Distribution → Farmer/End User", keywords: ["fertiliser", "urea", "DAP", "NPK", "agrochemicals", "NCPB", "MEA"], dataApis: ["commodities", "news", "stocks"] },
      { id: "20.3", name: "Plastics & Polymers", shortName: "Plastics", description: "Petrochemical feedstock → polymer production → moulding → consumer products", moneyFlow: "Petrochemical Feedstock → Polymer Production → Moulding/Extrusion → Consumer Products", keywords: ["plastics", "polymer", "PET", "HDPE", "plastic manufacturing", "packaging"], dataApis: ["commodities", "news"] },
      { id: "20.4", name: "Pharmaceutical Chemicals", shortName: "Pharma Chem", description: "API synthesis → intermediate chemicals → finished pharmaceutical ingredients", moneyFlow: "Feedstock → Intermediate Chemicals → API Synthesis → Pharmaceutical Manufacturer", keywords: ["pharmaceutical chemicals", "API", "active pharmaceutical ingredient", "chemical synthesis"], dataApis: ["news", "stocks"] },
    ],
  },
  {
    id: 21,
    slug: "politics-government",
    name: "Politics & Government",
    icon: "🏛️",
    color: "red",
    description: "Elections, legislation, sanctions, trade policy, geopolitics, lobbying, public procurement, governance.",
    subFlows: [
      { id: "21.1", name: "Elections & Political Campaigns", shortName: "Elections", description: "Campaign funding → media spend → polling → election outcomes → policy shifts", moneyFlow: "Donors/PACs → Campaign → Media/Ad Spend → Polling → Election Outcome → Policy Shift", keywords: ["election", "voting", "campaign finance", "political party", "ballot", "polling", "democracy"], dataApis: ["news"] },
      { id: "21.2", name: "Legislation & Regulation", shortName: "Legislation", description: "Bill drafting → committee review → parliamentary debate → enactment → enforcement", moneyFlow: "Lobby Groups → Bill Drafting → Committee → Parliament/Congress → Enactment → Enforcement", keywords: ["legislation", "regulation", "parliament", "congress", "bill", "policy reform", "deregulation", "executive order"], dataApis: ["news"] },
      { id: "21.3", name: "Geopolitics & Diplomacy", shortName: "Geopolitics", description: "Bilateral/multilateral relations, sanctions, trade wars, alliances", moneyFlow: "Foreign Policy → Trade Agreements → Aid/Sanctions → Bilateral Relations → Market Impact", keywords: ["geopolitics", "sanctions", "trade war", "NATO", "BRICS", "G7", "G20", "diplomacy", "UN", "African Union"], dataApis: ["news"] },
      { id: "21.4", name: "Public Procurement & Government Spending", shortName: "Procurement", description: "Budget allocation → tender → award → execution → audit", moneyFlow: "Tax Revenue → Budget Allocation → Tender → Contract Award → Execution → Audit", keywords: ["government procurement", "tender", "public spending", "fiscal policy", "budget", "infrastructure spending", "PPP"], dataApis: ["news"] },
      { id: "21.5", name: "Lobbying & Interest Groups", shortName: "Lobbying", description: "Industry groups, think tanks, PACs influencing policy", moneyFlow: "Industry/Corporation → Lobby Firm → Political Access → Policy Influence → Regulatory Outcome", keywords: ["lobbying", "interest group", "think tank", "PAC", "political donation", "corporate influence"], dataApis: ["news"] },
      { id: "21.6", name: "Governance & Anti-Corruption", shortName: "Governance", description: "Transparency, anti-corruption agencies, judicial independence", moneyFlow: "Public Funds → Government Institutions → Oversight Bodies → Accountability", keywords: ["corruption", "governance", "transparency", "anti-corruption", "EACC", "whistleblower", "judicial reform", "rule of law"], dataApis: ["news"] },
      { id: "21.7", name: "Tax Policy & Revenue", shortName: "Tax Policy", description: "Tax legislation, collection, compliance, incentives", moneyFlow: "Economic Activity → Tax Assessment → Collection → Revenue Authority → Government Budget", keywords: ["tax policy", "KRA", "IRS", "VAT", "income tax", "tax incentive", "tax haven", "digital tax"], dataApis: ["news"] },
    ],
  },
  {
    id: 22,
    slug: "climate-sustainability",
    name: "Climate & Sustainability",
    icon: "🌍",
    color: "emerald",
    description: "Climate policy, ESG investing, carbon markets, green bonds, climate adaptation, disaster preparedness.",
    subFlows: [
      { id: "22.1", name: "Climate Policy & Agreements", shortName: "Climate Policy", description: "International negotiations, NDCs, net-zero commitments", moneyFlow: "COP Negotiations → National Commitments → Policy Implementation → Market Shifts", keywords: ["climate change", "COP", "Paris Agreement", "net zero", "NDC", "climate policy", "IPCC"], dataApis: ["news"] },
      { id: "22.2", name: "ESG & Sustainable Finance", shortName: "ESG", description: "ESG ratings, green bonds, impact investing, sustainability reporting", moneyFlow: "ESG Framework → Rating Agencies → Investor Allocation → Green Instruments → Impact", keywords: ["ESG", "sustainable finance", "green bond", "impact investing", "sustainability reporting", "TCFD"], dataApis: ["news", "stocks"] },
      { id: "22.3", name: "Disaster & Climate Adaptation", shortName: "Adaptation", description: "Early warning, resilience infrastructure, insurance, recovery", moneyFlow: "Risk Assessment → Insurance/Aid → Early Warning → Response → Recovery → Rebuild", keywords: ["climate adaptation", "flood", "drought", "disaster preparedness", "resilience", "humanitarian", "El Nino", "La Nina"], dataApis: ["news"] },
      { id: "22.4", name: "Circular Economy & Waste-to-Value", shortName: "Circular", description: "Reduce, reuse, recycle, upcycling, waste-to-energy", moneyFlow: "Waste Collection → Sorting → Processing → Recycled Material → Manufacturing → Consumer", keywords: ["circular economy", "recycling", "upcycling", "waste-to-energy", "plastic credits", "extended producer responsibility"], dataApis: ["news"] },
    ],
  },
  {
    id: 23,
    slug: "sports-leisure",
    name: "Sports & Leisure",
    icon: "⚽",
    color: "orange",
    description: "Professional sports, leagues, betting, sponsorships, fitness, esports, sports media rights.",
    subFlows: [
      { id: "23.1", name: "Professional Sports & Leagues", shortName: "Pro Sports", description: "Player contracts, transfer fees, league revenue, broadcasting rights", moneyFlow: "Broadcasting Rights → Sponsorship → Ticket Sales → Player Salaries → Agent Fees", keywords: ["Premier League", "NFL", "NBA", "FIFA", "CAF", "athletics", "rugby", "cricket", "transfer fee"], dataApis: ["news"] },
      { id: "23.2", name: "Sports Betting & Gaming", shortName: "Betting", description: "Betting platforms, regulation, odds, market manipulation", moneyFlow: "Bettor → Platform → Odds Engine → Payout/Revenue → Tax → Regulator", keywords: ["sports betting", "Betika", "SportPesa", "DraftKings", "gambling regulation", "odds", "bookmaker"], dataApis: ["news"] },
      { id: "23.3", name: "Sponsorship & Sports Marketing", shortName: "Sponsorship", description: "Brand partnerships, athlete endorsements, stadium naming rights", moneyFlow: "Brand → Agency → Athlete/Team/Event → Exposure → Consumer Impact", keywords: ["sponsorship", "endorsement", "Nike", "Adidas", "sports marketing", "naming rights"], dataApis: ["news"] },
      { id: "23.4", name: "Fitness & Wellness", shortName: "Fitness", description: "Gyms, wellness apps, supplements, health tourism", moneyFlow: "Consumer → Gym/App Subscription → Equipment/Supplements → Trainer/Content", keywords: ["fitness", "gym", "wellness", "Peloton", "health supplements", "yoga", "marathon"], dataApis: ["news"] },
    ],
  },
  {
    id: 24,
    slug: "non-profit-development",
    name: "Non-Profit & Development",
    icon: "🤝",
    color: "sky",
    description: "International development, NGOs, philanthropy, humanitarian aid, social enterprise, multilateral institutions.",
    subFlows: [
      { id: "24.1", name: "International Aid & Multilaterals", shortName: "Aid", description: "Donor funding, multilateral programs, development finance", moneyFlow: "Donor Government → Multilateral (UN/WB/IMF) → Country Program → Implementing Partner → Beneficiary", keywords: ["USAID", "World Bank", "IMF", "UNDP", "foreign aid", "development finance", "bilateral aid"], dataApis: ["news"] },
      { id: "24.2", name: "NGOs & Civil Society", shortName: "NGOs", description: "Charitable organizations, advocacy, community development", moneyFlow: "Donors/Grants → NGO → Programs → Community Impact → Reporting", keywords: ["NGO", "civil society", "charity", "Gates Foundation", "Oxfam", "Red Cross", "philanthropy"], dataApis: ["news"] },
      { id: "24.3", name: "Social Enterprise & Impact", shortName: "Social Enterprise", description: "Hybrid businesses with social missions, B-Corps", moneyFlow: "Impact Investor → Social Enterprise → Revenue + Impact → Scale → Returns + Social Good", keywords: ["social enterprise", "B-Corp", "impact measurement", "SDGs", "social innovation"], dataApis: ["news"] },
      { id: "24.4", name: "Humanitarian & Emergency Response", shortName: "Humanitarian", description: "Disaster response, refugee support, crisis management", moneyFlow: "Crisis → Appeal → Donor Response → Agency Deployment → Relief Distribution", keywords: ["humanitarian", "refugee", "UNHCR", "disaster relief", "famine", "emergency response", "crisis"], dataApis: ["news"] },
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
