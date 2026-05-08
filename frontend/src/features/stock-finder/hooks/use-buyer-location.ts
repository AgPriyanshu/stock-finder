import { useEffect, useState } from "react";

export interface BuyerLocation {
  lat: number | null;
  lng: number | null;
  label: string;
  source: "gps" | "ip" | "none";
  isLoading: boolean;
}

export const useBuyerLocation = () => {
  const [location, setLocation] = useState<BuyerLocation>({
    lat: null,
    lng: null,
    label: "All India",
    source: "none",
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const fallbackToIp = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = (await response.json()) as {
          latitude?: number;
          longitude?: number;
          city?: string;
        };
        if (!cancelled && data.latitude && data.longitude) {
          setLocation({
            lat: data.latitude,
            lng: data.longitude,
            label: data.city || "your city",
            source: "ip",
            isLoading: false,
          });
          return;
        }
      } catch {
        // Browser network fallback is best-effort only.
      }

      if (!cancelled) {
        setLocation({
          lat: null,
          lng: null,
          label: "All India",
          source: "none",
          isLoading: false,
        });
      }
    };

    if (!navigator.geolocation) {
      void fallbackToIp();
      return () => {
        cancelled = true;
      };
    }

    const reverseGeocode = async (
      lat: number,
      lng: number
    ): Promise<string> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = (await response.json()) as {
          address?: {
            suburb?: string;
            neighbourhood?: string;
            city_district?: string;
            city?: string;
            town?: string;
            village?: string;
          };
        };
        const addr = data.address ?? {};
        return (
          addr.suburb ??
          addr.neighbourhood ??
          addr.city_district ??
          addr.city ??
          addr.town ??
          addr.village ??
          "your location"
        );
      } catch {
        return "your location";
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const { latitude, longitude } = position.coords;
        void reverseGeocode(latitude, longitude).then((label) => {
          if (!cancelled) {
            setLocation({
              lat: latitude,
              lng: longitude,
              label,
              source: "gps",
              isLoading: false,
            });
          }
        });
      },
      () => void fallbackToIp(),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return location;
};
