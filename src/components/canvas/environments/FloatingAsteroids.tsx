"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { InstancedMesh, MeshPhysicalMaterial, Object3D, Vector3 } from "three";

/**
 * FloatingAsteroids Component
 * 
 * 銀河内部の小惑星帯を表現するコンポーネント。
 * InstancedMeshを使用して多数の小惑星を効率的にレンダリングします。
 * 
 * @param minRadius - 小惑星帯の内側半径
 * @param maxRadius - 小惑星帯の外側半径
 * @param count - 小惑星の数
 * @param color - 小惑星の色
 * @param sizeScale - サイズのスケール係数
 * @param type - ジオメトリタイプ ('sphere' | 'poly' | 'shard')
 */

interface FloatingAsteroidsProps {
    minRadius?: number;
    maxRadius?: number;
    count?: number;
    color?: string;
    sizeScale?: number;
    type?: 'sphere' | 'poly' | 'shard';
}

export function FloatingAsteroids({
    minRadius = 20,
    maxRadius = 35,
    count = 20,
    color = "#ff6200ff",
    sizeScale = 1.0,
    type = 'shard'
}: FloatingAsteroidsProps) {
    const meshRef = useRef<InstancedMesh>(null);

    // Dynamic Material based on props
    const material = useMemo(() => new MeshPhysicalMaterial({
        color: color,
        metalness: type === 'poly' ? 0.8 : 1.0,
        roughness: type === 'poly' ? 0.4 : 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        iridescence: 1.0,
        iridescenceIOR: 1.5,
        emissive: color,
        emissiveIntensity: 0.2,
        wireframe: type === 'poly',
    }), [color, type]);

    // Generate asteroid data
    const asteroidData = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = minRadius + Math.random() * (maxRadius - minRadius);

            data.push({
                orbitAngle: angle,
                orbitRadius: radius,
                yOffset: (Math.random() - 0.5) * 151,
                // Apply sizeScale (default 1.0 -> 0.3 to make them smaller as requested)
                scale: (Math.random() * 0.3 + 0.5) * sizeScale,
                rotSpeed: new Vector3(
                    Math.random() * 0.1,
                    Math.random() * 0.1,
                    Math.random() * 0.1
                ),
                floatSpeed: Math.random() * 0.2 + 0.5,
                floatOffset: Math.random() * Math.PI * 2,
            });
        }
        return data;
    }, [count, minRadius, maxRadius, sizeScale]);

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
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]} material={material}>
            {type === 'poly' && <dodecahedronGeometry args={[1, 0]} />}
            {type === 'sphere' && <icosahedronGeometry args={[1, 1]} />}
            {type === 'shard' && <octahedronGeometry args={[1, 0]} />}
        </instancedMesh>
    );
}
