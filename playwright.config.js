export default {
  testDir: '.',
  testMatch: 'e2e.test.js',
  use: {
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx http-server -p 8080',
    port: 8080,
    timeout: 10000,
    reuseExistingServer: true,
  },
};
