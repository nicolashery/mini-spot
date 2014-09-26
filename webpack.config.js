var path = require('path');

var config = {
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

// If not in mock mode, don't bundle all the mock data
var apiUrl = process.env.API_URL;
if (apiUrl && apiUrl !== 'mock') {
  config.externals = [
    {'blip-mock-data': '{}'}
  ];
}

module.exports = config;
