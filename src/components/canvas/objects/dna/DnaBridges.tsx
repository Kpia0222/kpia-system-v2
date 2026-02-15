import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bridgeVertexShader, bridgeFragmentShader } from "@/config/shaders";

// ============================================================================
// Shared: Bridge Geometry Factory
// ============================================================================
function createBridgeGeometry(): THREE.BufferGeometry {
    const segments = 12;
    const pos: number[] = [];
    const uvs: number[] = [];
    for (let j = 0; j <= segments; j++) {
        const r = j / segments;
        pos.push(0, 0, r);
        uvs.push(r, 0);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    return g;
}

// ============================================================================
// Bridge Instance Component
// ============================================================================
function BridgeInstance({ data, geometry, material }: { data: any, geometry: THREE.BufferGeometry, material: THREE.Material }) {
    const ref = useRef<THREE.Line>(null);

    useEffect(() => {
        if (!ref.current) return;
        ref.current.position.copy(data.start);
        ref.current.lookAt(data.end);
        ref.current.scale.set(1, 1, data.length);
    }, [data]);

    // @ts-ignore — R3F lowercase 'line' JSX element
    return <line ref={ref} geometry={geometry} material={material} />;
}

// ============================================================================
// CPU Bridge Group (WebGL パス — 既存 GLSL ShaderMaterial)
// ============================================================================
export function CpuBridgeGroup({ data, fadeRadius }: { data: any[], fadeRadius: number }) {
    const mat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uFadeRadius: { value: fadeRadius }
        },
        vertexShader: bridgeVertexShader,
        fragmentShader: bridgeFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false
    }), [fadeRadius]);

    const geo = useMemo(() => createBridgeGeometry(), []);

    useFrame((state) => {
        mat.uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <group>
            {data.map((b, i) => (
                <BridgeInstance key={i} data={b} geometry={geo} material={mat} />
            ))}
        </group>
    );
}

// ============================================================================
// GPU Bridge Group (WebGPU パス — TSL NodeMaterial)
// ============================================================================
export function GpuBridgeGroup({ data, material }: { data: any[], material: THREE.Material }) {
    const geo = useMemo(() => createBridgeGeometry(), []);

    return (
        <group>
            {data.map((b, i) => (
                <BridgeInstance key={i} data={b} geometry={geo} material={material} />
            ))}
        </group>
    );
}
