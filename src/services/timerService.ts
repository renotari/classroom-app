/**
 * Timer Service
 *
 * Business logic for timer calculations and state management.
 * Separates timer logic from React components and stores.
 *
 * Handles:
 * - Time formatting
 * - Progress calculations
 * - Warning threshold logic
 * - State transitions
 */

/**
 * Format seconds into MM:SS string
 *
 * @param seconds - Total seconds to format
 * @returns Formatted string (e.g., "05:30")
 *
 * @example
 * formatTime(330) // "05:30"
 * formatTime(45)  // "00:45"
 * formatTime(3661) // "61:01"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Calculate timer progress as percentage
 *
 * @param remainingSeconds - Seconds remaining
 * @param totalSeconds - Total duration in seconds
 * @returns Progress percentage (0-100)
 *
 * @example
 * getProgress(30, 100) // 70 (30 seconds elapsed out of 100)
 * getProgress(0, 100)  // 100 (completed)
 */
export function getProgress(remainingSeconds: number, totalSeconds: number): number {
  if (totalSeconds === 0) return 0;
  return ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
}

/**
 * Check if current remaining time matches any warning threshold
 *
 * @param remainingSeconds - Seconds remaining
 * @param thresholds - Array of threshold seconds to check against
 * @returns true if in any warning zone
 *
 * @example
 * isInWarningZone(120, [120, 300]) // true (at 2 min warning)
 * isInWarningZone(150, [120, 300]) // false
 */
export function isInWarningZone(remainingSeconds: number, thresholds: number[]): boolean {
  return thresholds.some((threshold) => remainingSeconds <= threshold);
}

/**
 * Calculate warning thresholds based on total duration
 *
 * Returns array of seconds to trigger warnings at.
 * Standard thresholds:
 * - 2 minutes (120s) if duration > 2 min
 * - 5 minutes (300s) if duration > 5 min
 *
 * @param totalSeconds - Total timer duration
 * @param config - Warning configuration
 * @returns Array of threshold seconds
 *
 * @example
 * calculateWarningThresholds(600, {warningAt2Min: true, warningAt5Min: true})
 * // [120, 300]
 */
export function calculateWarningThresholds(
  totalSeconds: number,
  config: { warningAt2Min: boolean; warningAt5Min: boolean }
): number[] {
  const thresholds: number[] = [];

  if (config.warningAt2Min && totalSeconds > 120) {
    thresholds.push(120);
  }

  if (config.warningAt5Min && totalSeconds > 300) {
    thresholds.push(300);
  }

  return thresholds;
}

/**
 * Check if a specific warning has already been triggered
 *
 * @param threshold - Warning threshold to check
 * @param triggeredWarnings - Set of already triggered thresholds
 * @returns true if warning was already triggered
 *
 * @example
 * hasWarningBeenTriggered(120, new Set([120, 300])) // true
 * hasWarningBeenTriggered(60, new Set([120]))        // false
 */
export function hasWarningBeenTriggered(
  threshold: number,
  triggeredWarnings: Set<number>
): boolean {
  return triggeredWarnings.has(threshold);
}

/**
 * Get human-readable time remaining string
 *
 * @param seconds - Seconds remaining
 * @returns Descriptive string (e.g., "2 minutes 30 seconds")
 *
 * @example
 * getReadableTimeRemaining(150) // "2 minutes 30 seconds"
 * getReadableTimeRemaining(45)  // "45 seconds"
 */
export function getReadableTimeRemaining(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }

  if (secs === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }

  return `${mins} minute${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
}

/**
 * Validate timer duration
 *
 * @param seconds - Duration to validate
 * @throws Error if duration is invalid
 *
 * @example
 * validateDuration(300) // OK
 * validateDuration(0)   // throws Error
 */
export function validateDuration(seconds: number): void {
  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new Error('Timer duration must be a positive integer');
  }

  if (seconds > 86400) {
    // More than 24 hours
    throw new Error('Timer duration cannot exceed 24 hours');
  }
}

/**
 * Timer state validation
 *
 * Validates that state transitions are legal
 */
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Check if transition from one status to another is valid
 *
 * @param currentStatus - Current timer status
 * @param nextStatus - Desired next status
 * @returns true if transition is allowed
 *
 * @example
 * isValidTransition('idle', 'running')     // true
 * isValidTransition('completed', 'running') // true (restart)
 * isValidTransition('running', 'running')  // false (already running)
 */
export function isValidTransition(currentStatus: TimerStatus, nextStatus: TimerStatus): boolean {
  const validTransitions: Record<TimerStatus, TimerStatus[]> = {
    idle: ['running', 'idle'],
    running: ['paused', 'idle'],
    paused: ['running', 'idle'],
    completed: ['idle', 'running'],
  };

  return validTransitions[currentStatus]?.includes(nextStatus) ?? false;
}

/**
 * Convert time string (MM:SS) to seconds
 *
 * @param timeString - Time in format "MM:SS"
 * @returns Total seconds
 * @throws Error if format is invalid
 *
 * @example
 * parseTimeString("05:30") // 330
 * parseTimeString("00:45") // 45
 */
export function parseTimeString(timeString: string): number {
  const match = timeString.match(/^(\d{1,3}):(\d{2})$/);

  if (!match || !match[1] || !match[2]) {
    throw new Error('Invalid time format. Use MM:SS or MMM:SS');
  }

  const mins = parseInt(match[1], 10);
  const secs = parseInt(match[2], 10);

  const totalSeconds = mins * 60 + secs;
  validateDuration(totalSeconds);

  return totalSeconds;
}
