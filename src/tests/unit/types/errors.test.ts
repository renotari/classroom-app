/**
 * Error Handling System Tests
 *
 * Tests typed error codes and error handling patterns
 */

import { describe, it, expect } from 'vitest';
import {
  ERROR_CODES,
  AppError,
  isAppError,
  ensureAppError,
  ErrorLogger,
} from '../../../types/errors';

describe('Error Handling System', () => {
  describe('ERROR_CODES', () => {
    it('should have all audio error codes', () => {
      expect(ERROR_CODES.AUDIO_CONTEXT_INIT_FAILED).toBe('AUDIO_001');
      expect(ERROR_CODES.AUDIO_FILE_DECODE_FAILED).toBe('AUDIO_002');
      expect(ERROR_CODES.AUDIO_FILE_NOT_FOUND).toBe('AUDIO_003');
    });

    it('should have all noise error codes', () => {
      expect(ERROR_CODES.NOISE_PERMISSION_DENIED).toBe('NOISE_001');
      expect(ERROR_CODES.NOISE_DEVICE_UNAVAILABLE).toBe('NOISE_002');
      expect(ERROR_CODES.NOISE_STREAM_INVALID).toBe('NOISE_003');
    });

    it('should have all CSV error codes', () => {
      expect(ERROR_CODES.CSV_FILE_NOT_FOUND).toBe('CSV_001');
      expect(ERROR_CODES.CSV_PARSE_FAILED).toBe('CSV_003');
      expect(ERROR_CODES.CSV_MAX_STUDENTS_EXCEEDED).toBe('CSV_005');
    });

    it('should have consistent code format', () => {
      // All codes should follow DOMAIN_XXX format
      const codePattern = /^[A-Z]+_[0-9]{3}$/;

      Object.values(ERROR_CODES).forEach((code) => {
        expect(code).toMatch(codePattern);
      });
    });
  });

  describe('AppError class', () => {
    it('should create error with code and message', () => {
      const error = new AppError(
        ERROR_CODES.AUDIO_CONTEXT_INIT_FAILED,
        'AudioContext initialization failed'
      );

      expect(error.code).toBe('AUDIO_001');
      expect(error.message).toBe('AudioContext initialization failed');
      expect(error.name).toBe('AppError');
    });

    it('should support context object', () => {
      const context = { duration: 300, timestamp: Date.now() };
      const error = new AppError(
        ERROR_CODES.TIMER_INVALID_DURATION,
        'Duration must be positive',
        context
      );

      expect(error.context).toEqual(context);
    });

    it('should capture original error', () => {
      const originalError = new Error('Original message');
      const appError = new AppError(
        ERROR_CODES.AUDIO_FILE_DECODE_FAILED,
        'Failed to decode audio',
        undefined,
        originalError
      );

      expect(appError.originalError).toBe(originalError);
    });

    it('should convert to JSON for logging', () => {
      const error = new AppError(
        ERROR_CODES.NOISE_PERMISSION_DENIED,
        'Permission denied'
      );

      const json = error.toJSON();

      expect(json.code).toBe('NOISE_001');
      expect(json.message).toBe('Permission denied');
      expect(json.context).toBeUndefined();
    });

    it('should provide user-friendly message in Italian', () => {
      const error = new AppError(
        ERROR_CODES.NOISE_PERMISSION_DENIED,
        'Technical message'
      );

      const userMessage = error.getUserMessage();

      expect(userMessage).toBe('Permesso microfono negato');
      expect(userMessage).not.toContain('Technical');
    });

    it('should fallback to original message if code not mapped', () => {
      const error = new AppError(
        'UNKNOWN_CODE' as any,
        'Unknown error message'
      );

      const userMessage = error.getUserMessage();

      expect(userMessage).toBe('Unknown error message');
    });
  });

  describe('isAppError type guard', () => {
    it('should identify AppError instances', () => {
      const appError = new AppError(
        ERROR_CODES.AUDIO_CONTEXT_INIT_FAILED,
        'Failed'
      );

      expect(isAppError(appError)).toBe(true);
    });

    it('should reject regular Error', () => {
      const regularError = new Error('Regular error');

      expect(isAppError(regularError)).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });

    it('should reject objects without code property', () => {
      const fakeError = { message: 'Fake', name: 'FakeError' };

      expect(isAppError(fakeError)).toBe(false);
    });
  });

  describe('ensureAppError', () => {
    it('should return AppError as-is', () => {
      const error = new AppError(
        ERROR_CODES.AUDIO_CONTEXT_INIT_FAILED,
        'Failed'
      );

      const result = ensureAppError(error);

      expect(result).toBe(error);
    });

    it('should wrap regular Error with fallback code', () => {
      const regularError = new Error('File not found');

      const result = ensureAppError(
        regularError,
        ERROR_CODES.AUDIO_FILE_NOT_FOUND
      );

      expect(isAppError(result)).toBe(true);
      expect(result.code).toBe('AUDIO_003');
      expect(result.message).toBe('File not found');
      expect(result.originalError).toBe(regularError);
    });

    it('should use GENERAL_UNKNOWN if no fallback provided', () => {
      const regularError = new Error('Something failed');

      const result = ensureAppError(regularError);

      expect(result.code).toBe('GENERAL_001');
    });

    it('should wrap unknown error types', () => {
      const unknownError = 'String error';

      const result = ensureAppError(unknownError);

      expect(isAppError(result)).toBe(true);
      expect(result.code).toBe('GENERAL_001');
      expect(result.message).toBe('String error');
    });

    it('should handle null/undefined gracefully', () => {
      const resultNull = ensureAppError(null);
      const resultUndefined = ensureAppError(undefined);

      expect(isAppError(resultNull)).toBe(true);
      expect(isAppError(resultUndefined)).toBe(true);
      expect(resultNull.code).toBe('GENERAL_001');
    });
  });

  describe('ErrorLogger', () => {
    it('should log error with all details', () => {
      const error = new AppError(
        ERROR_CODES.AUDIO_CONTEXT_INIT_FAILED,
        'AudioContext failed',
        { audioContextState: 'suspended' }
      );

      const logged = ErrorLogger.log(error);

      expect(logged.code).toBe('AUDIO_001');
      expect(logged.message).toBe('AudioContext failed');
      expect(logged.additionalContext).toBeUndefined();
    });

    it('should log error with additional context', () => {
      const error = new AppError(
        ERROR_CODES.TIMER_INVALID_DURATION,
        'Invalid duration'
      );

      const context = { user: 'alice', timestamp: 12345 };
      const logged = ErrorLogger.log(error, context);

      expect(logged.additionalContext).toEqual(context);
    });

    it('should handle nested Error capture', () => {
      const originalError = new Error('Original cause');
      const appError = new AppError(
        ERROR_CODES.AUDIO_FILE_DECODE_FAILED,
        'Decode failed',
        undefined,
        originalError
      );

      const logged = ErrorLogger.log(appError);

      expect(logged.originalError.name).toBe('Error');
      expect(logged.originalError.message).toBe('Original cause');
    });

    it('should provide report method (logging only in tests)', async () => {
      const error = new AppError(
        ERROR_CODES.CSV_PARSE_FAILED,
        'CSV parsing failed'
      );

      // Just verify it doesn't throw
      await ErrorLogger.report(error, { csvPath: '/data.csv' });

      expect(true).toBe(true); // If we got here, it worked
    });
  });

  describe('Error handling patterns', () => {
    it('should use AppError in try-catch', () => {
      function throwAudioError() {
        throw new AppError(
          ERROR_CODES.AUDIO_CONTEXT_INIT_FAILED,
          'Cannot initialize AudioContext'
        );
      }

      try {
        throwAudioError();
      } catch (error) {
        expect(isAppError(error)).toBe(true);
        if (isAppError(error)) {
          expect(error.code).toBe('AUDIO_001');
        }
      }
    });

    it('should convert unknown errors to AppError', () => {
      function throwUnknown() {
        throw 'Something went wrong'; // Bad practice, but can happen
      }

      try {
        throwUnknown();
      } catch (error) {
        const appError = ensureAppError(error);
        expect(isAppError(appError)).toBe(true);
        expect(appError.message).toBe('Something went wrong');
      }
    });

    it('should preserve error chain', () => {
      const original = new Error('DB connection failed');
      const wrapped = new AppError(
        ERROR_CODES.GENERAL_UNKNOWN,
        'Operation failed',
        { operation: 'fetchStudents' },
        original
      );

      const logged = ErrorLogger.log(wrapped);

      expect(logged.originalError.message).toBe('DB connection failed');
    });
  });
});
