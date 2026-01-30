"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";

interface ObserverBeaconProps {
    position: [number, number, number];
    message: string;
    ownerDisplayId: string;
    onClick?: () => void;
}

/**
 * ObserverBeacon - A glowing orange beacon left by visitors
 * Represents a message/marker placed in another user's universe
 */
export function ObserverBeacon({
    position,
    message,
    ownerDisplayId,
    onClick
}: ObserverBeaconProps) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Gentle rotation
            groupRef.current.rotation.y += delta * 0.5;
        }
        if (glowRef.current) {
            // Pulsing glow effect
            const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 1;
            glowRef.current.scale.setScalar(pulse);
        }
    });

    const handleClick = () => {
        setShowMessage(!showMessage);
        onClick?.();
    };

    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <group
                ref={groupRef}
                position={position}
                onClick={handleClick}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
            >
                {/* Core Crystal */}
                <mesh>
                    <octahedronGeometry args={[0.5, 0]} />
                    <meshPhysicalMaterial
                        color="#ff8800"
                        emissive="#ff8800"
                        emissiveIntensity={isHovered ? 2 : 1}
                        transparent
                        opacity={0.9}
                        roughness={0.1}
                        metalness={0.8}
                        envMapIntensity={1}
                    />
                </mesh>

                {/* Inner Glow */}
                <mesh ref={glowRef}>
                    <sphereGeometry args={[0.8, 16, 16]} />
                    <meshBasicMaterial
                        color="#ff8800"
                        transparent
                        opacity={0.15}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Outer Glow Ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1, 0.02, 8, 32]} />
                    <meshBasicMaterial
                        color="#ff8800"
                        transparent
                        opacity={isHovered ? 0.8 : 0.4}
                    />
                </mesh>

                {/* Vertical Beam */}
                <mesh>
                    <cylinderGeometry args={[0.02, 0.02, 4, 8]} />
                    <meshBasicMaterial
                        color="#ff8800"
                        transparent
                        opacity={0.3}
                    />
                </mesh>

                {/* Owner ID Label (always visible) */}
                <Html
                    position={[0, 1.5, 0]}
                    center
                    style={{
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                >
                    <div className="font-mono text-[10px] text-[#ff8800] tracking-widest whitespace-nowrap opacity-70">
                        BEACON // {ownerDisplayId}
                    </div>
                </Html>

                {/* Message Popup (on click) */}
                {showMessage && (
                    <Html
                        position={[0, 2.5, 0]}
                        center
                        style={{
                            pointerEvents: "auto",
                        }}
                    >
                        <div
                            className="bg-black/90 border border-[#ff8800] p-3 font-mono text-sm text-white max-w-[200px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-[#ff8800] text-[10px] tracking-widest mb-2 border-b border-[#ff8800]/30 pb-1">
                                MESSAGE
                            </div>
                            <div className="text-white text-xs leading-relaxed">
                                {message}
                            </div>
                            <button
                                onClick={() => setShowMessage(false)}
                                className="mt-2 w-full py-1 border border-[#ff8800]/50 text-[#ff8800] text-[10px] hover:bg-[#ff8800] hover:text-black transition-all"
                            >
                                CLOSE
                            </button>
                        </div>
                    </Html>
                )}
            </group>
        </Float>
    );
}

/**
 * BeaconPlacer - Component for placing new beacons
 * Used when visiting another user's universe
 */
interface BeaconPlacerProps {
    onPlace: (position: [number, number, number], message: string) => void;
    isActive: boolean;
}

export function BeaconPlacer({ onPlace, isActive }: BeaconPlacerProps) {
    const [placerPosition, setPlacerPosition] = useState<[number, number, number]>([0, 0, 0]);

    if (!isActive) return null;

    return (
        <group position={placerPosition}>
            {/* Ghost beacon preview */}
            <mesh>
                <octahedronGeometry args={[0.5, 0]} />
                <meshBasicMaterial
                    color="#ff8800"
                    transparent
                    opacity={0.3}
                    wireframe
                />
            </mesh>
        </group>
    );
}
