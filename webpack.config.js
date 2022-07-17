const argv = require('yargs-parser')(process.argv.slice(2));  // ['--mode', 'production'] => { mode: 'production' }
const _mode = argv.mode || 'development';
const { merge } = require('webpack-merge');
const _mergeConfig = require(`./configs/webpack.${_mode}.js`);
const { resolve } = require("path");
const { CheckerPlugin } = require('awesome-typescript-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpackconfig = {
  entry: {
    app: resolve("./src/index.tsx")
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            // 缓存上次编译结果，避免每次重新编译，减少打包时间
            cacheDirectory: true
          }
        },
        exclude: /node_modules/
      },
    ]
  },
  plugins: [
    new CheckerPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './index.html'
    })
  ]
}

module.exports = merge(webpackconfig, _mergeConfig);
