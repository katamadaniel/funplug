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
            default: mode === "dark" ? "#0b1020" : "#f7f8fc",
            paper: mode === "dark" ? "#121a2d" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#f8fafc" : "#182033",
            secondary: mode === "dark" ? "#aeb9cc" : "#667085",
          },
          divider: mode === "dark" ? "rgba(226,232,240,0.14)" : "rgba(15,23,42,0.10)",
        },
        shape: {
          borderRadius: 14,
        },
        typography: {
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          body1: { lineHeight: 1.65 },
          body2: { lineHeight: 1.55 },
          h3: { fontWeight: 800, letterSpacing: "-0.02em" },
          h4: { fontWeight: 800, letterSpacing: "-0.02em" },
          h6: {
            fontWeight: 700,
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiButton: {
            defaultProps: { disableElevation: true },
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
