"use client";

import { useMemo, useState } from "react";
import { Float, Html, Text } from "@react-three/drei";
import { useStore } from "@/store/useStore";
import * as THREE from "three";

export function MusicFragments() {
    const { musicTracks, selectedGalaxyId } = useStore();

    // Only show fragments if NOT viewing a specific galaxy details (unless we want them globally)
    // Request says "around the galaxy". Assuming "My Galaxy" scene context.

    const drafts = useMemo(() => {
        return musicTracks.filter(track => track.status === 'draft');
    }, [musicTracks]);

    const fragments = useMemo(() => {
        return drafts.map((track, i) => {
            // Random position in a ring-like formation
            const angle = (i / drafts.length) * Math.PI * 2;
            const radius = 15 + Math.random() * 5; // 15-20 units out
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 10; // Vertical spread

            return {
                ...track,
                position: [x, y, z] as [number, number, number],
                rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
                // Use a more crystal-like cyan/blue color by default
                color: new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 0.8, 0.5)
            };
        });
    }, [drafts]);

    if (fragments.length === 0) return null;

    return (
        <group>
            {fragments.map((frag) => (
                <FragmentItem key={frag.id} frag={frag} />
            ))}
        </group>
    );
}

function FragmentItem({ frag }: { frag: any }) {
    const [hovered, setHovered] = useState(false);

    const handleClick = () => {
        if (frag.external_url) {
            window.open(frag.external_url, '_blank');
        }
    };

    return (
        <Float
            speed={1 + Math.random()}
            rotationIntensity={1}
            floatIntensity={2}
            position={frag.position}
        >
            <mesh
                rotation={frag.rotation}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
            >
                {/* Octahedron looks more like a crystal fragment */}
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    color={hovered ? '#ffffff' : frag.color}
                    emissive={hovered ? '#00ffff' : frag.color}
                    emissiveIntensity={hovered ? 2 : 0.5}
                    wireframe
                />
                <Html
                    distanceFactor={15}
                    center
                    className={`pointer-events-none select-none transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-60'}`}
                >
                    <div className="flex flex-col items-center">
                        <div className={`bg-black/90 border ${hovered ? 'border-[#00ffff]' : 'border-white/20'} px-2 py-1 backdrop-blur-md`}>
                            <span className={`text-[10px] font-mono whitespace-nowrap tracking-widest ${hovered ? 'text-[#00ffff] glow-text' : 'text-white/90'}`}>
                                {frag.title} {frag.external_url && '↗'}
                            </span>
                        </div>
                        <div className={`h-8 w-[1px] ${hovered ? 'bg-[#00ffff]' : 'bg-white/20'}`} />
                    </div>
                </Html>
            </mesh>
        </Float>
    );
}
