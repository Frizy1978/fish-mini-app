"use client";

import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ asChild, className, variant = "primary", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-cta px-4 py-3 text-sm font-semibold transition duration-200 active:scale-[0.99]",
        variant === "primary" &&
          "bg-brand font-accent text-white shadow-card hover:bg-[#0f5d99] disabled:bg-slate-300",
        variant === "secondary" &&
          "bg-white text-ink ring-1 ring-line shadow-soft hover:bg-mist",
        variant === "ghost" && "bg-transparent text-ink hover:bg-brand/5",
        "disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
