// cypress.config.mjs
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:13000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 960,
  },
});
