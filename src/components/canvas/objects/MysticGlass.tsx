/**
 * MysticGlass - 極上のガラス表現コンポーネント
 * MeshTransmissionMaterial による透過・屈折・虹彩反射を実現
 * useFrame による動的な表面うねりアニメーション
 * 周期的に幾何学形状へモーフィング
 * 
 * WebGPU 時: MeshPhysicalMaterial にフォールバック
 * (MeshTransmissionMaterial は GLSL ベースで WebGPU 非対応)
 */

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import { MYSTIC_GLASS_MATERIAL, MYSTIC_GLASS_DEFORMATION, MYSTIC_GLASS_MORPHING } from '@/config/environment-settings'

type GLTFResult = GLTF & {
  nodes: {
    トーラス: THREE.Mesh
    平面: THREE.Mesh
  }
  materials: {
    マテリアル: THREE.MeshPhysicalMaterial
  }
}

interface MysticGlassProps {
  position?: [number, number, number]
  scale?: number
}

export function MysticGlass({ position = [0, 0, 0], scale = 1 }: MysticGlassProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { nodes } = useGLTF('/models/mystic-glass.glb') as unknown as GLTFResult
  const { gl } = useThree()
  const isWebGPU = gl.constructor.name === 'WebGPURenderer'

  // オリジナルの頂点位置を保存（変形の基準点として使用）
  const originalPositions = useMemo(() => {
    const geo = nodes.トーラス.geometry
    return new Float32Array(geo.attributes.position.array)
  }, [nodes.トーラス.geometry])

  // 法線を確保（変形方向として使用）
  const normals = useMemo(() => {
    const geo = nodes.トーラス.geometry
    if (!geo.attributes.normal) {
      geo.computeVertexNormals()
    }
    return new Float32Array(geo.attributes.normal.array)
  }, [nodes.トーラス.geometry])

  // モーフィングターゲット（正二十面体）の頂点位置を生成
  const morphTargetPositions = useMemo(() => {
    const targetPositions = new Float32Array(originalPositions.length)

    // 元のジオメトリのバウンディングボックスを計算して正規化用のスケールを決定
    const bbox = new THREE.Box3()
    for (let i = 0; i < originalPositions.length; i += 3) {
      bbox.expandByPoint(new THREE.Vector3(
        originalPositions[i],
        originalPositions[i + 1],
        originalPositions[i + 2]
      ))
    }
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    const maxDim = Math.max(
      bbox.max.x - bbox.min.x,
      bbox.max.y - bbox.min.y,
      bbox.max.z - bbox.min.z
    )
    const radius = maxDim * 0.5

    // 各頂点を球面上に投影（幾何学的なシルエットを作成）
    for (let i = 0; i < originalPositions.length; i += 3) {
      const x = originalPositions[i] - center.x
      const y = originalPositions[i + 1] - center.y
      const z = originalPositions[i + 2] - center.z

      const len = Math.sqrt(x * x + y * y + z * z)
      if (len > 0) {
        // 正規化して球面上に配置
        targetPositions[i] = (x / len) * radius + center.x
        targetPositions[i + 1] = (y / len) * radius + center.y
        targetPositions[i + 2] = (z / len) * radius + center.z
      } else {
        targetPositions[i] = originalPositions[i]
        targetPositions[i + 1] = originalPositions[i + 1]
        targetPositions[i + 2] = originalPositions[i + 2]
      }
    }

    return targetPositions
  }, [originalPositions])

  // 毎フレーム頂点を波打たせる + モーフィング
  useFrame((state) => {
    if (!meshRef.current) return

    const time = state.clock.elapsedTime
    const geometry = meshRef.current.geometry
    const positions = geometry.attributes.position.array as Float32Array

    const { amplitude, frequency, speed } = MYSTIC_GLASS_DEFORMATION
    const { cycleDuration, morphDuration, holdDuration } = MYSTIC_GLASS_MORPHING

    // モーフィングサイクルを計算
    const cycleTime = time % cycleDuration
    let morphFactor = 0  // 0 = オリジナル形状, 1 = 幾何学形状

    // 遷移フェーズの計算
    const transitionStart = (cycleDuration - holdDuration) / 2 - morphDuration
    const holdStart = (cycleDuration - holdDuration) / 2
    const holdEnd = holdStart + holdDuration
    const transitionEnd = holdEnd + morphDuration

    if (cycleTime >= transitionStart && cycleTime < holdStart) {
      // オリジナル → 幾何学形状への遷移
      morphFactor = (cycleTime - transitionStart) / morphDuration
      morphFactor = smoothstep(morphFactor)
    } else if (cycleTime >= holdStart && cycleTime < holdEnd) {
      // 幾何学形状を維持
      morphFactor = 1
    } else if (cycleTime >= holdEnd && cycleTime < transitionEnd) {
      // 幾何学形状 → オリジナルへの遷移
      morphFactor = 1 - (cycleTime - holdEnd) / morphDuration
      morphFactor = smoothstep(morphFactor)
    }

    for (let i = 0; i < positions.length; i += 3) {
      // オリジナルとモーフターゲットを補間
      const ox = originalPositions[i] * (1 - morphFactor) + morphTargetPositions[i] * morphFactor
      const oy = originalPositions[i + 1] * (1 - morphFactor) + morphTargetPositions[i + 1] * morphFactor
      const oz = originalPositions[i + 2] * (1 - morphFactor) + morphTargetPositions[i + 2] * morphFactor

      const nx = normals[i]
      const ny = normals[i + 1]
      const nz = normals[i + 2]

      // sin波による法線方向への変位（モーフィング中は弱める）
      const waveAmplitude = amplitude * (1 - morphFactor * 0.7)
      const wave = Math.sin(ox * frequency + oy * frequency + time * speed) * waveAmplitude

      positions[i] = ox + nx * wave
      positions[i + 1] = oy + ny * wave
      positions[i + 2] = oz + nz * wave
    }

    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
  })

  return (
    <group position={position} scale={scale} dispose={null}>
      <mesh ref={meshRef} geometry={nodes.トーラス.geometry.clone()} rotation={[-0.905, -0.953, 1.84]}>
        {isWebGPU ? (
          /* WebGPU: MeshPhysicalMaterial (自動的に NodeMaterial に変換される) */
          <meshPhysicalMaterial
            transmission={MYSTIC_GLASS_MATERIAL.transmission}
            thickness={MYSTIC_GLASS_MATERIAL.thickness}
            roughness={MYSTIC_GLASS_MATERIAL.roughness}
            iridescence={MYSTIC_GLASS_MATERIAL.iridescence}
            iridescenceIOR={MYSTIC_GLASS_MATERIAL.iridescenceIOR}
            ior={MYSTIC_GLASS_MATERIAL.ior}
            transparent={true}
          />
        ) : (
          /* WebGL: drei MeshTransmissionMaterial (フル機能) */
          <MeshTransmissionMaterial
            transmission={MYSTIC_GLASS_MATERIAL.transmission}
            thickness={MYSTIC_GLASS_MATERIAL.thickness}
            roughness={MYSTIC_GLASS_MATERIAL.roughness}
            chromaticAberration={MYSTIC_GLASS_MATERIAL.chromaticAberration}
            iridescence={MYSTIC_GLASS_MATERIAL.iridescence}
            iridescenceIOR={MYSTIC_GLASS_MATERIAL.iridescenceIOR}
            ior={MYSTIC_GLASS_MATERIAL.ior}
            distortion={MYSTIC_GLASS_MATERIAL.distortion}
            anisotropy={MYSTIC_GLASS_MATERIAL.anisotropy}
            samples={MYSTIC_GLASS_MATERIAL.samples}
          />
        )}
      </mesh>
    </group>
  )
}

// イージング関数（滑らかな遷移）
function smoothstep(x: number): number {
  x = Math.max(0, Math.min(1, x))
  return x * x * (3 - 2 * x)
}

useGLTF.preload('/models/mystic-glass.glb')


