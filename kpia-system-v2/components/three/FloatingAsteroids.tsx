"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { InstancedMesh, MeshPhysicalMaterial, Object3D, Vector3, IcosahedronGeometry } from "three";

export function FloatingAsteroids() {
    const meshRef = useRef<InstancedMesh>(null);
    const COUNT = 20; // Increased for better visibility

    // Liquid Metal Material
    const material = useMemo(() => new MeshPhysicalMaterial({
        color: "#ffaa44", // Warmer orange color
        metalness: 1.0,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        iridescence: 1.0,
        iridescenceIOR: 1.5,
        emissive: "#ff8800", // Add glow
        emissiveIntensity: 0.3,
    }), []);

    // Generate asteroid data
    const asteroidData = useMemo(() => {
        const data = [];
        for (let i = 0; i < COUNT; i++) {
            const angle = (i / COUNT) * Math.PI * 2;
            const radius = 20 + Math.random() * 15; // 20-35 units

            data.push({
                orbitAngle: angle,
                orbitRadius: radius,
                yOffset: (Math.random() - 0.5) * 12,
                scale: Math.random() * 2.0 + 1.0, // 1.0 to 3.0 (much larger)
                rotSpeed: new Vector3(
                    Math.random() * 0.5,
                    Math.random() * 0.5,
                    Math.random() * 0.5
                ),
                floatSpeed: Math.random() * 0.8 + 0.5,
                floatOffset: Math.random() * Math.PI * 2,
            });
        }
        return data;
    }, []);

    const dummy = useMemo(() => new Object3D(), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        asteroidData.forEach((d, i) => {
            // Circular floating pattern
            const angle = d.orbitAngle + time * 0.1; // Slow orbit
            const x = Math.cos(angle) * d.orbitRadius;
            const z = Math.sin(angle) * d.orbitRadius;

            // Add floating Y motion
            const y = d.yOffset + Math.sin(time * d.floatSpeed + d.floatOffset) * 3;

            dummy.position.set(x, y, z);

            // Self-rotation
            dummy.rotation.x += d.rotSpeed.x * delta;
            dummy.rotation.y += d.rotSpeed.y * delta;
            dummy.rotation.z += d.rotSpeed.z * delta;

            dummy.scale.setScalar(d.scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} material={material}>
            <icosahedronGeometry args={[1, 1]} />
        </instancedMesh>
    );
}
