"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Environment, CameraControls } from "@react-three/drei";
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing";
import { AnimatePresence, motion } from "framer-motion";

// Zustand Store
import { useStore } from "@/store/useStore";
import { TRANSITION_DURATIONS, UI_COLORS } from "@/config/system-settings";
import { UI_STRINGS, KEYBOARD_HINTS } from "@/config/ui-strings";

// Custom Hooks
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useAuthSession } from "@/hooks/useAuthSession";

// Config
import { CAM_POS_DEFAULT, CAM_POS_ZOOM, CAM_POS_START, STARTUP_LOOK_AT } from "@/config/camera-settings";

// Canvas Components (R3F)
import { KpiaUniverse, galaxies } from "@/components/canvas/_scenes/KpiaUniverse";
import { GalaxyInterior } from "@/components/canvas/_scenes/GalaxyInterior";
import { MyGalaxyScene } from "@/components/canvas/_scenes/MyGalaxyScene";
import { TransitionOverlay } from "@/components/canvas/effects/TransitionOverlay";
import { StartScreenDecorations } from "@/components/canvas/environments/StartScreenDecorations";
import { KuiperBelt } from "@/components/canvas/environments/KuiperBelt";

// DOM Components (UI)
import { GameMenuHUD } from "@/components/dom/menus/GameMenuHUD";
import { ErosionGauge } from "@/components/dom/features/ErosionGauge";
import { GalaxyEntryCutIn } from "@/components/dom/overlays/GalaxyEntryCutIn";
import { UniversalMenu } from "@/components/dom/menus/UniversalMenu";
import { StatusMenu } from "@/components/dom/features/StatusMenu";
import { NotionMenu } from "@/components/dom/menus/NotionMenu";
import { MapMenu } from "@/components/dom/menus/MapMenu";
import { SocialMenu } from "@/components/dom/overlays/SocialMenu";
import { RealtimeToast } from "@/components/dom/overlays/RealtimeToast";
import { StartScreen } from "@/components/dom/overlays/StartScreen";
import { LoadingScreen } from "@/components/dom/overlays/LoadingScreen";
import { ScanlineEffect } from "@/components/dom/effects/ScanlineEffect";
import AuthOverlay from "@/components/dom/features/auth/AuthOverlay";

import { CyberButton } from "@/components/dom/shared/CyberButton";
import { SystemIdentity } from "@/components/dom/shared/SystemIdentity";



// ============================================================================
// Internal R3F Components
// ============================================================================

const CameraTracker = ({ onUpdate, isActive }: { onUpdate: (pos: { x: number, z: number }) => void, isActive: boolean }) => {
  useFrame(({ camera }) => {
    if (isActive) onUpdate({ x: camera.position.x, z: camera.position.z });
  });
  return null;
};

const InitialDiveController = ({ controls }: { controls: React.RefObject<CameraControls> }) => {
  const { setInitialDive } = useStore();

  useEffect(() => {
    if (!controls.current) return;

    controls.current.setLookAt(0, 0, STARTUP_LOOK_AT.z, 0, 0, 0, false);

    const moveTimer = setTimeout(() => {
      controls.current?.setLookAt(CAM_POS_START.x, CAM_POS_START.y, CAM_POS_START.z, 0, 0, 0, true);
    }, TRANSITION_DURATIONS.cameraMove);

    const completeTimer = setTimeout(() => {
      setInitialDive(false);
    }, TRANSITION_DURATIONS.initialDive);

    return () => {
      clearTimeout(moveTimer);
      clearTimeout(completeTimer);
    };
  }, [controls, setInitialDive]);

  return null;
};

// ============================================================================
// Startup Transition Handler (カメラ制御ロジック)
// ============================================================================

