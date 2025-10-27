/**
 * useMicrophonePermission Hook Unit Tests
 * Target: 10+ test cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMicrophonePermission } from '../../../hooks/useMicrophonePermission';

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn();

Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
  configurable: true,
});

describe('useMicrophonePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGetUserMedia.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with pending status', () => {
    const { result } = renderHook(() => useMicrophonePermission());

    expect(result.current.status).toBe('pending');
    expect(result.current.isPending).toBe(true);
    expect(result.current.isGranted).toBe(false);
    expect(result.current.isDenied).toBe(false);
  });

  it('should request permission', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }],
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMicrophonePermission());

    const status = await act(async () => {
      return await result.current.requestPermission();
    });

    expect(status).toBe('granted');
    expect(result.current.isGranted).toBe(true);
  });

  it('should handle denied permission', async () => {
    const error = new DOMException('Permission denied', 'NotAllowedError');
    mockGetUserMedia.mockRejectedValue(error);

    const { result } = renderHook(() => useMicrophonePermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.isDenied).toBe(true);
    expect(result.current.errorMessage).toContain('negato');
  });

  it('should handle no microphone device', async () => {
    const error = new DOMException('No device', 'NotFoundError');
    mockGetUserMedia.mockRejectedValue(error);

    const { result } = renderHook(() => useMicrophonePermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.errorMessage).toContain('Nessun microfono');
  });

  it('should handle security error (HTTPS required)', async () => {
    const error = new DOMException('Security error', 'SecurityError');
    mockGetUserMedia.mockRejectedValue(error);

    const { result } = renderHook(() => useMicrophonePermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.errorMessage).toContain('HTTPS');
  });

  it('should persist permission to localStorage', async () => {
    const mockStream = {
      getTracks: () => [{ stop: vi.fn() }],
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMicrophonePermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(localStorage.getItem('microphone-permission-granted')).toBe('true');
    expect(localStorage.getItem('microphone-onboarded')).toBe('true');
  });

  it('should check stored permission on mount', () => {
    localStorage.setItem('microphone-permission-granted', 'true');

    const { result } = renderHook(() => useMicrophonePermission());

    // Should load from localStorage
    expect(result.current.isGranted).toBe(true);
  });

  it('should handle stored denied permission', () => {
    localStorage.setItem('microphone-permission-granted', 'false');

    const { result } = renderHook(() => useMicrophonePermission());

    expect(result.current.isDenied).toBe(true);
    expect(result.current.errorMessage).toContain('negato');
  });

  it('should stop media stream tracks on successful request', async () => {
    const stopMock = vi.fn();
    const mockStream = {
      getTracks: () => [{ stop: stopMock }],
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => useMicrophonePermission());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(stopMock).toHaveBeenCalled();
  });

  it('should have return function signature', () => {
    const { result } = renderHook(() => useMicrophonePermission());

    expect(typeof result.current.requestPermission).toBe('function');
    expect(typeof result.current.status).toBe('string');
    expect(typeof result.current.isGranted).toBe('boolean');
    expect(typeof result.current.isDenied).toBe('boolean');
    expect(typeof result.current.isPending).toBe('boolean');
    expect(typeof result.current.isError).toBe('boolean');
  });
});
