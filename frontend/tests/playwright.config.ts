import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 60_000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ]
});
