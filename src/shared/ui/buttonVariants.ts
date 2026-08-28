import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink", { variants: { variant: { primary: "bg-ink text-white", text: "bg-transparent px-0 py-0 text-current" } }, defaultVariants: { variant: "primary" } });

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
