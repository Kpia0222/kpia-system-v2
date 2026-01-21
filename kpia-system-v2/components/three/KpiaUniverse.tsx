"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, useCursor, CameraControls } from "@react-three/drei";
import * as THREE from "three";

// ----------------------------------------------------------------------
// 1. Data Definitions
// ----------------------------------------------------------------------
export type GalaxyType = 'order' | 'ring' | 'chaos' | 'spiral';

export interface GalaxyData {
    id: string;
    name: string;
    type: GalaxyType;
    position: [number, number, number];
    rotation?: [number, number, number];
    starCount: number;
    erosionLevel: number;
}

export const galaxies: GalaxyData[] = [
    {
        id: 'g-order',
        name: 'WESTERN ORDER',
        type: 'order',
        position: [10, 0, 5],
        rotation: [0, 0, 0],
        starCount: 64, // 4x4x4
        erosionLevel: 0.05
    },
    {
        id: 'g-ring',
        name: 'MAQAM SYSTEM',
        type: 'ring',
        position: [-15, 8, -10],
        rotation: [Math.PI / 6, 0, Math.PI / 4],
        starCount: 180,
        erosionLevel: 0.35
    },
    {
        id: 'g-chaos',
        name: 'TABOO SECTOR',
        type: 'chaos',
        position: [5, -15, -25],
        rotation: [0, 0, 0],
        starCount: 300,
        erosionLevel: 0.92
    },
    {
        id: 'g-africa',
        name: 'AFRICAN POLYRHYTHM',
        type: 'ring',
        position: [20, -10, -5],
        rotation: [0, Math.PI / 4, 0],
        starCount: 150,
        erosionLevel: 0.15
    },
    {
        id: 'g-irish',
        name: 'CELTIC SPIRAL',
        type: 'chaos',
        position: [-25, -5, 15],
        rotation: [Math.PI / 2, 0, 0],
        starCount: 100,
        erosionLevel: 0.25
    },
    {
        id: 'g-spiral',
        name: 'ANDROMEDA VORTEX',
        type: 'spiral',
        position: [15, 20, 0],
        rotation: [Math.PI / 3, 0, 0],
        starCount: 250,
        erosionLevel: 0.50
    }
];



// ----------------------------------------------------------------------
// 3. Galaxy Cluster: 銀河団
// ----------------------------------------------------------------------
function GalaxyCluster({
    type,
    data,
    isHovered,
    isSelected,
    isDimmed,
    onPointerOver,
    onPointerOut,
    onClick
}: {
    type: GalaxyType;
    data: GalaxyData;
    isHovered: boolean;
    isSelected: boolean;
    isDimmed: boolean;
    onPointerOver: (e: any) => void;
    onPointerOut: (e: any) => void;
    onClick: (e: any) => void;
}) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const groupRef = useRef<THREE.Group>(null);

    // マウスカーソルの変更
    useCursor(isHovered);

    // 設定
    const config = useMemo(() => {
        // Custom colors/sizes by ID overrides Type default
        if (data.id === 'g-africa') return { count: data.starCount, color: '#ff6600', size: 0.25 };
        if (data.id === 'g-irish') return { count: data.starCount, color: '#00ff99', size: 0.2 };
        if (type === 'spiral') return { count: data.starCount, color: '#88aaff', size: 0.2 };

        switch (type) {
            case 'order': return { count: data.starCount, color: '#ffffff', size: 0.3 };
            case 'ring': return { count: data.starCount, color: '#ffeeaa', size: 0.2 };
            case 'chaos': return { count: data.starCount, color: '#990000', size: 0.15 };
            default: return { count: 100, color: '#fff', size: 0.2 };
        }
    }, [type, data.id, data.starCount]);

    // 配置計算
    const instances = useMemo(() => {
        const dataArray: THREE.Matrix4[] = [];
        const temp = new THREE.Object3D();

        if (type === 'order') {
            const dim = 4;
            const spacing = 1.5;
            const offset = (dim * spacing) / 2;
            let c = 0;
            for (let x = 0; x < dim; x++) {
                for (let y = 0; y < dim; y++) {
                    for (let z = 0; z < dim; z++) {
                        if (c >= config.count) break;
                        temp.position.set(
                            x * spacing - offset,
                            y * spacing - offset,
                            z * spacing - offset
                        );
                        temp.rotation.set(0, 0, 0);
                        temp.scale.setScalar(config.size);
                        temp.updateMatrix();
                        dataArray.push(temp.matrix.clone());
                        c++;
                    }
                }
            }
        } else if (type === 'ring') {
            const count = config.count;
            for (let i = 0; i < count; i++) {
                const theta = (i / count) * Math.PI * 2;
                const radius = 5;
                const tube = 1.0;
                const phi = Math.random() * Math.PI * 2;
                const r = Math.random() * tube;

                temp.position.set(
                    (radius + r * Math.cos(phi)) * Math.cos(theta),
                    r * Math.sin(phi),
                    (radius + r * Math.cos(phi)) * Math.sin(theta)
                );
                temp.rotation.set(Math.random(), Math.random(), Math.random());
                temp.scale.setScalar(config.size * (0.8 + Math.random() * 0.4));
                temp.updateMatrix();
                dataArray.push(temp.matrix.clone());
            }
        } else if (type === 'chaos') {
            const count = config.count;
            for (let i = 0; i < count; i++) {
                const r = Math.random() * 6;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                temp.position.set(
                    r * Math.sin(phi) * Math.cos(theta),
                    r * Math.sin(phi) * Math.sin(theta),
                    r * Math.cos(phi)
                );
                temp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
                temp.scale.setScalar(config.size * (0.5 + Math.random()));
                temp.updateMatrix();
                dataArray.push(temp.matrix.clone());
            }
        }
        return dataArray;
    }, [type, config]);

    const setInstances = (mesh: THREE.InstancedMesh | null) => {
        if (!mesh) return;
        instances.forEach((matrix, i) => {
            mesh.setMatrixAt(i, matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    };

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (data.id === 'g-africa') {
                meshRef.current.rotation.y += delta * 0.5;
                meshRef.current.rotation.x += delta * 0.2;
            } else if (data.id === 'g-irish') {
                meshRef.current.rotation.z -= delta * 0.3;
            } else {
                if (type === 'ring' || type === 'spiral') meshRef.current.rotation.y += delta * 0.1;
                if (type === 'chaos') {
                    meshRef.current.rotation.y -= delta * 0.05;
                    meshRef.current.rotation.z += delta * 0.02;
                }
                if (type === 'order') meshRef.current.rotation.y += delta * 0.01;
            }
        }

        // ホバー/選択時のスケールアニメーション
        if (groupRef.current) {
            let targetScale = isHovered ? 1.2 : 1.0;
            if (isDimmed) targetScale = 0.8; // 他が選択されているときは少し小さく
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
        }
    });

    // ヒットボックスの半径設定
    const hitRadius = type === 'order' ? 7 : (type === 'ring' || type === 'spiral') ? 8 : 7;

    return (
        <group ref={groupRef}>
            <mesh
                onPointerOver={onPointerOver}
                onPointerOut={onPointerOut}
                onClick={onClick}
            >
                <sphereGeometry args={[hitRadius, 16, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>

            <instancedMesh
                ref={(el) => {
                    meshRef.current = el;
                    setInstances(el);
                }}
                args={[undefined, undefined, config?.count ?? 0]}
            >
                {type === 'order' ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[1, 8, 8]} />}
                <meshStandardMaterial
                    color={config?.color || '#fff'}
                    roughness={0.5}
                    emissive={config?.color || '#fff'}
                    emissiveIntensity={isHovered || isSelected ? 2.0 : 0.2}
                    toneMapped={false}
                    transparent
                    opacity={isDimmed ? 0.3 : 1.0} // 非選択時は薄く
                />
            </instancedMesh>
        </group>
    )
}


// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
interface KpiaUniverseProps {
    hoveredGalaxy: GalaxyData | null;
    selectedGalaxy: GalaxyData | null;
    onHoverGalaxy: (data: GalaxyData | null) => void;
    onSelectGalaxy: (data: GalaxyData | null) => void;
}

export function KpiaUniverse({
    hoveredGalaxy,
    selectedGalaxy,
    onHoverGalaxy,
    onSelectGalaxy
}: KpiaUniverseProps) {
    const controlsRef = useRef<CameraControls>(null);

    // 視点移動の副作用
    useEffect(() => {
        if (selectedGalaxy) {
            // ズームイン
            // 位置: 銀河の位置 + Z軸手前(15) + Y軸少し上(5)
            const [gx, gy, gz] = selectedGalaxy.position;
            controlsRef.current?.setLookAt(
                gx, gy + 5, gz + 15, // Eye
                gx, gy, gz,          // Target
                true                 // Animated
            );
        } else {
            // リセット（全体俯瞰）
            controlsRef.current?.setLookAt(
                0, 20, 40, // Eye (Default)
                0, 0, 0,   // Target
                true
            );
        }
    }, [selectedGalaxy]);

    return (
        <group>
            <CameraControls
                ref={controlsRef}
                minDistance={5}
                maxDistance={80}
                smoothTime={0.8} // スムーズな移動
            />



            {galaxies.map((galaxy) => (
                <Float key={galaxy.id} speed={galaxy.type === 'chaos' ? 3 : galaxy.type === 'ring' ? 2 : 1} rotationIntensity={0.2} floatIntensity={0.5}>
                    <group position={galaxy.position} rotation={galaxy.rotation ? new THREE.Euler(...galaxy.rotation) : undefined}>
                        <GalaxyCluster
                            type={galaxy.type}
                            data={galaxy}
                            isHovered={hoveredGalaxy?.id === galaxy.id}
                            isSelected={selectedGalaxy?.id === galaxy.id}
                            isDimmed={!!selectedGalaxy && selectedGalaxy.id !== galaxy.id}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                if (!selectedGalaxy) onHoverGalaxy(galaxy); // 選択中はホバー更新しない
                            }}
                            onPointerOut={(e) => {
                                e.stopPropagation();
                                if (!selectedGalaxy) onHoverGalaxy(null);
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectGalaxy(galaxy);
                                onHoverGalaxy(galaxy); // クリック時も念のためホバー状態にする
                            }}
                        />
                    </group>
                </Float>
            ))}
        </group>
    );
}
