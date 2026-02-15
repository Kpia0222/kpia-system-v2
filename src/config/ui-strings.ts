// ============================================================================
// UI Strings Configuration
// ============================================================================

/**
 * Main UI Labels (General use)
 */
export const UI_STRINGS = {
    // Actions / Buttons
    ACTIONS: {
        ENTER_GALAXY: "ENTER GALAXY",
        BACK_TO_UNIVERSE: "← BACK TO UNIVERSE",
        PRESS_START: "PRESS START",
        CLOSE: "CLOSE",
    },

    // Status / Mode Indicators
    STATUS: {
        LOADING: "LOADING SECTOR...",
        ANALYZING: "ANALYZING...",
        INIT_SYSTEM: "KPIA SYSTEM INITIALIZED",
        VERSION_BETA: "Beta 4.5.0",
        VERSION_SYSTEM: "KPIA SYSTEM ver 3.3.0",
        COMING_SOON: "COMING SOON...",
        LOCKED: "LOCKED",
        OBSERVER: "OBSERVER",
    },

    // Time-based Greetings
    GREETINGS: {
        MORNING: "GOOD MORNING, ARCHITECT",
        AFTERNOON: "GOOD AFTERNOON, ARCHITECT",
        EVENING: "GOOD EVENING, ARCHITECT",
        MIDNIGHT: "MIDNIGHT PROTOCOL ACTIVE",
    },

    // Transitions
    TRANSITION: {
        INITIATING_DNA: "INITIATING DNA SEQUENCE...",
        RETURNING_UNIVERSE: "RETURNING TO UNIVERSE VIEW...",
        RELOCATING_PREFIX: "RELOCATING TO SECTOR: ",
        RETURNING_START: "RETURNING TO START...",
    },

    // Map Specific
    MAP: {
        TITLE: "TACTICAL MAP",
        SECTOR_DEFAULT: "SECTOR: UNIVERSE-00",
        SCALE: "SCALE: 1px :: 1 LY",
        COORDS: "COORDS:",
        STATUS_LABEL: "STATUS:",
        STATUS_ACTIVE: "ACTIVE",
        DISTANCE: "DISTANCE:",
    },

    // Notion / Research
    NOTION: {
        TITLE: "RESEARCH LOGS",
        ARCHIVE_MODE: "ARCHIVE_MODE",
        END_OF_TRANSMISSION: "-- END OF TRANSMISSION --",
        ID_PREFIX: "ID: ",
    },

    // DNA Interface
    DNA_UI: {
        LEVEL_LABEL: "LEVEL",
        STABILITY_LABEL: "CURRENT STABILITY: 98.4%", // Dynamic part could be split if needed
        LOG_HEADER: "SYSTEM_LOG // STREAM",
    },

    // Start Screen
    TITLE: {
        MAIN: "ORGANIC HYPER AETHER",
    }
} as const;

/**
 * Menu Item Labels
 */
export const MENU_LABELS = {
    UNIVERSAL_MENU_TITLE: "UNIVERSAL MENU",
    ITEMS: {
        START_SCREEN: "START SCREEN",
        AUDIO_SETTINGS: "AUDIO SETTINGS",
    },
    // HUD Buttons (Short labels)
    HUD: {
        MENU: "MENU",
        MAP: "MAP",
        STATUS: "STATUS",
        NOTION: "NOTION",
        SOUND: "SOUND",
        HOME: "HOME",
        UNIVERSE: "UNIVERSE",
        SKILL: "SKILL",
    }
} as const;

/**
 * Keyboard Shortcuts Hints
 */
export const KEYBOARD_HINTS = {
    MENU: "[U] MENU",
    SELECT: "[←][→] SELECT",
    ZOOM: "[ENTER] ZOOM",
    BACK: "[ESC] BACK/CLOSE",
} as const;
