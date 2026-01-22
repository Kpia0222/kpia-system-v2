"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface NotionMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const LOGS = [
    { id: 101, date: "2026.01.23", target: "GALAXY \"WESTERN\"", message: "FREQUENCY SHIFT DETECTED" },
    { id: 102, date: "2026.01.22", target: "GALAXY \"GAGAKU\"", message: "EROSION STABILIZED AT 45.2%" },
    { id: 103, date: "2026.01.20", target: "SYSTEM REBOOT", message: "CORE INTEGRITY 100%" },
    { id: 104, date: "2026.01.18", target: "OBSERVATION", message: "NEW ASTEROID BELT MAPPED" },
    { id: 105, date: "2026.01.15", target: "SIGNAL LOST", message: "CONNECTION RETRY... FAILED" },
];

export function NotionMenu({ isOpen, onClose }: NotionMenuProps) {
    // ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl pointer-events-auto"
                    onClick={onClose}
                >
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

                    {/* Main Container */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-10 w-[90vw] max-w-3xl h-[80vh] flex flex-col border border-[#ff8800]/30 bg-black/80 shadow-[0_0_50px_rgba(255,136,0,0.1)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#ff8800]/50 p-6 bg-black/40">
                            <div className="flex items-center gap-4">
                                <span className="text-[#ff8800] font-mono text-xl tracking-[0.2em] font-bold glow-text">
                                    RESEARCH LOGS
                                </span>
                                <div className="px-2 py-0.5 bg-white/10 text-white text-xs font-mono">
                                    ARCHIVE_MODE
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="group relative px-6 py-2 border border-[#ff8800]/50 text-[#ff8800] font-mono text-sm tracking-widest hover:bg-[#ff8800] hover:text-black transition-all duration-300"
                            >
                                <span className="relative z-10">CLOSE [ESC]</span>
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 flex overflow-hidden p-8">

                            <div className="w-full h-full overflow-y-auto pr-4 custom-scrollbar">
                                <div className="space-y-4">
                                    {LOGS.map((log, index) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="group relative flex items-start gap-4 p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
                                        >
                                            {/* Unread Indicator */}
                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-[#ff8800] group-hover:shadow-[0_0_8px_#ff8800] transition-shadow" />

                                            <div className="font-mono flex-1">
                                                <div className="flex items-baseline gap-3 mb-1">
                                                    <span className="text-[#ff8800] font-bold text-xs opacity-80">[{log.date}]</span>
                                                    <span className="text-white font-bold tracking-wider text-sm">{log.target}</span>
                                                </div>
                                                <div className="text-white/70 text-sm tracking-wide pl-2 border-l border-white/20">
                                                    {log.message}
                                                </div>
                                            </div>

                                            <div className="text-[10px] font-mono text-white/20 group-hover:text-white/50">
                                                ID: {log.id}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* End of Log */}
                                    <div className="py-8 text-center text-white/20 font-mono text-xs tracking-[0.3em]">
                                        -- END OF TRANSMISSION --
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
