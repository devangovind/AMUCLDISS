// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import ThemeProvider from "./theme";
import { ThemeSettings } from "./theme/themeSettings";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeSettings
    defaultSettings={{
      themeMode: "light", // 'light' | 'dark'
    }}
  >
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ThemeSettings>
);

// ReactDOM.render(
//   <ThemeSettings
//     defaultSettings={{
//       themeMode: "light", // 'light' | 'dark'
//     }}
//   >
//     <ThemeProvider>
//       <App />
//     </ThemeProvider>
//   </ThemeSettings>,

//   document.getElementById("root")
// );
