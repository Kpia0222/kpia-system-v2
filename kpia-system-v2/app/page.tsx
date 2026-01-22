"use client";


import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment, CameraControls } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import * as THREE from "three";

// 新しい世界観コンポーネント (v3)
import { KpiaUniverse, GalaxyData, galaxies } from "@/components/three/KpiaUniverse";
import { GalaxyInterior } from "@/components/three/GalaxyInterior";
import { MyGalaxyScene } from "@/components/three/MyGalaxyScene"; // DNA Scene
import { CosmicFog } from "@/components/three/CosmicFog";
import { GameMenuHUD } from "@/components/ui/GameMenuHUD";
import { ErosionGauge } from "@/components/ui/ErosionGauge";
import { AnimatePresence } from "framer-motion";
import { GalaxyEntryCutIn } from "@/components/ui/GalaxyEntryCutIn";

import { UniversalMenu } from "@/components/ui/UniversalMenu";
import { StatusMenu } from "@/components/ui/StatusMenu";
import { NotionMenu } from "@/components/ui/NotionMenu";
import { MapMenu } from "@/components/ui/MapMenu";
import { StartScreen } from "@/components/ui/StartScreen"; // Start Screen

// Helper to track camera position for Map
const CameraTracker = ({ onUpdate, isActive }: { onUpdate: (pos: { x: number, z: number }) => void, isActive: boolean }) => {
  useFrame(({ camera }) => {
    if (!isActive) return;
    onUpdate({ x: camera.position.x, z: camera.position.z });
  });
  return null;
};

