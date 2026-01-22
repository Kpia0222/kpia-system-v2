"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { InstancedMesh, Color, BufferGeometry, BoxGeometry, OctahedronGeometry, TetrahedronGeometry, MeshPhysicalMaterial, Object3D, Vector3 } from "three";
import { useRef, useMemo, useEffect, useState, RefObject } from "react";
import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/**
 * Transition Overlay Component (Redesigned)
 * 
 * Features:
 * - "IN TRANSIT" pulsing text
 * - Flowing Polyhedra (Tetrahedron, Box, Octahedron) from LEFT to RIGHT
 * - Liquid Metal Material
 * - Tips Window
 */
interface TransitionOverlayProps {
    active: boolean;
    onMidpoint?: () => void;
    onComplete?: () => void;
}

const TIPS = [
    "KARDASHEV SCALE REPRESENTS CIVILIZATION ENERGY LEVEL",
    "DNA MODE: SCROLL TO ZOOM IN/OUT FOR DETAIL",
    "PRESS F4 TO VERIFY SYSTEM INTEGRITY",
    "GALAXY EROSION RATE IS INCREASING...",
    "OBSERVATION DATA IS SYNCHRONIZED ACROSS DIMENSIONS",
    "HYPER AETHER RESONANCE: 98.4%",
    "SYSTEM OPTIMIZATION IN PROGRESS"
];

export function TransitionOverlay({ active, onMidpoint, onComplete }: TransitionOverlayProps) {
    const [tip, setTip] = useState("");

    useEffect(() => {
        if (active) {
            setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
        }
    }, [active]);

    return (
        <div className="absolute inset-0 z-[9999] pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 50 }}
                gl={{ alpha: true }}
                style={{ pointerEvents: 'none' }}
                dpr={[1, 2]} // High DPI for crisp text/shapes
            >
                {/* Environment for reflections (Crucial for liquid metal look) */}
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 10]} intensity={3} color="#ffffff" />
                <pointLight position={[-10, -5, 5]} intensity={5} color="#ff8800" />

                <TransitionPipeline
                    active={active}
                    onMidpoint={onMidpoint}
                    onComplete={onComplete}
                    tip={tip}
                />
            </Canvas>
        </div>
    );
}

