import { UI_STRINGS } from "@/config/ui-strings";

/**
 * Returns the current time formatted as HH:MM:SS
 */
export const getCurrentTime = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

/**
 * Time-of-day keys for greeting messages
 */
export type TimeOfDay = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'MIDNIGHT';

/**
 * Determines the current time of day based on the hour.
 * 
 * Schedule:
 * - 05:00 - 10:59: MORNING
 * - 11:00 - 16:59: AFTERNOON
 * - 17:00 - 21:59: EVENING
 * - 22:00 - 04:59: MIDNIGHT
 */
export const getTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 11) {
        return 'MORNING';
    } else if (hour >= 11 && hour < 17) {
        return 'AFTERNOON';
    } else if (hour >= 17 && hour < 22) {
        return 'EVENING';
    } else {
        return 'MIDNIGHT';
    }
};

/**
 * Returns the current greeting string based on the time of day.
 */
export const getSystemGreeting = (date: Date = new Date()): string => {
    // We can reuse getTimeOfDay logic but need to be careful if we passed a date to this function vs getTimeOfDay internal new Date().
    // For consistency let's just implement logic here or pass date to getTimeOfDay if we refactor.
    // Given the previous code didn't take args for getTimeOfDay, I'll allow this one to take date.

    const hour = date.getHours();
    let key: TimeOfDay;

    if (hour >= 5 && hour < 11) {
        key = 'MORNING';
    } else if (hour >= 11 && hour < 17) {
        key = 'AFTERNOON';
    } else if (hour >= 17 && hour < 22) {
        key = 'EVENING';
    } else {
        key = 'MIDNIGHT';
    }

    return UI_STRINGS.GREETINGS[key];
};
