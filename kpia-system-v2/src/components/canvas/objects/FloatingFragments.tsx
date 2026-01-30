import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'
import { MusicTrack } from '@/types/database'

function Crystal({ track, position, color = '#ff8800' }: { track: MusicTrack, position: [number, number, number], color?: string }) {
    const mesh = useRef<THREE.Mesh>(null)
    const [hovered, setHover] = React.useState(false)

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.2
            mesh.current.rotation.y += delta * 0.3
        }
    })

    const handleClick = () => {
        if (track.external_url) {
            window.open(track.external_url, '_blank')
        }
    }

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <mesh
                    ref={mesh}
                    onClick={handleClick}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                    scale={hovered ? 1.2 : 1}
                >
                    <octahedronGeometry args={[0.5, 0]} />
                    <meshPhysicalMaterial
                        color={hovered ? '#ffffff' : color}
                        emissive={color}
                        emissiveIntensity={hovered ? 2 : 0.5}
                        transmission={0.6}
                        thickness={1}
                        roughness={0.2}
                    />
                </mesh>

                {hovered && (
                    <Text
                        position={[0, 1.2, 0]}
                        fontSize={0.3}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {track.title}
                    </Text>
                )}
            </Float>
        </group>
    )
}

export function FloatingFragments() {
    const { musicTracks } = useStore()

    // Generate random positions on a sphere or ring in a way that doesn't change on every render unless tracks change
    const positions = useMemo(() => {
        return musicTracks.map(() => {
            const phi = Math.acos(-1 + (2 * Math.random())) // 0 to pi
            const theta = Math.sqrt(Math.PI * 1) * phi // Spiral distribution
            const r = 10 + Math.random() * 5 // Radius between 10 and 15

            return [
                r * Math.cos(theta) * Math.sin(phi),
                r * Math.sin(theta) * Math.sin(phi),
                r * Math.cos(phi)
            ] as [number, number, number]
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [musicTracks.length])

    return (
        <group>
            {musicTracks.map((track, i) => (
                <Crystal
                    key={track.id}
                    track={track}
                    position={positions[i] || [0, 0, 0]}
                />
            ))}
        </group>
    )
}
