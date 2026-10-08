import { defineConfig } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'tests/e2e',
  ...(isCI ? { forbidOnly: true, retries: 1, workers: 1 } : {}),
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4322',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4322',
    env: {
      PUBLIC_GA_ID: 'G-TEST000000',
      PUBLIC_CLARITY_ID: 'testclarity',
      PUBLIC_TURNSTILE_SITE_KEY: '1x00000000000000000000AA',
    },
    url: 'http://localhost:4322',
    reuseExistingServer: !isCI,
  },
});
