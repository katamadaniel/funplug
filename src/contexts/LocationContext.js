// LocationContext.js
import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);

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
    <LocationContext.Provider value={userLocation}>
      {children}
    </LocationContext.Provider>
  );
};

export const useUserLocation = () => useContext(LocationContext);
