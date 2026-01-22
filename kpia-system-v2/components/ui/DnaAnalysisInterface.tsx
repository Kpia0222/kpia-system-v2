"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { DodecahedronGeometry, MeshPhysicalMaterial, Vector3 } from "three";
import { LevelAsteroids } from "../three/LevelAsteroids";

// --- Mock Data Generator for Right Panel ---
const PARAM_NAMES = [
    "SIMPLEX_NOISE", "FBM_OCTAVES", "TIME_SCALE", "PERSISTENCE", "LACUNARITY",
    "VORONOI_DISPLACEMENT", "CELLULAR_AUTOMATA", "FLUID_DYNAMICS", "PARTICLE_LIFETIME",
    "GRAVITATIONAL_CONSTANT", "ENTROPY_LEVEL", "DARK_MATTER_RATIO", "QUANTUM_FLUX",
    "WAVE_FUNCTION_COLLAPSE", "EIGENVALUE_REAL", "EIGENVALUE_IMAG", "TENSOR_FLOW",
    "NEURAL_PATHWAY", "SYNAPTIC_WEIGHT", "HEBBIAN_LEARNING", "BACKPROPAGATION",
    "GRADIENT_DESCENT", "STOCHASTIC_PROCESS", "MARKOV_CHAIN", "MONTE_CARLO",
    "FOURIER_TRANSFORM", "LAPLACE_OPERATOR", "HAMILTONIAN_ENERGY", "LAGRANGIAN_MECHANICS",
    "SCHRODINGER_EQ", "HEISENBERG_UNCERTAINTY", "PLANCK_LENGTH", "LIGHT_SPEED_C",
];

const generateRandomLine = () => {
    const isError = Math.random() < 0.05;
    const isScanning = Math.random() < 0.05;

    if (isError) return { type: "status", text: "[ ERROR: NONE ]", color: "#00ff00" };
    if (isScanning) return { type: "status", text: "[ SCANNING... ]", color: "#ff8800" };

    const param = PARAM_NAMES[Math.floor(Math.random() * PARAM_NAMES.length)];
    const val = (Math.random() * 100).toFixed(4);
    return { type: "data", text: `${param}`, value: val };
};

export function DnaAnalysisInterface() {
    const [dataLines, setDataLines] = useState<any[]>([]);

    // Initial Data Population
    useEffect(() => {
        const initial = Array.from({ length: 40 }).map(generateRandomLine);
        setDataLines(initial);

        // Update random values periodically
        const interval = setInterval(() => {
            setDataLines(prev => prev.map(line => {
                if (line.type === "data" && Math.random() < 0.3) {
                    return { ...line, value: (Math.random() * 100).toFixed(4) };
                }
                return line;
            }));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative pointer-events-none md:p-12 p-4 flex justify-between items-center text-white font-mono overflow-hidden">

            {/* --- LEFT PANEL: LEVEL DISPLAY --- */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-1/4 h-1/2 flex flex-col items-center justify-center pointer-events-auto"
            >
                {/* Backdrop Blur & Container */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-xl border border-[#ff8800]/30 rounded-lg skew-x-[-12deg]" />

                {/* 3D Canvas for Asteroids - Positioned behind UI */}
                <div className="absolute inset-0 overflow-hidden">
                    <Canvas
                        camera={{ position: [0, 0, 8], fov: 50 }}
                        style={{ pointerEvents: 'none' }}
                    >
                        <ambientLight intensity={0.3} />
                        <pointLight position={[0, 0, 5]} intensity={1} color="#ff8800" />
                        <LevelAsteroids />
                    </Canvas>
                </div>

                {/* Content Wrapper (Un-skewed) */}
                <div className="relative z-10 skew-x-[12deg] flex flex-col items-center">
                    <h2 className="text-xl tracking-[0.5em] text-white/70 mb-2">LEVEL</h2>

                    <div className="relative flex items-center justify-center w-full">
                        {/* Rotating Hex Frame */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute w-64 h-64 border-[2px] border-[#ff8800]/20"
                            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} // Hexagon
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute w-56 h-56 border-[1px] border-dashed border-[#ff8800]/40"
                            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
                        />

                        {/* Huge Number */}
                        <span className="text-[8rem] font-bold text-white drop-shadow-[0_0_15px_rgba(255,136,0,0.5)] leading-none">
                            42
                        </span>
                    </div>

                    <div className="mt-8 text-xs tracking-widest text-[#ff8800]">
                        CURRENT STABILITY: 98.4%
                    </div>
                </div>
            </motion.div>


            {/* --- RIGHT PANEL: DATA STREAM --- */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="relative w-1/3 h-3/4 pointer-events-auto flex flex-col"
            >
                {/* Panel Frame */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-l-[4px] border-[#ff8800] rounded-r-lg" />

                {/* Header */}
                <div className="relative z-10 px-6 py-4 border-b border-[#ff8800]/30 flex justify-between items-center bg-black/20">
                    <span className="text-sm tracking-widest text-[#ff8800]">SYSTEM_LOG // STREAM</span>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-[#ff8800] rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-[#ff8800] rounded-full animate-pulse delay-75" />
                        <div className="w-2 h-2 bg-[#ff8800] rounded-full animate-pulse delay-150" />
                    </div>
                </div>

                {/* Scrollable Data Area */}
                <div className="relative z-10 flex-1 overflow-y-auto p-6 font-mono text-xs scrollbar-hide">
                    {/* Scanline Overlay for Panel */}
                    <div className="fixed inset-0 pointer-events-none z-20 mix-blend-overlay opacity-20"
                        style={{
                            background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                            backgroundSize: "100% 2px, 2px 100%"
                        }}
                    ></div>
                    {/* Moving Scan Bar */}
                    <motion.div
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-[10px] bg-gradient-to-b from-transparent via-[#ff8800]/20 to-transparent pointer-events-none z-30"
                    />

                    <div className="space-y-1">
                        {dataLines.map((line, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-0.5 min-h-[1.2em]">
                                {line.type === "data" ? (
                                    <>
                                        <span className="text-gray-400">{line.text}</span>
                                        <span className="text-[#ff8800] w-24 text-right tabular-nums">{line.value}</span>
                                    </>
                                ) : (
                                    <span style={{ color: line.color }} className="w-full text-center tracking-widest py-1 bg-white/5">
                                        {line.text}
                                    </span>
                                )}
                            </div>
                        ))}
                        {/* Padding at bottom */}
                        <div className="h-12" />
                    </div>
                </div>
            </motion.div>

        </div>
    );
}
