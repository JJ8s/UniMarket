import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Acepta tambien las variables que entrega Supabase con prefijo NEXT_PUBLIC_
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],

    // Cobertura (porcentaje de alcance de las pruebas)
    coverage: {
      provider: 'v8',
      // text = tabla con % en la terminal; html = reporte navegable en coverage/index.html
      reporter: ['text', 'text-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/tests/**',
        'src/pruebas-extra/**',
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.js',
        'src/main.jsx',
      ],
    },
  },
});
