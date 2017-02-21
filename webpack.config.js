var path = require('path');
var webpack = require('webpack');

module.exports = function(env) {

    return {
      entry: './src/js/index.js',
      output: {
        filename: env === 'production' ? 'build.min.js' : 'build.js',
        path: path.resolve(__dirname, 'dist/js')
      },
      plugins: [
        new webpack.IgnorePlugin(/unicode\/category\/So/)
      ].concat(env === 'production' ? [
        new webpack.optimize.UglifyJsPlugin({
          comments: false
        })
      ] : [])
    }

};
