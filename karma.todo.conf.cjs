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
