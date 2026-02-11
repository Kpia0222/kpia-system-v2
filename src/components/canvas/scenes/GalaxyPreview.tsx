"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GalaxyData } from "@/config/galaxy-data";

interface GalaxyPreviewProps {
    data: GalaxyData;
    isHovered: boolean;
    isSelected: boolean;
}

export function GalaxyPreview({ data, isHovered, isSelected }: GalaxyPreviewProps) {
    const pointsRef = useRef<THREE.Points>(null);

    // Generate Spiral Geometry
    const geometry = useMemo(() => {
        const particles = 2000;
        const positions = new Float32Array(particles * 3);
        const colors = new Float32Array(particles * 3);

        const colorInside = new THREE.Color('#00ffff');
        const colorOutside = new THREE.Color('#0044ff');

        for (let i = 0; i < particles; i++) {
            const i3 = i * 3;
            // Radius and Angle
            const radius = Math.random() * 50 + 10;
            const spinAngle = radius * 0.1;
            const branchAngle = (i % 3) * ((Math.PI * 2) / 3); // 3 arms

            const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
            const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);
            const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1);

            const x = Math.cos(branchAngle + spinAngle) * radius + randomX * 10;
            const y = randomY * 5;
            const z = Math.sin(branchAngle + spinAngle) * radius + randomZ * 10;

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            // Color
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / 60);

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geo;
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                size={isHovered ? 2 : 1.5}
                sizeAttenuation={true}
                depthWrite={false}
                vertexColors={true}
                blending={THREE.AdditiveBlending}
                transparent={true}
                opacity={0.8}
            />
        </points>
    );
}
