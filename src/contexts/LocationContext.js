// LocationContext.js
import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userCity, setUserCity] = useState(null);
  const [userCountry, setUserCountry] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setUserLocation(null),
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        setUserLocation,
        userCity,
        setUserCity,
        userCountry,
        setUserCountry,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const inferCityFromIP = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    return {
      city: data.city,
      country: data.country_name,
      lat: data.latitude,
      lng: data.longitude,
    };
  } catch (err) {
    console.warn("IP location fallback failed");
    return null;
  }
};

export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const useUserLocation = () => {
  const ctx = useContext(LocationContext);
  return ctx?.userLocation;
};

export const useLocationContext = () => {
  return useContext(LocationContext);
};