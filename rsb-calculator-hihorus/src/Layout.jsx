import React from "react";
import { ThemeProvider } from "./components/ThemeContext";

export default function Layout({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}