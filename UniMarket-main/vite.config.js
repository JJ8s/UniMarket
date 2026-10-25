import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Configuracion de Vitest (el test runner oficial de Vite). Vive en el
  // mismo archivo que la config de Vite para no duplicar el setup del
  // plugin de React entre build y test.
  test: {
    environment: 'jsdom', // simula el DOM y localStorage en Node, sin navegador real
    setupFiles: './src/tests/setup.js',
    globals: true, // permite usar describe/it/expect sin importarlos en cada archivo
    // Solo *.test.js: los *.spec.js son de Jasmine/Karma y Vitest no debe tocarlos
    include: ['src/**/*.test.js'],
  },
});
