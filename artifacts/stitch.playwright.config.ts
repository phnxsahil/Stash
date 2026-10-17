import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ testDir: '../tests', fullyParallel: false, workers: 1, reporter: [['list']], timeout: 30000, use: { baseURL: 'http://127.0.0.1:3000', reducedMotion: 'reduce', ...devices['Desktop Chrome'], channel: 'msedge', trace: 'retain-on-failure' } });
