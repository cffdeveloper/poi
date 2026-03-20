export type AlertLevel = "critical" | "high" | "medium" | "info";

export type Alert = {
  level: AlertLevel;
  domain: string;
  title: string;
  detail: string;
  time: number;
};

export type Flight = {
  callsign: string;
  country: string;
  longitude: number;
  latitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  on_ground: boolean;
};

export type CryptoAsset = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  change_1h: number | null;
  change_24h: number | null;
  change_7d: number | null;
  high_24h: number;
  low_24h: number;
  ath: number;
  ath_change: number;
  image: string;
  rank: number;
};

export type Earthquake = {
  magnitude: number;
  place: string;
  time: number;
  tsunami: number;
  significance: number;
  type: string;
  coordinates: [number, number, number];
  alert: string | null;
  felt: number | null;
  url: string;
};

export type ForexData = {
  base: string;
  rates: Record<string, number>;
  updated: string;
};

export type WeatherCity = {
  city: string;
  temperature: number;
  wind_speed: number;
  weather_code: number;
};

export type ISSPosition = {
  latitude: number;
  longitude: number;
};

export type SpaceWeatherEvent = {
  type: string;
  body: string;
  url: string;
  id: string;
  issued: string;
};

export type APOD = {
  title: string;
  url: string;
  explanation: string;
  date: string;
  media_type: string;
};

export type SpaceXLaunch = {
  name: string;
  date: string;
  rocket: string;
  details: string | null;
  flight_number: number;
};

export type FireHotspot = {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: string;
  acq_date: string;
  satellite: string;
  country?: string;
};

export type ConflictEvent = {
  source: string;
  title: string;
  url: string;
  date: string;
  country?: string;
  type?: string;
};

export type InfrastructureAsset = {
  name: string;
  type: "cable" | "pipeline" | "waterway" | "base" | "nuclear";
  lat?: number;
  lng?: number;
  detail: string;
  status?: string;
};

export type IntelFeed = {
  timestamp: string;
  alerts: Alert[];
  intel: {
    flights: Flight[];
    crypto: CryptoAsset[];
    earthquakes: Earthquake[];
    forex: ForexData;
    weather: WeatherCity[];
    iss: ISSPosition | null;
    space_weather: SpaceWeatherEvent[];
    apod: APOD | null;
    spacex: SpaceXLaunch[];
    fires: FireHotspot[];
    conflicts: ConflictEvent[];
    infrastructure: InfrastructureAsset[];
  };
  sources_status: Record<string, boolean>;
};
