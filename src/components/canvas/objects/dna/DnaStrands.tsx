import React, { useRef } from "react";
import * as THREE from "three";
import { DNA_COLORS } from "@/config/dna-settings";
import { snoiseGLSL } from "@/config/shaders";
import { DnaStrandUniforms } from "@/utils/dna-tsl-materials";

// ============================================================================
// DNA Component Props
// ============================================================================
interface DnaStrandsProps {
    strandGeometry: THREE.BufferGeometry[];
    isWebGPU: boolean;
    tslStrandMat: THREE.Material | null;
    isHovered: boolean;
    uniformsRef: React.MutableRefObject<DnaStrandUniforms>;
}

// ============================================================================
// Main DnaStrands Component
// ============================================================================
export function DnaStrands({
    strandGeometry,
    isWebGPU,
    tslStrandMat,
    isHovered,
    uniformsRef
}: DnaStrandsProps) {
    // === Liquid Metal Shader ===
    const onBeforeCompile = (shader: any) => {
        shader.uniforms.uTime = uniformsRef.current.uTime;
        shader.uniforms.uMinY = uniformsRef.current.uMinY;
        shader.uniforms.uMaxY = uniformsRef.current.uMaxY;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>
            uniform float uTime;
            uniform float uMinY;
            uniform float uMaxY;
            varying float vYProgress;
            varying vec3 vWorldPos;
            ${snoiseGLSL}`
        );

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            float n = snoise(transformed * 0.05 + vec3(0.0, uTime * 0.5, 0.0));
            transformed += normal * (n * 1.5);
            vec4 kpiaWorldPos = modelMatrix * vec4(transformed, 1.0);
            vWorldPos = kpiaWorldPos.xyz;
            vYProgress = smoothstep(uMinY, uMaxY, kpiaWorldPos.y);`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>
            uniform float uTime;
            uniform float uMinY;
            uniform float uMaxY;
            varying float vYProgress;
            varying vec3 vWorldPos;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
            vec3 colorSilver = vec3(0.8, 0.8, 0.8);
            vec3 colorOrange = vec3(1.0, 0.1, -0.5);
            float emissiveStrength = mix(0.1, 1.0, vYProgress);
            vec3 finalColor = mix(colorSilver, colorOrange, vYProgress);
            gl_FragColor.rgb *= finalColor;
            gl_FragColor.rgb += finalColor * emissiveStrength * 0.8;
            float halfHeight = (uMaxY - uMinY) * 0.5;
            float distY = abs(vWorldPos.y);
            float fadeAlpha = 1.0 - smoothstep(0.0, halfHeight * 0.6, distY);
            gl_FragColor.a = fadeAlpha;`
        );
    };

    return (
        <>
            {/* Strand 1 */}
            <mesh geometry={strandGeometry[0]}>
                {isWebGPU && tslStrandMat ? (
                    <primitive object={tslStrandMat} attach="material" />
                ) : (
                    <meshPhysicalMaterial
                        onBeforeCompile={onBeforeCompile}
                        metalness={0.9}
                        roughness={0.1}
                        color={isHovered ? DNA_COLORS.hover : DNA_COLORS.base}
                        emissive={isHovered ? DNA_COLORS.emissive.hover : DNA_COLORS.emissive.default}
                        emissiveIntensity={isHovered ? DNA_COLORS.emissiveIntensity.hover : DNA_COLORS.emissiveIntensity.default}
                        transparent={true}
                        side={THREE.DoubleSide}
                    />
                )}
            </mesh>

            {/* Strand 2 */}
            <mesh geometry={strandGeometry[1]}>
                {isWebGPU && tslStrandMat ? (
                    <primitive object={tslStrandMat} attach="material" />
                ) : (
                    <meshPhysicalMaterial
                        onBeforeCompile={onBeforeCompile}
                        metalness={0.9}
                        roughness={0.1}
                        color={isHovered ? DNA_COLORS.hover : DNA_COLORS.base}
                        emissive={isHovered ? DNA_COLORS.emissive.hover : DNA_COLORS.emissive.default}
                        emissiveIntensity={isHovered ? DNA_COLORS.emissiveIntensity.hover : DNA_COLORS.emissiveIntensity.default}
                        transparent={true}
                        side={THREE.DoubleSide}
                    />
                )}
            </mesh>
        </>
    );
}
