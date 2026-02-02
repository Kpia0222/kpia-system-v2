"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TRANSITION_DURATIONS, UI_COLORS } from "@/config/system-settings";
import { UI_STRINGS } from "@/config/ui-strings";
import { getRandomTip } from "@/config/lore-content";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
    isVisible: boolean;
    text?: string;
    duration?: number; // Optional override, defaults to TRANSITION_DURATIONS.sceneTransition
}

export function LoadingScreen({
    isVisible,
    text,
    duration = TRANSITION_DURATIONS.sceneTransition
}: LoadingScreenProps) {
    // Convert ms to seconds for framer-motion
    const durationSec = duration / 1000;
    const [tip, setTip] = useState("");

    // Set a random tip when the screen becomes visible
    useEffect(() => {
        if (isVisible) {
            setTip(getRandomTip());
        }
    }, [isVisible]);

    const displayLabel = text || UI_STRINGS.STATUS.LOADING;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: TRANSITION_DURATIONS.loadingFade / 1000 }}
                    className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center pointer-events-auto"
                >
                    {/* Background Tech Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10" />
                        <div className="absolute top-0 left-0 h-full w-[1px] bg-white/10" />
                        <div className="absolute top-0 right-0 h-full w-[1px] bg-white/10" />

                        {/* Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </div>

                    {/* Central Loading Area */}
                    <div className="relative z-10 w-full max-w-md px-8 flex flex-col items-center gap-4">

                        {/* Text */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[#ff8800] font-mono tracking-[0.3em] text-sm uppercase text-center"
                        >
                            {displayLabel}
                        </motion.div>

                        {/* Progress Bar Container - Synced with DURATIONS */}
                        <div className="relative w-full h-[2px] bg-[#ff8800]/20 overflow-hidden">
                            {/* Animated Bar - Uses duration from Store */}
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: durationSec, ease: "easeInOut" }}
                                className="absolute top-0 left-0 h-full bg-[#ff8800] shadow-[0_0_15px_#ff8800]"
                            />
                        </div>

                        {/* Decoding Decor & Tip */}
                        <div className="flex justify-between w-full text-[8px] font-mono text-[#ff8800]/50 tracking-widest">
                            <span>SYS_OPT: NORMAL</span>
                            <span>BUFFER_CLR</span>
                        </div>

                        {/* Random Tip */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-[10px] text-white/50 font-mono tracking-wider text-center"
                        >
                            {tip}
                        </motion.div>
                    </div>

                    {/* Scanline Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