function TransitionPipeline({ active, onMidpoint, onComplete, tip }: TransitionOverlayProps & { tip: string }) {
    const pipelineState = useRef({
        time: 0,
        hasTriggeredMid: false,
        hasCompleted: false,
        active: false,
    });

    useEffect(() => {
        if (active) {
            pipelineState.current = {
                time: 0,
                hasTriggeredMid: false,
                hasCompleted: false,
                active: true,
            };
        }
    }, [active]);

    useFrame((state, delta) => {
        if (!pipelineState.current.active) return;

        pipelineState.current.time += delta;
        const t = pipelineState.current.time;

        const MIDPOINT_TIME = 3.0; // Slightly longer to appreciate the flow
        const END_TIME = 6.0;

        if (t > MIDPOINT_TIME && !pipelineState.current.hasTriggeredMid) {
            pipelineState.current.hasTriggeredMid = true;
            if (onMidpoint) onMidpoint();
        }

        if (t > END_TIME && !pipelineState.current.hasCompleted) {
            pipelineState.current.hasCompleted = true;
            pipelineState.current.active = false;
            if (onComplete) onComplete();
        }
    });

    // We keep rendering during active phase
    // Note: To ensure exit animation plays out, we check if time < END_TIME even if !active in parent?
    // Actually parent controls 'active'. If parent sets active=false, we hide.
    // The logic assumes parent keeps active=true until onComplete is called.

    if (!active && !pipelineState.current.active) return null;

    // Timing constants for visual elements
    const GEOMETRIC_FLOW_START = 3.0;
    const GEOMETRIC_FLOW_END = 6.0;

    return (
        <>
            {/* Geometric Flow - Time controlled */}
            {pipelineState.current.time >= GEOMETRIC_FLOW_START &&
                pipelineState.current.time <= GEOMETRIC_FLOW_END && (
                    <GeometricFlow time={pipelineState.current.time} />
                )}

            {/* UI Overlay via Html */}
            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div className="w-full h-full flex flex-col items-center justify-center relative">

                    {/* Central Text: IN TRANSIT */}
                    <AnimatePresence>
                        {/* Show during the main part of transition */}
                        {pipelineState.current.time > 2.5 && pipelineState.current.time < 5.5 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7, filter: "blur(10px)" }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center justify-center z-10"
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

                    {/* Top Right Tips */}
                    <AnimatePresence>
                        {pipelineState.current.time > -0.5 && pipelineState.current.time < 4.5 && (
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                                className="absolute top-10 left-10 border border-[#ff8800]/50 bg-black/40 backdrop-blur-sm px-6 py-4 max-w-sm"
                            >
                                <div className="text-[#ff8800] text-xs font-bold tracking-widest mb-2">TIPS</div>
                                <div className="text-white text-xs font-mono leading-relaxed">
                                    {tip}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Html>
        </>
    );
}

// ------------------------------------------------------------------
// Geometric Flow (Left -> Right)
// ------------------------------------------------------------------
function GeometricFlow({ time }: { time: number }) {
    // We use 3 separate instances for variety: Box, Octahedron, Tetrahedron
    const boxRef = useRef<InstancedMesh>(null);
    const octaRef = useRef<InstancedMesh>(null);
    const tetraRef = useRef<InstancedMesh>(null);

    const COUNT = 80; // Total objects per shape (Total ~900)

    // Shared Material: Liquid Metal (Iridescent)
    const material = useMemo(() => new MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 1.0,
        roughness: 0.0,
        iridescence: 1.0,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.9,
    }), []);

    // Generate random data for a swarm
    const generateData = () => {
        const data = [];
        for (let i = 0; i < COUNT; i++) {
            data.push({
                xOffset: (Math.random()) * 40, // Spread along X (0 to 40)
                y: (Math.random() - 0.5) * 20, // Spread Y
                z: (Math.random() - 0.5) * 15, // Spread Z (Depth)
                scale: Math.random() * 0.5 + 0.2, // Random size
                speed: Math.random() * 15 + 10,   // Speed Left->Right
                rotSpeed: new Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(2),
            });
        }
        return data;
    };

    const boxData = useMemo(() => generateData(), []);
    const octaData = useMemo(() => generateData(), []);
    const tetraData = useMemo(() => generateData(), []);

    const dummy = useMemo(() => new Object3D(), []);

    useFrame(() => {
        // Animation: Move from Left (-X) to Right (+X)
        // Camera View Width at Z=0 is approx 20 units (FOV 50, Z=15 dist -> tan(25)*15*2 = ~14 unit height, aspect ratio ~25 width)
        // Let's spawn them far left at X = -30, move to X = +30.

        const updateMesh = (ref: RefObject<InstancedMesh | null>, data: any[]) => {
            if (!ref.current) return;
            data.forEach((d, i) => {
                // Pos = Start + Speed * Time
                // Add staggered start based on xOffset
                // We want a wave.

                // Let's define the wave front:
                // Global time flows. Objects appear from left.
                // x = (d.xOffset - 40) + d.speed * time?
                // d.xOffset is 0..40.
                // We want them to CROSS the screen.
                // Start: -30. End: +30.

                // If we want a continuous stream for a few seconds:
                // x = -40 + (d.speed * time) + (d.xOffset * 0.5); // Offset creates the stream length

                // Adjusting 'time' to represent the transition progress
                // time 0 -> start appearing. time 2.0 -> full screen?

                const x = -50 + (d.speed * time) + (d.xOffset);

                dummy.position.set(x, d.y, d.z);

                // Rotate
                dummy.rotation.x += d.rotSpeed.x * 0.01;
                dummy.rotation.y += d.rotSpeed.y * 0.01;
                dummy.rotation.z += d.rotSpeed.z * 0.01;

                dummy.scale.setScalar(d.scale);
                dummy.updateMatrix();
                ref.current!.setMatrixAt(i, dummy.matrix);
            });
            ref.current.instanceMatrix.needsUpdate = true;
        };

        updateMesh(boxRef, boxData);
        updateMesh(octaRef, octaData);
        updateMesh(tetraRef, tetraData);
    });

    return (
        <group rotation={[0, 0, Math.PI / 12]}> {/* Slight group tilt for dynamic angle */}
            <instancedMesh ref={boxRef} args={[undefined, undefined, COUNT]} material={material}>
                <boxGeometry args={[1, 1, 1]} />
            </instancedMesh>
            <instancedMesh ref={octaRef} args={[undefined, undefined, COUNT]} material={material}>
                <octahedronGeometry args={[0.7]} />
            </instancedMesh>
            <instancedMesh ref={tetraRef} args={[undefined, undefined, COUNT]} material={material}>
                <tetrahedronGeometry args={[0.8]} />
            </instancedMesh>
        </group>
    );
}
