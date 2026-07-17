/**
 * Haptic Feedback Utility using the browser's Vibration API.
 * This will gracefully fail (do nothing) on unsupported devices (e.g., iOS Safari or Desktop).
 */

// Small tap for general clicks
export const vibrateTap = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(30);
  }
};

// Happy pulse for correct answers
export const vibrateSuccess = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([50, 100, 50]);
  }
};

// Strong buzz for incorrect answers
export const vibrateError = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
};

// Heavy buzz for game over / losing a heart
export const vibrateHeavy = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([300]);
  }
};
