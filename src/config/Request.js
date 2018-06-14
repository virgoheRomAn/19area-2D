const axios = require('axios');
import Qs from 'qs'
import Config from './config';
const instance = axios.create({
  baseURL: Config.host,
  timeout: 100000,
  headers: {}
});
instance.interceptors.request.use(function (config) {
  // Do something before request is sent
  // debugger;
  // config.headers['accessToken'] = localStorage.getItem('accessToken') || undefined;
  // config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

  config.params = config.params || {};
  config.params['memberGid'] = window.BootParams['--memberGid'] || '9';
  config.params['token'] = window.BootParams['--token'] || 'e946f850c699459894c242584b11a776';
  // config.data = Qs.stringify(config.data);
  return config;
}, function (error) {
  // Do something with request error
  // debugger;
  console.log(error);
});
instance.interceptors.response.use(function (response) {
  // Do something with response data
  let data = response.data;
  //令牌失效，请重新获取令牌
  // debugger
  if (data.errorCode === 'E0004' && response.config.url.indexOf('refreshToken.json') == -1) {
    return instance.refreshToken().then(() => {
      response.config.baseURL = '';
      response.config.headers['accessToken'] = localStorage.getItem('accessToken');
      // debugger
      return instance(response.config);
    });
  }
  // console.log(response);
  return response;
}, function (error) {
  // Do something with response error
  // return Promise.reject(error);
  console.log(error);
});

export default instance;
