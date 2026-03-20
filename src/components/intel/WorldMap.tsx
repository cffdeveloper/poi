import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, Zap } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGeoContext } from "@/contexts/GeoContext";
import { useNavigate } from "react-router-dom";
import { RegionAnalyticsDialog } from "./RegionAnalyticsDialog";

const REGIONS: { name: string; lat: number; lng: number; label: string; code: string; industries: string[]; tradeVolume: string; disruptions: string[] }[] = [
  { name: "North America", lat: 40, lng: -100, label: "NA", code: "NA", industries: ["technology", "finance", "healthcare", "energy", "media"], tradeVolume: "$8.2T", disruptions: ["AI regulation wave", "Fed rate decisions"] },
  { name: "South America", lat: -15, lng: -60, label: "SA", code: "SA", industries: ["agriculture", "mining", "energy", "manufacturing"], tradeVolume: "$1.4T", disruptions: ["Lithium demand surge", "Deforestation policy"] },
  { name: "Europe", lat: 50, lng: 10, label: "EU", code: "EU", industries: ["finance", "automotive", "manufacturing", "technology", "fashion"], tradeVolume: "$6.8T", disruptions: ["EU AI Act enforcement", "Energy transition"] },
  { name: "Africa", lat: 5, lng: 20, label: "AF", code: "AF", industries: ["mining", "agriculture", "telecommunications", "finance", "energy"], tradeVolume: "$0.7T", disruptions: ["AfCFTA trade growth", "Mobile money expansion"] },
  { name: "Middle East", lat: 28, lng: 45, label: "ME", code: "ME", industries: ["energy", "construction", "finance", "aviation", "tourism"], tradeVolume: "$2.1T", disruptions: ["Oil diversification", "Vision 2030 projects"] },
  { name: "South Asia", lat: 22, lng: 78, label: "SAS", code: "SAS", industries: ["technology", "pharmaceuticals", "textiles", "agriculture", "finance"], tradeVolume: "$1.8T", disruptions: ["UPI global expansion", "Generic pharma boom"] },
  { name: "East Asia", lat: 35, lng: 115, label: "EA", code: "EA", industries: ["technology", "manufacturing", "semiconductors", "automotive", "ecommerce"], tradeVolume: "$9.5T", disruptions: ["Chip export controls", "EV price war"] },
  { name: "Southeast Asia", lat: 5, lng: 110, label: "SEA", code: "SEA", industries: ["manufacturing", "tourism", "agriculture", "technology", "textiles"], tradeVolume: "$1.9T", disruptions: ["Supply chain relocation", "Digital economy boom"] },
  { name: "Oceania", lat: -28, lng: 135, label: "OC", code: "OC", industries: ["mining", "agriculture", "technology", "tourism", "energy"], tradeVolume: "$0.6T", disruptions: ["Critical minerals demand", "Climate adaptation"] },
];

const FLOWS: { from: string; to: string; label: string; color: string; volume: string }[] = [
  { from: "East Asia", to: "North America", label: "Tech Hardware", color: "hsl(35, 100%, 55%)", volume: "$680B" },
  { from: "Middle East", to: "Europe", label: "Energy/Oil", color: "hsl(0, 85%, 55%)", volume: "$420B" },
  { from: "Africa", to: "East Asia", label: "Raw Materials", color: "hsl(155, 70%, 45%)", volume: "$180B" },
  { from: "North America", to: "Europe", label: "Software/SaaS", color: "hsl(200, 80%, 50%)", volume: "$340B" },
  { from: "South America", to: "North America", label: "Agriculture", color: "hsl(120, 60%, 40%)", volume: "$95B" },
  { from: "Southeast Asia", to: "Europe", label: "Textiles", color: "hsl(280, 60%, 55%)", volume: "$120B" },
  { from: "Europe", to: "Africa", label: "Financial Services", color: "hsl(210, 70%, 50%)", volume: "$85B" },
  { from: "Middle East", to: "South Asia", label: "Construction", color: "hsl(25, 90%, 50%)", volume: "$65B" },
  { from: "East Asia", to: "Southeast Asia", label: "Telecom Infra", color: "hsl(190, 80%, 45%)", volume: "$45B" },
  { from: "North America", to: "South Asia", label: "IT Services/BPO", color: "hsl(170, 60%, 45%)", volume: "$210B" },
  { from: "Oceania", to: "East Asia", label: "Mining/LNG", color: "hsl(45, 90%, 50%)", volume: "$130B" },
  { from: "South Asia", to: "Middle East", label: "Labor/Remittance", color: "hsl(300, 50%, 50%)", volume: "$75B" },
];

function getRegion(name: string) {
  return REGIONS.find(r => r.name === name);
}

