module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    client: { jasmine: { random: false } },

    files: [{ pattern: 'src/tests/componentes.spec.js', watched: false }],
    preprocessors: {
      'src/tests/componentes.spec.js': ['esbuild'],
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
