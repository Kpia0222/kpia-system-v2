"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useStore } from "@/store/useStore";
import { galaxies, GalaxyData } from "@/config/galaxy-data";
import { UI_STRINGS } from "@/config/ui-strings";

// MapMenu now uses Zustand directly - no props required
export function MapMenu() {
    const {
        isMapOpen,
        closeMenu,
        setSelectedGalaxy,
        setCurrentScene,
        setViewMode,
        setLoading,
    } = useStore();

    const [hoveredGalaxy, setHoveredGalaxy] = useState<GalaxyData | null>(null);
    const cameraPosRef = useRef({ x: 0, z: 400 }); // Would ideally come from Canvas, but default for now

    // ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isMapOpen && e.key === "Escape") {
                closeMenu('map');
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMapOpen, closeMenu]);

    // Cleanup hover on close
    useEffect(() => {
        if (!isMapOpen) setHoveredGalaxy(null);
    }, [isMapOpen]);

    // Map scaling
    const MAP_SIZE = 600;
    const WORLD_SIZE = 2000;

    const toMapPercent = (val: number) => {
        const p = (val + (WORLD_SIZE / 2)) / WORLD_SIZE;
        return Math.min(Math.max(p * 100, 0), 100);
    };

    const handleGalaxySelect = (galaxy: GalaxyData) => {
        closeMenu('map');
        setLoading(true, `${UI_STRINGS.TRANSITION.RELOCATING_PREFIX}${galaxy.name.toUpperCase()}...`);

        setTimeout(() => {
            setCurrentScene('universe');
            setViewMode('galaxy');
            setSelectedGalaxy(galaxy.id);
            setLoading(false);
        }, 2000);
    };

    const handleClose = () => closeMenu('map');
    const cameraPosition = cameraPosRef.current;

    return (
        <AnimatePresence>
            {isMapOpen && (
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
                                    {UI_STRINGS.MAP.TITLE}
                                </span>
                                <span className="text-[#ff8800]/50 font-mono text-xs tracking-widest bg-black/50 px-2 mt-1">
                                    {UI_STRINGS.MAP.SECTOR_DEFAULT}
                                </span>
                            </div>
                            <button
                                onClick={handleClose}
                                className="pointer-events-auto group relative px-4 py-1 border border-[#ff8800]/50 text-[#ff8800] font-mono text-sm tracking-widest hover:bg-[#ff8800] hover:text-black transition-all duration-300 bg-black/50"
                            >
                                <span className="relative z-10">{UI_STRINGS.ACTIONS.CLOSE}</span>
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
                                const top = toMapPercent(galaxy.position[2]);
                                return (
                                    <div
                                        key={galaxy.id}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-30"
                                        style={{ left: `${left}%`, top: `${top}%` }}
                                        onMouseEnter={() => setHoveredGalaxy(galaxy)}
                                        onMouseLeave={() => setHoveredGalaxy(null)}
                                        onClick={() => handleGalaxySelect(galaxy)}
                                    >
                                        <div className="w-2 h-2 bg-white rotate-45 group-hover:bg-[#ff8800] group-hover:scale-150 transition-all shadow-[0_0_5px_white]" />
                                        <div className="mt-1 text-[8px] font-mono text-white/50 whitespace-nowrap group-hover:text-[#ff8800] transition-colors">
                                            {galaxy.name}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Preview Window */}
                            <AnimatePresence>
                                {hoveredGalaxy && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 20 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute z-50 pointer-events-none"
                                        style={{
                                            left: `${toMapPercent(hoveredGalaxy.position[0])}%`,
                                            top: `${toMapPercent(hoveredGalaxy.position[2])}%`
                                        }}
                                    >
                                        <div className="w-48 bg-black/90 border border-[#ff8800] p-3 text-[#ff8800] font-mono shadow-[0_0_30px_rgba(255,136,0,0.2)]">
                                            <div className="text-xs border-b border-[#ff8800]/30 pb-1 mb-2 tracking-widest font-bold text-white">
                                                {hoveredGalaxy.name}
                                            </div>
                                            <div className="space-y-1 text-[9px] tracking-wider text-[#ff8800]/80">
                                                <div className="flex justify-between">
                                                    <span>{UI_STRINGS.MAP.COORDS}</span>
                                                    <span className="text-white">
                                                        [{Math.round(hoveredGalaxy.position[0])}, {Math.round(hoveredGalaxy.position[2])}]
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>{UI_STRINGS.MAP.STATUS_LABEL}</span>
                                                    <span className="text-white">{UI_STRINGS.MAP.STATUS_ACTIVE}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>{UI_STRINGS.MAP.DISTANCE}</span>
                                                    <span className="text-white">
                                                        {Math.round(Math.abs(hoveredGalaxy.position[0] - cameraPosition.x) + Math.abs(hoveredGalaxy.position[2] - cameraPosition.z))} LY
                                                    </span>
                                                </div>
                                                <div className="h-[2px] w-full bg-[#ff8800]/20 mt-2">
                                                    <div className="h-full bg-[#ff8800] w-[75%] animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Connector Line */}
                                        <svg className="absolute top-0 right-full w-6 h-6 -mr-[2px] -mt-[10px] pointer-events-none overflow-visible">
                                            <line x1="20" y1="10" x2="0" y2="10" stroke="#ff8800" strokeWidth="1" />
                                            <circle cx="0" cy="10" r="2" fill="#ff8800" />
                                        </svg>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                            {UI_STRINGS.MAP.SCALE}
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
