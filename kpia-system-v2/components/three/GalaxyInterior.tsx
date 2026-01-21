import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GalaxyData } from './KpiaUniverse';

// --------------------------------------------------------------------------
// Helper: Random generators
// --------------------------------------------------------------------------
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// --------------------------------------------------------------------------
// Component: Core Type Variations
// --------------------------------------------------------------------------
const GalaxyCore = ({ galaxy }: { galaxy: GalaxyData }) => {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
            meshRef.current.rotation.x += delta * 0.1;
        }
    });

    // Theme color based on galaxy ID (approximate)
    const color = useMemo(() => {
        if (galaxy.id === 'g-africa') return '#ffaa00';
        if (galaxy.id === 'g-irish') return '#00ff88';
        if (galaxy.id === 'g-spiral') return '#0088ff';
        return '#ffffff';
    }, [galaxy.id]);

    return (
        <group ref={meshRef}>
            {/* Base Glow */}
            <pointLight distance={50} intensity={2} color={color} />

            {/* Shape Variation */}
            {galaxy.id === 'g-africa' && (
                <group>
                    <Torus args={[2, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                        <meshStandardMaterial emissive={color} emissiveIntensity={2} color="black" />
                    </Torus>
                    <Torus args={[1.5, 0.1, 16, 100]} rotation={[0, 0, Math.PI / 2]}>
                        <meshStandardMaterial emissive={color} emissiveIntensity={1} color="black" />
                    </Torus>
                    <Sphere args={[0.5, 32, 32]}>
                        <meshBasicMaterial color={color} />
                    </Sphere>
                </group>
            )}

            {galaxy.id === 'g-irish' && (
                <group>
                    <Torus args={[1, 0.4, 32, 3]} position={[0, 0, 0]}>
                        <meshStandardMaterial emissive={color} emissiveIntensity={2} color="black" wireframe />
                    </Torus>
                    <Sphere args={[0.8, 32, 32]}>
                        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
                    </Sphere>
                </group>
            )}

            {galaxy.id === 'g-spiral' && (
                <group>
                    <Sphere args={[1.2, 32, 32]}>
                        <meshStandardMaterial emissive={color} emissiveIntensity={1.5} color="black" />
                    </Sphere>
                    <Torus args={[3, 0.05, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
                        <meshBasicMaterial color={color} transparent opacity={0.5} />
                    </Torus>
                </group>
            )}

            {/* Default for others */}
            {!['g-africa', 'g-irish', 'g-spiral'].includes(galaxy.id) && (
                <Sphere args={[1.5, 4, 2]}>
                    <meshBasicMaterial color={color} wireframe />
                </Sphere>
            )}
        </group>
    );
};

// --------------------------------------------------------------------------
// Component: Satellite
// --------------------------------------------------------------------------
const Satellite = ({ distance, speed, size, color }: { distance: number, speed: number, size: number, color: string }) => {
    const ref = useRef<THREE.Mesh>(null);
    const angle = useRef(Math.random() * Math.PI * 2);

    useFrame((state, delta) => {
        if (ref.current) {
            angle.current += speed * delta;
            ref.current.position.x = Math.cos(angle.current) * distance;
            ref.current.position.z = Math.sin(angle.current) * distance;
            ref.current.rotation.y += delta;
        }
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
    );
};

// --------------------------------------------------------------------------
// Component: Planet
// --------------------------------------------------------------------------
const Planet = ({ distance, speed, size, color }: { distance: number, speed: number, size: number, color: string }) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const angle = useRef(Math.random() * Math.PI * 2);

    // Satellites
    const numSatellites = useMemo(() => Math.floor(rand(0, 3)), []);
    const satellites = useMemo(() => {
        return new Array(numSatellites).fill(0).map(() => ({
            dist: rand(size * 1.5, size * 3),
            speed: rand(1, 3),
            size: size * 0.3,
            color: '#aaaaaa'
        }));
    }, [numSatellites, size]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            angle.current += speed * delta;
            groupRef.current.position.x = Math.cos(angle.current) * distance;
            groupRef.current.position.z = Math.sin(angle.current) * distance;
        }
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
            </mesh>
            {satellites.map((s, i) => (
                <Satellite key={i} distance={s.dist} speed={s.speed} size={s.size} color={s.color} />
            ))}
        </group>
    );
};

// --------------------------------------------------------------------------
// Component: Solar System
// --------------------------------------------------------------------------
const SolarSystem = ({ index, total }: { index: number, total: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const orbitAngle = (index / total) * Math.PI * 2;
    const distance = rand(15, 40); // Distance from Galaxy Core
    const speed = rand(0.05, 0.2); // Orbit speed around Core

    // Generate Planets
    const numPlanets = useMemo(() => Math.floor(rand(1, 4)), []);
    const planets = useMemo(() => {
        return new Array(numPlanets).fill(0).map((_, i) => ({
            dist: rand(2, 6) + i * 2,
            speed: rand(0.5, 1.5) * (Math.random() > 0.5 ? 1 : -1),
            size: rand(0.3, 0.8),
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5).getStyle()
        }));
    }, [numPlanets]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Simple circular orbit around galaxy core (0,0,0)
            const t = state.clock.getElapsedTime() * speed + orbitAngle;
            groupRef.current.position.x = Math.cos(t) * distance;
            groupRef.current.position.z = Math.sin(t) * distance;
            // Some vertical movement
            groupRef.current.position.y = Math.sin(t * 2 + index) * 2;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Star */}
            <mesh>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
            <pointLight distance={15} intensity={1} color="#fff8e0" decay={2} />

            {/* Planets */}
            {planets.map((p, i) => (
                <Planet key={i} distance={p.dist} speed={p.speed} size={p.size} color={p.color} />
            ))}
        </group>
    );
};

// --------------------------------------------------------------------------
// Main Galaxy Interior Component
// --------------------------------------------------------------------------
export function GalaxyInterior({ galaxy, onBack }: { galaxy: GalaxyData, onBack: () => void }) {

    return (
        <group>
            {/* Ambient light for internal view */}
            <ambientLight intensity={0.2} />

            {/* Core */}
            <GalaxyCore galaxy={galaxy} />

            {/* Solar Systems */}
            {new Array(10).fill(0).map((_, i) => (
                <SolarSystem key={i} index={i} total={10} />
            ))}

            {/* Navigation Text (in 3D space just in case) */}
            {/* Note: UI logic is mostly in page.tsx HTML overlay, but we can add 3D labels if needed */}
        </group>
    );
}
