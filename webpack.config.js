/*
 * @Author: 刘林
 * @Date: 2020-12-23 16:19:28
 * @LastEditors: 刘林
 * @LastEditTime: 2020-12-23 18:32:16
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const outputPath = path.resolve(__dirname, 'dist');
// const publicPath = './dist';
module.exports = {
  entry: {
    index: './src/index.js',
  },
  devtool: 'source-map',
  devServer: {
    host: '127.0.0.1',
    port: 3000,
    contentBase: './dist',
    hot: true,
    open: true,
    inline: true,
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader?cacheDirectory=true'],
      include: path.join(__dirname, 'src')
    }],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: './src/index.html' })
  ],
  output: {
    filename: '[name].bundle.js',
    path: outputPath,
    // publicPath
  },
};