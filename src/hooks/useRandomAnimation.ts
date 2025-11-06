/**
 * useRandomAnimation Hook
 *
 * Custom hook for slot machine animation effect when selecting random student.
 * Uses requestAnimationFrame for smooth 60fps animation with configurable
 * duration and easing functions.
 *
 * Features:
 * - Slot machine effect (names cycling rapidly then slowing down)
 * - Configurable duration and easing
 * - Callbacks for animation lifecycle (onStart, onTick, onComplete)
 * - Automatic cleanup on unmount
 *
 * @module useRandomAnimation
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Built-in easing functions
 */
export const EASING_FUNCTIONS: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => t * (2 - t),
  'ease-in-out': (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  'ease-in-cubic': (t: number) => t * t * t,
  'ease-out-cubic': (t: number) => --t * t * t + 1,
};

/**
 * Configuration options for useRandomAnimation hook
 */
export interface UseRandomAnimationOptions {
  /** Animation duration in milliseconds (default: 2000) */
  duration?: number;
  /** Easing function name or custom function (default: 'ease-out') */
  easing?: keyof typeof EASING_FUNCTIONS | EasingFunction;
  /** Callback when animation starts */
  onStart?: () => void;
  /** Callback on each animation tick (60fps) */
  onTick?: (currentIndex: number, progress: number) => void;
  /** Callback when animation completes */
  onComplete?: (finalIndex: number) => void;
}

/**
 * Return value from useRandomAnimation hook
 */
export interface UseRandomAnimationReturn {
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Current index being displayed (0 to totalItems-1) */
  currentIndex: number;
  /** Animation progress (0 to 1) */
  progress: number;
  /** Start the animation */
  start: (totalItems: number, finalIndex: number) => void;
  /** Stop the animation immediately */
  stop: () => void;
}

/**
 * Default configuration
 */
const DEFAULT_OPTIONS: Required<Omit<UseRandomAnimationOptions, 'onStart' | 'onTick' | 'onComplete'>> = {
  duration: 2000,
  easing: 'ease-out',
};

/**
 * Custom hook for random student selection animation
 *
 * Creates a slot machine effect by cycling through student indices,
 * starting fast and gradually slowing down to land on the final selection.
 *
 * @param options - Animation configuration options
 * @returns Animation state and control functions
 *
 * @example
 * ```tsx
 * const { isAnimating, currentIndex, start } = useRandomAnimation({
 *   duration: 2000,
 *   easing: 'ease-out',
 *   onComplete: (finalIndex) => {
 *     console.log('Selected:', students[finalIndex]);
 *   },
 * });
 *
 * // Start animation
 * start(students.length, selectedIndex);
 *
 * // Display current student
 * return <div>{students[currentIndex]?.name}</div>;
 * ```
 */
export function useRandomAnimation(
  options: UseRandomAnimationOptions = {}
): UseRandomAnimationReturn {
  // Merge with defaults
  const config = { ...DEFAULT_OPTIONS, ...options };

  // State
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Refs for animation data (don't trigger re-renders)
  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const totalItems = useRef<number>(0);
  const finalIndex = useRef<number>(0);

  // Get easing function
  const getEasingFunction = useCallback((): EasingFunction => {
    if (typeof config.easing === 'function') {
      return config.easing;
    }
    return EASING_FUNCTIONS[config.easing] || EASING_FUNCTIONS['ease-out'];
  }, [config.easing]);

  /**
   * Animation loop function
   */
  const animate = useCallback(
    (timestamp: number) => {
      // Initialize startTime on first frame
      if (startTime.current === 0) {
        startTime.current = timestamp;
      }

      const elapsed = timestamp - startTime.current;
      const rawProgress = Math.min(elapsed / config.duration, 1);
      const easedProgress = getEasingFunction()(rawProgress);

      setProgress(rawProgress);

      // Calculate current index based on eased progress
      // Early in animation: cycle through many indices (fast)
      // Late in animation: slow down and land on final index
      if (rawProgress < 1) {
        // Calculate how many full cycles we've done
        // More cycles early, fewer cycles late (creates slowdown effect)
        const cycleSpeed = 1 - easedProgress; // 1 → 0 (fast → slow)
        const cycleCount = Math.floor(easedProgress * 20 * cycleSpeed); // Reduce cycles over time

        // Random-ish cycling, but deterministic based on progress
        const randomOffset = Math.floor(easedProgress * totalItems.current * 10);
        const calculatedIndex = (finalIndex.current + cycleCount + randomOffset) % totalItems.current;

        setCurrentIndex(calculatedIndex);

        // Call onTick callback
        if (options.onTick) {
          options.onTick(calculatedIndex, rawProgress);
        }

        // Continue animation
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - land on final index
        setCurrentIndex(finalIndex.current);
        setIsAnimating(false);
        setProgress(1);

        // Call onComplete callback
        if (options.onComplete) {
          options.onComplete(finalIndex.current);
        }
      }
    },
    [config.duration, getEasingFunction, options]
  );

  /**
   * Start animation
   */
  const start = useCallback(
    (items: number, targetIndex: number) => {
      if (items <= 0) {
        throw new Error('totalItems must be greater than 0');
      }
      if (targetIndex < 0 || targetIndex >= items) {
        throw new Error(`finalIndex must be between 0 and ${items - 1}`);
      }

      // Stop any existing animation
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Reset state
      totalItems.current = items;
      finalIndex.current = targetIndex;
      startTime.current = 0;
      setProgress(0);
      setCurrentIndex(0);
      setIsAnimating(true);

      // Call onStart callback
      if (options.onStart) {
        options.onStart();
      }

      // Start animation
      animationFrameId.current = requestAnimationFrame(animate);
    },
    [animate, options]
  );

  /**
   * Stop animation immediately
   */
  const stop = useCallback(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    setIsAnimating(false);
    setProgress(0);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return {
    isAnimating,
    currentIndex,
    progress,
    start,
    stop,
  };
}

/**
 * Helper: Calculate index at specific progress point
 * Useful for testing or previewing animation
 */
export function calculateIndexAtProgress(
  progress: number,
  totalItems: number,
  finalIndex: number,
  easing: EasingFunction = EASING_FUNCTIONS['ease-out']
): number {
  const easedProgress = easing(progress);
  const cycleSpeed = 1 - easedProgress;
  const cycleCount = Math.floor(easedProgress * 20 * cycleSpeed);
  const randomOffset = Math.floor(easedProgress * totalItems * 10);
  return (finalIndex + cycleCount + randomOffset) % totalItems;
}
