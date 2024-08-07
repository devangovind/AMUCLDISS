import { useContext, createContext } from "react";

export const ThemeContext = createContext({});

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  return context;
};
