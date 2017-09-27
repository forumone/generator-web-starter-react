'use strict';

const generator = require('yeoman-generator');

const pkg = require('../package.json');

module.exports = class ReactGenerator extends generator.Base {
  _getGrunt() {
    const options = this.options;

    if (typeof options.getPlugin === 'function') {
      return options.getPlugin('grunt');
    }
  }

  _hasGrunt() {
    return Boolean(this._getGrunt());
  }

  initializing() {
    // this.options.addDevDependency(pkg.name, '~' + pkg.version);
  }

  _readFile(filename) {
    return this.fs.read(this.templatePath(filename));
  }

  configuring() {
    this.options.addToGitignore(this._readFile('_gitignore'));
    this.options.addToGitattributes(this._readFile('_gitattributes'));
  }

  _copyFileAs(sourceFilename, targetFilename) {
    this.fs.copy(this.templatePath(sourceFilename), this.destinationPath(targetFilename));
  }

  _copyFile(filename) {
    this._copyFileAs(filename, filename);
  }

  writing() {
    this._copyFileAs('_editorconfig', '.editorconfig');
    this._copyFile('tsconfig.json');
    this._copyFile('tslint.json');

    this._copyFile('webpack.config.js');
    this._copyFile('src/index.tsx');
    this._copyFile('src/ambient.d.ts');
    this._copyFile('src/polyfills.ts');
    this._copyFile('src/sass/styles.scss');
    this._copyFile('src/index.html');

    const grunt = this._getGrunt();
    if (grunt) {
      const webpack = grunt.getGruntTask('webpack');
      webpack.insertVariable('config', "require('../../webpack.config')");
      webpack.insertConfig('webpack', this._readFile('tasks/config/webpack.js'));

      const webpackDevServer = grunt.getGruntTask('webpack-dev-server');
      // gruntfile-editor prepends code instead of appending it, so we have to put these variables
      // in seemingly reverse order
      webpackDevServer.insertVariable(
        'serverConfig',
        'Object.assign({ webpack: config }, config.devServer);'
      );
      webpackDevServer.insertVariable('config', "require('../../webpack.config')");
      webpackDevServer.insertConfig(
        "'webpack-dev-server'",
        this._readFile('tasks/config/webpack-dev-server.js')
      );

      grunt.registerTask('build', 'webpack', 0);

      grunt.registerTask('default', 'webpack-dev-server', 0);
    }
  }

  _installToolchain() {
    // Webpack, static asset loaders, and basic plugins
    this.npmInstall(
      [
        'webpack',
        'webpack-dev-server',
        'file-loader',
        'url-loader',
        'html-webpack-plugin',
        'clean-webpack-plugin',
        'browser-sync',
        'browser-sync-webpack-plugin',
        'imagemin-loader',
        'imagemin-pngquant',
        'imagemin-svgo',
      ],
      {
        'save-dev': true,
      }
    );

    // Install TypeScript with an exact version so as to avoid breaking changes (the save-dev option creates a caret range, which isn't what we want)
    this.npmInstall(['typescript'], { 'save-dev': true, 'save-exact': true });

    this.npmInstall(
      [
        // TypeScript tooling
        'awesome-typescript-loader',
        'tslint',
        'tslint-loader',
      ],
      {
        'save-dev': true,
      }
    );

    // Sass compilation and plugins
    this.npmInstall(
      [
        'node-sass',
        'sass-loader',
        'import-glob',
        'css-loader',
        'style-loader',
        'postcss-loader',
        'autoprefixer',
        'extract-text-webpack-plugin',
      ],
      {
        'save-dev': true,
      }
    );
  }

  _installDependencies() {
    // Needed for code splitting via import() expressions
    this.npmInstall('es6-promise', { 'save-dev': true });

    this.npmInstall(['react@15', 'react-dom@15'], { 'save-dev': true });

    // Any change in an @types package is a patchlevel bump, so we install exactly to avoid version change issues
    this.npmInstall(['@types/react@15', '@types/react-dom@15'], { 'save-dev': true, 'save-exact': true });
  }

  _installGruntWebpack() {
    this.npmInstall(['grunt-webpack'], { 'save-dev': true });
  }

  install() {
    this._installToolchain();
    this._installDependencies();

    if (this._hasGrunt()) {
      this._installGruntWebpack();
    }

    this.installDependencies({
      npm: true,
    });
  }
}