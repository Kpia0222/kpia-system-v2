"use client";


import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment, CameraControls } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import * as THREE from "three";

// 新しい世界観コンポーネント (v3)
import { KpiaUniverse, GalaxyData, galaxies } from "@/components/three/KpiaUniverse";
import { GalaxyInterior } from "@/components/three/GalaxyInterior";
import { CosmicFog } from "@/components/three/CosmicFog";

export default function Home() {
  const [hoveredGalaxy, setHoveredGalaxy] = useState<GalaxyData | null>(null);
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyData | null>(null);
  const [viewMode, setViewMode] = useState<'universe' | 'galaxy'>('universe');
  const controlsRef = useRef<CameraControls>(null);

  // Keyboard Interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedGalaxy(null);
        return;
      }

      if (e.key === 'Enter') {
        if (hoveredGalaxy) setSelectedGalaxy(hoveredGalaxy);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const currentId = hoveredGalaxy?.id || selectedGalaxy?.id;
        let currentIndex = galaxies.findIndex(g => g.id === currentId);

        // If nothing is hovered, start from first
        if (currentIndex === -1) currentIndex = -1;

        let nextIndex = 0;
        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % galaxies.length;
        } else {
          nextIndex = (currentIndex - 1 + galaxies.length) % galaxies.length;
        }

        setHoveredGalaxy(galaxies[nextIndex]);
        // If selected, we don't change selection, just hover highlight change? 
        // Or should we move selection? Prompt said "increase index and update setHoveredGalaxy".
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredGalaxy, selectedGalaxy]);

  // 表示するデータ（選択中があればそちらを優先、なければホバー中）
  const activeData = selectedGalaxy || hoveredGalaxy;

  return (
    <main className="h-screen w-full bg-black relative">
      {/* 2D Info Panel (Permanent Header) */}
      <div className="absolute top-0 left-0 w-full z-10 p-4 pointer-events-none">
        <div className="mx-auto max-w-5xl bg-black/40 backdrop-blur-md border border-white/10 rounded-full py-3 px-8 shadow-2xl transition-all duration-300 pointer-events-auto">
          {!activeData ? (
            // STANDBY STATE
            <div className="flex items-center justify-between text-white/30 font-mono text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span>SYSTEM STANDBY</span>
              </div>
              <div className="tracking-[0.2em]">WAITING FOR TARGET LOCK...</div>
              <div>--:--:--</div>
            </div>
          ) : (
            // ACTIVE STATE (Horizontal Layout)
            <div className="flex items-center justify-between gap-8 font-mono animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Name */}
              <div className="flex flex-col">
                <span className="text-[9px] text-white/40 tracking-wider">TARGET DESIGNATION</span>
                <span className="text-lg font-bold text-white tracking-widest leading-none">{activeData.name}</span>
              </div>

              <div className="w-px h-8 bg-white/20" />

              {/* Details Group */}
              <div className="flex items-center gap-8 flex-1">
                <div className="flex flex-col">
                  <span className="text-[9px] text-white/40 tracking-wider">CLASS</span>
                  <span className="text-cyan-400 font-bold">{activeData.type.toUpperCase()}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] text-white/40 tracking-wider">MASS</span>
                  <span className="text-white">{activeData.starCount.toLocaleString()} <span className="text-[9px] text-white/30">UNITS</span></span>
                </div>

                {/* Erosion Bar */}
                <div className="flex flex-col w-32">
                  <div className="flex justify-between text-[9px] text-white/40 mb-1">
                    <span>EROSION</span>
                    <span>{(activeData.erosionLevel * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500 transition-all duration-300 ease-out"
                      style={{ width: `${activeData.erosionLevel * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              {selectedGalaxy && (
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setSelectedGalaxy(null);
                      setHoveredGalaxy(null);
                    }}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/50 px-4 py-1 rounded text-xs tracking-widest transition-colors cursor-pointer"
                  >
                    × CLOSE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Canvas shadows camera={{ position: [0, 20, 40], fov: 60 }}>
        <fog attach="fog" args={['#000', 30, 100]} />
        <ambientLight intensity={0.5} />

        {/* --- Global Background --- */}
        <CosmicFog
          galaxies={galaxies}
          mode={viewMode}
          accentColor={
            viewMode === 'galaxy' && selectedGalaxy
              ? (selectedGalaxy.id === 'g-africa' ? '#ffaa00' : selectedGalaxy.id === 'g-irish' ? '#00ff88' : selectedGalaxy.id === 'g-spiral' ? '#0088ff' : '#ffffff')
              : '#ffffff'
          }
        />

        {/* 背景の細かい粒子 */}
        <Sparkles count={5000} scale={120} size={1} speed={0.1} color="#ffffff" opacity={0.2} />

        {/* --- Main Scenes --- */}
        {viewMode === 'universe' ? (
          <KpiaUniverse
            hoveredGalaxy={hoveredGalaxy}
            selectedGalaxy={selectedGalaxy}
            onHoverGalaxy={setHoveredGalaxy}
            onSelectGalaxy={setSelectedGalaxy}
          />
        ) : (
          selectedGalaxy && (
            <>
              <CameraControls
                ref={controlsRef}
                minDistance={5}
                maxDistance={50}
                // Initial position for interior view
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
              />
              <GalaxyInterior
                galaxy={selectedGalaxy}
                onBack={() => setViewMode('universe')}
              />
            </>
          )
        )}

        <EffectComposer>
          <Noise opacity={0.05} />
        </EffectComposer>
      </Canvas>

      {/* --- UI Overlays --- */}
      {/* ENTER GALAXY Button */}
      {viewMode === 'universe' && selectedGalaxy && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 pointer-events-auto">
          <button
            className="px-6 py-2 border border-white/50 text-white bg-black/50 hover:bg-white/20 backdrop-blur-md rounded transition-all tracking-widest text-sm"
            onClick={() => {
              setViewMode('galaxy');
            }}
          >
            ENTER GALAXY
          </button>
        </div>
      )}

      {/* BACK TO UNIVERSE Button (In Galaxy View) */}
      {viewMode === 'galaxy' && (
        <div className="absolute top-8 left-8 pointer-events-auto">
          <button
            className="text-xs text-gray-400 hover:text-white transition-colors tracking-widest flex items-center gap-2"
            onClick={() => {
              setViewMode('universe');
              setSelectedGalaxy(null); // Reset selection when going back
            }}
          >
            &larr; BACK TO UNIVERSE
          </button>
        </div>
      )}

      <div className="absolute bottom-8 right-8 text-white/30 font-mono text-right pointer-events-none">
        <div className="text-[10px] tracking-[0.5em] mb-2">KPIA_SYSTEM v3.3.0 [EXPANDED_UNIVERSE]</div>
        <div className="text-[9px] tracking-widest opacity-60">
          [←][→] SELECT &nbsp;&nbsp; [ENTER] ZOOM &nbsp;&nbsp; [ESC] BACK
        </div>
      </div>
    </main>
  );
}