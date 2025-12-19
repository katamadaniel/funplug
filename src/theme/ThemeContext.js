import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const ThemeContext = createContext();

export const useThemeMode = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  // Load theme from storage
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setMode(stored);
    }
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#6C63FF",
          },
          background: {
            default: mode === "dark" ? "#0f172a" : "#f8fafc",
            paper: mode === "dark" ? "#020617" : "#ffffff",
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: "Inter, Roboto, sans-serif",
          h6: {
            fontWeight: 700,
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
