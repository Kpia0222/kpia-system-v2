/**
 * Menu Configuration
 * Controls the order and properties of HUD menu buttons
 * 
 * Order: [GALAXY, SOUND, NOTION, STATUS, MAP, SOCIAL] | [MENU]
 * The MENU button is separated by a vertical line
 */

import { MENU_LABELS } from './ui-strings';

export interface MenuButtonConfig {
    id: string;
    labelKey: keyof typeof MENU_LABELS.HUD | 'SOCIAL';
    shortcut: string;
    /** If true, this button toggles based on current scene */
    isDynamic?: boolean;
}

/**
 * Main menu buttons - displayed before the separator
 * Order determines visual layout from LEFT to RIGHT
 */
export const MAIN_MENU_BUTTONS: MenuButtonConfig[] = [
    { id: 'scene_toggle', labelKey: 'HOME', shortcut: 'F1', isDynamic: true },
    { id: 'sound', labelKey: 'SOUND', shortcut: 'F2' },
    { id: 'notion', labelKey: 'NOTION', shortcut: 'F3' },
    { id: 'status', labelKey: 'STATUS', shortcut: 'F4' },
    { id: 'map', labelKey: 'MAP', shortcut: 'F5' },
    { id: 'social', labelKey: 'SOCIAL', shortcut: 'F6' },
];

/**
 * Separated menu button - displayed after the vertical line
 */
export const SEPARATED_MENU_BUTTON: MenuButtonConfig = {
    id: 'universal',
    labelKey: 'MENU',
    shortcut: 'ESC',
};

/**
 * Get the label for a menu button
 */
export const getMenuLabel = (
    config: MenuButtonConfig,
    currentScene: 'start' | 'universe' | 'my_galaxy'
): string => {
    if (config.isDynamic && config.id === 'scene_toggle') {
        return currentScene === 'universe'
            ? MENU_LABELS.HUD.HOME
            : MENU_LABELS.HUD.UNIVERSE;
    }

    if (config.labelKey === 'SOCIAL') {
        return 'SOCIAL';
    }

    return MENU_LABELS.HUD[config.labelKey as keyof typeof MENU_LABELS.HUD] || config.labelKey;
};
