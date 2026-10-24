// ============================================================
// Configuracion de Karma + Jasmine
//   Jasmine : framework de pruebas (describe / it / expect / spyOn)
//   Karma   : ejecutor que abre un navegador real y corre las pruebas
//   esbuild : empaqueta los modulos ES (import/export) para que Karma
//             pueda cargarlos, ya que Karma no entiende modulos por si solo
//
// Es un archivo .cjs porque package.json declara "type": "module".
// Las pruebas de Karma se llaman *.spec.js; las de Vitest, *.test.js.
// ============================================================

// Navegador: si existe la variable CHROME_BIN se usa ese Chrome/Chromium
// (util en servidores o contenedores); si no, Karma busca el Chrome instalado.

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    client: { jasmine: { random: false } }, // orden fijo (1 a 10) para que la evidencia sea legible

    // Archivos de prueba (cada uno se empaqueta con esbuild)
    files: [{ pattern: 'src/tests/componentes.spec.js', watched: false }],
    preprocessors: {
      'src/tests/componentes.spec.js': ['esbuild'],
    },

    esbuild: {
      target: 'es2020',
      jsx: 'automatic', // permite escribir JSX en las pruebas de componentes
      loader: { '.js': 'jsx' }, // el .spec.js de componentes tiene JSX (karma-esbuild no admite entradas .jsx)
      define: { 'process.env.NODE_ENV': '"test"', 'import.meta.env': '{}' }, // React lo necesita; import.meta no existe en el bundle de Karma
      sourcemap: 'inline',
    },

    // Reportes: 'spec' lista cada prueba por nombre en la consola; 'kjhtml'
    // muestra el resultado en pagina HTML cuando se usa un Chrome con ventana.
    // (La cobertura de codigo se mide con Vitest: npm run test:coverage)
    reporters: ['spec', 'kjhtml'],
    specReporter: {
      suppressSkipped: true,
      showSpecTiming: true,
    },

    // ChromeHeadless = Chrome sin ventana. Para ver el navegador abrirse,
    // cambia a ['Chrome'] y pon singleRun en false.
    browsers: ['ChromeHeadlessSinSandbox'],
    customLaunchers: {
      ChromeHeadlessSinSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'], // --no-sandbox: necesario en contenedores
      },
    },

    singleRun: true, // corre una vez y termina (ideal para evaluacion y CI)
    autoWatch: false,
    restartOnFileChange: false,
  });
};
