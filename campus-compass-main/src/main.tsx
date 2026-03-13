import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { CampusProvider } from "./context/CampusContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <CampusProvider>
    <App />
  </CampusProvider>
);