export default function Home() {
  // Scene State: 'start' | 'universe' | 'my_galaxy'
  const [currentScene, setCurrentScene] = useState<'start' | 'universe' | 'my_galaxy'>('start');
  const [isSceneSwitching, setIsSceneSwitching] = useState(false); // Transition state

  const [hoveredGalaxy, setHoveredGalaxy] = useState<GalaxyData | null>(null);
  const [selectedGalaxy, setSelectedGalaxy] = useState<GalaxyData | null>(null);
  const [viewMode, setViewMode] = useState<'universe' | 'galaxy'>('universe');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isNotionOpen, setIsNotionOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraPos, setCameraPos] = useState({ x: 0, z: 400 });
  const controlsRef = useRef<CameraControls>(null!);         // For Galaxy Interior
  const universeControlsRef = useRef<CameraControls>(null!); // For Universe View

  // Scene Toggle Logic with Transition
  const handleSceneToggle = () => {
    if (currentScene === 'start' || isSceneSwitching) return;

    setIsSceneSwitching(true);
    setTimeout(() => {
      setCurrentScene(prev => prev === 'universe' ? 'my_galaxy' : 'universe');
      // Reset ViewMode if switching to Universe, mainly
      if (currentScene === 'my_galaxy') {
        setViewMode('universe');
        setSelectedGalaxy(null);
      }
      setTimeout(() => setIsSceneSwitching(false), 800);
    }, 800);
  };

  // Keyboard Interaction
  // Keyboard Interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC: Toggle Universal Menu
      if (e.key === 'Escape') {
        if (isMenuOpen || isStatusOpen || isNotionOpen || isMapOpen) {
          setIsMenuOpen(false);
          setIsStatusOpen(false);
          setIsNotionOpen(false);
          setIsMapOpen(false);
        } else if (viewMode === 'galaxy' && !isTransitioning) {
          setViewMode('universe');
          setSelectedGalaxy(null);
        } else if (selectedGalaxy && !isTransitioning) {
          setSelectedGalaxy(null);
        } else {
          setIsMenuOpen(prev => !prev);
        }
        return;
      }

      // Toggle Menu with 'U' (Global)
      if (e.key.toUpperCase() === 'U') {
        setIsMenuOpen(prev => !prev);
        return;
      }

      // F2: Sound Toggle (Global)
      if (e.key === 'F2') {
        e.preventDefault();
        setIsMuted(prev => !prev);
        return;
      }

      // Start Screen Restriction for other keys
      if (currentScene === 'start') return;

      // F1: Toggle Scene
      if (e.key === 'F1') {
        e.preventDefault();
        handleSceneToggle();
        return;
      }
      // F3: Notion
      if (e.key === 'F3') {
        e.preventDefault();
        setIsNotionOpen(prev => !prev);
        return;
      }
      // F4: Status
      if (e.key === 'F4') {
        e.preventDefault();
        setIsStatusOpen(prev => !prev);
        return;
      }
      // F5: Map
      if (e.key === 'F5') {
        e.preventDefault();
        setIsMapOpen(prev => !prev);
        return;
      }

      // If any Menu is open or transitioning, block navigation keys
      if (isMenuOpen || isStatusOpen || isNotionOpen || isMapOpen || isTransitioning || isSceneSwitching) {
        return;
      }

      // ENTER: Zoom/Select Logic
      if (e.key === 'Enter') {
        if (hoveredGalaxy && !selectedGalaxy && !isTransitioning) {
          setSelectedGalaxy(hoveredGalaxy);
        } else if (selectedGalaxy && viewMode === 'universe' && !isTransitioning) {
          setIsTransitioning(true);
        }
        return;
      }

      // ARROWS: Navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        if (isTransitioning || viewMode === 'galaxy') return;

        const currentId = selectedGalaxy?.id || hoveredGalaxy?.id;
        let currentIndex = galaxies.findIndex(g => g.id === currentId);

        if (currentIndex === -1) currentIndex = -1;

        let nextIndex = 0;
        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % galaxies.length;
        } else {
          nextIndex = (currentIndex - 1 + galaxies.length) % galaxies.length;
        }

        const nextGalaxy = galaxies[nextIndex];
        setHoveredGalaxy(nextGalaxy);
        if (selectedGalaxy) {
          setSelectedGalaxy(nextGalaxy);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredGalaxy, selectedGalaxy, viewMode, isTransitioning, isMenuOpen, isStatusOpen, isNotionOpen, isMapOpen, isMuted, currentScene, isSceneSwitching]);

  // 表示するデータ（選択中があればそちらを優先、なければホバー中）
  const activeData = selectedGalaxy || hoveredGalaxy;

  return (
    <main className="h-screen w-full bg-black relative">
      <AnimatePresence>
        {currentScene === 'start' && (
          <StartScreen onStartSystem={() => setCurrentScene('my_galaxy')} />
        )}
      </AnimatePresence>

      {/* Scene Transition Overlay */}
      <AnimatePresence>
        {isSceneSwitching && (
          <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center pointer-events-auto">
            {/* Scanline / Loading Effect */}
            <div className="w-full h-[2px] bg-[#ff8800] animate-pulse shadow-[0_0_20px_#ff8800]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
            <div className="absolute text-[#ff8800] font-mono tracking-[0.5em] text-xs">
              SYSTEM TRANSFER...
            </div>
          </div>
        )}
      </AnimatePresence>

      <UniversalMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onStartScreen={() => {
          setIsMenuOpen(false);
          setCurrentScene('start');
        }}
      />
      <StatusMenu isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} />
      <NotionMenu isOpen={isNotionOpen} onClose={() => setIsNotionOpen(false)} />
      <MapMenu
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        galaxies={galaxies}
        cameraPosition={cameraPos}
      />

      {/* Cut-In Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && selectedGalaxy && (
          <GalaxyEntryCutIn
            galaxyName={selectedGalaxy.name}
            onComplete={() => {
              setViewMode('galaxy');
              setIsTransitioning(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Game Menu HUD - Only show if NOT in Start Screen and NOT transitioning */}
      {currentScene !== 'start' && !isTransitioning && (
        <GameMenuHUD
          onUniversalOpen={() => setIsMenuOpen(true)}
          onMapOpen={() => setIsMapOpen(true)}
          onStatusOpen={() => setIsStatusOpen(true)}
          onNotionOpen={() => setIsNotionOpen(true)}
          onToggleMute={() => setIsMuted(prev => !prev)}
          onToggleScene={handleSceneToggle}
          isMuted={isMuted}
          currentScene={currentScene}
        />
      )}

      {/* Erosion Gauge - Only in Universe View */}
      {currentScene === 'universe' && !isTransitioning && viewMode === 'universe' && (
        <ErosionGauge
          erosionLevel={activeData?.erosionLevel ? Math.round(activeData.erosionLevel * 100) : 0}
          isVisible={!!hoveredGalaxy || !!selectedGalaxy}
          galaxyName={activeData?.name}
        />
      )}

      {/* Canvas Scene */}
      <Canvas shadows camera={{ position: [0, 200, 400], fov: 60, far: 3000 }}>
        {/* Common Env */}
        <fog attach="fog" args={['#000', 500, 2500]} />
        <ambientLight intensity={0.5} />
        <Environment preset="city" />

        {/* Scene: My Galaxy (DNA) */}
        {currentScene === 'my_galaxy' && (
          <>
            <CameraControls makeDefault minDistance={100} maxDistance={1000} />
            <MyGalaxyScene />
            <Sparkles count={500} scale={800} size={2} speed={0.2} opacity={0.5} color="#ff8800" />
          </>
        )}

        {/* Scene: Universe (Main Game) */}
        {currentScene === 'universe' && (
          <>
            <CameraTracker onUpdate={setCameraPos} isActive={isMapOpen} />

            <CosmicFog
              galaxies={galaxies}
              mode={viewMode}
              accentColor={
                viewMode === 'galaxy' && selectedGalaxy
                  ? (selectedGalaxy.id === 'g-africa' ? '#ffaa00' : selectedGalaxy.id === 'g-irish' ? '#00ff88' : selectedGalaxy.id === 'g-spiral' ? '#0088ff' : '#ffffff')
                  : '#ffffff'
              }
            />

            <Sparkles
              count={viewMode === 'universe' ? 5000 : 2000}
              scale={viewMode === 'universe' ? 1000 : 100}
              size={viewMode === 'universe' ? 0.5 : 1.5}
              speed={0.1}
              color={viewMode === 'galaxy' && selectedGalaxy ? '#ff8800' : '#ffffff'}
              opacity={0.2}
            />

            {viewMode === 'universe' && !isTransitioning && (
              <>
                <CameraControls
                  ref={universeControlsRef}
                  minDistance={50}
                  maxDistance={800}
                  smoothTime={0.8}
                />
                <KpiaUniverse
                  hoveredGalaxy={hoveredGalaxy}
                  selectedGalaxy={selectedGalaxy}
                  onHoverGalaxy={setHoveredGalaxy}
                  onSelectGalaxy={setSelectedGalaxy}
                  controlsRef={universeControlsRef}
                />
              </>
            )}

            {viewMode === 'galaxy' && !isTransitioning && selectedGalaxy && (
              <>
                <CameraControls
                  ref={controlsRef}
                  minDistance={5}
                  maxDistance={450}
                  minPolarAngle={0}
                  maxPolarAngle={Math.PI}
                />
                <GalaxyInterior
                  galaxy={selectedGalaxy}
                  onBack={() => setViewMode('universe')}
                />
              </>
            )}
          </>
        )}

        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={2.0} />
          <Noise opacity={0.05} />
        </EffectComposer>
      </Canvas>

      {/* --- UI Overlays (Specific to Universe Scene) --- */}

      {/* ENTER GALAXY Button */}
      {currentScene === 'universe' && viewMode === 'universe' && selectedGalaxy && !isTransitioning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 pointer-events-auto">
          <button
            className="px-6 py-2 border border-white/50 text-white bg-black/50 hover:bg-white/20 backdrop-blur-md rounded transition-all tracking-widest text-sm"
            onClick={() => {
              setIsTransitioning(true);
            }}
          >
            ENTER GALAXY
          </button>
        </div>
      )}

      {/* BACK TO UNIVERSE Button */}
      {currentScene === 'universe' && viewMode === 'galaxy' && (
        <div className="absolute top-8 left-8 pointer-events-auto">
          <button
            className="text-xs font-mono tracking-widest flex items-center gap-2 transition-all duration-300 hover:drop-shadow-[0_0_8px_#ff8800]"
            style={{ color: "#ff8800" }}
            onClick={() => {
              setViewMode('universe');
              setSelectedGalaxy(null);
            }}
          >
            ← BACK TO UNIVERSE
          </button>
        </div>
      )}

      {currentScene !== 'start' && (
        <>
          <div className="absolute bottom-2 right-2 font-mono text-right pointer-events-none" style={{ color: "#FFFFFF" }}>
            <div className="text-[10px] tracking-[0.5em] mb-2">KPIA_SYSTEM v3.3.0 [LIQUID_METAL]</div>
          </div>
          <div className="absolute bottom-4 left-4 font-mono text-right pointer-events-none" style={{ color: "#FFFFFF" }}>
            <div className="text-[12px] tracking-widest">
              [U] MENU &nbsp;&nbsp; [←][→] SELECT &nbsp;&nbsp; [ENTER] ZOOM &nbsp;&nbsp; [ESC] BACK/CLOSE
            </div>
          </div>
        </>
      )}
    </main>
  );
}