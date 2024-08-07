import PropTypes from "prop-types";
import { useMemo } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { palette } from "./palette";
import { useThemeContext } from "./themeContext";

export default function ThemeProvider({ children }) {
  const themeSettings = useThemeContext();
  const memoizedValue = useMemo(
    () => ({
      palette: palette(themeSettings.themeMode), // or palette('dark')
      shape: { borderRadius: 8 },
    }),
    [themeSettings.themeMode]
  );

  const theme = createTheme(memoizedValue);
  //   theme.components = componentsOverrides(theme);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
