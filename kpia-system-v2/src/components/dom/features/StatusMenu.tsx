"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

// StatusMenu now uses Zustand directly - no props required
export function StatusMenu() {
    const {
        isStatusOpen,
        closeMenu,
        erosionLevel,
        kardashevScale,
        setErosionLevel,
        setKardashevScale,
        musicTracks
    } = useStore();

    // ESC key to close & Data Refresh
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isStatusOpen && e.key === "Escape") {
                closeMenu('status');
            }
        };
        window.addEventListener("keydown", handleKeyDown);

        // Refresh data when menu opens
        if (isStatusOpen) {
            useStore.getState().fetchMusicTracks();
        }

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isStatusOpen, closeMenu]);

    const handleClose = () => closeMenu('status');

    return (
        <AnimatePresence>
            {isStatusOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl pointer-events-auto"
                    onClick={handleClose}
                >
                    {/* Scanline Effect */}
                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0" />

                    {/* Main Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-10 w-[90vw] max-w-4xl h-[80vh] flex flex-col gap-4 border border-[#ff8800]/30 bg-black/80 shadow-[0_0_50px_rgba(255,136,0,0.1)] p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#ff8800]/50 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                                <span className="text-[#ff8800] font-mono text-xl tracking-[0.2em] font-bold glow-text">
                                    SYSTEM STATUS
                                </span>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="px-2 py-0.5 bg-[#ff8800]/20 text-[#ff8800] text-xs font-mono"
                                >
                                    ANALYZING...
                                </motion.div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="group relative px-6 py-2 border border-[#ff8800]/50 text-[#ff8800] font-mono text-sm tracking-widest hover:bg-[#ff8800] hover:text-black transition-all duration-300"
                            >
                                <span className="relative z-10">CLOSE [ESC]</span>
                            </button>
                        </div>

                        {/* Top Section: Kardashev Scale */}
                        <div className="mb-6 border border-white/10 bg-white/5 p-6 rounded-sm">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="text-[#ff8800] font-mono text-sm tracking-widest">KARDASHEV SCALE</h3>
                                <div className="font-mono text-2xl font-bold text-white">
                                    <span className="text-[#ff8800]">TYPE</span> {kardashevScale.toFixed(2)} <span className="text-white/30 text-sm">/ 3.00</span>
                                </div>
                            </div>

                            {/* Simulator Control */}
                            <div className="mb-2">
                                <input
                                    type="range"
                                    min="0" max="3" step="0.01"
                                    value={kardashevScale}
                                    onChange={(e) => setKardashevScale(parseFloat(e.target.value))}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff8800]"
                                />
                            </div>

                            <div className="relative w-full h-4 bg-white/10 rounded-full overflow-hidden">
                                <div className="absolute inset-0 grid grid-cols-[repeat(30,1fr)] gap-0.5">
                                    {Array.from({ length: 30 }).map((_, i) => (
                                        <div key={i} className="bg-black/20 h-full w-[1px]" />
                                    ))}
                                </div>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(kardashevScale / 3) * 100}%` }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#ff8800]/50 to-[#ff8800]"
                                />
                            </div>
                            <div className="flex justify-between mt-1 text-[10px] font-mono text-white/40">
                                <span>TYPE 0</span>
                                <span>TYPE 1</span>
                                <span>TYPE 2</span>
                                <span>TYPE 3</span>
                            </div>
                        </div>

                        {/* Main Grid: Metrics */}
                        <div className="grid grid-cols-3 gap-6 flex-1">

                            {/* Metric 1: Erosion */}
                            <div className="border border-white/10 bg-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#ff8800]/50 transition-colors">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,136,0,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <h3 className="text-white/60 font-mono text-xs tracking-widest mb-4 z-10">EROSION</h3>

                                <div className="w-full mb-4 px-4 z-20">
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.01"
                                        value={erosionLevel}
                                        onChange={(e) => setErosionLevel(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff8800]"
                                    />
                                </div>

                                <div className="relative z-10 w-32 h-32 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="56" fill="none" stroke="#333" strokeWidth="4" />
                                        <motion.circle
                                            cx="64" cy="64" r="56"
                                            fill="none" stroke="#ff8800" strokeWidth="4"
                                            strokeDasharray="351.8"
                                            strokeDashoffset="351.8"
                                            animate={{ strokeDashoffset: 351.8 * (1 - erosionLevel) }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    </svg>
                                    <div className="text-3xl font-mono font-bold text-white">{(erosionLevel * 100).toFixed(0)}<span className="text-sm text-[#ff8800]">%</span></div>
                                </div>
                                <div className={`mt-4 text-[10px] font-mono ${erosionLevel > 0.8 ? 'text-[#ff8800] animate-pulse' : 'text-white/40'}`}>
                                    {erosionLevel > 0.8 ? 'WARNING: UNSTABLE' : 'STABLE'}
                                </div>
                            </div>

                            {/* Metric 2: Capacity */}
                            <div className="border border-white/10 bg-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#ff8800]/50 transition-colors">
                                <h3 className="text-white/60 font-mono text-xs tracking-widest mb-4 z-10">CAPACITY</h3>
                                <div className="flex flex-col items-center gap-2 z-10">
                                    <div className="text-4xl font-mono font-bold text-white tracking-tighter">
                                        1.2<span className="text-lg text-white/50">TB</span>
                                    </div>
                                    <div className="w-full h-[1px] bg-white/20 w-16" />
                                    <div className="text-sm font-mono text-white/50">
                                        8.0<span className="text-xs">TB TOTAL</span>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-1">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${i < 6 ? 'bg-[#ff8800]' : 'bg-[#333]'}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Metric 3: Level */}
                            <div className="border border-white/10 bg-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#ff8800]/50 transition-colors">
                                <h3 className="text-white/60 font-mono text-xs tracking-widest mb-4 z-10">OBSERVER LEVEL</h3>
                                <div className="relative z-10">
                                    <div className="text-6xl font-black font-mono text-white drop-shadow-[0_0_10px_rgba(255,136,0,0.5)]">
                                        42
                                    </div>
                                </div>
                                <div className="mt-2 font-mono text-[10px] text-[#ff8800] tracking-[0.2em] border border-[#ff8800]/30 px-2 py-1">
                                    MASTER
                                </div>
                            </div>

                        </div>

                        {/* SYSTEM LOG / DATA STREAM */}
                        <div className="mt-4 border border-white/10 bg-black/40 p-4 h-48 overflow-hidden relative group">
                            <h3 className="text-[#ff8800] font-mono text-sm tracking-widest mb-2 flex justify-between">
                                <span>SYSTEM LOG / DATA STREAM</span>
                                <span className="text-white/30 text-[10px] animate-pulse">LIVE RECEPTION</span>
                            </h3>
                            <div className="absolute top-10 left-4 right-4 h-[1px] bg-[#ff8800]/20" />

                            <div className="h-full overflow-y-auto pr-2 pb-8 scrollbar-thin scrollbar-thumb-[#ff8800]/20 hover:scrollbar-thumb-[#ff8800]/50">
                                <AnimatePresence mode="popLayout">
                                    {musicTracks.length === 0 ? (
                                        <div className="font-mono text-xs text-white/30 italic pt-2">
                                            NO DATA STREAMS DETECTED...
                                        </div>
                                    ) : (
                                        musicTracks.map((track) => (
                                            <motion.div
                                                key={track.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className={`flex items-center gap-4 py-1.5 border-b border-white/5 font-mono text-xs transition-colors ${track.external_url ? 'hover:bg-white/10 cursor-pointer group/item' : 'hover:bg-white/5'}`}
                                                onClick={() => track.external_url && window.open(track.external_url, '_blank')}
                                            >
                                                <span className={`min-w-[80px] ${track.status === 'draft' || track.status === 'fragment' ? 'text-[#00ffff]' : 'text-[#00ff00]'}`}>
                                                    [{track.status === 'draft' || track.status === 'fragment' ? 'FRAGMENT' : 'SUCCESS'}]
                                                </span>
                                                <span className="text-white/80 flex-1 truncate group-hover/item:text-[#ff8800] transition-colors">
                                                    {track.title} {track.external_url && '↗'}
                                                </span>
                                                <span className="text-white/30 text-[10px]">{new Date(track.created_at).toLocaleDateString()}</span>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="flex justify-between text-[10px] font-mono text-white/30 pt-2 border-t border-white/5">
                            <div>SYS.ID: KPIA-992-X</div>
                            <div>UPTIME: 36412h 12m 44s</div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
