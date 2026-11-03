// Opciones por consola: --grep="texto" (una prueba por nombre) y --archivos="glob" (un archivo o carpeta)
module.exports = function (config) {
  const archivos = config.archivos || 'src/tests/componentes/karma/**/*.spec.js';
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    client: { jasmine: { random: false }, args: config.grep ? ['--grep', config.grep] : [] },

    files: [{ pattern: archivos, watched: false }],
    preprocessors: {
      [archivos]: ['esbuild'],
    },

    esbuild: {
      target: 'es2020',
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      define: { 'process.env.NODE_ENV': '"test"', 'import.meta.env': '{}' },
      sourcemap: 'inline',
    },

    reporters: ['spec', 'kjhtml'],
    specReporter: {
      suppressSkipped: true,
      showSpecTiming: true,
    },

    browsers: ['ChromeHeadlessSinSandbox'],
    customLaunchers: {
      ChromeHeadlessSinSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
    },

    singleRun: true,
    autoWatch: false,
    restartOnFileChange: false,
  });
};
