"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface AppHeaderProps {
    title?: string;
    showBack?: boolean;
    backHref?: string;
    rightContent?: React.ReactNode;
    showLogo?: boolean;
}

export function AppHeader({
    title,
    showBack = true,
    backHref,
    rightContent,
    showLogo = true
}: AppHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (backHref) {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#0F051D]/80 backdrop-blur-lg border-b border-white/5">
            <div className="flex items-center gap-3">
                {showBack && (
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                )}

                {showLogo && (
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo.svg" alt="Creavidy" className="h-8" />
                    </Link>
                )}

                {title && (
                    <div className="flex items-center gap-2">
                        {showLogo && <span className="text-zinc-600">/</span>}
                        <span className="text-lg font-medium text-zinc-200 whitespace-nowrap">{title}</span>
                    </div>
                )}
            </div>

            <div className="flex-1" />

            <div className="flex items-center justify-end gap-2">
                <div className="scale-90">
                    <LanguageSwitcher />
                </div>
                {rightContent}
            </div>
        </header>
    );
}
