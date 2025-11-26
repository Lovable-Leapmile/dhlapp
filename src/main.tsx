import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add mobile viewport meta tags
document.head.insertAdjacentHTML('beforeend', `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="format-detection" content="telephone=no" />
`);

createRoot(document.getElementById("root")!).render(<App />);
