var path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'jsx'},
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.json$/, loader: 'json'}
    ]
  }
};
