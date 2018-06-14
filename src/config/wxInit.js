import Config from './config';
const axios = require('axios');
import Request from './Request'; //封装后的axios
//获取微信通用设置
window.getConfig = function (config) {
    config = Object.assign({}, config, {
        debug: false,
        jsApiList: [
            "onMenuShareTimeline",
            "onMenuShareAppMessage",
            "hideAllNonBaseMenuItem",
            "showMenuItems",
            "showOptionMenu",
            "hideOptionMenu"
        ]
    })
    return config;
}

export default function (callback) {
    window.wxShareOpt = {
        title: "desc",
        imgUrl: 'https://h5.parsec.com.cn/fliggy/' + require('../images/logo.png'),
        desc: "title",
    }
    window.wxShareOpt.link = window.location.href;
    window.addEventListener('hashchange', () => {
        window.wxShareOpt.link = window.location.href;
        wx.onMenuShareTimeline(window.wxShareOpt);
        wx.onMenuShareAppMessage(window.wxShareOpt);
    })
    let openid = localStorage.getItem(Config.openid);

    let match = window.location.href.match(/openid\=[a-z0-9\-\_]+/ig);
    if (!openid && openid != 'null' && !!match && match[0]) {
        openid = match[0].split('=')[1];
    }
    let appid = 'wx1fc1f399fd2c1529';
    //获取授权
    if (!openid) {
        let data = new FormData();
        data.append('appid', appid);
        data.append('redirect_uri', window.location.href);
        axios.post('https://games.parsec.com.cn/user_auth_url', data, {
            headers: { 'Content-Type': 'multipart/form-data;' },
        }).then((data) => {
            localStorage.clear();
            localStorage.setItem('fliggy_version', '2');
            window.location.href = data.data.url;
        });

        // let href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1fc1f399fd2c1529&redirect_uri=http://games.parsec.com.cn/user_auth_proxy&response_type=code&scope=snsapi_userinfo&state=' + 'http%3A//h5.parsec.com.cn/fliggy' + '&component_appid=wx42184d43fe2c4741&connect_redirect=1#wechat_redirect';
        // window.location.href = href;

    } else {
        // axios.get();
        window.openid = openid;
        window.appid = appid;
        localStorage.setItem(Config.openid, openid);
        localStorage.setItem(Config.appid, appid);
        axios.get('https://games.parsec.com.cn/js_ticket', {
            params: {
                appId: window.appid,
                url: window.location.href,
            }
        }).then((data) => {
            // console.log(data);
            wx.config(window.getConfig(data.data.result));
        })
        wx.ready(() => {
            wx.onMenuShareTimeline(window.wxShareOpt);
            wx.onMenuShareAppMessage(window.wxShareOpt);
        });

        wx.error(() => {
            alert("微信初始化失败");
        });

        //更新Userinfo
        axios.get('https://games.parsec.com.cn/user_info', {
            params: {
                appid: window.appid,
                openid: window.openid,
            }
        }).then((data) => {
            window.UserInfo = data.data;
            //登录
            Request.post('api/login', {
                username: window.openid,
                password: window.appid,
                type: 'wechat'
            }).then((data) => {
                localStorage.setItem(Config.token, data.data.result.token);
                callback && callback();
            })
        })
    }
}