import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { GalaxyData } from '@/components/canvas/_scenes/KpiaUniverse';
import { FloatingAsteroids } from '@/components/canvas/environments/FloatingAsteroids';
import { MeteorEnvironment } from '@/components/canvas/environments/MeteorEnvironment';

// --------------------------------------------------------------------------
// Helper: Random generators
// --------------------------------------------------------------------------
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// --------------------------------------------------------------------------
// Helper: Accretion Disk Inclination
// Distance-based: inner orbits are chaotic, outer orbits converge to flat
// --------------------------------------------------------------------------
const MIN_ORBIT_DIST = 40;
const MAX_ORBIT_DIST = 300;

const getInclination = (distance: number): [number, number, number] => {
    const normalizedDist = (distance - MIN_ORBIT_DIST) / (MAX_ORBIT_DIST - MIN_ORBIT_DIST);
    const maxTilt = Math.PI / 2; // 90 degrees max
    const tiltMagnitude = maxTilt * Math.exp(-normalizedDist * 5); // Stronger decay for flatter outer orbits

    // Random direction for the tilt
    const tiltX = (Math.random() - 0.5) * 2 * tiltMagnitude;
    const tiltZ = (Math.random() - 0.5) * 2 * tiltMagnitude;
    return [tiltX, 0, tiltZ];
};

// --------------------------------------------------------------------------
// Component: OrbitRing (Static full circle)
// --------------------------------------------------------------------------
interface OrbitRingProps {
    radius: number;
    color?: string;
    opacity?: number;
    thickness?: number;
}

const OrbitRing = ({ radius, color = '#ffffff', opacity = 0.2, thickness = 0.05 }: OrbitRingProps) => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + thickness, 64]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};

// --------------------------------------------------------------------------
// Component: OrbitTrail (Dynamic half-arc following object using Line)
// --------------------------------------------------------------------------
interface OrbitTrailProps {
    radius: number;
    currentAngle: React.MutableRefObject<number>;
    color?: string;
    opacity?: number;
    thickness?: number;
}

const OrbitTrail = ({ radius, currentAngle, color = '#ffffff', opacity = 0.2, thickness = 0.05 }: OrbitTrailProps) => {
    const segments = 32; // Number of segments in the arc

    // Create geometry and material once
    const { geometry, material } = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array((segments + 1) * 3);
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.LineBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: opacity,
        });

        return { geometry: geo, material: mat };
    }, [segments, color, opacity]);

    useFrame(() => {
        const positions = geometry.attributes.position.array as Float32Array;

        // Calculate arc points from currentAngle backwards by PI
        const endAngle = currentAngle.current;
        const startAngle = endAngle - Math.PI;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const angle = startAngle + t * Math.PI;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            positions[i * 3] = x;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = z;
        }

        geometry.attributes.position.needsUpdate = true;
    });

    return <primitive object={new THREE.Line(geometry, material)} />;
};

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
interface SatelliteProps {
    distance: number;
    speed: number;
    size: number;
    color: string;
    galaxyType?: string;
    themeColor?: string;
}

const Satellite = ({ distance, speed, size, color, galaxyType, themeColor }: SatelliteProps) => {
    const ref = useRef<THREE.Mesh>(null);
    const angle = useRef(Math.random() * Math.PI * 2);
    const isWestern = galaxyType === 'order';

    useFrame((state, delta) => {
        if (ref.current) {
            angle.current += speed * delta;
            ref.current.position.x = Math.cos(angle.current) * distance;
            ref.current.position.z = Math.sin(angle.current) * distance;
            ref.current.rotation.y += delta;
            ref.current.rotation.x += delta * 0.5;
        }
    });

    return (
        <>
            {/* Satellite orbit trail */}
            <OrbitTrail currentAngle={angle} radius={distance} thickness={0.005} opacity={0.15} color={themeColor || "#888888"} />

            <mesh ref={ref}>
                {isWestern ? (
                    <tetrahedronGeometry args={[size, 0]} />
                ) : (
                    <sphereGeometry args={[size, 8, 8]} />
                )}
                <meshStandardMaterial color={color} roughness={0.8} wireframe={isWestern} />
            </mesh>
        </>
    );
};

// --------------------------------------------------------------------------
// Component: Planet
// --------------------------------------------------------------------------
interface PlanetProps {
    distance: number;
    speed: number;
    size: number;
    color: string;
    galaxyType?: string;
    themeColor?: string;
}

