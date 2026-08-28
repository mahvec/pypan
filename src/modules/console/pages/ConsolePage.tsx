import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/shared/ui/buttonVariants";
import { BrandMark } from "@/shared/ui/BrandMark";
import { isConvexConfigured } from "@/app/convex";
import { ConsoleLoginForm } from "@/modules/console/components/ConsoleLoginForm";

export function ConsolePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col bg-paper p-5 sm:p-6">
      <BrandMark />
      <section className="my-auto max-w-md">
        <LockKeyhole className="mb-10" size={28} />
        <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.14em]">
          Private Console
        </p>
        <h1 className="m-0 text-[clamp(3rem,8vw,5.5rem)] leading-[.91] tracking-[-.075em]">
          Sign in to manage the roster.
        </h1>
        {isConvexConfigured ? <ConsoleLoginForm /> : <p className="mt-6 max-w-105 leading-relaxed text-muted">Convex is not configured for this deployment yet.</p>}
        <Link className={`${buttonVariants({ variant: "text" })} mt-6`} to="/">
          Return to Reveal
        </Link>
      </section>
    </main>
  );
}
