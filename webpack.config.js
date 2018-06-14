var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var Visualizer = require('webpack-visualizer-plugin');
var TransferWebpackPlugin = require('transfer-webpack-plugin');

module.exports = {
  entry: {
    main: './src/index.js',
    // config: './src/config.js',
    vender: ['react', 'react-dom', 'react-router-dom']
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist')
  },
  // entry: [
  //   'react-hot-loader/patch',
  //   // activate HMR for React

  //   'webpack-dev-server/client?http://localhost:8081',
  //   // bundle the client for webpack-dev-server
  //   // and connect to the provided endpoint

  //   'webpack/hot/only-dev-server',
  //   // bundle the client for hot reloading
  //   // only- means to only hot reload for successful updates

  //   './src/index.js'
  //   // the entry point of our app
  // ],
  // output: {
  //   filename: '[name].js',
  //   // the output bundle

  //   path: path.resolve(__dirname, 'dist'),

  //   publicPath: '/'
  //   // necessary for HMR to know where to load the hot update chunks
  // },
  devtool: "source-map",
  devServer: {
    hot: true,
    contentBase: path.join(__dirname, "dist"),
    // compress: true,
    port: 8081
  },
  module: {
    rules: [
      {
        test: /\.(css|less)$/,
        // use: ExtractTextPlugin.extract({
        //   use: [
        //     {
        //       loader: 'css-loader',
        //       options: {
        //         importLoaders: 1,
        //       }
        //     }, 'less-loader', {
        //       loader: 'postcss-loader'
        //     }]
        // }),
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
              loader: 'css-loader',
              options: {
                  importLoaders: 1
              }
          }, {
              loader: 'postcss-loader',
          }, {
              loader: 'less-loader',
              options: {
                  modifyVars: {
                      "@primary-color": "#00cccb",
                      "@themeColor": "#545454",
                      "@bgColor": "#343534",
                      "@bdColor": "#d9d9d9",
                      "@textColor": "#ccc",
                      "@textDarkColor": "#333",
                      "@textGreyColor": "#666",
                      "@titleColor": "#fff",
                  },
              },
          }]
        })
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|mp4|ttc|ttf)$/i,
        use: {
          loader: 'url-loader?limit=1024'
        }
      },
      // {
      //   test: /\.(mp4|ogg|svg|ttf|eot|woff|woff2|png|jpg|gif)$/,
      //   use: {
      //     loader: 'file-loader'
      //   }
      // }
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
            options: {
                plugins: [
                    "transform-decorators-legacy",
                    ['import', [{libraryName: 'antd', style: true}]],  // import less
                ],
                cacheDirectory: true,
            },
        }
      },
    ]
  },
  plugins: [
    // new Visualizer(),
    // new webpack.DefinePlugin({
    //   'process.env': {
    //     NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    //   },
    // }),
    new TransferWebpackPlugin([
      { from: './native', to: '../dist/' }
    ], path.join(__dirname, './src')),
    new HtmlWebpackPlugin({
      template: './src/index.template.html'
    }),
    new ExtractTextPlugin('styles.[chunkhash].css'),
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vender' // Specify the common bundle's name.
    }),
  ]
};
