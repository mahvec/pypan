import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { ConvexProvider } from "convex/react";
import { convexClient } from "@/app/convex";
import { router } from "@/app/router";
import "./styles.css";

const app = <><RouterProvider router={router} /><Toaster position="top-center" richColors /></>;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {convexClient ? <ConvexProvider client={convexClient}>{app}</ConvexProvider> : app}
  </StrictMode>,
);
