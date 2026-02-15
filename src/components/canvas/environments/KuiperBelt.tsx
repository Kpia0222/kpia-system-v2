"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { InstancedMesh, MeshPhysicalMaterial, DodecahedronGeometry, OctahedronGeometry, TetrahedronGeometry, Object3D, Vector3 } from "three";

export function KuiperBelt() {
    const meshRef = useRef<InstancedMesh>(null);
    const COUNT = 800;
    const ORBIT_RADIUS = 700; // Distance from DNA center
    const ORBIT_SPEED = 0.02; // Rotation speed (radians per second)

    // Shared Material: Liquid Metal
    const material = useMemo(() => new MeshPhysicalMaterial({
        color: "#ff88ff",
        metalness: 1.0,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        iridescence: 1.0,
        iridescenceIOR: 1.5,
        transparent: true,
        opacity: 0.8,
    }), []);

    // Generate orbital data
    const orbitData = useMemo(() => {
        const geometries = [
            new DodecahedronGeometry(1.5),
            new OctahedronGeometry(1.2),
            new TetrahedronGeometry(1.0)
        ];

        const data = [];
        for (let i = 0; i < COUNT; i++) {
            const angle = (i / COUNT) * Math.PI * 2; // Evenly distribute around circle
            data.push({
                initialAngle: angle,
                radiusVariation: (Math.random() - 0.5) * 20, // +/- 10 units
                yOffset: (Math.random() - 0.5) * 15, // Vertical spread
                scale: Math.random() * 0.8 + 0.3,
                rotSpeed: new Vector3(
                    Math.random() * 0.001,
                    Math.random() * 0.002,
                    Math.random() * 0.003
                ),
                orbitSpeedMult: 0.5 + Math.random() * 0.4, // 0.8 to 1.2x speed
                geometry: geometries[Math.floor(Math.random() * geometries.length)],
            });
        }
        return data;
    }, []);

    const dummy = useMemo(() => new Object3D(), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        orbitData.forEach((d, i) => {
            // Calculate current angle based on time and initial offset
            const currentAngle = d.initialAngle + (time * ORBIT_SPEED * d.orbitSpeedMult);

            // Orbital position (XZ plane)
            const radius = ORBIT_RADIUS + d.radiusVariation;
            const x = Math.cos(currentAngle) * radius;
            const z = Math.sin(currentAngle) * radius;

            dummy.position.set(x, d.yOffset, z);

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

    // Use first geometry as placeholder (will be overridden by matrix transforms)
    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} material={material} raycast={() => { }}>
            <dodecahedronGeometry args={[1]} />
        </instancedMesh>
    );
}
