import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GalaxyData } from './KpiaUniverse';

interface CosmicFogProps {
    galaxies: GalaxyData[];
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;
    vPosition = position;
    // Calculate world position
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vWorldPosition;
uniform float uTime;

// Galaxy Data
uniform vec3 uGalaxyPositions[10]; // Max 10 galaxies
uniform int uGalaxyCount;
uniform float uDensityFalloff;

// -------------------------------------------------------------------------
// 3D Simplex Noise
// -------------------------------------------------------------------------
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

// -------------------------------------------------------------------------
// FBM (Fractal Brownian Motion)
// -------------------------------------------------------------------------
#define NUM_OCTAVES 4

float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * snoise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec3 pos = vPosition * 0.005; 
    vec3 move = vec3(uTime * 0.05, uTime * 0.02, -uTime * 0.05);

    // Calculate FBM Noise
    float noiseVal = fbm(pos + move);
    float n = noiseVal * 0.5 + 0.5;
    
    // --- Proximity Calculation ---
    // Find distance to the nearest galaxy
    float minDistance = 1000.0;
    for(int i = 0; i < 10; i++) {
        if(i >= uGalaxyCount) break;
        float d = distance(vWorldPosition, uGalaxyPositions[i]);
        if(d < minDistance) {
            minDistance = d;
        }
    }
    
    // Create density factor based on distance
    // Closer to galaxy = more opacity
    float proximityFactor = 1.0 - smoothstep(0.0, uDensityFalloff, minDistance);
    
    // Tiny clip to ensure far areas are truly empty
    if(proximityFactor < 0.01) discard;

    // Combine noise alpha with proximity
    // Removed base density (+0.15) to make void completely black
    float alpha = smoothstep(0.3, 0.75, n) * proximityFactor * 1.5;

    // Color mixing
    vec3 baseColor = vec3(0.1, 0.05, 0.3);
    vec3 highlightColor = vec3(0.3, 0.6, 0.8);
    vec3 finalColor = mix(baseColor, highlightColor, n * n);

    gl_FragColor = vec4(finalColor, alpha * 0.4); // Reduce overall opacity slightly for balance
}
`;

export function CosmicFog({ galaxies }: CosmicFogProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Prepare Uniforms
    const shaderArgs = useMemo(
        () => ({
            uniforms: {
                uTime: { value: 0 },
                uGalaxyPositions: { value: new Array(10).fill(new THREE.Vector3(0, 0, 0)) },
                uGalaxyCount: { value: 0 },
                uDensityFalloff: { value: 25.0 }, // Radius of the fog cluster around galaxies
            },
            vertexShader,
            fragmentShader,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        }),
        []
    );

    // Update Uniforms when galaxies change
    useEffect(() => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            const positions = galaxies.map(g => new THREE.Vector3(...g.position));

            // Pad array
            for (let i = positions.length; i < 10; i++) {
                positions.push(new THREE.Vector3(0, 0, 0));
            }

            material.uniforms.uGalaxyPositions.value = positions;
            material.uniforms.uGalaxyCount.value = galaxies.length;
        }
    }, [galaxies]);

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[300, 64, 64]} />
            <shaderMaterial args={[shaderArgs]} />
        </mesh>
    );
}
