"use client";

import { RefObject, useMemo } from "react";
import { CameraControls, Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { ConstellationGraph } from "@/components/canvas/objects/skill/ConstellationGraph";

interface SkillSceneProps {
    controlsRef: RefObject<CameraControls>;
}

export function SkillScene({ controlsRef }: SkillSceneProps) {
    // Generate random constellations
    const constellations = useMemo(() => {
        return Array.from({ length: 5 }).map((_, i) => {
            const numPoints = 5 + Math.floor(Math.random() * 5);
            const points = Array.from({ length: numPoints }).map(() =>
                new THREE.Vector3(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                )
            );
            // Simple connections: connect each point to the next
            const connections: [number, number][] = [];
            for (let j = 0; j < numPoints - 1; j++) {
                connections.push([j, j + 1]);
            }
            // Close the loop sometimes
            if (Math.random() > 0.5) {
                connections.push([numPoints - 1, 0]);
            }

            return {
                id: i,
                points,
                connections,
                position: [
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 50
                ] as [number, number, number],
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5).getStyle(),
            };
        });
    }, []);

    return (
        <group>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {constellations.map((c) => (
                <Float key={c.id} speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                    <ConstellationGraph
                        points={c.points}
                        connections={c.connections}
                        position={c.position}
                        color={c.color}
                        scale={1}
                    />
                </Float>
            ))}
        </group>
    );
}
