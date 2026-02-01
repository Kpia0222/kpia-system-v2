"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import {
    InstancedMesh, MeshPhysicalMaterial, Object3D, Vector3, Color,
    AdditiveBlending, CanvasTexture, DoubleSide,
    BufferGeometry, Float32BufferAttribute,
    BoxGeometry, TetrahedronGeometry, OctahedronGeometry, PlaneGeometry
} from "three";

// ----------------------------------------------------------------------
// Texture Generation Utility
// ----------------------------------------------------------------------
function getGlowTexture() {
    if (typeof document === 'undefined') return new CanvasTexture(new OffscreenCanvas(32, 32) as unknown as HTMLCanvasElement);

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');

    if (context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
    }

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// ----------------------------------------------------------------------
// MeteorEnvironment Component
// ----------------------------------------------------------------------

interface MeteorEnvironmentProps {
    minRadius?: number;
    maxRadius?: number;
    count?: number;
    color?: string;
    shapeType?: "tetrahedron" | "box" | "octahedron" | "plane";
}

// ★★★ GALAXY CONFIGURATION ★★★
const GALAXY_PARAMS = {
    // 1. CENTER SPHERE CORE
    core: {
        count: 10000,      // Reduced for safety & clarity
        maxRadius: 40.0,
        brightness: 0.5,
        sizeMin: 2.0,
        sizeMax: 4.0,
        color: new Vector3(0.8, 0.9, 1.0),
    },
    // 2. SPIRAL ARMS
    arms: {
        count: 15000,     // Reduced for safety
        branches: 5,
        spin: 4,
        randomness: 0.7,
        minRadius: 0,
        maxRadius: 600.0,
        brightness: 1.0,
        sizeMin: 1.5,
        sizeMax: 3.5,
        colorBase: new Vector3(0.1, 0.1, 0.1),

    },
    // 3. BACKGROUND FILL
    background: {
        count: 30000,     // Increased to fill the gaps (Dust)
        minRadius: 0.0,   // Start from center to cover everything
        maxRadius: 600.0,
        brightness: 1.0,
        sizeMin: 0.5,     // Slightly larger to fill volume
        sizeMax: 1.5,
        colorBase: new Vector3(0.1, 0.1, 0.3),
    }
};

export function MeteorEnvironment({
    minRadius = 15.0,
    maxRadius = 40.0,
    count = 100000,
    color = "#ff8800",
    shapeType = "plane",
}: MeteorEnvironmentProps) {
    const meshRef = useRef<InstancedMesh>(null);
    const glowTexture = useMemo(() => getGlowTexture(), []);

    const geometry = useMemo(() => {
        const s = 0.5;
        switch (shapeType) {
            case "box": return new BoxGeometry(s, s, s);
            case "tetrahedron": return new TetrahedronGeometry(s);
            case "octahedron": return new OctahedronGeometry(s);
            case "plane":
            default: return new PlaneGeometry(s, s);
        }
    }, [shapeType]);

    // Sum total count from params
    const totalCount = GALAXY_PARAMS.core.count + GALAXY_PARAMS.arms.count + GALAXY_PARAMS.background.count;

    // A. MATERIAL
    const glassMaterial = useMemo(() => new MeshPhysicalMaterial({
        color: new Color(1, 1, 1),
        transmission: 0.8,
        opacity: 1.0,
        metalness: 0.0,
        roughness: 0.2,
        ior: 1.5,
        thickness: 0.1,
        side: DoubleSide,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    }), []);

    // B. COLORS PALETTE for Arms
    const colors = useMemo(() => [
        new Vector3(0.0, 0.75, 1.0), // cyan
        new Vector3(0.0, 0.5, 1.0),  // blue
        new Vector3(1.0, 0.9, 0.5),  // warm white
        new Vector3(0.3, 0.0, 0.8),  // purple
        new Vector3(1.0, 1.0, 1.0),  // white
    ], []);

    // C. GENERATE GALAXY DATA
    const starData = useMemo(() => {
        const data = [];

        // -----------------------
        // 1. GENERATE CORE (Sphere)
        // -----------------------
        const { count: coreCount, maxRadius: coreRad, brightness: coreBright, sizeMin: cMin, sizeMax: cMax, color: cColor } = GALAXY_PARAMS.core;

        for (let i = 0; i < coreCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = 2 * Math.PI * u;
            const phi = Math.acos(2 * v - 1);
            const r = coreRad * Math.cbrt(Math.random());

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            const scale = cMin + Math.random() * (cMax - cMin);

            data.push({
                position: new Vector3(x, y, z),
                scale: scale,
                rotSpeed: new Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(1.0),
                initialRotation: new Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
                color: cColor,
                opacityFactor: coreBright,
                twinkleSpeed: Math.random() * 3.0 + 1.0,
                twinkleOffset: Math.random() * 10,
            });
        }

        // -----------------------
        // 2. GENERATE ARMS (Spiral)
        // -----------------------
        const { count: armCount, branches, spin, randomness, minRadius: aMinR, maxRadius: aMaxR, brightness: armBright, sizeMin: aMin, sizeMax: aMax } = GALAXY_PARAMS.arms;
        const randomnessPower = 2;

        for (let i = 0; i < armCount; i++) {
            const distPower = 2.0;
            const distribution = Math.pow(Math.random(), distPower); // 0..1
            const r = aMinR + distribution * (aMaxR - aMinR);

            const branchAngle = (i % branches) * ((Math.PI * 2) / branches);
            const spinAngle = distribution * spin;

            let randomOffset = (Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1)) * randomness * distribution;
            let finalAngle = branchAngle + spinAngle + randomOffset;

            const thickness = 100.0 * Math.pow(1 - distribution, 2.0) + 10.0;
            const y = (Math.random() - 0.5) * thickness;
            const x = Math.cos(finalAngle) * r;
            const z = Math.sin(finalAngle) * r;

            const scale = aMin + Math.random() * (aMax - aMin);
            const selectedColor = colors[Math.floor(Math.random() * colors.length)];

            data.push({
                position: new Vector3(x, y, z),
                scale: scale,
                rotSpeed: new Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(1.0),
                initialRotation: new Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
                color: selectedColor,
                opacityFactor: armBright,
                twinkleSpeed: Math.random() * 3.0 + 1.0,
                twinkleOffset: Math.random() * 10,
            });
        }

        // -----------------------
        // 3. GENERATE BACKGROUND (Fill)
        // -----------------------
        const { count: bgCount, minRadius: bMinR, maxRadius: bMaxR, brightness: bgBright, sizeMin: bMin, sizeMax: bMax, colorBase } = GALAXY_PARAMS.background;

        for (let i = 0; i < bgCount; i++) {
            const distribution = Math.random();
            const distFactor = Math.sqrt(distribution); // Normalized radius (0..1)
            const r = bMinR + distFactor * (bMaxR - bMinR);

            const angle = Math.random() * Math.PI * 2;
            const thickness = 100.0 * Math.pow(1 - distFactor, 2.0) + 10.0;
            const y = (Math.random() - 0.5) * thickness;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;

            const scale = bMin + Math.random() * (bMax - bMin);

            data.push({
                position: new Vector3(x, y, z),
                scale: scale,
                rotSpeed: new Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(1.0),
                initialRotation: new Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
                color: colorBase,
                opacityFactor: bgBright,
                twinkleSpeed: Math.random() * 3.0 + 1.0,
                twinkleOffset: Math.random() * 10,
            });
        }

        return data;
    }, [colors]);

    const dummy = useMemo(() => new Object3D(), []);
    const colorDummy = useMemo(() => new Color(), []);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        const slowRot = time * 0.02;

        if (meshRef.current) {
            meshRef.current.rotation.y = slowRot;

            // Safety check: ensure we don't exceed existing instances
            const limit = Math.min(starData.length, totalCount);

            for (let i = 0; i < limit; i++) {
                const d = starData[i];
                dummy.position.copy(d.position);

                dummy.rotation.x = d.initialRotation.x + d.rotSpeed.x * time;
                dummy.rotation.y = d.initialRotation.y + d.rotSpeed.y * time;
                dummy.rotation.z = d.initialRotation.z + d.rotSpeed.z * time;

                const twinkle = Math.sin(time * d.twinkleSpeed + d.twinkleOffset) * 0.2 + 0.8;
                dummy.scale.setScalar(d.scale * twinkle);

                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);

                colorDummy.setRGB(
                    d.color.x * d.opacityFactor,
                    d.color.y * d.opacityFactor,
                    d.color.z * d.opacityFactor
                );
                meshRef.current!.setColorAt(i, colorDummy);
            }
            meshRef.current.instanceMatrix.needsUpdate = true;
            if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
        }
    });

    return (
        <group>
            <instancedMesh ref={meshRef} args={[undefined, undefined, totalCount]} material={glassMaterial} geometry={geometry} />
        </group>
    );
}
