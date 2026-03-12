"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ChatError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Chat Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-[#0F051D] text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-sm px-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
          The AI chat encountered an error. Please try again — your conversation context will be preserved.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3 mb-5 text-left">
            <p className="text-red-400 text-[11px] font-mono break-all">{error.message}</p>
          </div>
        )}

        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#a78bfa]/20 border border-[#a78bfa]/30 text-sm text-white hover:bg-[#a78bfa]/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
