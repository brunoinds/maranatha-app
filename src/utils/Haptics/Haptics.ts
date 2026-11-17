import { Capacitor } from '@capacitor/core';
import { Haptics as CapacitorHaptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Semantic haptic feedback. Does nothing on the web and never throws:
 * a failed vibration must never break the action that triggered it.
 *
 * - light:   tapping or selecting (toggles, segments, picking an item)
 * - medium:  committing a main action (save, send, approve, scan, register)
 * - heavy:   committing a destructive action (delete, reject)
 * - success / warning / error: the outcome of an action
 */
const run = (feedback: () => Promise<void>) => {
    if (!Capacitor.isNativePlatform()) {
        return;
    }
    try {
        feedback().catch(() => {});
    } catch (e) {
        // Ignore: haptics are a nice-to-have.
    }
};

const Haptics = {
    light: () => run(() => CapacitorHaptics.impact({ style: ImpactStyle.Light })),
    medium: () => run(() => CapacitorHaptics.impact({ style: ImpactStyle.Medium })),
    heavy: () => run(() => CapacitorHaptics.impact({ style: ImpactStyle.Heavy })),
    selection: () => run(() => CapacitorHaptics.selectionStart().then(() => CapacitorHaptics.selectionChanged()).then(() => CapacitorHaptics.selectionEnd())),
    success: () => run(() => CapacitorHaptics.notification({ type: NotificationType.Success })),
    warning: () => run(() => CapacitorHaptics.notification({ type: NotificationType.Warning })),
    error: () => run(() => CapacitorHaptics.notification({ type: NotificationType.Error })),
};

export { Haptics };
