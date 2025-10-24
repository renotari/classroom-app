import { defineConfig, devices } from '@playwright/test';

/**
 * E2E TESTING CONFIGURATION - Classroom Management Tool
 *
 * IMPORTANT: E2E Testing Strategy
 * =================================
 *
 * DECISION: Test React Frontend + Mock Tauri APIs (Option B)
 * Rationale:
 * - E2E tests focus on user-visible behavior, not Tauri internals
 * - Tauri has its own testing framework (checked separately in CI)
 * - Using `npm run dev` (Vite) with Tauri API mocks is fastest for iteration
 * - Real Tauri testing (with window management) comes later in Phase 14
 *
 * SETUP STEPS:
 * 1. Start Vite dev server with mocked Tauri APIs: `npm run dev`
 * 2. Playwright launches browser and navigates to http://localhost:1420
 * 3. Tests interact with React components (not actual Tauri windows)
 * 4. Window management (EC-002), file ops, etc. tested separately via unit/integration tests
 *
 * FUTURE (Phase 14 Integration Testing):
 * - Add webServer: { command: 'npm run tauri dev' } for full Tauri testing
 * - Requires Tauri built & running, slower but more complete
 * - Will test actual window decorations, app menu, system integration
 *
 * Current webServer uses `npm run dev` which:
 * - Starts Vite dev server on http://localhost:1420
 * - Loads app in "dev mode" with mocked Tauri API
 * - Fast iteration and debugging
 *
 * SEE ALSO:
 * - tests/e2e/README.md for test examples
 * - CLAUDE.md "Testing Strategy" section for patterns
 * - docs/edge-cases.md for scenarios to test
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30000, // 30s per test
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:1420',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for multi-browser testing (optional)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
  webServer: {
    // IMPORTANT: Uses `npm run dev` (Vite frontend only)
    // This assumes Tauri APIs are mocked in the app
    // For full Tauri integration testing, change to: 'npm run tauri dev'
    command: 'npm run dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 min startup timeout
  },

  // Global setup (optional - use for login, setup, etc.)
  // globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
});
