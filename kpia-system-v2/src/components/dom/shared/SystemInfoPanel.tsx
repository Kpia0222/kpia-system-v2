"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSystemGreeting } from "@/utils/time";

/**
 * SystemInfoPanel - Left-side HUD panel
 * Layout: Digital Clock -> Greeting -> UID (with copy feature)
 */
export function SystemInfoPanel() {
    const { user, displayId } = useStore();
    const [isMounted, setIsMounted] = useState(false);
    const [greeting, setGreeting] = useState("");
    const [currentTime, setCurrentTime] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setGreeting(getSystemGreeting());

        // Update greeting every minute
        const greetingInterval = setInterval(() => {
            setGreeting(getSystemGreeting());
        }, 60000);

        // Update digital clock every second
        const clockInterval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);

        // Initial time set
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        return () => {
            clearInterval(greetingInterval);
            clearInterval(clockInterval);
        };
    }, []);

    // UID コピー機能
    const handleCopyId = useCallback(() => {
        const idToCopy = displayId || (user ? user.id.slice(0, 8).toUpperCase() : "GUEST");
        navigator.clipboard.writeText(idToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [displayId, user]);

    if (!isMounted) return null;

    const idDisplay = displayId || (user ? user.id.slice(0, 8).toUpperCase() : "GUEST");

    return (
        <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-start gap-3"
            >
                {/* Digital Clock Section */}
                <div className="flex flex-col items-start">
                    <div className="font-mono text-xl font-bold tracking-[0.15em] text-white/90">
                        {currentTime}
                    </div>
                    <div className="h-[1px] w-full bg-[#ff8800]/30 mt-1" />
                </div>

                {/* Greeting Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="font-mono text-xs tracking-[0.2em] text-[#ff8800]/80"
                >
                    {greeting}
                </motion.div>

                {/* UID Section with Copy */}
                <button
                    onClick={handleCopyId}
                    className="px-3 py-2 bg-black/60 backdrop-blur-sm border border-white/20 rounded-sm 
                               hover:border-[#ff8800]/50 hover:bg-black/80 transition-all duration-200 
                               cursor-pointer pointer-events-auto group"
                >
                    <div className="font-mono text-sm font-bold tracking-[0.15em] text-white/80 group-hover:text-white">
                        UID // <span className="text-[#ff8800]">{idDisplay}</span>
                    </div>

                    {/* Copy Feedback */}
                    <AnimatePresence>
                        {copied && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="font-mono text-[10px] tracking-widest text-[#00ff00] mt-1"
                            >
                                ✓ CODE COPIED
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </motion.div>
        </div>
    );
}
