"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line, Sphere } from "@react-three/drei";

interface ConstellationGraphProps {
    points: THREE.Vector3[];
    connections: [number, number][];
    position?: [number, number, number];
    scale?: number;
    color?: string;
}

export function ConstellationGraph({
    points,
    connections,
    position = [0, 0, 0],
    scale = 1,
    color = "#00FFFF",
}: ConstellationGraphProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    // Normalize points to center
    const centeredPoints = useMemo(() => {
        const center = new THREE.Vector3();
        points.forEach((p) => center.add(p));
        center.divideScalar(points.length);
        return points.map((p) => p.clone().sub(center));
    }, [points]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Slow rotation
            groupRef.current.rotation.y += delta * 0.05;
            groupRef.current.rotation.x += delta * 0.02;
        }
    });

    return (
        <group position={position} scale={scale} ref={groupRef}>
            {/* Points (Stars) */}
            {centeredPoints.map((point, index) => (
                <Sphere
                    key={index}
                    position={point}
                    args={[0.2, 16, 16]}
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        setHoveredPoint(index);
                    }}
                    onPointerOut={(e) => {
                        e.stopPropagation();
                        setHoveredPoint(null);
                    }}
                >
                    <meshStandardMaterial
                        color={hoveredPoint === index ? "#ffffff" : color}
                        emissive={hoveredPoint === index ? "#ffffff" : color}
                        emissiveIntensity={hoveredPoint === index ? 2 : 0.5}
                    />
                </Sphere>
            ))}

            {/* Lines (Constellation connections) */}
            {connections.map(([start, end], index) => (
                <Line
                    key={`line-${index}`}
                    points={[centeredPoints[start], centeredPoints[end]]}
                    color={color}
                    transparent
                    opacity={0.3}
                    lineWidth={1}
                />
            ))}
        </group>
    );
}
