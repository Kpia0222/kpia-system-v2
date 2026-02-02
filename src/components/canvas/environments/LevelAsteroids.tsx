"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { InstancedMesh, MeshPhysicalMaterial, Object3D, Vector3, DodecahedronGeometry } from "three";

export function LevelAsteroids() {
    const meshRef = useRef<InstancedMesh>(null);
    const COUNT = 8; // 12個の小惑星

    // 不規則な岩のようなマテリアル
    const material = useMemo(() => new MeshPhysicalMaterial({
        color: "#ff8800", // 茶色がかった岩の色
        metalness: 0.3,
        roughness: 0.9, // 粗い表面
        clearcoat: 0.1,
        clearcoatRoughness: 0.8,
        emissive: "#ff6600", // わずかな発光
        emissiveIntensity: 1.0,
    }), []);

    // 不規則な十二面体ジオメトリ (岩のように見える)
    const geometry = useMemo(() => {
        const geo = new DodecahedronGeometry(1, 0); // detail=0で角張った形
        // 頂点をランダムに変形させて不規則にする
        const positions = geo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            const factor = 0.7 + Math.random() * 0.6; // 0.7-1.3の範囲でランダム変形
            positions.setXYZ(i, x * factor, y * factor, z * factor);
        }
        geo.computeVertexNormals();
        return geo;
    }, []);

    // 小惑星データ
    const asteroidData = useMemo(() => {
        const data = [];
        for (let i = 0; i < COUNT; i++) {
            const angle = (i / COUNT) * Math.PI * 2;
            const radius = 2.5 + Math.random() * 1.5; // 2.5-4 units (画面座標での距離)

            data.push({
                orbitAngle: angle,
                orbitRadius: radius,
                yOffset: (Math.random() - 0.5) * 2,
                zOffset: (Math.random() - 0.5) * 1.5, // Z方向にも少し変化
                scale: Math.random() * 0.0 - 0.3, // 0.3-0.7
                rotSpeed: new Vector3(
                    (Math.random() - 0.5) * 1.0,
                    (Math.random() - 0.4) * 1.0,
                    (Math.random() - 0.3) * 1.0
                ),
                orbitSpeed: 0.05 + Math.random() * 0.1, // 0.05-0.15
                floatSpeed: Math.random() * 0.6 + 0.3,
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
            // 楕円軌道でLEVEL表示の周りを回る
            const angle = d.orbitAngle + time * d.orbitSpeed;
            const x = Math.cos(angle) * d.orbitRadius;
            const y = d.yOffset + Math.sin(time * d.floatSpeed + d.floatOffset) * 0.8;
            const z = Math.sin(angle) * d.orbitRadius * 0.6 + d.zOffset; // 手前に飛び出す

            dummy.position.set(x, y, z);

            // ゆっくり回転
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
        <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} />
    );
}
