"use client";

import { useMemo, useRef, useEffect, RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CameraControls, Html } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { DnaAnalysisInterface } from "@/components/dom/features/DnaAnalysisInterface";
import { snoiseGLSL, bridgeVertexShader, bridgeFragmentShader } from "@/config/shaders";
import { DNA_GEOMETRY, DNA_ANIMATION, DNA_COLORS } from "@/config/dna-settings";

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

    const groupRef = useRef<THREE.Group>(null);
    const bridgeMatRef = useRef<THREE.ShaderMaterial>(null);

    const HALF_HEIGHT = DNA_GEOMETRY.totalHeight / 2;

    const uniformsRef = useRef({
        uTime: { value: 0 },
        uMinY: { value: -HALF_HEIGHT },
        uMaxY: { value: HALF_HEIGHT },
    });

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

    // === Liquid Metal Shader ===
    const onBeforeCompile = (shader: any) => {
        shader.uniforms.uTime = uniformsRef.current.uTime;
        shader.uniforms.uMinY = uniformsRef.current.uMinY;
        shader.uniforms.uMaxY = uniformsRef.current.uMaxY;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
            uniform float uTime;
            uniform float uMinY;
            uniform float uMaxY;
            varying float vYProgress;
            varying vec3 vWorldPos;
            ${snoiseGLSL}`
        );

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            float n = snoise(transformed * 0.05 + vec3(0.0, uTime * 0.5, 0.0));
            transformed += normal * (n * 1.5);
            vec4 kpiaWorldPos = modelMatrix * vec4(transformed, 1.0);
            vWorldPos = kpiaWorldPos.xyz;
            vYProgress = smoothstep(uMinY, uMaxY, kpiaWorldPos.y);`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
            uniform float uTime;
            uniform float uMinY;
            uniform float uMaxY;
            varying float vYProgress;
            varying vec3 vWorldPos;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
            vec3 colorSilver = vec3(0.8, 0.8, 0.8);
            vec3 colorOrange = vec3(1.0, 0.1, -0.5);
            float emissiveStrength = mix(0.1, 1.0, vYProgress);
            vec3 finalColor = mix(colorSilver, colorOrange, vYProgress);
            gl_FragColor.rgb *= finalColor;
            gl_FragColor.rgb += finalColor * emissiveStrength * 0.8;
            float halfHeight = (uMaxY - uMinY) * 0.5;
            float distY = abs(vWorldPos.y);
            float fadeAlpha = 1.0 - smoothstep(0.0, halfHeight * 0.6, distY);
            gl_FragColor.a = fadeAlpha;`
        );
    };

    // === Animation Frame ===
    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        uniformsRef.current.uTime.value = time;

        if (bridgeMatRef.current) {
            bridgeMatRef.current.uniforms.uTime.value = time;
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
            {/* Strand 1 */}
            <mesh geometry={strandGeometry[0]}>
                <meshPhysicalMaterial
                    onBeforeCompile={onBeforeCompile}
                    metalness={0.9}
                    roughness={0.1}
                    color={isHovered ? DNA_COLORS.hover : DNA_COLORS.base}
                    emissive={isHovered ? DNA_COLORS.emissive.hover : DNA_COLORS.emissive.default}
                    emissiveIntensity={isHovered ? DNA_COLORS.emissiveIntensity.hover : DNA_COLORS.emissiveIntensity.default}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Strand 2 */}
            <mesh geometry={strandGeometry[1]}>
                <meshPhysicalMaterial
                    onBeforeCompile={onBeforeCompile}
                    metalness={0.9}
                    roughness={0.1}
                    color={isHovered ? DNA_COLORS.hover : DNA_COLORS.base}
                    emissive={isHovered ? DNA_COLORS.emissive.hover : DNA_COLORS.emissive.default}
                    emissiveIntensity={isHovered ? DNA_COLORS.emissiveIntensity.hover : DNA_COLORS.emissiveIntensity.default}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Bridges */}
            <BridgeGroup data={bridgesData} fadeRadius={HALF_HEIGHT} />

            {/* DNA Analysis Interface */}
            <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
                <AnimatePresence>
                    {isDnaMode && <DnaAnalysisInterface />}
                </AnimatePresence>
            </Html>
        </group>
    );
}

// ============================================================================
// Bridge Group Component
// ============================================================================
function BridgeGroup({ data, fadeRadius }: { data: any[], fadeRadius: number }) {
    const mat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uFadeRadius: { value: fadeRadius }
        },
        vertexShader: bridgeVertexShader,
        fragmentShader: bridgeFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false
    }), [fadeRadius]);

    const geo = useMemo(() => {
        const segments = 12;
        const pos = [];
        const uvs = [];
        for (let j = 0; j <= segments; j++) {
            const r = j / segments;
            pos.push(0, 0, r);
            uvs.push(r, 0);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        return g;
    }, []);

    useFrame((state) => {
        mat.uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <group>
            {data.map((b, i) => (
                <BridgeInstance key={i} data={b} geometry={geo} material={mat} />
            ))}
        </group>
    );
}

// ============================================================================
// Bridge Instance Component
// ============================================================================
function BridgeInstance({ data, geometry, material }: { data: any, geometry: any, material: any }) {
    const ref = useRef<THREE.Line>(null);

    useEffect(() => {
        if (!ref.current) return;
        ref.current.position.copy(data.start);
        ref.current.lookAt(data.end);
        ref.current.scale.set(1, 1, data.length);
    }, [data]);

    // @ts-ignore
    return <line ref={ref} geometry={geometry} material={material} />;
}
