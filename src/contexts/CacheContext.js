import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const CacheContext = createContext();

/**
 * Default cache TTL (in ms)
 * Example: 5 minutes
 */
const DEFAULT_TTL = 5 * 60 * 1000;

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});

  /* =========================
     ADD TO CACHE
  ========================== */
  const addToCache = useCallback(
    (key, data, ttl = DEFAULT_TTL) => {
      setCache(prev => ({
        ...prev,
        [key]: {
          data,
          expiresAt: Date.now() + ttl,
        },
      }));
    },
    []
  );

  /* =========================
     GET FROM CACHE (TTL SAFE)
  ========================== */
  const getFromCache = useCallback(
    key => {
      const entry = cache[key];

      if (!entry) return null;

      // Expired
      if (Date.now() > entry.expiresAt) {
        setCache(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        return null;
      }

      return entry.data;
    },
    [cache]
  );

  /* =========================
     CLEAR CACHE
  ========================== */
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  /* =========================
     AUTO CLEANUP (INTERVAL)
  ========================== */
  useEffect(() => {
    const interval = setInterval(() => {
      setCache(prev => {
        const now = Date.now();
        const cleaned = {};

        Object.entries(prev).forEach(([key, value]) => {
          if (value.expiresAt > now) {
            cleaned[key] = value;
          }
        });

        return cleaned;
      });
    }, 60 * 1000); // cleanup every 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <CacheContext.Provider
      value={{
        getFromCache,
        addToCache,
        clearCache,
      }}
    >
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider");
  }
  return context;
};
