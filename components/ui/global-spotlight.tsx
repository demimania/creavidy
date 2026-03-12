"use client";

import { useMousePosition } from "@/hooks/use-mouse-position";
import { useEffect, useState } from "react";

export default function GlobalSpotlight() {
    const mouse = useMousePosition();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div
            className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
            style={{
                background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(255,255,255,0.06), transparent 40%)`,
            }}
        />
    );
}
