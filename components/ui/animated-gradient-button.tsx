"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface AnimatedGradientButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    containerClassName?: string;
}

export function AnimatedGradientButton({
    children,
    className,
    containerClassName,
    ...props
}: AnimatedGradientButtonProps) {
    return (
        <div
            className={cn(
                "group relative flex items-center justify-center rounded-full p-[1px] transition-all hover:scale-105 active:scale-95 cursor-pointer",
                containerClassName
            )}
        >
            <div className="absolute inset-0 animate-gradient-xy rounded-full bg-gradient-to-r from-[#D1FE17] via-[#9F5AFE] to-[#D1FE17] opacity-70 blur-sm transition-all duration-500 group-hover:opacity-100 group-hover:blur-md" />
            <button
                className={cn(
                    "relative flex h-full w-full items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-medium text-white backdrop-blur-3xl transition-all hover:bg-black/90",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        </div>
    );
}
