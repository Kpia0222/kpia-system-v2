import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { TRANSITION_DURATIONS as DURATIONS } from "@/config/system-settings";
import { UI_STRINGS } from "@/config/ui-strings";
import { MusicTrack, UserProfile } from "@/types/database";

export type SceneType = 'start' | 'universe' | 'my_galaxy' | 'skill'
export type ViewMode = 'universe' | 'galaxy'
export type DurationKeys = keyof typeof DURATIONS

export interface AppState {
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
    isSocialOpen: boolean
    isMuted: boolean

    // 演出同期用フラグ
    showStartupText: boolean
    showStartupTips: boolean

    // フェード時間設定 (秒)
    fadeSettings: {
        textIn: number
        textOut: number
        tipsIn: number
        tipsOut: number
    }


    // 訪問モード（他ユーザーの宇宙を観測中）
    isVisitingMode: boolean
    visitingUserId: string | null
    displayId: string | null

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
    userProfile: UserProfile | null
    session: Session | null

    // 基本アクション
    setCurrentScene: (scene: SceneType) => void
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    resetState: () => void
    syncWithCloud: () => Promise<void>
    loadFromCloud: () => Promise<void>
    fetchUserProfile: () => Promise<void>
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
    setStartupText: (value: boolean) => void
    setStartupTips: (value: boolean) => void
    setFadeSettings: (settings: { textIn: number, textOut: number, tipsIn: number, tipsOut: number }) => void
    setStartupTransition: (value: boolean) => void
    setInitialDive: (value: boolean) => void
    setHoveredGalaxy: (id: string | null) => void
    setSelectedGalaxy: (id: string | null) => void
    openMenu: (menu: 'menu' | 'status' | 'notion' | 'map' | 'auth' | 'social') => void
    closeMenu: (menu: 'menu' | 'status' | 'notion' | 'map' | 'auth' | 'social') => void
    toggleMenu: (menu: 'menu' | 'status' | 'notion' | 'map' | 'auth' | 'social') => void
    closeAllMenus: () => void
    toggleMute: () => void

    // 訪問モードアクション
    enterVisitingMode: (userId: string) => void
    exitVisitingMode: () => void
    generateDisplayId: () => Promise<void>

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
    userProfile: null,
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
    isSocialOpen: false,
    isMuted: false,

    // 演出同期用フラグ初期値
    showStartupText: false,
    showStartupTips: false,
    fadeSettings: { textIn: 1.0, textOut: 1.0, tipsIn: 1.0, tipsOut: 1.0 },

    // 訪問モード初期状態
    isVisitingMode: false,
    visitingUserId: null,
    displayId: null,

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
    setStartupText: (value) => set({ showStartupText: value }),
    setStartupTips: (value) => set({ showStartupTips: value }),
    setFadeSettings: (settings) => set({ fadeSettings: settings }),
    setStartupTransition: (value) => set({ showStartupText: false, showStartupTips: false, isStartupTransition: value }),
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
                    menu === 'map' ? 'isMapOpen' :
                        menu === 'social' ? 'isSocialOpen' : 'isAuthOpen'
        set({ [key]: true })
    },
    closeMenu: (menu) => {
        const key = menu === 'menu' ? 'isMenuOpen' :
            menu === 'status' ? 'isStatusOpen' :
                menu === 'notion' ? 'isNotionOpen' :
                    menu === 'map' ? 'isMapOpen' :
                        menu === 'social' ? 'isSocialOpen' : 'isAuthOpen'
        set({ [key]: false })
    },
    toggleMenu: (menu) => {
        set((state) => {
            const key = menu === 'menu' ? 'isMenuOpen' :
                menu === 'status' ? 'isStatusOpen' :
                    menu === 'notion' ? 'isNotionOpen' :
                        menu === 'map' ? 'isMapOpen' :
                            menu === 'social' ? 'isSocialOpen' : 'isAuthOpen'
            return { [key]: !state[key] }
        })
    },
    closeAllMenus: () => set({
        isMenuOpen: false,
        isStatusOpen: false,
        isNotionOpen: false,
        isMapOpen: false,
        isAuthOpen: false,
        isSocialOpen: false,
    }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    // 訪問モードアクション
    enterVisitingMode: (userId) => set({ isVisitingMode: true, visitingUserId: userId }),
    exitVisitingMode: () => set({ isVisitingMode: false, visitingUserId: null }),

    generateDisplayId: async () => {
        const state = get();
        if (!state.user || state.displayId) return;

        const supabase = createClient();

        try {
            // Get the maximum existing display_id to generate the next sequential ID
            // Use RPC or direct query - for now, generate based on timestamp + random for uniqueness
            // Sequential IDs starting from 100000000
            const baseId = 100000000;
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const newDisplayId = String(baseId + (timestamp % 900000000) + random).slice(0, 9);

            set({ displayId: newDisplayId });

            // Save to Supabase profile
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: state.user.id,
                    updated_at: new Date().toISOString(),
                    game_state: {
                        ...(state.userProfile?.game_state as any || {}),
                        display_id: newDisplayId,
                    },
                });
            if (error) throw error;
            console.log('Display ID generated:', newDisplayId);
        } catch (error: any) {
            console.error('Failed to save display ID:', error.message || error);
        }
    },

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
            lastPosition: null, // Reset position history on logout
            isMenuOpen: false,
            isStatusOpen: false,
            isNotionOpen: false,
            isMapOpen: false,
            isAuthOpen: false,
        });
    },

    fetchUserProfile: async () => {
        const state = get();
        if (!state.user) return;

        const supabase = createClient();
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', state.user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                const profile = data as UserProfile;
                console.log('User profile fetched:', profile);
                set({ userProfile: profile });

                if (profile.game_state) {
                    const gameState = profile.game_state as any;
                    console.log('Restoring game state:', gameState);

                    set({
                        erosionLevel: gameState.erosionLevel ?? 0.0,
                        kardashevScale: gameState.kardashevScale ?? 1.24,
                        lastPosition: gameState.lastPosition ?? null,
                        displayId: gameState.display_id ?? null,
                    });
                }
            }
        } catch (error: any) {
            console.error('Failed to fetch user profile:', error.message || error);
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
        await get().fetchUserProfile();
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
                const tracks: MusicTrack[] = data as MusicTrack[];
                console.log('Music tracks fetched:', tracks);
                set({ musicTracks: tracks });
            }
        } catch (error: any) {
            console.error('Failed to fetch music tracks:', error.message || error);
        }
    }
}))
