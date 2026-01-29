import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { TRANSITION_DURATIONS as DURATIONS } from "@/config/system-settings";
import { UI_STRINGS } from "@/config/ui-strings";

export type SceneType = 'start' | 'universe' | 'my_galaxy'
export type ViewMode = 'universe' | 'galaxy'
export type DurationKeys = keyof typeof DURATIONS

export interface MusicTrack {
    id: string
    title: string
    external_url?: string
    status: 'draft' | 'published' | 'archived' | 'fragment'
    created_at: string
}

interface AppState {
    // シーン状態
    currentScene: SceneType
    viewMode: ViewMode

    // UI状態
    isDnaMode: boolean
    isTransitioning: boolean
    isLoading: boolean
    loadingText: string

    // カメラ・シーン制御
    isDiving: boolean
    isAwakening: boolean
    isStartupTransition: boolean
    isInitialDive: boolean

    // ギャラクシー選択 (IDで管理)
    hoveredGalaxyId: string | null
    selectedGalaxyId: string | null

    // メニュー状態
    isMenuOpen: boolean
    isStatusOpen: boolean
    isNotionOpen: boolean
    isMapOpen: boolean
    isAuthOpen: boolean
    isMuted: boolean

    // ステータス・シミュレーション
    erosionLevel: number
    kardashevScale: number
    lastPosition: {
        scene: SceneType
        galaxyId: string | null
        viewMode: ViewMode
    } | null

    // 認証・永続化状態
    user: User | null
    session: Session | null

    // 基本アクション
    setCurrentScene: (scene: SceneType) => void
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    resetState: () => void
    syncWithCloud: () => Promise<void>
    loadFromCloud: () => Promise<void>
    syncProfile: () => Promise<void>
    saveCurrentState: () => Promise<void>

    // Status Setters
    setErosionLevel: (level: number) => void
    setKardashevScale: (scale: number) => void

    // Music Data
    musicTracks: MusicTrack[]
    fetchMusicTracks: () => Promise<void>

    setViewMode: (mode: ViewMode) => void
    toggleDnaMode: () => void
    setDnaMode: (value: boolean) => void
    setTransitioning: (value: boolean) => void
    setLoading: (value: boolean, text?: string) => void
    setDiving: (value: boolean) => void
    setAwakening: (value: boolean) => void
    setStartupTransition: (value: boolean) => void
    setInitialDive: (value: boolean) => void
    setHoveredGalaxy: (id: string | null) => void
    setSelectedGalaxy: (id: string | null) => void
    openMenu: (menu: 'menu' | 'status' | 'notion' | 'map' | 'auth') => void
    closeMenu: (menu: 'menu' | 'status' | 'notion' | 'map' | 'auth') => void
    toggleMenu: (menu: 'menu' | 'status' | 'notion' | 'map' | 'auth') => void
    closeAllMenus: () => void
    toggleMute: () => void

    // 遷移アクション（複合操作）
    executeSceneTransition: (
        targetScene: SceneType,
        options?: {
            targetView?: ViewMode
            loadingText?: string
            galaxyId?: string | null
            duration?: number
            onMidpoint?: () => void
            onComplete?: () => void
        }
    ) => void
    warpToGalaxy: (galaxyId: string, galaxyName: string) => void
    returnToStart: () => void
    toggleSceneMode: () => void
    startSystem: () => void
    enterGalaxy: () => void
    exitGalaxy: () => void
    completeGalaxyEntry: () => void
}

