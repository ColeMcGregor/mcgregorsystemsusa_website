const { defineConfig, devices } = require('@playwright/test');

const fullBrowserMatrix = process.env.FULL_BROWSERS === '1';

module.exports = defineConfig({
    testDir: './tests',
    testMatch: '**/*.spec.cjs',
    timeout: 30_000,
    expect: { timeout: 7_500 },
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: [
        ['list'],
        ['html', { open: 'never' }]
    ],
    use: {
        baseURL: process.env.SITE_URL || 'http://127.0.0.1:4173',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10_000
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        ...(fullBrowserMatrix ? [
            { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
            { name: 'webkit', use: { ...devices['Desktop Safari'] } }
        ] : [])
    ],
    webServer: process.env.SITE_URL ? undefined : {
        command: 'npx http-server . -a 127.0.0.1 -p 4173 -c-1 --silent',
        url: 'http://127.0.0.1:4173/index.html',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000
    }
});