const Planet = ({ distance, speed, size, color, galaxyType, themeColor }: PlanetProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const angle = useRef(Math.random() * Math.PI * 2);
    const isWestern = galaxyType === 'order';

    // Planet orbital inclination: ±5-15 degrees
    const planetInclination = useMemo(() => {
        const tiltDeg = rand(5, 15) * (Math.random() > 0.5 ? 1 : -1);
        const tiltRad = (tiltDeg * Math.PI) / 180;
        return [tiltRad, 0, rand(-0.2, 0.2) * tiltRad] as [number, number, number];
    }, []);

    // Satellites Data with inclination
    const numSatellites = useMemo(() => Math.floor(rand(0, 3)), []);
    const satellites = useMemo(() => {
        return new Array(numSatellites).fill(0).map(() => {
            // Satellite orbital inclination: ±10-20 degrees relative to planet
            const satTiltDeg = rand(10, 20) * (Math.random() > 0.5 ? 1 : -1);
            const satTiltRad = (satTiltDeg * Math.PI) / 180;
            return {
                dist: rand(size * 1.5, size * 3),
                speed: rand(1, 3),
                size: size * 0.3,
                color: '#aaaaaa',
                inclination: [satTiltRad, 0, rand(-0.3, 0.3) * satTiltRad] as [number, number, number]
            };
        });
    }, [numSatellites, size]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            angle.current += speed * delta;
            groupRef.current.position.x = Math.cos(angle.current) * distance;
            groupRef.current.position.z = Math.sin(angle.current) * distance;
        }
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;
            meshRef.current.rotation.x += delta * 0.3;
        }
    });

    return (
        <group rotation={planetInclination}>
            {/* Orbit trail for this planet (half-arc behind) */}
            <OrbitTrail currentAngle={angle} radius={distance} thickness={0.02} opacity={0.2} color={themeColor || color} />

            <group ref={groupRef}>
                {/* Satellite Orbits - each wrapped in its own inclined group */}
                {satellites.map((s, i) => (
                    <group key={`sat-orbit-${i}`} rotation={s.inclination}>
                        {/* OrbitTrail is now rendered inside Satellite component */}
                        <Satellite distance={s.dist} speed={s.speed} size={s.size} color={s.color} galaxyType={galaxyType} themeColor={themeColor} />
                    </group>
                ))}

                <mesh ref={meshRef}>
                    {isWestern ? (
                        <octahedronGeometry args={[size, 0]} />
                    ) : (
                        <sphereGeometry args={[size, 16, 16]} />
                    )}
                    <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} wireframe={isWestern} />
                </mesh>
            </group>
        </group>
    );
};

// --------------------------------------------------------------------------
// Component: Solar System
// --------------------------------------------------------------------------
interface SolarSystemProps {
    index: number;
    distance: number;
    speed: number;
    orbitAngle: number;
    galaxyType?: string;
    themeColor?: string;
}

