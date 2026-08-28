import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { buttonVariants } from "@/shared/ui/buttonVariants";

export function RouteErrorPage() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error) && error.status === 404 ? "That page could not be found." : "Something went wrong while opening this page.";
  return <main className="flex min-h-[100dvh] items-center justify-center bg-paper p-5 text-center"><section><p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.14em] text-muted">PYPAN House Reveal</p><h1 className="m-0 text-4xl tracking-[-.06em]">{message}</h1><Link className={`${buttonVariants()} mt-6`} to="/">Return home</Link></section></main>;
}