export function WorldMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeDisruptions, setActiveDisruptions] = useState<typeof REGIONS[0]["disruptions"]>([]);
  const [selectedRegion, setSelectedRegion] = useState<typeof REGIONS[0] | null>(null);
  const navigate = useNavigate();
  const { addSelection } = useGeoContext();

  const handleRegionClick = useCallback((region: typeof REGIONS[0]) => {
    addSelection({ value: region.code, label: region.name, type: "continent" });
    setSelectedRegion(region);
  }, [addSelection]);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 20],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
      worldCopyJump: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 8, opacity: 0.6, subdomains: "abcd" }
    ).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png",
      { maxZoom: 8, opacity: 0.4, subdomains: "abcd" }
    ).addTo(map);

    // Region markers — interactive
    REGIONS.forEach(region => {
      // Outer pulse ring
      const pulseRing = L.circleMarker([region.lat, region.lng], {
        radius: 22,
        fillColor: "hsl(35, 100%, 55%)",
        fillOpacity: 0.06,
        color: "hsl(35, 100%, 55%)",
        weight: 1,
        opacity: 0.15,
        className: "animate-pulse",
      }).addTo(map);

      // Inner marker
      const marker = L.circleMarker([region.lat, region.lng], {
        radius: 7,
        fillColor: "hsl(35, 100%, 55%)",
        fillOpacity: 0.8,
        color: "hsl(35, 100%, 55%)",
        weight: 2,
        opacity: 1,
      }).addTo(map);

      // Disruption indicator (red pulse if disruptions)
      if (region.disruptions.length > 0) {
        L.circleMarker([region.lat + 2, region.lng + 3], {
          radius: 4,
          fillColor: "hsl(0, 85%, 55%)",
          fillOpacity: 0.9,
          color: "hsl(0, 85%, 55%)",
          weight: 1,
          opacity: 0.8,
          className: "animate-pulse",
        }).addTo(map);
      }

      const tooltipContent = `
        <div style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; min-width: 180px;">
          <div style="color: hsl(35, 100%, 55%); font-weight: 700; font-size: 11px; margin-bottom: 4px;">${region.name}</div>
          <div style="color: hsl(200, 20%, 70%); margin-bottom: 3px;">Trade Volume: <span style="color: hsl(200, 20%, 92%); font-weight: 600;">${region.tradeVolume}</span></div>
          <div style="color: hsl(200, 20%, 70%); margin-bottom: 2px;">Top Industries:</div>
          <div style="color: hsl(200, 20%, 85%); font-size: 9px;">${region.industries.slice(0, 3).join(" · ")}</div>
          ${region.disruptions.length ? `<div style="color: hsl(0, 85%, 65%); margin-top: 4px; font-size: 9px;">⚡ ${region.disruptions[0]}</div>` : ''}
          <div style="color: hsl(35, 100%, 55%); margin-top: 4px; font-size: 9px; opacity: 0.7;">Click to filter →</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        className: "map-tooltip",
        direction: "top",
        offset: [0, -12],
      });

      marker.on("click", () => handleRegionClick(region));
      pulseRing.on("click", () => handleRegionClick(region));

      marker.on("mouseover", () => setHoveredRegion(region.name));
      marker.on("mouseout", () => setHoveredRegion(null));
    });

    // Flow lines
    FLOWS.forEach(flow => {
      const from = getRegion(flow.from);
      const to = getRegion(flow.to);
      if (!from || !to) return;

      const midLat = (from.lat + to.lat) / 2 + 8;
      const midLng = (from.lng + to.lng) / 2;

      const points: L.LatLngExpression[] = [];
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = (1 - t) * (1 - t) * from.lat + 2 * (1 - t) * t * midLat + t * t * to.lat;
        const lng = (1 - t) * (1 - t) * from.lng + 2 * (1 - t) * t * midLng + t * t * to.lng;
        points.push([lat, lng]);
      }

      const line = L.polyline(points, {
        color: flow.color,
        weight: 1.2,
        opacity: 0.35,
        dashArray: "4 6",
      }).addTo(map);

      line.bindTooltip(
        `<div style="font-family: 'IBM Plex Mono', monospace; font-size: 9px;">
          <span style="color: hsl(35, 100%, 55%)">${flow.from}</span> → <span style="color: hsl(35, 100%, 55%)">${flow.to}</span><br/>
          <span style="font-weight: 600">${flow.label}</span> · ${flow.volume}
        </div>`,
        { className: "map-tooltip", sticky: true }
      );

      // Arrow endpoint
      const lastPt = points[points.length - 1] as [number, number];
      L.circleMarker(lastPt, {
        radius: 2.5,
        fillColor: flow.color,
        fillOpacity: 0.7,
        color: flow.color,
        weight: 1,
      }).addTo(map);
    });

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, [handleRegionClick]);

  // Rotate disruptions
  useEffect(() => {
    const allDisruptions = REGIONS.flatMap(r => r.disruptions.map(d => ({ region: r.name, text: d })));
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % allDisruptions.length;
      setActiveDisruptions([`${allDisruptions[idx].region}: ${allDisruptions[idx].text}`]);
    }, 4000);
    setActiveDisruptions([`${allDisruptions[0].region}: ${allDisruptions[0].text}`]);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel overflow-hidden">
      {/* Header bar */}
      <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span className="terminal-header">GLOBAL FLOW MAP</span>
          <span className="text-[9px] text-muted-foreground">LIVE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        {activeDisruptions[0] && (
          <div className="flex items-center gap-1.5 text-[9px] text-destructive">
            <Zap className="w-3 h-3" />
            <span className="animate-fade-in-up">{activeDisruptions[0]}</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-[380px]"
        style={{ background: "hsl(220 20% 4%)" }}
      />

      {/* Legend bar */}
      <div className="px-3 py-2 border-t border-border/50 flex flex-wrap gap-x-4 gap-y-1">
        {FLOWS.slice(0, 8).map((flow, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 cursor-default"
          >
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: flow.color }} />
            <span className="text-[8px] text-muted-foreground">{flow.label}</span>
            <span className="text-[8px] text-foreground font-semibold">{flow.volume}</span>
          </div>
        ))}
      </div>

      {/* Region analytics popup */}
      <RegionAnalyticsDialog
        open={!!selectedRegion}
        onClose={() => setSelectedRegion(null)}
        region={selectedRegion}
      />
    </div>
  );
}
