"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";

// Custom Hooks
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useAuthSession } from "@/hooks/useAuthSession";

// Config
import { CAMERA_PROPERTIES, CAMERA_INITIAL_POSITION } from "@/config/camera-settings";

// Directors
import { SceneDirector } from "@/components/canvas/SceneDirector";
import { UIManager } from "@/components/dom/UIManager";

// ============================================================================
// Main Page Component - Clean Entry Point
// ============================================================================

export default function Home() {
  // Initialize hooks
  useGlobalShortcuts();
  useAutoSave();
  useAuthSession();

  return (
    <main className="h-screen w-full bg-black relative">
      {/* UI Layer */}
      <UIManager />

      {/* 3D Canvas Layer - Camera settings from config */}
      <Canvas
        shadows
        camera={{
          position: CAMERA_INITIAL_POSITION,
          fov: CAMERA_PROPERTIES.fov,
          near: CAMERA_PROPERTIES.near,
          far: CAMERA_PROPERTIES.far,
        }}
      >
        <ambientLight intensity={0.5} />
        <Environment preset="city" />

        {/* Scene Director handles all 3D scene rendering */}
        <SceneDirector />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={2.0} />
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>
    </main>
  );
}