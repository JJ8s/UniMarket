// Corre TODAS las pruebas de Jasmine (las 10 de componentes + las de datos,
// reportes y hooks): npm run test:karma:todo
const base = require('./karma.conf.cjs');

module.exports = function (config) {
  base(config);
  config.set({
    files: [
      { pattern: 'src/**/*.spec.js', watched: false },
    ],
    preprocessors: {
      'src/**/*.spec.js': ['esbuild'],
    },
  });
};
