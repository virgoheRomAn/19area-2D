import React from "react";
import $ from "jquery";
import md5 from "js-md5";

import Agreement from "./RegisterAgreement";

import Method from "../../Interface/Method";
import Module from "../../Interface/Module";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import G from "../../Interface/Global";

require('./RegisterLogin.less');
let mp4 = require("../../../images/Area19.mp4");

export default class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            isChange_login: false,
            isChange_register: false,
            isChange_forget: false,
            isChange_logo: false,
            isChange_skin: false
        };

    }
    componentDidMount() {
        var getInfo = JSON.parse(localStorage.getItem('userinfo'));
        if (getInfo !== null) {
            var userName = getInfo.loginName;
            var userPwd = getInfo.loginPwd;
            $("#loginname").val(userName)
            $("#password").val(userPwd);
            $("#remember").addClass("active");
        } else {
            $("#remember").removeClass("active");
        }

    }
    render() {
        let { isChange_login, isChange_register, isChange_forget } = this.state;
        //是否显示背景图 是否显示背景视频 图片地址
        let [isSkin, isVideo, skinImg] = ["", "", ""];
        let handleImg = new window.Native.HandleImg();
        if (!handleImg.mkdirSync(handleImg.getSkinImg() + "/skin.png")) {
            isSkin = "none";
        } else {
            isVideo = "none";
            skinImg = handleImg.getImgUrl();
        }
        /**
         * 用户登录
         * 小啊刚
         * 2018.5.4修改
         */
        function login() {
            if ($("#loginname").val() === "" || $("#loginname").val() === null) {
                jBox.error("用户名不能为空！");
                return false;
            }
            if ($("#password").val() === "" || $("#password").val() === null) {
                jBox.error("密码不能空！");
                return false;
            }
            Module.getLoginState({
                name: $("#loginname").val(),
                password: isChange_login ? md5(md5($("#password").val()) + $("#loginname").val()) : $("#password").val(),
                callback: (data) => {
                    //用户信息
                    G.saveMemberInfor = data.memberInfo;
                    Module.saveDataTransfer({
                        memberGid: data.memberInfo.gid,
                        token: data.memberInfo.loginToken,
                        type: data.memberInfo.memberType,
                        projectType: 1,
                        callback: () => {
                            //读取用户信息文件
                            window.Native.getBootParams();
                            G.sourceType = 1;
                            let hasMerchant = data.memberInfo.hasMerchant;
                            Module.getConfigInfor({
                                callback: (data) => {
                                    jBox.remove("#tipsLoad", {}, function () {
                                        jBox.success("登录成功！", {
                                            closeFun: function () {
                                                //加载全部方案库
                                                window.EM.emit("getSolutions", 1, -1, -1, "", hasMerchant);
                                                G.saveModelTypeList = data.configModelTypeList;
                                                G.saveCityList = data.configCityList;
                                                //加载用户基础信息
                                                window.EM.emit("loadMemberInfo", data.memberInfo || {});
                                                customizedInfo();
                                                $(".user-operation").hide();
                                                var $state = $(".fb-check-box");
                                                if ($state.hasClass("active")) {
                                                    var userInfo = {
                                                        loginName: $("#loginname").val(),
                                                        loginPwd: isChange_login ? md5(md5($("#password").val()) + $("#loginname").val()) : $("#password").val()
                                                    };
                                                    localStorage.setItem('userinfo', JSON.stringify(userInfo));
                                                } else {
                                                    localStorage.removeItem('userinfo');
                                                }
                                            }
                                        })
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        /**
         * 皮肤设置
         * xag
         * 2018.5.4
         */
        function customizedInfo() {
            Module.customizedInfo({
                callback: (data) => {
                    let logoPath = data.logoPath;
                    let skinPath = data.skinPath;
                    let files = [];
                    //判断用户是否有设置logo
                    if (!logoPath || logoPath == "1") {
                        if (handleImg.mkdirSync(handleImg.getSkinImg() + "/myLogo.ico")) {
                            handleImg.deleteImg(handleImg.getSkinImg() + "/myLogo.ico");
                        }
                    } else {
                        files.push(
                            {
                                url: logoPath,
                                fileName: "logo.ico",
                                option: {
                                    responseType: 'arraybuffer'
                                }
                            }
                        );
                    }
                    //判断用户是否有设置皮肤
                    if (!logoPath || skinPath == "1") {
                        if (handleImg.mkdirSync(handleImg.getSkinImg() + "/skin.png")) {
                            handleImg.deleteImg(handleImg.getSkinImg() + "/skin.png");
                        }
                    } else {
                        files.push(
                            {
                                url: skinPath,
                                fileName: "skin.png",
                                option: {
                                    responseType: 'arraybuffer'
                                }
                            }
                        );
                    }
                    if (files.length > 0) {
                        Module.downloadFiles({
                            files: files,
                            callback: (response) => {
                                for (let key in response) {
                                    let imgBase64 = btoa(new Uint8Array(response[key].data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                                    handleImg.downloadUrl(imgBase64, key);
                                }
                            }
                        });
                    }
                }
            });
        }

        /**
         * 新用户注册
         * liuxiaoyi
         * 2018-05-02 修改
         */
        function register() {
            var code = verifyPhone("#registername");
            if (code === 2) {
                if ($("#codenum").val() === "" || $("#codenum").val() === null) {
                    jBox.error("验证码不能为空！");
                    return false;
                }
                if ($("#registerpassword").val() === "" || $("#registerpassword").val() === null) {
                    jBox.error("密码不能为空！");
                    return false;
                }

                jBox.loading("账户注册中...", {
                    boxID: "tipsLoad"
                });

                Module.registerMemberInfo({
                    loginName: $("#registername").val(),
                    loginPwd: md5(md5($("#registerpassword").val()) + $("#registername").val()),
                    verificationCode: $("#codenum").val(),
                    callback: (data) => {
                        $(".user-operation .register-bar").hide();
                        $(".user-operation .login-bar").show();
                    }
                });
            }
        }

        /**
         * 用户忘记密码
         * liuxiaoyi
         * 2018-05-03 修改
         */
        function forget() {
            var code = verifyPhone("#forgetname");
            if (code === 2) {
                if ($("#forgetcodenum").val() === "" || $("#forgetcodenum").val() === null) {
                    jBox.error("验证码不能为空！");
                    return false;
                }
                if ($("#forgetpassword").val() === "" || $("#forgetpassword").val() === null) {
                    jBox.error("密码不能为空！");
                    return false;
                }
                if ($("#againpassword").val() === "" || $("#againpassword").val() === null) {
                    jBox.error("请确认密码！");
                    return false;
                }
                if ($("#againpassword").val() !== $("#forgetpassword").val()) {
                    jBox.error("两次密码不一致");
                    return false;
                }

                jBox.loading("找回密码中...", {
                    boxID: "tipsLoad"
                });
                Module.forgetLoginPwd({
                    loginName: $("#forgetname").val(),
                    loginPwd: md5(md5($("#forgetpassword").val()) + $("#forgetname").val()),
                    validateCode: $("#forgetcodenum").val(),
                    callback: (data) => {
                        $(".user-operation .forget-bar").hide();
                        $(".user-operation .login-bar").show();
                    }
                });
            }
        }

        /** 
         * 注册协议
         * xag
         * 2018.5.4
         */
        function showAgreementContent() {
            jBox.confirm($("#agreement").html(), {
                confirmType: 1,
                title: "用户协议",
                cls: {
                    titleCls: "specail"
                },
                element: {
                    cls: "jBox-fixed-box specail",
                    width: $(window).width() * 0.7,
                    height: $(window).height() * 0.8,
                },
                initAfterFun: function (opt) {
                    opt.popElement.$intro.css("padding", 0);
                }
            });
        }

        /**
         * 获取注册验证码同时倒计时
         * liuxiaoyi
         * 2018-05-02 添加
         */
        function getRegisterPhoneCode() {
            var cutDown;
            var code = verifyPhone("#registername");

            if ($("#countDown").hasClass("active")) return false;

            if (code === 2) {
                var time = 120;

                jBox.loading("正在发送验证码...", {
                    boxID: "tipsLoad"
                });

                Module.getRegisterPhoneCode({
                    phoneNumber: $("#registername").val(),
                    callback: (code) => {
                        cutDown = new Method.countDown("#countDown", time, ["获取验证码", " 秒后重新获取"]);
                    }
                });
            }
        }

        /**
         * 获取忘记密码验证码同时倒计时
         * liuxiaoyi
         * 2018-05-03 添加
         */
        function getForgetPhoneCode() {
            var cutDown;
            var code = verifyPhone("#forgetname");

            if ($("#forgetcountDown").hasClass("active")) return false;

            if (code === 2) {
                var time = 120;

                jBox.loading("正在发送验证码...", {
                    boxID: "tipsLoad"
                });

                Module.getForgetPhoneCode({
                    loginName: $("#forgetname").val(),
                    callback: (code) => {
                        cutDown = new Method.countDown("#forgetcountDown", time, ["获取验证码", " 秒后重新获取"]);
                    }
                });
            }
        }

        /**
         * 验证手机号
         * liuxiaoyi
         * 2018-05-03 修改
         */
        function verifyPhone(element) {
            var val = $(element).val();
            var code = Method.verifyPhone(val);
            switch (code) {
                case 0:
                    jBox.error("手机号不能为空！");
                    break;
                case 1:
                case 3:
                    jBox.error("手机号格式错误！");
                    break;
            }
            return code;
        }

        return (
            <div className="user-operation">
                {/* 背景视频 */}
                <div className="bg-video">
                    <span></span>
                    <video autoPlay="autoPlay" loop="loop" src={mp4} id="video" style={{ display: isVideo }} />
                    <img src={skinImg} width="100%" height="100%" style={{ display: isSkin }} />
                </div>
                {/* 注册协议 */}
                <Agreement />

                {/* 登录 */}
                <div className="login-bar">
                    <div className="table-box">
                        <div className="cell">
                            <div className="header-box">
                                <span>VR设计平台</span>
                            </div>
                            <div className="cont-box">
                                <div className="user-box">
                                    <div className="user-cont radius">
                                        <div className="user-form">
                                            <div className="item">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <span><i className="fb-sprite icon-mobile"></i></span>
                                                    <input id="loginname" type="text" placeholder="请输入注册手机号" />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                            </div>
                                            <div className="item">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <span><i className="fb-sprite icon-password"></i></span>
                                                    <input id="password" type="password" placeholder="请输入密码" onChange={() => {
                                                        this.setState({
                                                            isChange_login: true
                                                        });
                                                    }} onKeyDown={(e) => {
                                                        if (e.keyCode === 13) {
                                                            login();
                                                        }
                                                    }} />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                            </div>
                                            <div className="intro clearfix">
                                                <label className="fb-check-box fl" id="remember">
                                                    <em>
                                                        <i className="fb-sprite icon-checked"></i>
                                                        <input type="checkbox" />
                                                    </em>
                                                    <span>记住密码</span>
                                                </label>
                                                <a className="fr" href="javascript:;" onClick={() => {
                                                    $(".login-bar").hide();
                                                    $(".forget-bar").show();
                                                }}>忘记密码？</a>
                                            </div>
                                            <div className="btn-big">
                                                <a className="fb-btn big background blue" href="javascript:;" onClick={() => {
                                                    login();
                                                }}>登录</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="user-intro">没有账号？去  <a className="tm-uline" href="javascript:;" onClick={() => {
                                        $(".login-bar").hide();
                                        $(".register-bar").show();
                                    }}>注册</a></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 注册 */}
                <div className="register-bar" style={{ display: "none" }}>
                    <div className="table-box">
                        <div className="cell">
                            <div className="header-box">
                                <span>VR设计平台</span>
                            </div>
                            <div className="cont-box">
                                <div className="user-box">
                                    <div className="user-cont radius">
                                        <div className="user-form">
                                            <div className="item">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <span><i className="fb-sprite icon-mobile"></i></span>
                                                    <input id="registername" type="text" placeholder="请输入手机号" />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                            </div>
                                            <div className="item code clearfix">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <input id="codenum" type="text" placeholder="请输入验证码" />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                                <a className="fb-btn big background orange cut-down" href="javascript:;" id="countDown" onClick={() => {
                                                    getRegisterPhoneCode();
                                                }}>获取验证码</a>
                                            </div>
                                            <div className="item">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <span><i className="fb-sprite icon-password"></i></span>
                                                    <input id="registerpassword" type="password" placeholder="请输入密码" onKeyDown={(e) => {
                                                        if (e.keyCode === 13) {
                                                            register();
                                                        }
                                                    }} />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                            </div>
                                            <div className="btn-big">
                                                <a className="fb-btn big background blue" href="javascript:;" onClick={() => {
                                                    register();
                                                }}>注册</a>
                                            </div>
                                            <div className="register-agreement">
                                                <span>点击"注册"即表示您同意<a href="javascript:;" onClick={() => {
                                                    showAgreementContent();
                                                }}>《十九区用户使用协议》</a></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="user-intro">已有账号？去  <a className="tm-uline" href="javascript:;" onClick={() => {
                                        $(".login-bar").show();
                                        $(".register-bar").hide();
                                    }}>登录</a></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 忘记密码 */}
                <div className="forget-bar" style={{ display: "none" }}>
                    <div className="table-box">
                        <div className="cell">
                            <div className="header-box">
                                <span>VR设计平台</span>
                            </div>
                            <div className="cont-box">
                                <div className="user-box">
                                    <div className="user-cont radius">
                                        <div className="user-form">
                                            <div className="item">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <span><i className="fb-sprite icon-mobile"></i></span>
                                                    <input id="forgetname" type="text" placeholder="请输入手机号" />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                            </div>
                                            <div className="item code clearfix">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <input id="forgetcodenum" type="text" placeholder="请输入验证码" />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                                <a className="fb-btn big background orange cut-down" href="javascript:;" id="forgetcountDown" onClick={() => {
                                                    getForgetPhoneCode();
                                                }}>获取验证码</a>
                                            </div>
                                            <div className="item">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <span><i className="fb-sprite icon-password"></i></span>
                                                    <input id="forgetpassword" type="password" placeholder="请设置新的密码" />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                            </div>
                                            <div className="item">
                                                <label className="form-input clean border bto gray big block before-text">
                                                    <span><i className="fb-sprite icon-password"></i></span>
                                                    <input id="againpassword" type="password" placeholder="请再次输入密码" onKeyDown={(e) => {
                                                        if (e.keyCode === 13) {
                                                            forget();
                                                        }
                                                    }} />
                                                    <label className="clean-btn" href="javascript:;">&times;</label>
                                                </label>
                                            </div>
                                            <div className="btn-big">
                                                <a className="fb-btn big background blue" href="javascript:;" onClick={() => {
                                                    forget();
                                                }}>找回密码</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="user-intro">去  <a className="tm-uline" href="javascript:;" onClick={() => {
                                        $(".login-bar").show();
                                        $(".forget-bar").hide();
                                    }}>登录</a></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}