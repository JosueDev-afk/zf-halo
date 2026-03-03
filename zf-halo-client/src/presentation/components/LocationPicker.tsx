"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import { Button } from "@/presentation/components/ui/button";

// Dynamically loaded to avoid SSR issues
let L: typeof import("leaflet");

export interface LocationValue {
  lat: number;
  lng: number;
  displayName: string;
}

interface LocationPickerProps {
  value?: LocationValue | null;
  onChange: (location: LocationValue | null) => void;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [ready, setReady] = useState(false);

  // Default to CDMX if no value
  const defaultLat = value?.lat ?? 19.4326;
  const defaultLng = value?.lng ?? -99.1332;

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      // Dynamic import so it doesn't break SSR / Vite tree-shaking
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix default icon paths broken by bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setReady(true);

      cleanup = () => {
        map.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      };
    };

    void init();
    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "es" } },
      );
      const data = (await res.json()) as { display_name?: string };
      onChange({
        lat,
        lng,
        displayName:
          data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      });
    } catch {
      onChange({
        lat,
        lng,
        displayName: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      });
    }
  };

  const handleSearch = async () => {
    if (!search.trim() || !ready) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
        { headers: { "Accept-Language": "es" } },
      );
      const results = (await res.json()) as NominatimResult[];
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };
        mapInstanceRef.current?.setView([latlng.lat, latlng.lng], 16);
        markerRef.current?.setLatLng(latlng);
        onChange({
          lat: latlng.lat,
          lng: latlng.lng,
          displayName: display_name,
        });
      }
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    onChange(null);
    setSearch("");
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ubicación..."
            className="pl-9 bg-background/50 border-white/[0.08]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => void handleSearch()}
          disabled={searching}
          className="border-white/[0.08] bg-background/50"
        >
          <Search className="h-4 w-4" />
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-64 rounded-xl overflow-hidden border border-white/[0.08] bg-background/30"
        style={{ zIndex: 0 }}
      />

      {/* Current location display */}
      {value && (
        <div className="flex items-start gap-2 rounded-lg bg-primary/10 border border-primary/20 p-3">
          <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-foreground/80 leading-relaxed">
            {value.displayName}
          </p>
        </div>
      )}
    </div>
  );
}
