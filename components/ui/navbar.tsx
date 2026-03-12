"use client";

import Link from "next/link";
import { Bot, Store, CreditCard, MessageSquare } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useRouter } from "next/navigation";

export function Navbar() {
    const router = useRouter();

    return (
        <nav className="fixed top-0 z-[9999] w-full border-b border-white/5 bg-[#0F051D]/80 backdrop-blur-md pointer-events-auto">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Creavidy" className="h-8" />
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
                    <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2">
                        <Bot className="w-4 h-4" /> Studio
                    </Link>
                    <Link href="/chat" className="hover:text-white transition-colors flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> AI Director
                    </Link>
                    <Link href="/pricing" className="hover:text-white transition-colors flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Pricing
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <div className="scale-90">
                        <LanguageSwitcher />
                    </div>
                    <Link href="/dashboard">
                        <span className="text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">
                            Log in
                        </span>
                    </Link>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="h-8 px-4 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center cursor-pointer"
                    >
                        Start Building
                    </button>
                </div>
            </div>
        </nav>
    );
}
