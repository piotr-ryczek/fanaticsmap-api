const path = require('path');

module.exports = {
  target: 'node',
  entry: `${__dirname}/src/server.ts`,
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      'node_modules',
      path.resolve(__dirname, './src'),
    ],
    alias: {
      "@controllers": path.resolve(__dirname, "./src/controllers"),
      "@utilities": path.resolve(__dirname, "./src/utilities"),
      "@models": path.resolve(__dirname, "./src/models"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@services": path.resolve(__dirname, "./src/services"),
    }
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
};