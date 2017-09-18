'use strict';

const path = require('path');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const targetDir = path.resolve(__dirname, 'public');

// We always use these plugins
const standardPlugins = [
  new CleanWebpackPlugin([targetDir]),
  new webpack.EnvironmentPlugin({
    NODE_ENV: 'development',
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'src/index.html'),
  }),
  new ExtractTextPlugin('styles.css'),
];

// Development-only plugins (e.g., browsersync)
const devPlugins = [
  new BrowserSyncPlugin(
    {
      host: 'localhost',
      port: 3000,
      proxy: 'http://localhost:8000',
      open: false,
    },
    {
      // If you're having issues with BrowserSync not reloading properly, uncomment the line below
      reload: false,
    }
  ),
];

// Production-only plugins (for stuff like minification)
const prodPlugins = [
  new webpack.optimize.UglifyJsPlugin({
    comments: false,
  }),
];

module.exports = {
  devtool: isProduction ? false : 'source-map',

  entry: [
    path.resolve(__dirname, 'src/index.tsx'),
  ],

  output: {
    path: targetDir,
    publicPath: '',
    filename: '[name].js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },

  devServer: {
    host: '0.0.0.0',
    port: 8000,
    overlay: true,
  },

  plugins: standardPlugins.concat(isProduction ? prodPlugins : devPlugins),

  module: {
    rules: [
      // Static assets
      // Anything less than 8KB is inlined automatically. Otherwise, webpack outputs
      // them as separate files.
      {
        test: /\.(?:png|svg|jpg)$/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name]-[hash].[ext]',
            limit: 8192,
          },
        },
      },

      // Scripts
      {
        test: /\.tsx?$/,
        enforce: 'pre',
        use: {
          loader: 'tslint-loader',
          options: {
            emitErrors: true,
            formatter: 'codeFrame',
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader',
      },

      // Stylesheets
      {
        test: /\.scss$/,
        enforce: 'pre',
        use: 'import-glob',
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { sourceMap: !isProduction },
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !isProduction,
                plugins: [
                  require('autoprefixer')({
                    browsers: '> 1%, last 3 versions',
                    remove: false,
                  }),
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: { sourceMap: !isProduction },
            },
          ],
        }),
      },
    ],
  },
};