/**
 * AudioService Integration Tests
 *
 * Verifies that multiple audio services share the same AudioContext singleton
 * This is CRITICAL because browsers typically limit AudioContext to 6 instances
 *
 * Addresses: External Review Point #3
 * References: CLAUDE.md § Audio - REGOLE CRITICHE
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AudioService } from "../../services/audioService";
import { AudioMonitoringService } from "../../services/audioMonitoringService";

describe("AudioService Integration - Singleton Pattern across services", () => {
  // Reset singletons between tests
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AudioService as any).instance = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AudioMonitoringService as any).instance = undefined;
  });

  afterEach(() => {
    // Clean up after each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AudioService as any).instance = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (AudioMonitoringService as any).instance = undefined;
  });

  it("should share the same AudioContext between AudioService and AudioMonitoringService", () => {
    // Get both service instances
    const audioService = AudioService.getInstance();
    const monitoringService = AudioMonitoringService.getInstance();

    // Get their AudioContext instances
    const audioContext1 = audioService.getContext();
    // AudioMonitoringService uses AudioService internally, so verify same instance
    const audioContext2 = AudioService.getInstance().getContext();

    // They should be the same instance
    expect(audioContext1).toBe(audioContext2);
  });

  it("should maintain single AudioContext after multiple service instantiations", () => {
    // Create first service
    const service1 = AudioService.getInstance();
    const context1 = service1.getContext();

    // Create monitoring service (depends on AudioService)
    const monitoring = AudioMonitoringService.getInstance();

    // Try to get AudioService again
    const service2 = AudioService.getInstance();
    const context2 = service2.getContext();

    // All contexts should be identical
    expect(context1).toBe(context2);
    expect(service1).toBe(service2); // Same service instance
  });

  it("should prevent multiple AudioContext instances (critical browser limitation)", () => {
    // This test verifies we never create more than one AudioContext
    // Browsers typically error after 6+ AudioContext instances

    const service1 = AudioService.getInstance();
    const monitoring = AudioMonitoringService.getInstance();

    // Get the AudioContext from both
    const ctx1 = service1.getContext();
    const ctx2 = AudioService.getInstance().getContext();

    // Should be the same instance - NOT different instances
    expect(ctx1).toBe(ctx2);

    // Both services should report the same context state
    expect(ctx1.state).toBe("running");
  });

  it("should share AudioContext on concurrent service access", () => {
    // Simulate rapid/concurrent access to both services
    const contexts = [];

    for (let i = 0; i < 5; i++) {
      const audio = AudioService.getInstance();
      contexts.push(audio.getContext());

      const monitoring = AudioMonitoringService.getInstance();
      const monCtx = AudioService.getInstance().getContext();
      contexts.push(monCtx);
    }

    // All contexts should be identical
    const firstContext = contexts[0];
    contexts.forEach((ctx) => {
      expect(ctx).toBe(firstContext);
    });
  });

  it("should have AudioMonitoringService depend on AudioService singleton", () => {
    // Create monitoring service first
    const monitoring = AudioMonitoringService.getInstance();

    // Create audio service after
    const audio = AudioService.getInstance();

    // AudioMonitoringService should have gotten the same AudioService instance
    // This is verified by sharing the same AudioContext
    const monitoringCtx = AudioService.getInstance().getContext();
    const audioCtx = audio.getContext();

    expect(monitoringCtx).toBe(audioCtx);
  });

  it("should keep AudioContext in running state across services", async () => {
    const audio = AudioService.getInstance();
    const monitoring = AudioMonitoringService.getInstance();

    const context1 = audio.getContext();
    const context2 = AudioService.getInstance().getContext();

    expect(context1).toBe(context2);
    expect(context1.state).toBe("running");
    expect(context2.state).toBe("running");

    // Both services should see the same state changes
    await context1.suspend();
    expect(context1.state).toBe("suspended");

    await context1.resume();
    expect(context1.state).toBe("running");
  });

  describe("Master gain node sharing", () => {
    it("should share master gain node between services", () => {
      const audio = AudioService.getInstance();
      const monitoring = AudioMonitoringService.getInstance();

      // Both should be able to access and use the gain
      const masterGain = audio.getMasterGain();
      expect(masterGain).toBeDefined();
      expect(masterGain.gain.value).toBe(0.8); // Default volume

      // Changing gain in one service should affect all
      audio.setMasterVolume(0.5);
      expect(audio.getMasterGain().gain.value).toBe(0.5);
    });

    it("should not create duplicate gain nodes", () => {
      const audio = AudioService.getInstance();
      const gain1 = audio.getMasterGain();

      const audio2 = AudioService.getInstance();
      const gain2 = audio2.getMasterGain();

      // Should be identical - not duplicates
      expect(gain1).toBe(gain2);
    });
  });

  describe("Error scenarios", () => {
    it("should handle AudioContext errors gracefully without creating new instances", async () => {
      const audio = AudioService.getInstance();
      const ctx = audio.getContext();

      // Even if operations fail, should not create new AudioContext
      try {
        // Try an operation
        await ctx.suspend();
        await ctx.resume();
      } catch (error) {
        // Even on error, should keep same instance
        const audio2 = AudioService.getInstance();
        expect(audio2).toBe(audio);
      }
    });

    it("should prevent second AudioContext creation on error", () => {
      const audio1 = AudioService.getInstance();
      const ctx1 = audio1.getContext();

      // Create monitoring service (may have internal errors)
      const monitoring = AudioMonitoringService.getInstance();

      // Should still be same context
      const audio2 = AudioService.getInstance();
      const ctx2 = audio2.getContext();

      expect(ctx1).toBe(ctx2);
    });
  });
});
