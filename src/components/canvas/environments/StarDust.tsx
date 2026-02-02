"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarDustProps {
    count?: number;
    size?: number;
    radius?: number;
    color?: string;
    opacity?: number;
    speed?: number;
}

export function StarDust({
    count = 5000,
    size = 2,
    radius = 1000,
    color = "#ffffff",
    opacity = 0.5,
    speed = 0.05
}: StarDustProps) {
    const pointsRef = useRef<THREE.Points>(null);

    // Geometry Generation
    const [positions, initialPositions, driftParams] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const initialPositions = new Float32Array(count * 3);
        const driftParams = new Float32Array(count * 4); // x, y, z speed, offset

        for (let i = 0; i < count; i++) {
            // Random position in sphere
            const r = Math.cbrt(Math.random()) * radius;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            initialPositions[i * 3] = x;
            initialPositions[i * 3 + 1] = y;
            initialPositions[i * 3 + 2] = z;

            // Random drift parameters
            driftParams[i * 4] = (Math.random() - 0.5) * 0.2; // x speed
            driftParams[i * 4 + 1] = (Math.random() - 0.5) * 0.2; // y speed
            driftParams[i * 4 + 2] = (Math.random() - 0.5) * 0.2; // z speed
            driftParams[i * 4 + 3] = Math.random() * Math.PI; // offset
        }

        return [positions, initialPositions, driftParams];
    }, [count, radius]);

    // Material
    const material = useMemo(() => new THREE.PointsMaterial({
        size: size,
        color: new THREE.Color(color),
        transparent: true,
        opacity: opacity,
        sizeAttenuation: true, // 遠くの星は小さく
        depthWrite: false,     // 重なっても消えない
        blending: THREE.AdditiveBlending,
    }), [size, color, opacity]);

    // Animation
    useFrame((state) => {
        if (!pointsRef.current) return;

        const time = state.clock.getElapsedTime();
        const positionsAttr = pointsRef.current.geometry.attributes.position;

        if (!positionsAttr) return;

        // Update positions with gentle wave drift
        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const idx = i * 4;

            // Base drift
            const driftX = Math.sin(time * 0.1 + driftParams[idx + 3]) * radius * 0.02;
            const driftY = Math.cos(time * 0.15 + driftParams[idx + 3]) * radius * 0.02;

            positionsAttr.setXYZ(
                i,
                initialPositions[ix] + driftX,
                initialPositions[ix + 1] + driftY,
                initialPositions[ix + 2]
            );
        }

        positionsAttr.needsUpdate = true;

        // Ensure rotation for depth feeling
        pointsRef.current.rotation.y = time * speed * 0.5;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <primitive object={material} attach="material" />
        </points>
    );
}
