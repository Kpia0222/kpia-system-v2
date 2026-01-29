"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { InstancedMesh, MeshPhysicalMaterial, Object3D, Vector3 } from "three";

/**
 * MeteorEnvironment Component
 * 
 * 銀河外縁部のカイパーベルトを表現するコンポーネント。
 * 液体金属マテリアルを使用して、美しい隕石リングを生成します。
 * 
 * @param minRadius - カイパーベルトの内側半径
 * @param maxRadius - カイパーベルトの外側半径
 * @param count - 隕石の数
 * @param color - 隕石の色（銀河のテーマカラー）
 * @param shapeType - ジオメトリタイプ ('tetrahedron' | 'box' | 'octahedron')
 */

interface MeteorEnvironmentProps {
    minRadius?: number;
    maxRadius?: number;
    count?: number;
    color?: string;
    shapeType?: 'tetrahedron' | 'box' | 'octahedron';
}

export function MeteorEnvironment({
    minRadius = 15.0,
    maxRadius = 40.0,
    count = 40,
    color = "#ff8800",
    shapeType = 'octahedron'
}: MeteorEnvironmentProps) {
    const meshRef = useRef<InstancedMesh>(null);

    // Liquid Metal Material
    const material = useMemo(() => new MeshPhysicalMaterial({
        color: color,
        metalness: 1.0,
        roughness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        iridescence: 1.0,
        iridescenceIOR: 1.5,
        emissive: color,
        emissiveIntensity: 0.2, // Subtle glow
    }), [color]);

    // Generate meteor data (Orbiting + Floating logic)
    const meteorData = useMemo(() => {
        const data = [];
        for (let i = 0; i < count; i++) {
            // Circular distribution
            const angle = (i / count) * Math.PI * 2;
            const radius = minRadius + Math.random() * (maxRadius - minRadius);

            data.push({
                orbitAngle: angle,
                orbitRadius: radius,
                yOffset: (Math.random() - 0.5) * (maxRadius - minRadius) * 0.3, // Vertical spread

                scale: 0.5 + Math.random() * 0.25, // Random scale 0.1 ~ 0.25

                rotSpeed: new Vector3(
                    Math.random() * 0.2,
                    Math.random() * 0.2,
                    Math.random() * 0.2
                ),
                floatSpeed: Math.random() * 0.05 + 0.05,
                floatOffset: Math.random() * Math.PI * 2,
            });
        }
        return data;
    }, [count, minRadius, maxRadius]);

    const dummy = useMemo(() => new Object3D(), []);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        meteorData.forEach((d, i) => {
            // Circular Orbit Animation
            const angle = d.orbitAngle + time * 0.05; // Slow orbit
            const x = Math.cos(angle) * d.orbitRadius;
            const z = Math.sin(angle) * d.orbitRadius;

            // Vertical Floating
            const y = d.yOffset + Math.sin(time * d.floatSpeed + d.floatOffset) * 2.0;

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
            {shapeType === 'tetrahedron' && <tetrahedronGeometry args={[1, 0]} />}
            {shapeType === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
            {shapeType === 'box' && <boxGeometry args={[1, 1, 1]} />}
        </instancedMesh>
    );
}
