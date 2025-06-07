export const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export function debugLog(...args: unknown[]) {
  if (DEBUG) {
    console.log(...args);
  }
}