const SolarSystem = ({ index, distance, speed, orbitAngle, galaxyType, themeColor }: SolarSystemProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const starRef = useRef<THREE.Mesh>(null);
    const angle = useRef(orbitAngle); // Store and update angle in ref
    const isWestern = galaxyType === 'order';

    // Distance-based planet generation
    // Inner = more planets, smaller, faster; Outer = fewer planets, larger, slower
    const normalizedDist = (distance - MIN_ORBIT_DIST) / (MAX_ORBIT_DIST - MIN_ORBIT_DIST);

    // Planet count: inner (5-8), outer (1-2)
    const numPlanets = useMemo(() => {
        const minCount = 1 + Math.floor((1 - normalizedDist) * 7); // 1-8
        const maxCount = minCount + 1;
        return Math.floor(rand(minCount, maxCount));
    }, [normalizedDist]);

    // Generate planets with distance-based properties
    const planets = useMemo(() => {
        return new Array(numPlanets).fill(0).map((_, i) => {
            // Size: inner = smaller (0.2-0.5), outer = larger (0.6-1.2)
            const baseSize = 0.2 + normalizedDist * 0.6;
            const size = rand(baseSize * 0.8, baseSize * 1.5);

            // Speed: inner = faster (1.5-3.0), outer = slower (0.3-0.8)
            const baseSpeed = 3.0 - normalizedDist * 2.5;
            const planetSpeed = rand(baseSpeed * 0.7, baseSpeed * 1.3) * (Math.random() > 0.5 ? 1 : -1);

            return {
                dist: rand(2, 6) + i * 1.5,
                speed: planetSpeed,
                size,
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5).getStyle()
            };
        });
    }, [numPlanets, normalizedDist]);

    useFrame((state, delta) => {
        // Update angle in ref
        angle.current = state.clock.getElapsedTime() * speed + orbitAngle;

        if (groupRef.current) {
            // Simple circular orbit in local XZ plane (parent group provides inclination)
            groupRef.current.position.x = Math.cos(angle.current) * distance;
            groupRef.current.position.z = Math.sin(angle.current) * distance;
            // Vertical movement removed - inclination provides 3D variation
        }
        if (starRef.current && isWestern) {
            // Rotate the dodecahedron for visual interest
            starRef.current.rotation.y += delta * 0.3;
            starRef.current.rotation.x += delta * 0.2;
        }
    });

    return (
        <>
            {/* This solar system's orbit trail (half-arc behind) - rendered in parent's space */}
            <OrbitTrail currentAngle={angle} radius={distance} thickness={0.08} opacity={0.25} color={themeColor || "#ffffff"} />

            <group ref={groupRef}>
                {/* Planet Orbits (Rings) */}
                {planets.map((p, i) => (
                    <OrbitRing key={`ring-${i}`} radius={p.dist} thickness={0.05} opacity={0.1} color="#ffffff" />
                ))}

                {/* Star */}
                <mesh ref={starRef}>
                    {isWestern ? (
                        <dodecahedronGeometry args={[1.2, 0]} />
                    ) : (
                        <sphereGeometry args={[1.2, 32, 32]} />
                    )}
                    <meshBasicMaterial color={themeColor || "#fff"} wireframe={isWestern} />
                </mesh>
                <pointLight distance={15} intensity={1} color={themeColor || "#fff8e0"} decay={2} />

                {/* Planets */}
                {planets.map((p, i) => (
                    <Planet key={`planet-${i}`} distance={p.dist} speed={p.speed} size={p.size} color={p.color} galaxyType={galaxyType} themeColor={themeColor} />
                ))}
            </group>
        </>
    );
};

// --------------------------------------------------------------------------
// Main Galaxy Interior Component
// --------------------------------------------------------------------------
export function GalaxyInterior({ galaxy, onBack }: { galaxy: GalaxyData, onBack: () => void }) {

    // Theme color based on galaxy ID (approximate) - Reuse for orbit rings
    const themeColor = useMemo(() => {
        if (galaxy.id === 'g-africa') return '#ffaa00';
        if (galaxy.id === 'g-irish') return '#00ff88';
        if (galaxy.id === 'g-spiral') return '#0088ff';
        return '#ffffff';
    }, [galaxy.id]);

    // Solar Systems Data (Lifted up to control orbits)
    // With Accretion Disk inclination: inner = chaotic, outer = flat
    const solarSystems = useMemo(() => {
        const count = 35; // Increased for more natural density
        return new Array(count).fill(0).map((_, i) => {
            const distance = rand(MIN_ORBIT_DIST, MAX_ORBIT_DIST);
            return {
                index: i,
                distance,
                speed: rand(0.05, 0.2),
                orbitAngle: (i / count) * Math.PI * 2,
                rotation: getInclination(distance) as [number, number, number]
            };
        });
    }, []);

    return (
        <group>
            {/* Ambient light for internal view */}
            <ambientLight intensity={0.2} />

            {/* Core */}
            <GalaxyCore galaxy={galaxy} />

            {/* Solar System Orbits & Systems (Galaxy Level) - Wrapped in Inclined Groups */}
            {solarSystems.map((s, i) => (
                <group key={`orbit-group-${i}`} rotation={s.rotation}>
                    {/* OrbitTrail is now rendered inside SolarSystem */}
                    <SolarSystem
                        index={s.index}
                        distance={s.distance}
                        speed={s.speed}
                        orbitAngle={s.orbitAngle}
                        galaxyType={galaxy.type}
                        themeColor={themeColor}
                    />
                </group>
            ))}

            {/* Meteor Environment (Kuiper Belt Ring) */}
            <MeteorEnvironment
                minRadius={300}
                maxRadius={400}
                count={500} // Massive density
                color={galaxy.meteorConfig?.color || themeColor}
                shapeType={galaxy.meteorConfig?.shapeType || 'octahedron'}
            />

            {/* Asteroid Belt (Outer) */}
            <FloatingAsteroids minRadius={350} maxRadius={450} count={100} />

            {/* Asteroid Belt (Inner Scattered) */}
            <FloatingAsteroids minRadius={50} maxRadius={300} count={50} />

            {/* Navigation Text (in 3D space just in case) */}
            {/* Note: UI logic is mostly in page.tsx HTML overlay, but we can add 3D labels if needed */}
        </group>
    );
}
