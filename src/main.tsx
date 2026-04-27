import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { StatusBar, Style } from "@capacitor/status-bar";

// Apply saved theme before render to avoid flash
const savedTheme = localStorage.getItem("melo-theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

// Set status bar style to match theme (light icons on dark bg, dark icons on light bg)
StatusBar.setStyle({ style: savedTheme === "dark" ? Style.Light : Style.Dark }).catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);
