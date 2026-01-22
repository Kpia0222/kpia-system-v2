"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { GalaxyData } from "@/components/three/KpiaUniverse";

interface MapMenuProps {
    isOpen: boolean;
    onClose: () => void;
    galaxies: GalaxyData[];
    cameraPosition?: { x: number; z: number }; // Optional for now, will wire in page.tsx
}

export function MapMenu({ isOpen, onClose, galaxies, cameraPosition = { x: 0, z: 400 } }: MapMenuProps) {
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

    // Map scaling
    const MAP_SIZE = 600; // Pixel size of the map container
    const WORLD_SIZE = 2000; // Approx world units to cover

    // Convert world pos to map pos (percentage 0-100)
    const toMapPercent = (val: number) => {
        // Map 0 to 50%, -1000 to 0%, +1000 to 100%
        const p = (val + (WORLD_SIZE / 2)) / WORLD_SIZE;
        return Math.min(Math.max(p * 100, 0), 100);
    };

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
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative z-10 w-[80vh] h-[80vh] flex flex-col border border-[#ff8800]/30 bg-black/80 shadow-[0_0_50px_rgba(255,136,0,0.1)] p-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-20">
                            <div className="flex flex-col">
                                <span className="text-[#ff8800] font-mono text-xl tracking-[0.2em] font-bold glow-text bg-black/50 px-2">
                                    TACTICAL MAP
                                </span>
                                <span className="text-[#ff8800]/50 font-mono text-xs tracking-widest bg-black/50 px-2 mt-1">
                                    SECTOR: UNIVERSE-00
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="pointer-events-auto group relative px-4 py-1 border border-[#ff8800]/50 text-[#ff8800] font-mono text-sm tracking-widest hover:bg-[#ff8800] hover:text-black transition-all duration-300 bg-black/50"
                            >
                                <span className="relative z-10">CLOSE</span>
                            </button>
                        </div>

                        {/* Grid Area */}
                        <div className="relative w-full h-full overflow-hidden bg-[#050505]">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
                                {Array.from({ length: 100 }).map((_, i) => (
                                    <div key={i} className="border border-[#ff8800]/10" />
                                ))}
                            </div>

                            {/* Center Cross */}
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#ff8800]/30" />
                            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#ff8800]/30" />

                            {/* Galaxies Points */}
                            {galaxies.map((galaxy) => {
                                const left = toMapPercent(galaxy.position[0]);
                                const top = toMapPercent(galaxy.position[2]); // Z is vertical in 2D top-down
                                return (
                                    <div
                                        key={galaxy.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                                        style={{ left: `${left}%`, top: `${top}%` }}
                                    >
                                        <div className="w-2 h-2 bg-white rotate-45 group-hover:bg-[#ff8800] group-hover:scale-150 transition-all shadow-[0_0_5px_white]" />
                                        <div className="mt-1 text-[8px] font-mono text-white/50 whitespace-nowrap group-hover:text-[#ff8800] transition-colors">
                                            {galaxy.name}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Observer Position (Crosshair) */}
                            <div
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-100 ease-linear"
                                style={{
                                    left: `${toMapPercent(cameraPosition.x)}%`,
                                    top: `${toMapPercent(cameraPosition.z)}%`
                                }}
                            >
                                <div className="relative w-6 h-6 flex items-center justify-center">
                                    <div className="absolute w-full h-[1px] bg-[#ff8800]" />
                                    <div className="absolute h-full w-[1px] bg-[#ff8800]" />
                                    <div className="absolute w-4 h-4 border border-[#ff8800] rounded-full animate-ping opacity-50" />
                                </div>
                                <div className="absolute top-4 left-4 text-[8px] font-mono text-[#ff8800] whitespace-nowrap">
                                    OBSERVER
                                </div>
                            </div>

                        </div>

                        {/* Footer Scale */}
                        <div className="absolute bottom-4 right-4 font-mono text-[10px] text-[#ff8800]/50 bg-black/50 px-2">
                            SCALE: 1px :: 1 LY
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
