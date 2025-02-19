const path = require('path');

module.exports = {
  // other configurations...
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/intro.js/, // Exclude intro.js files
        ],
      },
    ],
  },
  ignoreWarnings: [
    {
      module: /node_modules\/intro.js/, // Ignore warnings related to intro.js
      message: /Failed to parse source map/,
    },
    {
      module: /node_modules\/intro.js\/intro.module.js/, // Specific warning for intro.module.js
      message: /Failed to parse source map from/,
    },
  ],
};
