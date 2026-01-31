"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WarpEffectProps {
    active: boolean;
    streakCount?: number;
}

/**
 * WarpEffect - Rainbow glass warp transition effect
 */
export function WarpEffect({ active, streakCount = 100 }: WarpEffectProps) {
    const groupRef = useRef<THREE.Group>(null);
    const streaksRef = useRef<THREE.InstancedMesh>(null);

    // Create streak positions and speeds
    const streakData = useMemo(() => {
        const positions: THREE.Vector3[] = [];
        const speeds: number[] = [];
        const lengths: number[] = [];

        for (let i = 0; i < streakCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 8;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = Math.random() * 20 - 10;

            positions.push(new THREE.Vector3(x, y, z));
            speeds.push(0.5 + Math.random() * 1.5);
            lengths.push(0.5 + Math.random() * 2);
        }

        return { positions, speeds, lengths };
    }, [streakCount]);

    // Geometry for individual streak
    const streakGeometry = useMemo(() => {
        return new THREE.CylinderGeometry(0.02, 0.02, 1, 8, 1);
    }, []);

    // Rainbow glass material with iridescence
    const material = useMemo(() => {
        return new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.5,
            roughness: 0,
            transmission: 0.9,
            thickness: 0.5,
            ior: 2.33,
            iridescence: 1.0,
            iridescenceIOR: 1.5,
            iridescenceThicknessRange: [100, 400],
            envMapIntensity: 1.5,
            transparent: true,
            opacity: 0.9,
        });
    }, []);

    // Animation
    useFrame((state, delta) => {
        if (!active || !streaksRef.current) return;

        const mesh = streaksRef.current;
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        for (let i = 0; i < streakCount; i++) {
            mesh.getMatrixAt(i, matrix);
            matrix.decompose(position, quaternion, scale);

            position.z += delta * streakData.speeds[i] * 30;

            if (position.z > 15) {
                position.z = -15;
                const angle = Math.random() * Math.PI * 2;
                const radius = 2 + Math.random() * 8;
                position.x = Math.cos(angle) * radius;
                position.y = Math.sin(angle) * radius;
            }

            matrix.compose(position, quaternion, scale);
            mesh.setMatrixAt(i, matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
    });

    // Initialize streak positions
    useMemo(() => {
        if (!active) return;

        const mesh = streaksRef.current;
        if (!mesh) return;

        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

        for (let i = 0; i < streakCount; i++) {
            const position = streakData.positions[i];
            const scale = new THREE.Vector3(1, streakData.lengths[i], 1);
            matrix.compose(position, quaternion, scale);
            mesh.setMatrixAt(i, matrix);
        }

        mesh.instanceMatrix.needsUpdate = true;
    }, [active, streakCount, streakData]);

    if (!active) return null;

    return (
        <group ref={groupRef}>
            <instancedMesh
                ref={streaksRef}
                args={[streakGeometry, material, streakCount]}
                frustumCulled={false}
            />

            {/* Central glow sphere */}
            <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshPhysicalMaterial
                    color={0xffffff}
                    emissive={0xffffff}
                    emissiveIntensity={0.5}
                    metalness={0.5}
                    roughness={0}
                    iridescence={1.0}
                    iridescenceIOR={1.5}
                    iridescenceThicknessRange={[100, 400]}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Outer ring glow */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3, 0.05, 8, 64]} />
                <meshPhysicalMaterial
                    color={0xffffff}
                    metalness={0.5}
                    roughness={0}
                    iridescence={1.0}
                    iridescenceIOR={1.5}
                    transparent
                    opacity={0.6}
                />
            </mesh>
        </group>
    );
}