export const useStore = create<AppState>((set, get) => ({
    // 初期状態
    user: null,
    session: null,
    currentScene: 'start',
    viewMode: 'universe',
    isDnaMode: false,
    isTransitioning: false,
    isLoading: false,
    loadingText: '',
    isDiving: false,
    isAwakening: false,
    isStartupTransition: false,
    isInitialDive: true,
    hoveredGalaxyId: null,
    selectedGalaxyId: null,
    isMenuOpen: false,
    isStatusOpen: false,
    isNotionOpen: false,
    isMapOpen: false,
    isAuthOpen: false,
    isMuted: false,

    erosionLevel: 0.0,
    kardashevScale: 1.24,
    lastPosition: null,
    musicTracks: [],

    // 基本アクション
    setCurrentScene: (scene) => set({ currentScene: scene }),
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleDnaMode: () => set((state) => ({ isDnaMode: !state.isDnaMode })),
    setDnaMode: (value) => set({ isDnaMode: value }),
    setTransitioning: (value) => set({ isTransitioning: value }),
    setLoading: (value, text = '') => set({ isLoading: value, loadingText: text }),
    setDiving: (value) => set({ isDiving: value }),
    setAwakening: (value) => set({ isAwakening: value }),
    setStartupTransition: (value) => set({ isStartupTransition: value }),
    setInitialDive: (value) => set({ isInitialDive: value }),
    setHoveredGalaxy: (id) => set({ hoveredGalaxyId: id }),
    setSelectedGalaxy: (id) => set({ selectedGalaxyId: id }),

    // Status Setters
    setErosionLevel: (level) => set({ erosionLevel: level }),
    setKardashevScale: (scale) => set({ kardashevScale: scale }),

    openMenu: (menu) => {
        const key = menu === 'menu' ? 'isMenuOpen' :
            menu === 'status' ? 'isStatusOpen' :
                menu === 'notion' ? 'isNotionOpen' :
                    menu === 'map' ? 'isMapOpen' : 'isAuthOpen'
        set({ [key]: true })
    },
    closeMenu: (menu) => {
        const key = menu === 'menu' ? 'isMenuOpen' :
            menu === 'status' ? 'isStatusOpen' :
                menu === 'notion' ? 'isNotionOpen' :
                    menu === 'map' ? 'isMapOpen' : 'isAuthOpen'
        set({ [key]: false })
    },
    toggleMenu: (menu) => {
        set((state) => {
            const key = menu === 'menu' ? 'isMenuOpen' :
                menu === 'status' ? 'isStatusOpen' :
                    menu === 'notion' ? 'isNotionOpen' :
                        menu === 'map' ? 'isMapOpen' : 'isAuthOpen'
            return { [key]: !state[key] }
        })
    },
    closeAllMenus: () => set({
        isMenuOpen: false,
        isStatusOpen: false,
        isNotionOpen: false,
        isMapOpen: false,
        isAuthOpen: false,
    }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    // ============================================================================
    // 遷移アクション（複合操作）- DURATIONS を使用
    // ============================================================================

    executeSceneTransition: (targetScene, options = {}) => {
        const {
            targetView = 'universe',
            loadingText = '',
            galaxyId,
            duration = DURATIONS.sceneTransition,
            onMidpoint,
            onComplete,
        } = options

        // Phase 1: 遷移開始
        set({ isTransitioning: true, isLoading: true, loadingText })

        // Phase 2: 80% 地点でシーン切り替え（演出が最高潮の時点）
        setTimeout(() => {
            set({
                currentScene: targetScene,
                viewMode: targetView,
                selectedGalaxyId: galaxyId !== undefined ? galaxyId : get().selectedGalaxyId,
                isDnaMode: false,
            })
            onMidpoint?.()
        }, duration * 0.8)

        // Phase 3: 100% 地点で遷移完了
        setTimeout(() => {
            set({
                isTransitioning: false,
                isLoading: false,
                loadingText: '',
            })
            onComplete?.()
        }, duration)
    },

    warpToGalaxy: (galaxyId, galaxyName) => {
        const state = get()
        state.closeMenu('map')
        state.executeSceneTransition('universe', {
            targetView: 'galaxy',
            loadingText: `${UI_STRINGS.TRANSITION.RELOCATING_PREFIX}${galaxyName.toUpperCase()}...`,
            galaxyId,
        })
    },

    returnToStart: () => {
        const state = get()
        if (state.currentScene === 'start' || state.isLoading) return

        set({ isDnaMode: false, isDiving: true, isLoading: true, loadingText: UI_STRINGS.TRANSITION.RETURNING_START })

        setTimeout(() => {
            set({
                currentScene: 'start',
                viewMode: 'universe',
                isDiving: false,
                isLoading: false,
                loadingText: '',
            })
        }, DURATIONS.sceneTransition)
    },

    toggleSceneMode: () => {
        const state = get()
        if (state.currentScene === 'start' || state.isLoading) return

        const nextScene = state.currentScene === 'universe' ? 'my_galaxy' : 'universe'
        const text = nextScene === 'my_galaxy'
            ? UI_STRINGS.TRANSITION.INITIATING_DNA
            : UI_STRINGS.TRANSITION.RETURNING_UNIVERSE

        state.executeSceneTransition(nextScene, { loadingText: text })
    },

    startSystem: () => {
        set({ isStartupTransition: true })
    },

    enterGalaxy: () => {
        const state = get()
        if (!state.selectedGalaxyId || state.isTransitioning) return
        set({ isTransitioning: true })
    },

    completeGalaxyEntry: () => {
        set({ viewMode: 'galaxy', isTransitioning: false })
    },

    exitGalaxy: () => {
        set({ viewMode: 'universe', selectedGalaxyId: null })
    },

    // ============================================================================
    // Supabase Actions
    // ============================================================================
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),

    resetState: () => {
        set({
            currentScene: 'start',
            viewMode: 'universe',
            isDnaMode: false,
            selectedGalaxyId: null,
            erosionLevel: 0.0,
            kardashevScale: 1.24,
            lastPosition: null,
            isMenuOpen: false,
            isStatusOpen: false,
            isNotionOpen: false,
            isMapOpen: false,
            isAuthOpen: false,
        });
    },

    syncProfile: async () => {
        const state = get();
        if (!state.user) return;

        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('game_state')
                .eq('id', state.user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data?.game_state) {
                const gameState = data.game_state as any;
                console.log('Restoring game state:', gameState);

                set({
                    // Restore only persistent fields
                    erosionLevel: gameState.erosionLevel ?? 0.0,
                    kardashevScale: gameState.kardashevScale ?? 1.24,
                    lastPosition: gameState.lastPosition ?? null,
                    // If resuming directly, we might want to set these, but usually we wait for "START" action
                    // For now just load into memory, and let StartScreen logic handle the jump
                });
            }
        } catch (error: any) {
            console.error('Failed to sync profile:', error.message || error);
        }
    },

    saveCurrentState: async () => {
        const state = get();
        if (!state.user) return;

        // Construct lastPosition based on current state
        const lastPosition = {
            scene: state.currentScene,
            galaxyId: state.selectedGalaxyId,
            viewMode: state.viewMode
        };

        const gameState = {
            erosionLevel: state.erosionLevel,
            kardashevScale: state.kardashevScale,
            lastPosition: lastPosition,
            updatedAt: new Date().toISOString()
        };

        const supabase = createClient();
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: state.user.id,
                    updated_at: new Date().toISOString(),
                    game_state: gameState,
                });

            if (error) throw error;
            console.log('Game state saved:', gameState);
        } catch (error) {
            const e = error as any;
            console.error('Failed to save state [FULL DUMP]:', JSON.stringify(e, null, 2));
            console.error('Failed to save state [DIRECT]:', e);
            console.error('Error Code:', e?.code || 'NO_CODE');
            console.error('Error Message:', e?.message || 'NO_MESSAGE');
        }
    },

    syncWithCloud: async () => {
        await get().saveCurrentState();
    },

    loadFromCloud: async () => {
        await get().syncProfile();
    },

    fetchMusicTracks: async () => {
        const state = get();
        if (!state.user) return;

        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('music_metadata')
                .select('*')
                .eq('user_id', state.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                console.log('Music tracks fetched:', data);
                set({ musicTracks: data as MusicTrack[] });
            }
        } catch (error: any) {
            console.error('Failed to fetch music tracks:', error.message || error);
        }
    }
}))



