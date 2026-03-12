"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
        { code: 'zh', name: '中文' },
        { code: 'ja', name: '日本語' },
        { code: 'pt', name: 'Português' },
    ];

    const currentLang = languages.find(l => l.code === locale) || languages[0];

    const handleLanguageChange = (code: string) => {
        const segments = pathname.split('/');
        // default locale handling: if path doesn't start with a locale, next-intl might handle it.
        // But assuming prefix based routing:
        if (languages.some(l => l.code === segments[1])) {
            segments[1] = code;
        } else {
            // If locale is missing (or root), we replace or prepend.
            // Usually next-intl redirects / to /en.
            // If we rely on middleware, we can just push the new path.
            // The safest way is to replace the locale segment if it exists.
            segments[1] = code;
        }

        const newPath = segments.join('/');
        router.push(newPath);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium text-zinc-300 hover:text-white"
            >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline uppercase">{currentLang.code}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[#1A103C] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors flex items-center justify-between ${locale === lang.code ? "text-[#D1FE17]" : "text-zinc-400"
                                }`}
                        >
                            {lang.name}
                            {locale === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-[#D1FE17]" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
