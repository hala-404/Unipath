import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";

console.log("CLERK KEY:", import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

const clerkPubKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "").trim();

if (!clerkPubKey) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY in frontend/.env. Restart the Vite dev server after setting it."
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);