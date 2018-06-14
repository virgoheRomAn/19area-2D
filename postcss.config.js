
// module.exports = {
//   plugins: [
//     // require('precss'),
//     require('autoprefixer'),
//     // require('postcss-pxtorem')({
//     //   rootValue: 75,
//     //   unitPrecision: 5,
//     //   propList: ['*border*', '*width*', '*height*', 'margin*', 'padding*', 'top', 'left', 'bottom', 'right', 'line-height', 'font-size', 'border-radius', '*transform*'],
//     //   selectorBlackList: [],
//     //   replace: true,
//     //   mediaQuery: false,
//     //   minPixelValue: 0
//     // })
//   ]
// }

module.exports = {
  plugins: [
      require('autoprefixer')({
          browsers: ['last 2 versions', 'Firefox >= 1', 'Android >= 4.0', 'iOS >= 8']
      })
  ]
};