import { alpha } from "@mui/material/styles";

export const grey = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
};

export const primary = {
  lighter: "#CCF4FE",
  light: "#68CDF9",
  main: "#078DEE",
  dark: "#166087",
  darker: "#004a71",
  contrastText: "#FFFFFF",
};

export const am = {
  dark: "#01244a",
  secondary: "#5c8bb4",
  main: "#0085ca",
  light: "#dee7f0",
  lighter: "#f2f9fc",
  grey: "#646464",
};

export const secondary = {
  lighter: "#EFD6FF",
  light: "#C684FF",
  main: "#8E33FF",
  dark: "#5119B7",
  darker: "#27097A",
  contrastText: "#FFFFFF",
};

export const info = {
  lighter: "#CAFDF5",
  light: "#61F3F3",
  main: "#00B8D9",
  dark: "#006C9C",
  darker: "#003768",
  contrastText: "#FFFFFF",
};

export const success = {
  lighter: "#D3FCD2",
  light: "#77ED8B",
  main: "#22C55E",
  dark: "#118D57",
  darker: "#065E49",
  contrastText: "#ffffff",
};

export const warning = {
  lighter: "#FFF5CC",
  light: "#FFD666",
  main: "#FFAB00",
  dark: "#B76E00",
  darker: "#7A4100",
  contrastText: grey[800],
};

export const error = {
  lighter: "#FFE9D5",
  light: "#FFAC82",
  main: "#FF5630",
  dark: "#B71D18",
  darker: "#7A0916",
  contrastText: "#FFFFFF",
};

export const common = {
  black: "#000000",
  white: "#FFFFFF",
};

export const action = {
  hover: alpha(grey[500], 0.08),
  selected: alpha(grey[500], 0.16),
  disabled: alpha(grey[500], 0.8),
  disabledBackground: alpha(grey[500], 0.24),
  focus: alpha(grey[500], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

const base = {
  primary,
  am,
  secondary,
  info,
  success,
  warning,
  error,
  grey,
  common,
  divider: alpha(grey[500], 0.2),
  action,
};

export function palette(mode) {
  const dark = {
    ...base,
    mode: "dark",
    text: {
      primary: "#FFFFFF",
      secondary: grey[500],
      disabled: grey[600],
    },
    background: {
      paper: grey[800],
      default: grey[900],
      neutral: alpha(grey[500], 0.12),
    },
    action: {
      ...base.action,
      active: grey[500],
      customHover: alpha(am.main, 0.2),
    },
  };
  const light = {
    ...base,
    mode: "light",
    text: {
      primary: am.dark,
      secondary: grey[800],
      disabled: grey[900],
    },
    background: {
      paper: am.lighter,
      default: alpha(am.light, 0.05),
      neutral: alpha(grey[500], 0.12),
    },
    action: {
      ...base.action,
      active: grey[300],
      customHover: alpha(am.main, 0.2),
    },
  };

  return mode === "light" ? light : dark;
}
