import { useCallback, useMemo, useState } from "react";

import { ThemeContext } from "./themeContext";

// ----------------------------------------------------------------------

export function ThemeSettings({ children, defaultSettings }) {
  const [themeMode, setThemeMode] = useState(defaultSettings.themeMode);
  const switchMode = useCallback(() => {
    setThemeMode((currTheme) => (currTheme === "light" ? "dark" : "light"));
  }, []);
  const memoizedValue = useMemo(
    () => ({
      themeMode,
      onSwitchMode: switchMode,
    }),
    [themeMode, switchMode]
  );

  return (
    <ThemeContext.Provider value={memoizedValue}>
      {children}
    </ThemeContext.Provider>
  );
}
