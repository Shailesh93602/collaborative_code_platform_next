const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {},
    defaultCommandTimeout: 10000,
    responseTimeout: 30000,
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    env: {
      API_URL: 'http://localhost:3000',
    },
  },
});