const useStartupTransitionHandler = (
  controlsRef: React.RefObject<CameraControls>,
  isStartupTransition: boolean
) => {
  const { setCurrentScene, setAwakening, setStartupTransition } = useStore();

  useEffect(() => {
    if (!isStartupTransition || !controlsRef.current) return;

    // Midpoint: シーン切り替え
    const midpointTimer = setTimeout(() => {
      setCurrentScene('my_galaxy');
      setAwakening(true);

      controlsRef.current?.setLookAt(
        CAM_POS_ZOOM.x, CAM_POS_ZOOM.y, CAM_POS_ZOOM.z * 1.5,
        0, 0, 0, false
      );

      setTimeout(() => {
        controlsRef.current?.setLookAt(
          CAM_POS_DEFAULT.x, CAM_POS_DEFAULT.y, CAM_POS_DEFAULT.z,
          0, 0, 0, true
        );
      }, TRANSITION_DURATIONS.cameraMove);

      setTimeout(() => setAwakening(false), TRANSITION_DURATIONS.awakeningEffect);
    }, TRANSITION_DURATIONS.sceneTransition / 2);

    // Complete: 遷移終了
    const completeTimer = setTimeout(() => {
      setStartupTransition(false);
    }, TRANSITION_DURATIONS.sceneTransition);

    return () => {
      clearTimeout(midpointTimer);
      clearTimeout(completeTimer);
    };
  }, [isStartupTransition, controlsRef, setCurrentScene, setAwakening, setStartupTransition]);
};

// ============================================================================
// Main Page Component
// ============================================================================

// ============================================================================
// Main Page Component
// ============================================================================

