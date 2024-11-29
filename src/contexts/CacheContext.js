import React, { createContext, useContext, useState } from 'react';

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});
  const clearCache = () => setCache({});
  const getFromCache = (key) => cache[key];

  const addToCache = (key, data) => {
    setCache((prev) => ({ ...prev, [key]: data }));
  };

  return (
    <CacheContext.Provider value={{ getFromCache, addToCache, clearCache }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}