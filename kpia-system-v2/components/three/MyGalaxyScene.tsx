"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function MyGalaxyScene() {
    const groupRef = useRef<THREE.Group>(null);

    // Grid Background
    const gridRef = useRef<THREE.GridHelper>(null);

    // Double Helix Data Generation
    const { positions, connectLines } = useMemo(() => {
        const count = 100; // Number of points per strand
        const height = 400;
        const radius = 40;
        const turns = 4;

        const posArray: [number, number, number][] = [];
        const lines: { start: [number, number, number], end: [number, number, number] }[] = [];

        // Strand 1 & 2
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const angle = t * Math.PI * 2 * turns;
            const y = (t - 0.5) * height;

            // Strand 1
            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;

            // Strand 2 (Offset by PI)
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;

            posArray.push([x1, y, z1]);
            posArray.push([x2, y, z2]); // Push sequentially, or handle as separate arrays.

            // Bridge line every few points
            if (i % 3 === 0) {
                lines.push({ start: [x1, y, z1], end: [x2, y, z2] });
            }
        }
        return { positions: posArray, connectLines: lines };
    }, []);

    // Create Instance Mesh for Fluid Particles
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!meshRef.current || !groupRef.current) return;

        const time = state.clock.getElapsedTime();

        // Rotate entire DNA
        groupRef.current.rotation.y = time * 0.1;

        // Animate particles (Undulation)
        positions.forEach((pos, i) => {
            const [ix, iy, iz] = pos;

            // Wave effect: Modify Y/Radius slightly based on time
            const wave = Math.sin(iy * 0.05 + time * 1.5) * 5;
            const scale = 1.0 + Math.sin(iy * 0.1 + time * 2) * 0.3;

            dummy.position.set(ix, iy + wave, iz);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(time * 0.5, time * 0.3, 0); // Self rotation for liquid feel
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <fog attach="fog" args={['#000000', 100, 1000]} />
            <ambientLight intensity={0.2} />
            <pointLight position={[200, 200, 200]} intensity={1} color="#ff8800" />
            <pointLight position={[-200, -200, -200]} intensity={0.5} color="#4444ff" />



            {/* DNA Group */}
            <group ref={groupRef}>
                {/* Liquid Metal Particles */}
                <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]}>
                    <sphereGeometry args={[3, 16, 16]} />
                    {/* Liquid Metal Material: High Metalness, Low Roughness */}
                    <meshPhysicalMaterial
                        color="#aaaaaa"
                        metalness={1.0}
                        roughness={0.0}
                        envMapIntensity={2.0}
                        emissive="#222222"
                    />
                </instancedMesh>

                {/* Connecting Bridges (Orange Glow) */}
                {connectLines.map((line, idx) => {
                    // Convert array points to Vector3 for line geometry logic or just use naive mesh lines
                    // Using thin cylinders for bridges looks better than GL_LINES
                    const start = new THREE.Vector3(...line.start);
                    const end = new THREE.Vector3(...line.end);
                    const center = start.clone().lerp(end, 0.5);
                    const dist = start.distanceTo(end);

                    return (
                        <mesh key={idx} position={center} rotation={[0, -Math.atan2(end.z - start.z, end.x - start.x), Math.PI / 2]}>
                            {/* Rotation logic is tricky for arbitrary 3D lines, simplified here or use Line component */}
                            {/* Better: Use Line from Drei? Or simple primitives. 
                                 For vertical helix, bridges are horizontal.
                                 atan2 logic above is for horizontal plane rotation. 
                             */}
                            <boxGeometry args={[dist, 0.5, 0.5]} />
                            <meshBasicMaterial color="#ff8800" />
                        </mesh>
                    )
                })}
            </group>
        </group>
    );
}

// Optimized Line Drawing Helper could be better, but loop above works for prototype.
// Actually, simple LineSegments is best for performance if we want simple lines.
// But user asked for "Orange strong glow". Mesh with bloom is better.
