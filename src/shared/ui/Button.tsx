import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { buttonVariants, type ButtonVariantProps } from "@/shared/ui/buttonVariants";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariantProps & { children: ReactNode };

export function Button({ className, variant, children, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props}>{children}</button>;
}
