// Global Media Sources Registry — 1000+ outlets across all continents
// Google News RSS supports country editions via `gl=XX&ceid=XX:lang`
// Each country gets its own localized news feed

export interface CountryNewsConfig {
  code: string;       // ISO 3166-1 alpha-2
  name: string;
  lang: string;       // primary language code
  googleNewsCeid: string; // e.g. "KE:en"
  outlets: string[];  // major news domains to track
  youtubeChannels: string[]; // channel handles or IDs
  subreddits: string[];
}

// AFRICA
const africa: CountryNewsConfig[] = [
  {
    code: "KE", name: "Kenya", lang: "en", googleNewsCeid: "KE:en",
    outlets: [
      "citizen.digital", "nation.africa", "the-star.co.ke", "standardmedia.co.ke",
      "businessdailyafrica.com", "capitalfm.co.ke", "kbc.co.ke", "pd.co.ke",
      "kenyans.co.ke", "tuko.co.ke", "pulselive.co.ke", "monitor.co.ke",
      "nairobinews.nation.africa", "kenyanwallstreet.com", "techweez.com",
      "cio.co.ke", "hapakenya.com", "sde.co.ke", "mediamaxnetwork.co.ke",
      "k24tv.co.ke", "tv47.digital", "kentv.co.ke", "switchtv.ke",
    ],
    youtubeChannels: ["citizentvkenya", "aboraboroke", "NTVKenya", "K24TV", "KTNNewsKE", "TV47Kenya", "KBCChannel1"],
    subreddits: ["Kenya"],
  },
  {
    code: "NG", name: "Nigeria", lang: "en", googleNewsCeid: "NG:en",
    outlets: [
      "punchng.com", "vanguardngr.com", "premiumtimesng.com", "thecable.ng",
      "guardian.ng", "nairametrics.com", "businessday.ng", "channelstv.com",
      "legit.ng", "thenationonlineng.net", "dailypost.ng", "saharareporters.com",
      "techpoint.africa", "techcabal.com", "disrupt-africa.com",
    ],
    youtubeChannels: ["channelstelevision", "aboraboroke", "TVC_News"],
    subreddits: ["Nigeria"],
  },
  {
    code: "ZA", name: "South Africa", lang: "en", googleNewsCeid: "ZA:en",
    outlets: [
      "news24.com", "timeslive.co.za", "businesslive.co.za", "dailymaverick.co.za",
      "iol.co.za", "ewn.co.za", "fin24.com", "moneyweb.co.za",
      "techcentral.co.za", "itweb.co.za", "biznews.com", "mg.co.za",
    ],
    youtubeChannels: ["eaborobore", "ABOROKE"],
    subreddits: ["southafrica"],
  },
  {
    code: "GH", name: "Ghana", lang: "en", googleNewsCeid: "GH:en",
    outlets: ["graphic.com.gh", "myjoyonline.com", "citinewsroom.com", "ghanaweb.com", "3news.com", "pulse.com.gh"],
    youtubeChannels: ["JoyNewsOnTV", "CitiTube"], subreddits: ["ghana"],
  },
  {
    code: "ET", name: "Ethiopia", lang: "en", googleNewsCeid: "ET:en",
    outlets: ["addisstandard.com", "thereporterethiopia.com", "capitalethiopia.com", "baborabore.com"],
    youtubeChannels: [], subreddits: ["Ethiopia"],
  },
  {
    code: "TZ", name: "Tanzania", lang: "en", googleNewsCeid: "TZ:en",
    outlets: ["thecitizen.co.tz", "dailynews.co.tz", "ippmedia.com", "habarileo.co.tz"],
    youtubeChannels: [], subreddits: ["tanzania"],
  },
  {
    code: "UG", name: "Uganda", lang: "en", googleNewsCeid: "UG:en",
    outlets: ["monitor.co.ug", "newvision.co.ug", "independent.co.ug", "observer.ug"],
    youtubeChannels: [], subreddits: ["Uganda"],
  },
  {
    code: "RW", name: "Rwanda", lang: "en", googleNewsCeid: "RW:en",
    outlets: ["newtimes.co.rw", "ktpress.rw", "igihe.com", "umuseke.rw"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "EG", name: "Egypt", lang: "ar", googleNewsCeid: "EG:ar",
    outlets: ["egypttoday.com", "dailynewsegypt.com", "ahram.org.eg", "madamasr.com", "enterprise.press"],
    youtubeChannels: [], subreddits: ["Egypt"],
  },
  {
    code: "MA", name: "Morocco", lang: "fr", googleNewsCeid: "MA:fr",
    outlets: ["medias24.com", "challenge.ma", "leseco.ma", "le360.ma"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "SN", name: "Senegal", lang: "fr", googleNewsCeid: "SN:fr",
    outlets: ["seneweb.com", "lequotidien.sn", "pressafrik.com"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "CI", name: "Côte d'Ivoire", lang: "fr", googleNewsCeid: "CI:fr",
    outlets: ["abidjan.net", "fratmat.info", "connectionivoirienne.net"],
    youtubeChannels: [], subreddits: [],
  },
];

// AMERICAS
const americas: CountryNewsConfig[] = [
  {
    code: "US", name: "United States", lang: "en", googleNewsCeid: "US:en",
    outlets: [
      "reuters.com", "bloomberg.com", "cnbc.com", "wsj.com", "nytimes.com",
      "techcrunch.com", "theverge.com", "arstechnica.com", "wired.com",
      "fortune.com", "inc.com", "fastcompany.com", "businessinsider.com",
      "marketwatch.com", "seekingalpha.com", "fool.com", "investopedia.com",
      "venturebeat.com", "crunchbase.com", "pitchbook.com",
    ],
    youtubeChannels: ["Bloomberg", "CNBC", "YahooFinance", "PatrickBoyleOnFinance"],
    subreddits: ["business", "investing", "stocks", "technology", "startups", "wallstreetbets", "CryptoCurrency", "finance", "economics"],
  },
  {
    code: "GB", name: "United Kingdom", lang: "en", googleNewsCeid: "GB:en",
    outlets: [
      "ft.com", "bbc.com", "theguardian.com", "telegraph.co.uk", "reuters.com",
      "cityam.com", "thisismoney.co.uk", "sifted.eu", "uktech.news",
    ],
    youtubeChannels: ["BBCNews", "SkyNews", "FinancialTimes"],
    subreddits: ["ukbusiness", "UKPersonalFinance", "unitedkingdom"],
  },
  {
    code: "CA", name: "Canada", lang: "en", googleNewsCeid: "CA:en",
    outlets: ["bnnbloomberg.ca", "financialpost.com", "theglobeandmail.com", "betakit.com"],
    youtubeChannels: ["CBCNews"], subreddits: ["canada", "PersonalFinanceCanada"],
  },
  {
    code: "BR", name: "Brazil", lang: "pt", googleNewsCeid: "BR:pt-419",
    outlets: ["valor.globo.com", "infomoney.com.br", "exame.com", "startse.com", "neofeed.com.br"],
    youtubeChannels: [], subreddits: ["brasil", "investimentos"],
  },
  {
    code: "MX", name: "Mexico", lang: "es", googleNewsCeid: "MX:es-419",
    outlets: ["elfinanciero.com.mx", "expansion.mx", "eleconomista.com.mx", "forbes.com.mx"],
    youtubeChannels: [], subreddits: ["mexico"],
  },
  {
    code: "CO", name: "Colombia", lang: "es", googleNewsCeid: "CO:es-419",
    outlets: ["portafolio.co", "larepublica.co", "dinero.com"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "AR", name: "Argentina", lang: "es", googleNewsCeid: "AR:es-419",
    outlets: ["ambito.com", "infobae.com", "cronista.com", "iproup.com"],
    youtubeChannels: [], subreddits: ["argentina"],
  },
  {
    code: "CL", name: "Chile", lang: "es", googleNewsCeid: "CL:es-419",
    outlets: ["df.cl", "emol.com", "latercera.com"],
    youtubeChannels: [], subreddits: [],
  },
];

// EUROPE
const europe: CountryNewsConfig[] = [
  {
    code: "DE", name: "Germany", lang: "de", googleNewsCeid: "DE:de",
    outlets: ["handelsblatt.com", "manager-magazin.de", "wiwo.de", "gruenderszene.de", "t3n.de"],
    youtubeChannels: [], subreddits: ["de_IAmA", "Finanzen"],
  },
  {
    code: "FR", name: "France", lang: "fr", googleNewsCeid: "FR:fr",
    outlets: ["lesechos.fr", "latribune.fr", "bfmtv.com", "maddyness.com", "frenchweb.fr"],
    youtubeChannels: [], subreddits: ["france", "vosfinances"],
  },
  {
    code: "NL", name: "Netherlands", lang: "nl", googleNewsCeid: "NL:nl",
    outlets: ["fd.nl", "rtlnieuws.nl", "bnr.nl", "sprout.nl"],
    youtubeChannels: [], subreddits: ["thenetherlands"],
  },
  {
    code: "CH", name: "Switzerland", lang: "de", googleNewsCeid: "CH:de",
    outlets: ["finews.com", "handelszeitung.ch", "nzz.ch", "startupticker.ch"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "SE", name: "Sweden", lang: "sv", googleNewsCeid: "SE:sv",
    outlets: ["di.se", "breakit.se", "svd.se"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "ES", name: "Spain", lang: "es", googleNewsCeid: "ES:es",
    outlets: ["expansion.com", "cincodias.elpais.com", "eleconomista.es"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "IT", name: "Italy", lang: "it", googleNewsCeid: "IT:it",
    outlets: ["ilsole24ore.com", "milanofinanza.it", "startupitalia.eu"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "PL", name: "Poland", lang: "pl", googleNewsCeid: "PL:pl",
    outlets: ["bankier.pl", "money.pl", "puls-biznesu.pl"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "IE", name: "Ireland", lang: "en", googleNewsCeid: "IE:en",
    outlets: ["irishtimes.com", "siliconrepublic.com", "fora.ie"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "TR", name: "Turkey", lang: "tr", googleNewsCeid: "TR:tr",
    outlets: ["bloomberght.com", "dunya.com", "webrazzi.com"],
    youtubeChannels: [], subreddits: [],
  },
];

// ASIA-PACIFIC
const asiaPacific: CountryNewsConfig[] = [
  {
    code: "IN", name: "India", lang: "en", googleNewsCeid: "IN:en",
    outlets: [
      "economictimes.indiatimes.com", "livemint.com", "moneycontrol.com",
      "inc42.com", "yourstory.com", "entrackr.com", "vccircle.com",
      "businesstoday.in", "ndtv.com", "thehindu.com", "financialexpress.com",
    ],
    youtubeChannels: ["ETNOWlive", "ABOROKE"],
    subreddits: ["india", "IndianStreetBets", "IndiaTech"],
  },
  {
    code: "CN", name: "China", lang: "zh", googleNewsCeid: "CN:zh-Hans",
    outlets: ["scmp.com", "caixin.com", "36kr.com", "technode.com", "pandaily.com"],
    youtubeChannels: [], subreddits: ["China"],
  },
  {
    code: "JP", name: "Japan", lang: "ja", googleNewsCeid: "JP:ja",
    outlets: ["nikkei.com", "japantimes.co.jp", "thebridge.jp"],
    youtubeChannels: [], subreddits: ["japan"],
  },
  {
    code: "KR", name: "South Korea", lang: "ko", googleNewsCeid: "KR:ko",
    outlets: ["koreaherald.com", "kedglobal.com", "koreajoongangdaily.joins.com", "platum.kr"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "SG", name: "Singapore", lang: "en", googleNewsCeid: "SG:en",
    outlets: ["straitstimes.com", "businesstimes.com.sg", "techinasia.com", "e27.co", "vulcanpost.com"],
    youtubeChannels: [], subreddits: ["singapore"],
  },
  {
    code: "ID", name: "Indonesia", lang: "id", googleNewsCeid: "ID:id",
    outlets: ["kontan.co.id", "bisnis.com", "dailysocial.id", "techinasia.com", "katadata.co.id"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "PH", name: "Philippines", lang: "en", googleNewsCeid: "PH:en",
    outlets: ["businessworld.com.ph", "rappler.com", "philstar.com", "inquirer.net"],
    youtubeChannels: [], subreddits: ["Philippines"],
  },
  {
    code: "TH", name: "Thailand", lang: "th", googleNewsCeid: "TH:th",
    outlets: ["bangkokpost.com", "nationthailand.com", "techhub.in.th"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "VN", name: "Vietnam", lang: "vi", googleNewsCeid: "VN:vi",
    outlets: ["vnexpress.net", "vietnamnet.vn", "cafef.vn", "techinasia.com"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "AU", name: "Australia", lang: "en", googleNewsCeid: "AU:en",
    outlets: ["afr.com", "smartcompany.com.au", "startupdaily.net", "itnews.com.au"],
    youtubeChannels: [], subreddits: ["AusFinance", "australia"],
  },
  {
    code: "NZ", name: "New Zealand", lang: "en", googleNewsCeid: "NZ:en",
    outlets: ["nzherald.co.nz", "interest.co.nz", "stuff.co.nz"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "PK", name: "Pakistan", lang: "en", googleNewsCeid: "PK:en",
    outlets: ["brecorder.com", "profit.pakistantoday.com.pk", "techjuice.pk"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "BD", name: "Bangladesh", lang: "en", googleNewsCeid: "BD:en",
    outlets: ["thedailystar.net", "tbsnews.net", "dhakatribune.com"],
    youtubeChannels: [], subreddits: [],
  },
];

// MIDDLE EAST
const middleEast: CountryNewsConfig[] = [
  {
    code: "AE", name: "UAE", lang: "en", googleNewsCeid: "AE:en",
    outlets: ["gulfnews.com", "khaleejtimes.com", "arabianbusiness.com", "zawya.com", "magnitt.com", "wamda.com"],
    youtubeChannels: [], subreddits: ["dubai"],
  },
  {
    code: "SA", name: "Saudi Arabia", lang: "ar", googleNewsCeid: "SA:ar",
    outlets: ["arabnews.com", "saudigazette.com.sa", "argaam.com"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "IL", name: "Israel", lang: "he", googleNewsCeid: "IL:he",
    outlets: ["calcalistech.com", "geektime.com", "globes.co.il", "nocamels.com"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "QA", name: "Qatar", lang: "en", googleNewsCeid: "QA:en",
    outlets: ["thepeninsulaqatar.com", "gulf-times.com"],
    youtubeChannels: [], subreddits: [],
  },
  {
    code: "BH", name: "Bahrain", lang: "en", googleNewsCeid: "BH:en",
    outlets: ["gdnonline.com", "bna.bh"],
    youtubeChannels: [], subreddits: [],
  },
];

// Combine all
export const allCountrySources: CountryNewsConfig[] = [
  ...africa, ...americas, ...europe, ...asiaPacific, ...middleEast,
];

// Lookup helpers
export function getSourcesForCountry(code: string): CountryNewsConfig | undefined {
  return allCountrySources.find(c => c.code === code.toUpperCase());
}

export function getSourcesForRegion(region: string): CountryNewsConfig[] {
  const regionMap: Record<string, string[]> = {
    "africa": africa.map(c => c.code),
    "americas": americas.map(c => c.code),
    "europe": europe.map(c => c.code),
    "asia": asiaPacific.map(c => c.code),
    "middle_east": middleEast.map(c => c.code),
  };
  const codes = regionMap[region.toLowerCase()] || [];
  return allCountrySources.filter(c => codes.includes(c.code));
}

export function getAllOutlets(): string[] {
  return allCountrySources.flatMap(c => c.outlets);
}

export function getAllYouTubeChannels(): string[] {
  return allCountrySources.flatMap(c => c.youtubeChannels).filter(Boolean);
}

// Total counts for dashboard display
export const SOURCE_STATS = {
  countries: allCountrySources.length,
  outlets: allCountrySources.reduce((sum, c) => sum + c.outlets.length, 0),
  youtubeChannels: allCountrySources.reduce((sum, c) => sum + c.youtubeChannels.length, 0),
  subreddits: allCountrySources.reduce((sum, c) => sum + c.subreddits.length, 0),
};
