"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeLogoProps {
    className?: string;
    alt?: string;
}

export function ThemeLogo({ className = "h-12 w-auto object-contain", alt = "dazla." }: ThemeLogoProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // Default to light mode logo during SSR / before mount
    const src = mounted && resolvedTheme === "dark" ? "/pnglogodark.png" : "/logolightmode.png";

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={className} />
    );
}
