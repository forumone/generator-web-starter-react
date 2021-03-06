'use strict';

const path = require('path');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const targetDir = path.resolve(__dirname, 'public');

// Automatically inline any image less than this size
const inlineThreshold = 8 * 1024;

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

    // Show errors in the browser
    overlay: true,

    // Don't fall back to the filesystem during development
    contentBase: false,
  },

  plugins: standardPlugins.concat(isProduction ? prodPlugins : devPlugins),

  module: {
    rules: [
      // Static assets:
      // Assets are automatically inlined if their size is less than the value of the `inlineThreshold' variable.
      {
        test: /\.(?:png|svg|jpg)$/,
        exclude: [
          // The 'exclude' array here is used to exempt images from minimization.
          // Be sure to check the configuration block below this! Your Webpack build will fail if you don't pass the exempted images through url-loader.
          // path.resolve(__dirname, 'src/images/filename.ext'),
        ],
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[hash].[ext]',
              limit: inlineThreshold,
            },
          },
          {
            loader: 'imagemin-loader',
            options: {
              enabled: isProduction,
              plugins: [
                {
                  use: 'imagemin-pngquant',
                  options: {
                    quality: '50-60',
                  },
                },
                {
                  use: 'imagemin-svgo',
                },
              ],
            },
          },
        ],
      },

      // Image optimization exceptions:
      // If any images look terrible after a production build:
      // 1) Add the FULL path to the 'exclude' array in the configuration above this,
      // 2) Uncomment the block below, and
      // 3) Add the path again to the 'include' array
      // {
      //   test: /\.(?:png|svg|jpg)$/,
      //   include: [
      //     // path.resolve(__dirname, 'src/images/filename.ext'),
      //   ],
      //   use: {
      //     loader: 'url-loader',
      //     options: {
      //       name: '[name]-[hash].[ext]',
      //       limit: inlineThreshold,
      //     },
      //   },
      // },

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
              options: {
                minimize: isProduction,
                sourceMap: !isProduction,
              },
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