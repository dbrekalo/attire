var path = require('path');
var webpack = require('webpack');

module.exports = function(env) {

    var isDevEnvironment = env === 'development';

    return {
      entry: {
            build: './src/js/demoApp/main.js',
            demoBuild: './src/js/demoApp/main.js',
            docsBuild: './src/js/docsApp/main.js'
      },
      output: {
            path: path.resolve(__dirname, 'dist/js'),
            filename: '[name]' + (isDevEnvironment ? '' : '.min') + '.js'
      },
      plugins: [
            new webpack.IgnorePlugin(/unicode\/category\/So/)
        ].concat(isDevEnvironment ? [] : [
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                comments: false,
                mangle: {
                    screw_ie8: true,
                },
                compress: {
                    screw_ie8: true,
                    warnings: false
                }
            })
        ])
    };

};
