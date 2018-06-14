var express = require("express");
var webpackDevMiddleware = require("webpack-dev-middleware");
var webpack = require("webpack");
var webpackConfig = require("./webpack.config");
let path = require('path');
var app = express();

//代理API
var proxy = require("express-http-proxy");
var port = 8088;
//开发环境API地址
var apiProxy = proxy("http://192.168.78.142:8080", {
  forwardPath: function (req, res) {
    return req._parsedUrl.path
  }
})
app.use("/api", apiProxy);

//解决413错误
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var compiler = webpack(webpackConfig);
app.use(webpackDevMiddleware(compiler, {
  hot: true,
  publicPath: "/"
}));

app.listen(8081, function () {
  console.log("Listening on port 8081!");
});
