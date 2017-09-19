'use strict';

const generator = require('yeoman-generator');

const pkg = require('../package.json');

module.exports = class ReactGenerator extends generator.Base {
  _hasGrunt() {
    return typeof this.options.getPlugin === 'function' && this.options.getPlugin('grunt');
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

    // TODO: Append to .gitattributes and .gitignore from web-starter

    this._copyFile('webpack.config.js');
    this._copyFile('src/index.tsx');
    this._copyFile('src/sass/styles.scss');
    this._copyFile('src/index.html');

    if (this._hasGrunt()) {
      this._copyFile('tasks/config/webpack.js');
      this._copyFile('tasks/register/build.js');
      // TODO: Override tasks/register/default.js from web-starter-grunt
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

  _installReact() {
    this.npmInstall(['react@15', 'react-dom@15'], { 'save-dev': true });

    // Any change in an @types package is a patchlevel bump, so we install exactly to avoid version change issues
    this.npmInstall(['@types/react@15', '@types/react-dom@15'], { 'save-dev': true, 'save-exact': true });
  }

  _installGruntWebpack() {
    this.npmInstall(['grunt-webpack'], { 'save-dev': true });
  }

  install() {
    this._installToolchain();
    this._installReact();

    if (this._hasGrunt()) {
      this._installGruntWebpack();
    }

    this.installDependencies({
      npm: true,
    });
  }
}