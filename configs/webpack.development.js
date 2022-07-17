const { join } = require('path');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');

module.exports = {
  devServer: {
    contentBase: join(__dirname, '../dist'),
    hot: true,
    port: 3000
  },
  devtool: 'eval-source-map',
  plugins: [
    new WebpackBuildNotifierPlugin({
      title: "My Webpack Project",
      // logo: path.resolve("./img/favicon.png"),
      suppressSuccess: true,
    })
  ],
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              }
            },
          },
        ],
      },
    ],
  },
}