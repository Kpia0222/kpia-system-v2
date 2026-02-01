"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Leva } from "leva";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";

// Custom Hooks
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useAuthSession } from "@/hooks/useAuthSession";

// Config
import { CAMERA_PROPERTIES, CAMERA_INITIAL_POSITION } from "@/config/camera-settings";
import { ENVIRONMENT_LIGHTING, POST_PROCESSING } from "@/config/environment-settings";

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
      {/* Development GUI - Draggable & Wider */}
      <Leva theme={{ sizes: { rootWidth: '350px' } }} flat />

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
        <ambientLight intensity={ENVIRONMENT_LIGHTING.ambientIntensity} />
        <Environment
          preset={ENVIRONMENT_LIGHTING.preset}
          environmentIntensity={ENVIRONMENT_LIGHTING.environmentIntensity}
        />

        {/* Scene Director handles all 3D scene rendering */}
        <SceneDirector />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={POST_PROCESSING.bloom.luminanceThreshold}
            luminanceSmoothing={POST_PROCESSING.bloom.luminanceSmoothing}
            intensity={POST_PROCESSING.bloom.intensity}
          />
          <Noise opacity={POST_PROCESSING.noise.opacity} />
        </EffectComposer>
      </Canvas>
    </main>
  );
}