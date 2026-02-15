"use client";

import { useMemo, useRef, useEffect, useState, RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CameraControls, Html } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { DnaAnalysisInterface } from "@/components/dom/features/DnaAnalysisInterface";
import { DNA_GEOMETRY, DNA_ANIMATION } from "@/config/dna-settings";
import type { DnaStrandUniforms } from "@/utils/dna-tsl-materials";
import { DnaStrands } from "./DnaStrands";
import { CpuBridgeGroup, GpuBridgeGroup } from "./DnaBridges";

// ============================================================================
// DNA Configuration
// ============================================================================


// ============================================================================
// DNA Component Props
// ============================================================================
interface DNAProps {
    controlsRef: RefObject<CameraControls>;
    mode?: 'interactive' | 'decorative';
    isDiving?: boolean;
    isHovered?: boolean;
    onHoverChange?: (isHovered: boolean) => void;
}

// ============================================================================
// Main DNA Component
// ============================================================================
export function DnaModel({
    controlsRef,
    mode = 'interactive',
    isDiving = false,
    isHovered = false,
    onHoverChange,
}: DNAProps) {
    const { isDnaMode, toggleDnaMode, setDnaMode } = useStore();
    const { gl } = useThree();
    const isWebGPU = gl.constructor.name === "WebGPURenderer";

    const groupRef = useRef<THREE.Group>(null);
    const bridgeMatRef = useRef<THREE.ShaderMaterial>(null);

    const HALF_HEIGHT = DNA_GEOMETRY.totalHeight / 2;

    const uniformsRef = useRef<DnaStrandUniforms>({
        uTime: { value: 0 },
        uMinY: { value: -HALF_HEIGHT },
        uMaxY: { value: HALF_HEIGHT },
    });

    // --- WebGPU 用 TSL マテリアル (動的インポート) ---
    const [tslStrandMat, setTslStrandMat] = useState<THREE.Material | null>(null);
    const [tslBridgeResult, setTslBridgeResult] = useState<{
        material: THREE.Material;
        uniforms: { uTime: { value: number } };
    } | null>(null);

    useEffect(() => {
        if (!isWebGPU) return;
        let cancelled = false;
        import("@/utils/dna-tsl-materials").then((mod) => {
            if (cancelled) return;
            setTslStrandMat(mod.createDnaStrandNodeMaterial(uniformsRef.current));
            setTslBridgeResult(mod.createBridgeNodeMaterial(HALF_HEIGHT));
        });
        return () => { cancelled = true; };
    }, [isWebGPU, HALF_HEIGHT]);

    const rotationSpeedRef = useRef(0.1);
    const targetRotationSpeed = useRef(0.1);
    const savedCameraState = useRef<{ position: THREE.Vector3, target: THREE.Vector3 } | null>(null);

    // === Rotation Speed Control ===
    useEffect(() => {
        if (mode === 'decorative') {
            targetRotationSpeed.current = DNA_ANIMATION.rotationSpeed.decorative;
        } else if (isDiving) {
            targetRotationSpeed.current = DNA_ANIMATION.rotationSpeed.diving;
            rotationSpeedRef.current = DNA_ANIMATION.rotationSpeed.diving;
        } else {
            targetRotationSpeed.current = isDnaMode ? DNA_ANIMATION.rotationSpeed.dnaMode : DNA_ANIMATION.rotationSpeed.default;
        }
    }, [mode, isDiving, isDnaMode]);

    // === Camera Transition for DNA Mode ===
    useEffect(() => {
        if (!controlsRef.current || mode === 'decorative') return;

        if (isDnaMode) {
            // Save camera state
            const pos = new THREE.Vector3();
            const tgt = new THREE.Vector3();
            controlsRef.current.getPosition(pos);
            controlsRef.current.getTarget(tgt);
            savedCameraState.current = { position: pos, target: tgt };

            // Focus View
            controlsRef.current.setLookAt(0, 0, 180, 0, 0, 0, true);

            // Spike rotation (clockwise)
            rotationSpeedRef.current = DNA_ANIMATION.rotationSpeed.spikeClockwise;
            targetRotationSpeed.current = DNA_ANIMATION.rotationSpeed.dnaMode;
        } else {
            // Restore Camera
            if (savedCameraState.current) {
                const { position, target } = savedCameraState.current;
                controlsRef.current.setLookAt(
                    position.x, position.y, position.z,
                    target.x, target.y, target.z,
                    true
                );
            }

            // Spike rotation (counter-clockwise)
            if (!isDiving) {
                rotationSpeedRef.current = DNA_ANIMATION.rotationSpeed.spikeCounterClockwise;
                targetRotationSpeed.current = DNA_ANIMATION.rotationSpeed.default;
            }
        }
    }, [isDnaMode, controlsRef, mode, isDiving]);

    // === Geometry Construction ===
    const { strandGeometry, bridgesData } = useMemo(() => {
        const { totalHeight, radius, turns, pointsPerStrand, tubeRadius, tubeSegments } = DNA_GEOMETRY;

        const pathPoints1: THREE.Vector3[] = [];
        const pathPoints2: THREE.Vector3[] = [];
        const bridges: { start: THREE.Vector3, end: THREE.Vector3, length: number }[] = [];

        for (let i = 0; i <= pointsPerStrand; i++) {
            const t = i / pointsPerStrand;
            const angle = t * Math.PI * 2 * turns;
            const y = (t - 0.5) * totalHeight;

            // Strand 1
            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;
            pathPoints1.push(new THREE.Vector3(x1, y, z1));

            // Strand 2 (Offset PI)
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;
            pathPoints2.push(new THREE.Vector3(x2, y, z2));

            // Bridges (every 4th point)
            if (i % 4 === 0) {
                const v1 = new THREE.Vector3(x1, y, z1);
                const v2 = new THREE.Vector3(x2, y, z2);
                bridges.push({ start: v1, end: v2, length: v1.distanceTo(v2) });
            }
        }

        const curve1 = new THREE.CatmullRomCurve3(pathPoints1);
        const curve2 = new THREE.CatmullRomCurve3(pathPoints2);

        const geo1 = new THREE.TubeGeometry(curve1, 400, tubeRadius, tubeSegments, false);
        const geo2 = new THREE.TubeGeometry(curve2, 400, tubeRadius, tubeSegments, false);

        return { strandGeometry: [geo1, geo2], bridgesData: bridges };
    }, []);

    // === Animation Frame ===
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        uniformsRef.current.uTime.value = time;

        // WebGL: 既存の ShaderMaterial uniform を更新
        if (!isWebGPU && bridgeMatRef.current) {
            bridgeMatRef.current.uniforms.uTime.value = time;
        }
        // WebGPU: TSL ブリッジ uniform を更新
        if (isWebGPU && tslBridgeResult) {
            tslBridgeResult.uniforms.uTime.value = time;
        }

        if (groupRef.current) {
            rotationSpeedRef.current += (targetRotationSpeed.current - rotationSpeedRef.current) * 0.05;
            groupRef.current.rotation.y += rotationSpeedRef.current * state.clock.getDelta();
        }
    });

    // === Click Handler ===
    const handleClick = (e: any) => {
        if (mode === 'decorative') return;
        e.stopPropagation();
        toggleDnaMode();
    };

    return (
        <group
            ref={groupRef}
            onClick={handleClick}
            onPointerOver={() => onHoverChange?.(true)}
            onPointerOut={() => onHoverChange?.(false)}
            onPointerMissed={() => isDnaMode && setDnaMode(false)}
        >
            <DnaStrands
                strandGeometry={strandGeometry}
                isWebGPU={isWebGPU}
                tslStrandMat={tslStrandMat}
                isHovered={isHovered}
                uniformsRef={uniformsRef}
            />

            {/* Bridges */}
            {isWebGPU && tslBridgeResult ? (
                <GpuBridgeGroup data={bridgesData} material={tslBridgeResult.material} />
            ) : (
                <CpuBridgeGroup data={bridgesData} fadeRadius={HALF_HEIGHT} />
            )}

            {/* DNA Analysis Interface */}
            <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
                <AnimatePresence>
                    {isDnaMode && <DnaAnalysisInterface />}
                </AnimatePresence>
            </Html>
        </group>
    );
}
