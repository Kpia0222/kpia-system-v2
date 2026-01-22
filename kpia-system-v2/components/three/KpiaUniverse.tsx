"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
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
        position: [400, 50, 200],
        rotation: [0, 0, 0],
        starCount: 2000,
        erosionLevel: 0.05
    },
    {
        id: 'g-ring',
        name: 'MAQAM SYSTEM',
        type: 'ring',
        position: [-500, 150, -300],
        rotation: [Math.PI / 6, 0, Math.PI / 4],
        starCount: 3500,
        erosionLevel: 0.35
    },
    {
        id: 'g-chaos',
        name: 'TABOO SECTOR',
        type: 'chaos',
        position: [200, -100, -600],
        rotation: [0, 0, 0],
        starCount: 5000,
        erosionLevel: 0.92
    },
    {
        id: 'g-africa',
        name: 'AFRICAN POLYRHYTHM',
        type: 'ring',
        position: [600, -50, -100],
        rotation: [0, Math.PI / 4, 0],
        starCount: 3000,
        erosionLevel: 0.15
    },
    {
        id: 'g-irish',
        name: 'CELTIC SPIRAL',
        type: 'chaos',
        position: [-600, 0, 500],
        rotation: [Math.PI / 2, 0, 0],
        starCount: 2500,
        erosionLevel: 0.25
    },
    {
        id: 'g-spiral',
        name: 'ANDROMEDA VORTEX',
        type: 'spiral',
        position: [0, 200, 0],
        rotation: [Math.PI / 3, 0, 0],
        starCount: 4000,
        erosionLevel: 0.50
    }
];

// ----------------------------------------------------------------------
// 2. GLSL Noise Functions (for Injection)
// ----------------------------------------------------------------------
const noiseGLSL = `
    // 3D Simplex Noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        float n_ = 0.142857142857; 
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                        dot(p2,x2), dot(p3,x3) ) );
    }

    // FBM for more detail
    float fbm(vec3 x) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100.0);
        for (int i = 0; i < 4; ++i) {
            v += a * snoise(x);
            x = x * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }
`;

// ----------------------------------------------------------------------
// 3. Galaxy Cluster: Organic Liquid Metal Blob
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
    const groupRef = useRef<THREE.Group>(null);
    useCursor(isHovered);

    // Color Config (Unified Orange)
    const color = '#ff8800';

    // Memoize Geometry for sharing across layers
    const geometry = useMemo(() => {
        return data.id === 'g-order'
            ? new THREE.DodecahedronGeometry(40, 0)
            : new THREE.OctahedronGeometry(40, 0);
    }, [data.id]);

    // Animation Loop
    useFrame((state, delta) => {
        if (groupRef.current) {
            // Constant elegant rotation
            groupRef.current.rotation.x += delta * 0.15;
            groupRef.current.rotation.y += delta * 0.2;

            // Hover effect (Scale only)
            let targetScale = isHovered ? 1.2 : 1.0;
            if (isDimmed) targetScale = 0.6;
            groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 2);
        }
    });

    return (
        <group>
            {/* Hit Area (Invisible Sphere) matching roughly the blob size */}
            <mesh
                onPointerOver={onPointerOver}
                onPointerOut={onPointerOut}
                onClick={onClick}
                visible={false}
            >
                <sphereGeometry args={[60, 16, 16]} />
                <meshBasicMaterial />
            </mesh>

            {/* 3-Layer Geometric Crystal Group */}
            <group ref={groupRef}>

                {/* Layer 1: Faces (Soap Bubble) */}
                <mesh geometry={geometry}>
                    <meshPhysicalMaterial
                        color={color}
                        transmission={1.0}
                        transparent={true}
                        opacity={0.3}
                        roughness={0.0}
                        metalness={0.0}
                        ior={1.5}
                        thickness={0.1}
                        iridescence={1.0}
                        iridescenceIOR={1.3}
                        iridescenceThicknessRange={[100, 400]}
                        envMapIntensity={2.0}
                        side={THREE.DoubleSide}
                        flatShading={true}
                    />
                </mesh>

                {/* Layer 2: Edges (White Wireframe) */}
                <lineSegments>
                    <edgesGeometry args={[geometry]} />
                    <lineBasicMaterial color="#FFFFFF" opacity={0.6} transparent />
                </lineSegments>

                {/* Layer 3: Dots (Vertex Points) */}
                <points geometry={geometry}>
                    <pointsMaterial
                        color="#FFFFFF"
                        size={0.6}
                        transparent
                        opacity={0.9}
                        sizeAttenuation={true}
                    />
                </points>
            </group>
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
    controlsRef: React.RefObject<CameraControls | null>;
}

export function KpiaUniverse({
    hoveredGalaxy,
    selectedGalaxy,
    onHoverGalaxy,
    onSelectGalaxy,
    controlsRef
}: KpiaUniverseProps) {
    // 視点移動の副作用
    useEffect(() => {
        if (selectedGalaxy) {
            // ズームイン
            const [gx, gy, gz] = selectedGalaxy.position;
            controlsRef.current?.setLookAt(
                gx, gy + 50, gz + 100, // Eye
                gx, gy, gz,          // Target
                true                 // Animated
            );
        } else {
            // リセット（全体俯瞰）
            controlsRef.current?.setLookAt(
                0, 200, 400, // Eye (Default)
                0, 0, 0,   // Target
                true
            );
        }
    }, [selectedGalaxy, controlsRef]);

    return (
        <group>
            {/* Background elements to avoid void */}

            {/* Background elements to avoid void */}
            <color attach="background" args={['#000510']} />


            {galaxies.map((galaxy) => (
                <Float key={galaxy.id} speed={galaxy.type === 'chaos' ? 2 : 1} rotationIntensity={0.5} floatIntensity={0.5}>
                    <group position={galaxy.position} rotation={galaxy.rotation ? new THREE.Euler(...galaxy.rotation) : undefined}>
                        <GalaxyCluster
                            type={galaxy.type}
                            data={galaxy}
                            isHovered={hoveredGalaxy?.id === galaxy.id}
                            isSelected={selectedGalaxy?.id === galaxy.id}
                            isDimmed={!!selectedGalaxy && selectedGalaxy.id !== galaxy.id}
                            onPointerOver={(e) => {
                                e.stopPropagation();
                                if (!selectedGalaxy) onHoverGalaxy(galaxy);
                            }}
                            onPointerOut={(e) => {
                                e.stopPropagation();
                                if (!selectedGalaxy) onHoverGalaxy(null);
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectGalaxy(galaxy);
                                onHoverGalaxy(galaxy);
                            }}
                        />
                    </group>
                </Float>
            ))}
        </group>
    );
}
