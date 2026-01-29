export const SHORTCUTS = {
    MENU: {
        TOGGLE: ['u', 'U'],
    },
    MAP: {
        TOGGLE: ['m', 'M', 'F5'],
    },
    STATUS: {
        TOGGLE: ['s', 'S', 'F4'],
    },
    NOTION: {
        TOGGLE: ['F3'],
    },
    SCENE: {
        TOGGLE_MODE: ['F1'], // Switch between Universe/DNA
        RETURN_START: ['Home'],
    },
    SYSTEM: {
        MUTE: ['F2'],
        ESCAPE: ['Escape'],
    },
    NAVIGATION: {
        ENTER: ['Enter'],
        NEXT: ['ArrowRight', 'd', 'D'],
        PREV: ['ArrowLeft', 'a', 'A'],
    }
} as const;

export type ShortcutAction = keyof typeof SHORTCUTS;
