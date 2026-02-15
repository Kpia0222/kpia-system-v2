"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { InstancedMesh, MeshPhysicalMaterial, Object3D, Vector3 } from "three";
import { useRef, useMemo, useEffect, RefObject } from "react";

import { useControls } from "leva";
import { STARTUP_TRANSITION } from "@/config/camera-settings";

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
    duration?: number; // Total duration in ms, default 6000
    onMidpoint?: () => void;
    onComplete?: () => void;
}



export function TransitionOverlay({ active, duration = 6000, onMidpoint, onComplete }: TransitionOverlayProps) {
    const durationSec = duration / 1000;

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
                    durationSec={durationSec}
                    onMidpoint={onMidpoint}
                    onComplete={onComplete}
                />
            </Canvas>
        </div>
    );
}

function TransitionPipeline({ active, durationSec = 6, onMidpoint, onComplete }: { active: boolean; durationSec?: number; onMidpoint?: () => void; onComplete?: () => void }) {
    const pipelineState = useRef({
        time: 0,
        hasTriggeredMid: false,
        hasCompleted: false,
        active: false,
    });

    // Calculate timing based on duration
    const MIDPOINT_TIME = durationSec / 2;
    const END_TIME = durationSec;

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

    if (!active && !pipelineState.current.active) return null;

    // Timing constants for visual elements (Based on duration)
    const GEOMETRIC_FLOW_START = MIDPOINT_TIME;
    const GEOMETRIC_FLOW_END = END_TIME;

    return (
        <>
            {/* Geometric Flow - Time controlled */}
            {pipelineState.current.time >= GEOMETRIC_FLOW_START &&
                pipelineState.current.time <= GEOMETRIC_FLOW_END && (
                    <GeometricFlow time={pipelineState.current.time} />
                )}
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

    // Configから値を取得
    const { polyhedraOverlay } = STARTUP_TRANSITION;

    // LevaによるGUI調整
    // folder機能を使ってグループ化
    const config = useControls('Polyhedra Overlay', {
        countPerShape: { value: polyhedraOverlay.countPerShape, min: 10, max: 200, step: 10 },
        opacity: { value: polyhedraOverlay.opacity, min: 0, max: 1, step: 0.1 },
        centerClearanceY: { value: polyhedraOverlay.centerClearanceY, min: 0, max: 20, step: 0.5 },
        spreadY: { value: polyhedraOverlay.spreadY, min: 10, max: 100, step: 1 },
        spreadZ: { value: polyhedraOverlay.spreadZ, min: 10, max: 100, step: 1 },
    });

    const { countPerShape, opacity, centerClearanceY, spreadY, spreadZ } = config;

    const COUNT = countPerShape;

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
        opacity: opacity, // Configurable opacity
    }), [opacity]); // opacity変更時に再生成

    // Generate random data for a swarm
    const generateData = () => {
        const data = [];
        for (let i = 0; i < COUNT; i++) {
            // 中央（視界）を避ける配置ロジック
            // 上下どちらかに配置
            const isTop = Math.random() > 0.5;
            // clearance 〜 spread の範囲でランダム
            const yOffset = centerClearanceY + Math.random() * (spreadY - centerClearanceY);
            const y = isTop ? yOffset : -yOffset;

            data.push({
                xOffset: (Math.random()) * 40, // Spread along X (0 to 40)
                y: y,
                z: (Math.random() - 0.5) * spreadZ, // Spread Z (Depth)
                scale: Math.random() * 0.5 + 0.2, // Random size
                speed: Math.random() * 15 + 10,   // Speed Left->Right
                rotSpeed: new Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(2),
            });
        }
        return data;
    };

    const boxData = useMemo(() => generateData(), [COUNT]);
    const octaData = useMemo(() => generateData(), [COUNT]);
    const tetraData = useMemo(() => generateData(), [COUNT]);

    const dummy = useMemo(() => new Object3D(), []);

    useFrame(() => {
        const updateMesh = (ref: RefObject<InstancedMesh | null>, data: any[]) => {
            if (!ref.current) return;
            data.forEach((d, i) => {
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
