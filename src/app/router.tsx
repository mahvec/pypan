import { createBrowserRouter } from "react-router-dom";
import { HOUSES, PREVIEW_PARTICIPANTS } from "@/modules/house-reveal/constants";
import { LandingPage } from "@/modules/house-reveal/pages/LandingPage";
import { RevealPage, type RevealLoaderData } from "@/modules/house-reveal/pages/RevealPage";
import { SearchPage } from "@/modules/house-reveal/pages/SearchPage";
import { ConsolePage } from "@/modules/console/pages/ConsolePage";
import { ConsoleDashboardPage } from "@/modules/console/pages/ConsoleDashboardPage";
import { HouseSetupPage } from "@/modules/console/pages/HouseSetupPage";
import { RosterUploadPage } from "@/modules/console/pages/RosterUploadPage";
import { RosterPage } from "@/modules/console/pages/RosterPage";
import { ConsoleAppLayout } from "@/modules/console/components/ConsoleAppLayout";
import { isConvexConfigured } from "@/app/convex";
import { RouteErrorPage } from "@/app/RouteErrorPage";

function revealLoader({ params }: { params: Record<string, string | undefined> }): RevealLoaderData | null {
  if (isConvexConfigured) return null;
  const participant = PREVIEW_PARTICIPANTS.find((item) => item.id === params.participantId);
  if (!participant) throw new Response("Participant not found", { status: 404 });
  const house = HOUSES.find((item) => item.id === participant.houseId);
  if (!house) throw new Response("House not found", { status: 404 });
  return { participant, house };
}

export const router = createBrowserRouter([{ path: "/", errorElement: <RouteErrorPage />, children: [{ index: true, element: <LandingPage /> }, { path: "search", element: <SearchPage /> }, { path: "reveal/:participantId", element: <RevealPage />, loader: revealLoader }, { path: "console", element: <ConsolePage /> }, { path: "console", element: <ConsoleAppLayout />, children: [{ path: "dashboard", element: <ConsoleDashboardPage /> }, { path: "houses", element: <HouseSetupPage /> }, { path: "upload", element: <RosterUploadPage /> }, { path: "roster", element: <RosterPage /> }] }] }]);
