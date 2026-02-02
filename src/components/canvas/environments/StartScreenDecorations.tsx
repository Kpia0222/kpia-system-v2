"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { Mesh, MeshPhysicalMaterial, Vector3, DodecahedronGeometry, OctahedronGeometry, TetrahedronGeometry } from "three";
import * as THREE from "three";

interface StartScreenDecorationsProps {
    isTransitioning: boolean;
}

export function StartScreenDecorations({ isTransitioning }: StartScreenDecorationsProps) {
    // Light for DNA Reflection
    const lightRef = useRef<THREE.PointLight>(null);

    // Generate random objects with clustering
    const shapes = useMemo(() => {
        const items = [];
        const geometries = [
            new DodecahedronGeometry(1.5),
            new OctahedronGeometry(1.2),
            new TetrahedronGeometry(1.0)
        ];

        const COUNT = 200;

        for (let i = 0; i < COUNT; i++) {
            // Cluster Logic: 
            // 40% near DNA (Left), 40% near Title (Center), 20% Random
            let xBase = 0;
            let yBase = 0;
            let spreadFactor = 1.1;

            const seed = Math.random();
            if (seed < 0.4) {
                // DNA Cluster (Left)
                xBase = -80; // Closer to DNA
                yBase = 0;
                spreadFactor = 0.8;
            } else if (seed < 0.8) {
                // Title Cluster (Center)
                xBase = 0;
                yBase = 0;
                spreadFactor = 9.9;
            } else {
                // Random outlier
                xBase = (Math.random() - 0.5) * 100;
                spreadFactor = 3.3;
            }

            items.push({
                geometry: geometries[Math.floor(Math.random() * geometries.length)],
                position: new Vector3(
                    xBase + (Math.random() - 0.5) * 40 * spreadFactor,
                    yBase + (Math.random() - 0.5) * 30 * spreadFactor,
                    (Math.random() - 0.5) * 50 - 10 // Range Z
                ),
                rotSpeed: new Vector3(
                    Math.random() * 0.5,
                    Math.random() * 0.5,
                    Math.random() * 0.5
                ),
                floatSpeed: Math.random() * 0.5 + 0.2,
                floatOffset: Math.random() * Math.PI * 2,
                scale: Math.random() * 1.5 + 0.2, // Varied scale: 0.2 to 1.7
                // Unique movement seed for transition
                flowSpeed: Math.random() * 20 + 30, // Fast
                transitionDelay: Math.random() * 0.2,
            });
        }
        return items;
    }, []);

    // Material: Liquid Metal
    const material = useMemo(() => new MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 1.0,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        iridescence: 1.0,
        iridescenceIOR: 1.5,
    }), []);

    return (
        <group>
            {/* Orange Light representing DNA glow from Left */}
            <pointLight
                ref={lightRef}
                position={[-150, 0, 50]}
                intensity={8000} // High intensity for decay distance 
                distance={500}
                decay={2}
                color="#ff8800"
            />
            {/* Ambient fill */}
            <ambientLight intensity={0.2} />

            {shapes.map((data, i) => (
                <FloatingShape
                    key={i}
                    data={data}
                    material={material}
                    isTransitioning={isTransitioning}
                />
            ))}
        </group>
    );
}

function FloatingShape({ data, material, isTransitioning }: { data: any, material: MeshPhysicalMaterial, isTransitioning: boolean }) {
    const meshRef = useRef<Mesh>(null);
    const timeRef = useRef(0);
    const transitionTimeRef = useRef(0);

    // Initial position freeze
    const initialPos = useRef(data.position.clone());

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        timeRef.current += delta;

        if (!isTransitioning) {
            // Idle Animation
            // Rotate
            meshRef.current.rotation.x += data.rotSpeed.x * delta;
            meshRef.current.rotation.y += data.rotSpeed.y * delta;

            // Float
            const yOffset = Math.sin(timeRef.current * data.floatSpeed + data.floatOffset) * 2;
            meshRef.current.position.set(
                initialPos.current.x,
                initialPos.current.y + yOffset,
                initialPos.current.z
            );
        } else {
            // Transition Animation (Radial Expansion from DNA)
            transitionTimeRef.current += delta;

            // DNA center position (in world coordinates, accounting for group offset in page.tsx)
            const DNA_CENTER = new Vector3(-150, 0, 0);

            if (transitionTimeRef.current > data.transitionDelay) {
                const activeTime = transitionTimeRef.current - data.transitionDelay;

                // Calculate radial direction from DNA center to object
                const direction = new Vector3().subVectors(initialPos.current, DNA_CENTER).normalize();

                // Accelerating radial expansion
                const expandDist = data.flowSpeed * (activeTime * activeTime);

                // Apply radial movement
                const newPos = new Vector3().addVectors(
                    initialPos.current,
                    direction.multiplyScalar(expandDist)
                );

                meshRef.current.position.copy(newPos);

                // Faster rotation during expansion
                meshRef.current.rotation.x += data.rotSpeed.x * delta * 5;
                meshRef.current.rotation.y += data.rotSpeed.y * delta * 5;
            }
        }
    });

    return (
        <mesh
            ref={meshRef}
            geometry={data.geometry}
            material={material}
            scale={data.scale}
            position={data.position}
        />
    );
}
