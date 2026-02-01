"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRandomTip } from "@/config/lore-content";
import { useStore } from "@/store/useStore";

/**
 * 軽量なトランジションテキストオーバーレイ
 * - TIPSテキスト（左上）
 * - GALAXY:000 テキスト演出（中央）
 * ポリへドラの流れは含まない
 */
interface TransitionTextOverlayProps {
    active: boolean;
}

export function TransitionTextOverlay({ active }: TransitionTextOverlayProps) {
    const [tip, setTip] = useState("");
    const { showStartupText, showStartupTips, fadeSettings } = useStore();

    useEffect(() => {
        if (showStartupTips) {
            setTip(getRandomTip());
        }
    }, [showStartupTips]);

    if (!active && !showStartupText && !showStartupTips) return null;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            <AnimatePresence>
                {showStartupText && (
                    <motion.div
                        key="main-text"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            transition: { duration: fadeSettings.textIn }
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.7,
                            filter: "blur(10px)",
                            transition: { duration: fadeSettings.textOut }
                        }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-10"
                    >
                        <div className="text-6xl md:text-8xl font-black font-mono tracking-[0.2em] text-white animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                            GALAXY:000
                        </div>
                        <div className="mt-2 text-[#ff8800] text-sm font-mono tracking-[0.5em] opacity-80 animate-pulse">
                            [units: 0.242522 | opus: 1.234532]
                        </div>
                        {/* Thin orange scanline behind text */}
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#ff8800]/30 -z-10" />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showStartupTips && (
                    <motion.div
                        key="tips"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            transition: { duration: fadeSettings.tipsIn }
                        }}
                        exit={{
                            opacity: 0,
                            x: -50,
                            transition: { duration: fadeSettings.tipsOut }
                        }}
                        className="absolute top-10 left-10 border border-[#ff8800]/50 bg-black/40 backdrop-blur-sm px-6 py-4 max-w-sm z-20"
                    >
                        <div className="text-[#ff8800] text-xs font-bold tracking-widest mb-2">TIPS</div>
                        <div className="text-white text-xs font-mono leading-relaxed">
                            {tip}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
