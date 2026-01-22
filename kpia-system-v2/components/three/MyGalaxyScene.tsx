"use client";

import { useMemo, useRef, useEffect, RefObject, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { CameraControls, Html } from "@react-three/drei";
import { DnaAnalysisInterface } from "@/components/ui/DnaAnalysisInterface";
import { AnimatePresence } from "framer-motion";

// --- Liquid Metal Pulse Noise ---
const snoiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
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
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

// --- Bridge Shader Material ---
const bridgeVertexShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
    vUv = uv;
    vec3 pos = position; 
    
    // Wave Logic
    float envelope = sin(pos.x * 3.14159);
    float sway = sin(pos.x * 6.28 + uTime * 2.0);
    float jitter = sin(pos.x * 20.0 - uTime * 5.0) * 0.3;
    float wave = (sway + jitter) * envelope;
    
    pos.y += wave * 5.0; 
    pos.z += wave * 2.0; 

    // Calculate World Position for Fade logic
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const bridgeFragmentShader = `
uniform float uTime;
uniform float uFadeRadius; // effectively half-height
varying vec2 vUv;
varying vec3 vWorldPos;

void main() {
    // Pulse alpha or color along the string
    float pulse = 0.5 + 0.5 * sin(vUv.x * 10.0 - uTime * 3.0);
    
    // Vertical Gradient Logic (Silver -> Orange)
    // Map Y from [-FadeRadius, +FadeRadius] to [0, 1]
    float gradientT = smoothstep(-uFadeRadius, uFadeRadius, vWorldPos.y);
    
    vec3 colorSilver = vec3(0.2, 0.2, 0.2);
    vec3 colorOrange = vec3(4, 1, 0); // User's custom orange
    
    vec3 baseColor = mix(colorSilver, colorOrange, gradientT);
    
    // Brighter spots (add pulse brightness to the mixed color)
    vec3 finalColor = baseColor + vec3(0.5) * pulse;
    
    // Distance Fade Logic
    // Opacity 1.0 at Y=0 -> 0.0 at Y=uFadeRadius
    float distY = abs(vWorldPos.y);
    float fade = 1.0 - smoothstep(0.0, uFadeRadius * 0.6, distY);
    
    gl_FragColor = vec4(finalColor, fade); 
}
`;


// --- Scene Component ---
interface MyGalaxySceneProps {
    controlsRef: RefObject<CameraControls>;
    mode?: 'interactive' | 'decorative';
}

interface MyGalaxySceneProps {
    controlsRef: RefObject<CameraControls>;
    mode?: 'interactive' | 'decorative';
    isDiving?: boolean;
}

export function MyGalaxyScene({ controlsRef, mode = 'interactive', isDiving = false }: MyGalaxySceneProps) {
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
    const bridgeMatRef = useRef<THREE.ShaderMaterial>(null);

    const [isDnaMode, setIsDnaMode] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Height Configuration
    const TOTAL_HEIGHT = 1000;
    const HALF_HEIGHT = TOTAL_HEIGHT / 2;

    const uniformsRef = useRef({
        uTime: { value: 0 },
        uMinY: { value: -HALF_HEIGHT },
        uMaxY: { value: HALF_HEIGHT },
    });

    const rotationSpeedRef = useRef(0.1);
    const targetRotationSpeed = useRef(0.1);
    const savedCameraState = useRef<{ position: THREE.Vector3, target: THREE.Vector3 } | null>(null);

    // Initial Setup based on Mode
    useEffect(() => {
        if (mode === 'decorative') {
            targetRotationSpeed.current = 0.05;
        } else if (isDiving) {
            targetRotationSpeed.current = 5.0; // Super fast spin during dive
            rotationSpeedRef.current = 5.0;
        }
    }, [mode, isDiving]);

    // Handle Diving State Updates
    useEffect(() => {
        if (isDiving) {
            targetRotationSpeed.current = 8.0;
        } else if (mode === 'decorative') {
            targetRotationSpeed.current = 0.05;
        } else {
            targetRotationSpeed.current = isDnaMode ? 0.2 : 0.1;
        }
    }, [isDiving, isDnaMode, mode]);

    // Camera Transition Logic
    useEffect(() => {
        if (!controlsRef.current || mode === 'decorative') return;

        if (isDnaMode) {
            // SAVE STATE before transition
            const pos = new THREE.Vector3();
            const tgt = new THREE.Vector3();
            controlsRef.current.getPosition(pos);
            controlsRef.current.getTarget(tgt);
            savedCameraState.current = { position: pos, target: tgt };

            // Focus View
            controlsRef.current.setLookAt(
                0, 0, 180, // Position
                0, 0, 0,   // Target
                true       // Enable transition
            );

            // SPIKE Rotation (Clockwise)
            rotationSpeedRef.current = 2.0;
            targetRotationSpeed.current = 0.2; // Settle at slightly faster than idle

        } else {
            // Restore Camera
            if (savedCameraState.current) {
                const { position, target } = savedCameraState.current;
                controlsRef.current.setLookAt(
                    position.x, position.y, position.z,
                    target.x, target.y, target.z,
                    true
                );
            }

            // SPIKE Rotation (Counter-Clockwise)
            if (!isDiving) {
                rotationSpeedRef.current = -2.0;
                targetRotationSpeed.current = 0.1; // Settle back to idle
            }
        }
    }, [isDnaMode, controlsRef, mode, isDiving]);

    // Handle Click
    // Handle Click
    const handleClick = (e: any) => {
        if (mode === 'decorative') return;
        e.stopPropagation();
        setIsDnaMode(!isDnaMode);
    };

    // --- Geometry Construction ---
    const { strandGeometry, bridgesData } = useMemo(() => {
        const height = TOTAL_HEIGHT;
        const radius = 40;
        const turns = 8; // Increased turns for longer helix
        const pointsPerStrand = 400; // Increased resolution

        const pathPoints1: THREE.Vector3[] = [];
        const pathPoints2: THREE.Vector3[] = [];
        const bridges: { start: THREE.Vector3, end: THREE.Vector3, length: number, rotation: THREE.Euler, position: THREE.Vector3 }[] = [];

        // 1. Generate Helix Points
        for (let i = 0; i <= pointsPerStrand; i++) {
            const t = i / pointsPerStrand;
            const angle = t * Math.PI * 2 * turns;
            const y = (t - 0.5) * height;

            // Strand 1
            const x1 = Math.cos(angle) * radius;
            const z1 = Math.sin(angle) * radius;
            pathPoints1.push(new THREE.Vector3(x1, y, z1));

            // Strand 2 (Offset PI)
            const x2 = Math.cos(angle + Math.PI) * radius;
            const z2 = Math.sin(angle + Math.PI) * radius;
            pathPoints2.push(new THREE.Vector3(x2, y, z2));

            // Bridges (every 4th point)
            if (i % 4 === 0) {
                const v1 = new THREE.Vector3(x1, y, z1);
                const v2 = new THREE.Vector3(x2, y, z2);
                const center = v1.clone().add(v2).multiplyScalar(0.5);
                const dist = v1.distanceTo(v2);

                const dummy = new THREE.Object3D();
                dummy.position.copy(center);
                dummy.lookAt(v2);

                bridges.push({
                    start: v1,
                    end: v2,
                    length: dist,
                    position: center,
                    rotation: dummy.rotation
                });
            }
        }

        const curve1 = new THREE.CatmullRomCurve3(pathPoints1);
        const curve2 = new THREE.CatmullRomCurve3(pathPoints2);

        // Tube Geometry
        const geo1 = new THREE.TubeGeometry(curve1, 400, 4, 8, false);
        const geo2 = new THREE.TubeGeometry(curve2, 400, 4, 8, false);

        // 2. Line Geometry for Bridges
        const segments = 12;
        const linePos = [];
        const lineUvs = [];
        for (let j = 0; j <= segments; j++) {
            const r = j / segments;
            linePos.push(r, 0, 0); // Along X axis
            lineUvs.push(r, 0);
        }
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        lineGeo.setAttribute('uv', new THREE.Float32BufferAttribute(lineUvs, 2));

        return {
            strandGeometry: [geo1, geo2],
            bridgesData: bridges,
            lineGeometry: lineGeo
        };
    }, []);

    // --- Liquid Metal Shader Logic ---
    const onBeforeCompile = (shader: any) => {
        shader.uniforms.uTime = uniformsRef.current.uTime;
        shader.uniforms.uMinY = uniformsRef.current.uMinY;
        shader.uniforms.uMaxY = uniformsRef.current.uMaxY;

        // Inject Definitions safely at common
        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `
            #include <common>
            uniform float uTime;
            uniform float uMinY;
            uniform float uMaxY;
            varying float vYProgress;
            varying vec3 vWorldPos;
            ${snoiseGLSL}
            `
        );

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            
            // Pulse & Displacement
            float n = snoise(transformed * 0.05 + vec3(0.0, uTime * 0.5, 0.0));
            transformed += normal * (n * 1.5); 
            
            // Calc World Position utilizing modelMatrix
            vec4 kpiaWorldPos = modelMatrix * vec4(transformed, 1.0);
            vWorldPos = kpiaWorldPos.xyz;
            
            // Normalize Y for Gradient (Color)
            vYProgress = smoothstep(uMinY, uMaxY, kpiaWorldPos.y);
            `
        );

        // Inject Definitions for Fragment
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `
            #include <common>
            uniform float uTime;
            uniform float uMinY;
            uniform float uMaxY;
            varying float vYProgress;
            varying vec3 vWorldPos;
            `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `
            #include <dithering_fragment>
            
            // Stronger Gradient Logic
            vec3 colorSilver = vec3(0.8, 0.8, 0.8);
            vec3 colorOrange = vec3(1.0, 0.1, -0.5);
            
            float emissiveStrength = mix(0.1, 1.0, vYProgress);
            
            vec3 finalColor = mix(colorSilver, colorOrange, vYProgress);
            
            gl_FragColor.rgb *= finalColor;
            gl_FragColor.rgb += finalColor * emissiveStrength * 0.8;
            
            // --- Opacity Fade Logic ---
            // Fade out towards the top/bottom tips
            float halfHeight = (uMaxY - uMinY) * 0.5;
            float distY = abs(vWorldPos.y);
            // Start fading at 0, end at halfHeight (full fade)
            // Or maybe keep center opaque longer?
            // User requested: "Center opaque, fades to 0 at ends"
            float fadeAlpha = 1.0 - smoothstep(0.0, halfHeight * 0.6, distY);
            
            gl_FragColor.a = fadeAlpha;
            `
        );
    };

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (uniformsRef.current) {
            uniformsRef.current.uTime.value = time;
        }
        if (bridgeMatRef.current) {
            bridgeMatRef.current.uniforms.uTime.value = time;
        }
        if (groupRef.current) {
            // Smooth Rotation Speed Logic
            // Lerp current speed towards target
            rotationSpeedRef.current += (targetRotationSpeed.current - rotationSpeedRef.current) * 0.05;
            groupRef.current.rotation.y += rotationSpeedRef.current * state.clock.getDelta();
        }
    });

    return (
        <group
            ref={groupRef}
            onClick={handleClick}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            onPointerMissed={() => isDnaMode && setIsDnaMode(false)} // Click background to exit
        >
            {/* Strand 1 */}
            <mesh geometry={strandGeometry[0]}>
                <meshPhysicalMaterial
                    onBeforeCompile={onBeforeCompile}
                    metalness={0.9}
                    roughness={0.1}
                    color={isHovered ? "#ffaa00" : "#ffffff"} // Highlight on hover
                    emissive={isHovered ? "#ff4400" : "#000000"}
                    emissiveIntensity={isHovered ? 0.5 : 0}
                    transparent={true} // Enable transparency for fade
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Strand 2 */}
            <mesh geometry={strandGeometry[1]}>
                <meshPhysicalMaterial
                    onBeforeCompile={onBeforeCompile}
                    metalness={0.9}
                    roughness={0.1}
                    color={isHovered ? "#ffaa00" : "#ffffff"}
                    emissive={isHovered ? "#ff4400" : "#000000"}
                    emissiveIntensity={isHovered ? 0.5 : 0}
                    transparent={true}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Bridges */}
            <BridgeGroup data={bridgesData} fadeRadius={HALF_HEIGHT} />

            {/* Interface Overlay */}
            <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
                <AnimatePresence>
                    {isDnaMode && <DnaAnalysisInterface />}
                </AnimatePresence>
            </Html>
        </group>
    );
}

// Sub-component to handle geometry/material instantiation cleanly
function BridgeGroup({ data, fadeRadius }: { data: any[], fadeRadius: number }) {
    // Shared Material
    const mat = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uFadeRadius: { value: fadeRadius } // Pass radius
        },
        vertexShader: bridgeVertexShader,
        fragmentShader: bridgeFragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false // Optional for glow
    }), [fadeRadius]);

    // Shared Geometry
    const geo = useMemo(() => {
        const segments = 12;
        const pos = [];
        const uvs = [];
        for (let j = 0; j <= segments; j++) {
            const r = j / segments;
            pos.push(0, 0, r); // Along Z axis
            uvs.push(r, 0); // uv.x tracks length
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        return g;
    }, []);

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

function BridgeInstance({ data, geometry, material }: { data: any, geometry: any, material: any }) {
    // data has start, end, length
    const ref = useRef<THREE.Line>(null);

    useEffect(() => {
        if (!ref.current) return;
        // Position at start
        ref.current.position.copy(data.start);
        // Look at end
        ref.current.lookAt(data.end);
        // Scale Z to length
        ref.current.scale.set(1, 1, data.length);
    }, [data]);

    // @ts-ignore
    return <line ref={ref} geometry={geometry} material={material} />;
}
