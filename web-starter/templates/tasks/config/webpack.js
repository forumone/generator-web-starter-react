'use strict';

module.exports = function (grunt) {
  const config = require('../../webpack.config');
  const serverConfig = Object.assign({ webpack: config }, config.devServer);

  grunt.config.set('webpack', {
    default: function () {
      return config;
    },
  });

  grunt.config.set('webpack-dev-server', {
    default: function () {
      return serverConfig;
    },
  });
}