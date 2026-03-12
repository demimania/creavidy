"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Twitter, Youtube, Instagram, Github, ArrowRight } from "lucide-react";

export function CosmosFooter() {
    return (
        <footer className="relative pt-32 pb-12 overflow-hidden text-white bg-[#0F051D]">
            {/* Smooth Gradient Transition from previous section */}
            <div className="absolute -top-32 inset-x-0 h-32 bg-gradient-to-b from-transparent to-[#0F051D] z-10 pointer-events-none" />

            {/* Background Texture - Clean grain */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay z-0" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20 mb-20">

                    {/* Brand Column */}
                    <div className="md:col-span-2 space-y-8">
                        <Link href="/" className="inline-block">
                            <img src="/logo.svg" alt="Creavidy" className="h-12" />
                        </Link>
                        <p className="text-zinc-300 text-lg leading-relaxed max-w-sm font-light">
                            The AI-powered video creation platform. Describe, generate, and export professional videos — with any AI model, from one place.
                        </p>

                        <div className="flex items-center gap-6 text-zinc-300">
                            <a href="#" className="hover:text-[#D1FE17] hover:scale-110 transition-all">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                            <a href="#" className="hover:text-[#D1FE17] hover:scale-110 transition-all"><Instagram className="w-6 h-6" /></a>
                            <a href="#" className="hover:text-[#D1FE17] hover:scale-110 transition-all"><Youtube className="w-6 h-6" /></a>
                            <a href="#" className="hover:text-[#D1FE17] hover:scale-110 transition-all"><Github className="w-6 h-6" /></a>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="font-serif text-2xl mb-8 text-[#E0CCFA]">Platform</h4>
                        <ul className="space-y-4 text-zinc-300">
                            <li><Link href="#" className="hover:text-[#D1FE17] transition-colors flex items-center gap-3 group text-lg"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all text-[#D1FE17]" /> Features</Link></li>
                            <li><Link href="#" className="hover:text-[#D1FE17] transition-colors flex items-center gap-3 group text-lg"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all text-[#D1FE17]" /> Pricing</Link></li>
                            <li><Link href="#" className="hover:text-[#D1FE17] transition-colors flex items-center gap-3 group text-lg"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all text-[#D1FE17]" /> Showcase</Link></li>
                            <li><Link href="#" className="hover:text-[#D1FE17] transition-colors flex items-center gap-3 group text-lg"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all text-[#D1FE17]" /> Enterprise</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="font-serif text-2xl mb-8 text-[#E0CCFA]">Company</h4>
                        <ul className="space-y-4 text-zinc-300">
                            <li><Link href="#" className="hover:text-[#D1FE17] transition-colors flex items-center gap-3 group text-lg"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all text-[#D1FE17]" /> About</Link></li>
                            <li><Link href="#" className="hover:text-[#D1FE17] transition-colors flex items-center gap-3 group text-lg"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all text-[#D1FE17]" /> Blog</Link></li>
                            <li><Link href="#" className="hover:text-[#D1FE17] transition-colors flex items-center gap-3 group text-lg"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all text-[#D1FE17]" /> Careers</Link></li>
                            <li><Link href="#" className="hover:text-[#D1FE17] transition-colors flex items-center gap-3 group text-lg"><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-7 group-hover:ml-0 transition-all text-[#D1FE17]" /> Contact</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-zinc-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Creavidy Inc. All rights reserved.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>

            {/* Soft Purple Glow Orb for Atmosphere */}
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#9F5AFE]/20 rounded-full blur-[150px] pointer-events-none" />
        </footer>
    );
}
