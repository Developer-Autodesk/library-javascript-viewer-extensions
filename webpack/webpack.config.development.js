var path = require('path');
var webpack = require('webpack');

module.exports = {

  devtool: 'eval-source-map',

  entry: {

    'Autodesk.ADN.Viewing.Extension.BasicES2015':
      './src/Autodesk.ADN.Viewing.Extension.BasicES2015/Autodesk.ADN.Viewing.Extension.BasicES2015.js',

    'Autodesk.ADN.Viewing.Extension.ModelLoader':
      './src/Autodesk.ADN.Viewing.Extension.ModelLoader/Autodesk.ADN.Viewing.Extension.ModelLoader.js',

    'Autodesk.ADN.Viewing.Extension.PropertyPanel':
      './src/Autodesk.ADN.Viewing.Extension.PropertyPanel/Autodesk.ADN.Viewing.Extension.PropertyPanel.js',

    '_Viewing.Extension.ControlSelector':
      './src/Viewing.Extension.ControlSelector/Viewing.Extension.ControlSelector.js',

    '_Viewing.Extension.ExtensionManager':
      './src/Viewing.Extension.ExtensionManager/Viewing.Extension.ExtensionManager.js',

    'Viewing.Extension.Particle':
      './src/Viewing.Extension.Particle/Viewing.Extension.Particle.js',

    '_Viewing.Extension.Particle.LHC':
      './src/Viewing.Extension.Particle/Viewing.Extension.Particle.LHC.js',

    'Viewing.Extension.PointCloud':
      './src/Viewing.Extension.PointCloud/Viewing.Extension.PointCloud.js',

    'Autodesk.ADN.Viewing.Extension.React':
      './src/Autodesk.ADN.Viewing.Extension.React/Autodesk.ADN.Viewing.Extension.React.js',

    'Viewing.Extension.TypeScript':
      './src/Viewing.Extension.TypeScript/Viewing.Extension.TypeScript.js'
  },

  output: {
    path: path.join(__dirname, '../../App/dynamic/extensions'),
    filename: "[name]/[name].js",
    libraryTarget: "umd",
    library: "[name]",
    watch: true
  },

  plugins: [

    new webpack.optimize.UglifyJsPlugin({
      compress: false,
      minimize: false,
      mangle: false
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),

    new webpack.ProvidePlugin({
      _ : "underscore",
      jQuery: "jquery",
      $: "jquery"
    })
  ],

  resolve: {
    extensions: ['', '.js', '.jsx', '.json', '.ts'],
    root: [
      path.resolve('./src/utils'),
      path.resolve('./src/Viewing.Extension.Particle'),
      path.resolve('./src/Viewing.Extension.Transform')
    ]
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      }
    ]
  }
}