export default function Home() {
  // === Zustand Store ===
  const {
    currentScene,
    viewMode,
    isTransitioning,
    isLoading,
    loadingText,
    isDiving,
    isStartupTransition,
    isInitialDive,
    isMapOpen,
    isAuthOpen,

    closeMenu,
    hoveredGalaxyId,
    selectedGalaxyId,
    // Actions
    setHoveredGalaxy,
    setSelectedGalaxy,
    startSystem,
    enterGalaxy,
    exitGalaxy,
    completeGalaxyEntry,


  } = useStore();

  // === Hooks ===
  useGlobalShortcuts();
  useAutoSave();
  useAuthSession();

  // === Refs ===
  const controlsRef = useRef<CameraControls>(null!);
  const universeControlsRef = useRef<CameraControls>(null!);
  const cameraPosRef = useRef({ x: 0, z: 400 });

  // === Startup Transition Handler ===
  useStartupTransitionHandler(controlsRef, isStartupTransition);

  // === Derived State ===
  const hoveredGalaxy = useMemo(() => galaxies.find(g => g.id === hoveredGalaxyId) ?? null, [hoveredGalaxyId]);
  const selectedGalaxy = useMemo(() => galaxies.find(g => g.id === selectedGalaxyId) ?? null, [selectedGalaxyId]);
  const activeData = selectedGalaxy || hoveredGalaxy;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <main className="h-screen w-full bg-black relative">
      {/* ===== UI OVERLAYS ===== */}
      <AnimatePresence>
        {currentScene === 'start' && <StartScreen onStartSystem={startSystem} isTransitioning={isStartupTransition} />}
      </AnimatePresence>

      <TransitionOverlay active={isStartupTransition} duration={TRANSITION_DURATIONS.sceneTransition} />

      <UniversalMenu />
      <StatusMenu />
      <NotionMenu />
      <MapMenu />
      <SocialMenu />
      <RealtimeToast />



      {/* Auth Overlay */}
      <AnimatePresence>
        {isAuthOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => closeMenu('auth')}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <AuthOverlay />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoadingScreen isVisible={isLoading} text={loadingText} />

      <AnimatePresence>
        {isTransitioning && selectedGalaxy && (
          <GalaxyEntryCutIn galaxyName={selectedGalaxy.name} onComplete={completeGalaxyEntry} />
        )}
      </AnimatePresence>

      {currentScene !== 'start' && !isTransitioning && <GameMenuHUD />}
      {currentScene !== 'start' && !isTransitioning && <SystemIdentity />}

      {currentScene === 'universe' && !isTransitioning && viewMode === 'universe' && (
        <ErosionGauge
          erosionLevel={activeData?.erosionLevel ? Math.round(activeData.erosionLevel * 100) : 0}
          isVisible={!!hoveredGalaxy || !!selectedGalaxy}
          galaxyName={activeData?.name}
        />
      )}

      {/* ===== 3D CANVAS ===== */}
      <Canvas shadows camera={{ position: [0, 200, 400], fov: 60, far: 3000 }}>
        <ambientLight intensity={0.5} />
        <Environment preset="city" />

        {/* --- Start Scene --- */}
        {currentScene === 'start' && (
          <>
            <CameraControls ref={controlsRef} makeDefault minDistance={10} maxDistance={2000} smoothTime={1.5} enabled={false} />
            <group position={[-150, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
              <MyGalaxyScene controlsRef={controlsRef} mode="decorative" isDiving={isInitialDive} />
              <Sparkles count={200} scale={400} size={2} speed={0.4} opacity={0.3} color={UI_COLORS.primary} />
            </group>
            <StartScreenDecorations isTransitioning={isStartupTransition} />
            {isInitialDive && <InitialDiveController controls={controlsRef} />}
          </>
        )}

        {/* --- My Galaxy Scene --- */}
        {currentScene === 'my_galaxy' && (
          <>
            <CameraControls ref={controlsRef} makeDefault minDistance={100} maxDistance={1000} smoothTime={isDiving ? 0.3 : 1.5} />
            <MyGalaxyScene controlsRef={controlsRef} isDiving={isDiving} />
            <KuiperBelt />
            <Sparkles count={500} scale={800} size={2} speed={0.2} opacity={0.5} color={UI_COLORS.primary} />
          </>
        )}

        {/* --- Universe Scene --- */}
        {currentScene === 'universe' && (
          <>
            <CameraTracker onUpdate={(pos) => { cameraPosRef.current = pos; }} isActive={isMapOpen} />
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
                <CameraControls ref={universeControlsRef} minDistance={50} maxDistance={800} smoothTime={0.8} />
                <KpiaUniverse
                  hoveredGalaxy={hoveredGalaxy}
                  selectedGalaxy={selectedGalaxy}
                  onHoverGalaxy={(g) => setHoveredGalaxy(g?.id ?? null)}
                  onSelectGalaxy={(g) => setSelectedGalaxy(g?.id ?? null)}
                  controlsRef={universeControlsRef}
                />
              </>
            )}

            {viewMode === 'galaxy' && !isTransitioning && selectedGalaxy && (
              <>
                <CameraControls ref={controlsRef} minDistance={5} maxDistance={500} minPolarAngle={0} maxPolarAngle={Math.PI} />
                <GalaxyInterior galaxy={selectedGalaxy} onBack={exitGalaxy} />
              </>
            )}
          </>
        )}

        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={2.0} />
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>

      {/* ===== ACTION BUTTONS ===== */}
      {currentScene === 'universe' && viewMode === 'universe' && selectedGalaxy && !isTransitioning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 pointer-events-auto">
          <CyberButton onClick={enterGalaxy}>
            {UI_STRINGS.ACTIONS.ENTER_GALAXY}
          </CyberButton>
        </div>
      )}

      {currentScene === 'universe' && viewMode === 'galaxy' && (
        <div className="absolute top-8 left-8 pointer-events-auto">
          <CyberButton
            variant="secondary"
            onClick={exitGalaxy}
            className="flex items-center gap-2 hover:drop-shadow-[0_0_8px_#ff8800]"
          >
            {UI_STRINGS.ACTIONS.BACK_TO_UNIVERSE}
          </CyberButton>
        </div>
      )}

      {/* ===== KEYBOARD HINTS ===== */}
      {currentScene !== 'start' && (
        <div className="absolute bottom-4 right-4 font-mono text-right pointer-events-none text-white text-[12px] tracking-widest">
          {KEYBOARD_HINTS.MENU} &nbsp;&nbsp; {KEYBOARD_HINTS.SELECT} &nbsp;&nbsp; {KEYBOARD_HINTS.ZOOM} &nbsp;&nbsp; {KEYBOARD_HINTS.BACK}
        </div>
      )}

      <ScanlineEffect />
    </main>
  );
}