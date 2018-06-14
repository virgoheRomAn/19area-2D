import axios from 'axios';
import Request from "../../config/Request";
import jBox from "../Plugins/jBox/jQuery.jBox";
import G from "./Global";

/**
 * 登录接口方法
 * virgoheRomAn
 * 2018-05-02
 * @param {Object} params {name: 用户名, password: 设置密码, callback: 回调} 
 * @param {string} url 请求地址
 */
export const getLoginState = function (params = { name: "", password: "", callback: "" }, url = `/frontAjax/userLoginAction.action`) {
    jBox.loading("正在登录中...", { boxID: "tipsLoad" });
    Request.get(url, {
        params: {
            loginName: params.name,
            loginPwd: params.password
        }
    }).then(response => {
        let data = response.data;
        switch (data.code) {
            case 1001:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("您输入的用户密码错误！");
                });
                break;
            case 1002:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("该账户已被冻结！");
                });
                break;
            case 1023:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("该账户已过期！");
                });
                break;
            case 1000:
                params.callback && params.callback.call(this, data);
                break;
        }
    });
}

/**
 * 获取基础信息
 * virgoheRomAn
 * 2018-05-02
 * @param {Object} params {callback: 回调}
 * @param {string} url 请求地址
 */
export const getConfigInfor = function (params = { callback: "" }, url = `/frontDesginAjax/desginQueryConfigSystemInfo.action`) {
    Request.get(url).then(response => {
        let data = response.data;
        if (data.code === 1000) {
            params.callback && params.callback.call(this, data);
        }
    });
}

/**
 * 本地存储基础信息
 * @author 小啊刚
 * 2018-05-02
 * @param {Object} params {memberGid:用户id,token:登陆令牌,type:会员类型,projectType:方案库类型,callback:回调}
 */
export const saveDataTransfer = function (params = { memberGid: "", token: "", type: "", projectType: 1, projectid: "", schemeNo: "", callback: "" }) {
    var memberInfo = {
        "--memberGid": params.memberGid,
        "--token": params.token,
        "--type": params.type,
        "--projectType": params.projectType,
        "--projectid": params.projectid,
        "--schemeNo": params.schemeNo
    };
    window.Native.saveDataTransfer(memberInfo, () => {
        params.callback && params.callback.call();
    });
}

/**
 * 获取皮肤信息
 * @author 小啊刚
 * 2018-05-03 
 * @param {Object} params {callback:回调}
 * @param {String} url 请求地址
 */
export const customizedInfo = function (params = { callback: "" }, url = `/frontAjax/memberQueryCustomizedInfo.action`) {
    Request.get(url).then(response => {
        let data = response.data;
        if (data.code === 1000) {
            params.callback && params.callback.call(this, data);
        }
    });
}

/**
 * 新用户注册
 * @author liuxiaoyi
 * 2018-05-02
 * @param {Object} params 
 * {
 * loginName: 登录名, 
 * loginPwd: 登录密码, 
 * verificationCode: 验证码,
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */

export const registerMemberInfo = function (params = { loginName: "", loginPwd: "", verificationCode: "", callback: "" },
    url = `/frontAjax/memberRegisterAction.action`) {
    Request.get(url, {
        params: {
            loginName: params.loginName,
            loginPwd: params.loginPwd,
            verificationCode: params.verificationCode
        }
    }).then(response => {
        let data = response.data;
        switch (data.code) {
            case 1007:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("该手机已经注册过，请更换手机号！");
                });
                break;
            case 1004:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("验证码错误！");
                });
                break;
            case 1000:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.success("注册成功！", {
                        closeFun: function () {
                            params.callback && params.callback.call(this, data);
                        }
                    })
                });
                break;
        }
    });
}

/**
 * 新用户获取注册手机验证码
 * @author liuxiaoyi
 * 2018-05-02
 * @param {Object} params {phoneNumber: 注册电话号码, callback: 回调}
 * @param {string} url 请求地址
 */
export const getRegisterPhoneCode = function (params = { phoneNumber: "", callback: "" }, url = `/frontAjax/memberRegisterSendValidateCodeAction.action`) {
    Request.get(url, {
        params: {
            phoneNumber: params.phoneNumber
        }
    }).then(response => {
        let data = response.data;
        switch (data.code) {
            case 1007:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("该手机已经注册过，请更换手机号！");
                });
                break;
            case 1000:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.success("验证码发送成功，注意查收！", {
                        closeFun: function () {
                            params.callback && params.callback.call(this, data);
                        }
                    })
                });
                break;
        }
    });
}

/**
 * 用户获取忘记密码手机验证码
 * @author liuxiaoyi
 * 2018-05-03
 * @param {Object} params {loginName: 登录名, callback: 回调}
 * @param {string} url 请求地址
 */
export const getForgetPhoneCode = function (params = { loginName: "", callback: "" }, url = `/frontAjax/memberForgetSendValidateCodeAction.action`) {
    Request.get(url, {
        params: {
            loginName: params.loginName
        }
    }).then(response => {
        let data = response.data;
        switch (data.code) {
            case 1016:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("该用户不存在！");
                });
                break;
            case 1000:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.success("验证码发送成功，注意查收！", {
                        closeFun: function () {
                            params.callback && params.callback.call(this, data);
                        }
                    })
                });
                break;
        }
    });
}

/**
 * 用户忘记密码
 * @author liuxiaoyi
 * 2018-05-03
 * @param {Object} params 
 * {
 * loginName: 登录名, 
 * loginPwd: 登录密码, 
 * validateCode: 验证码,
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const forgetLoginPwd = function (params = { loginName: "", loginPwd: "", validateCode: "", callback: "" },
    url = `/frontAjax/memberForgetLoginPwdAction.action`) {
    Request.get(url, {
        params: {
            loginName: params.loginName,
            loginPwd: params.loginPwd,
            validateCode: params.validateCode
        }
    }).then(response => {
        let data = response.data;
        switch (data.code) {
            case 1016:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("该用户不存在！");
                });
                break;
            case 1004:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.error("验证码错误！");
                });
                break;
            case 1000:
                jBox.remove("#tipsLoad", {}, function () {
                    jBox.success("找回密码成功！", {
                        closeFun: function () {
                            params.callback && params.callback.call(this, data);
                        }
                    })
                });
                break;
        }
    });
}

/**
 * 批量获取模型类型顶视图
 * @author liuxiaoyi
 * 2018-05-08
 * @param {Object} params 
 * {
 * gidStr: 模型GID字符串(例1: 23, 例2: '1,2,3')
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const getDesignTopImageByModelGidStr = function (params = { gidStr: "", callback: "" },
    url = `/frontAjax/queryDesignTopImageByModelGidStr.action`) {
    Request.get(url, {
        params: {
            gidStr: params.gidStr
        }
    }).then(response => {
        if (response.data && response.data.code === 1000) {
            params.callback && params.callback.call(this, response.data);
        }
    });
}

///////////////////////////////////////////////////////////////////////方案库接口///////////////////////////////////////////////////////////////////////

/**
 * 获取方案库列表
 * @author liuxiaoyi
 * 2018-05-04
 * @param {Object} params 
 * {
 * curPage: 当前页, 
 * pageSize：每页条数，
 * floorAreaStr: 面积(默认-1,50m2以下 传值1;50-80m2传值2;80-100m2传值3;100-130m2传值4;130m2以上传值5), 
 * houseRoom: 户型(默认-1,1\2\3\4 对应 一室\二室\三室\四室 ,其他对应0),
 * keyWords: 搜索关键字,
 * schemeType: 方案类型(1:全部，2：我的方案；3：公共方案 4:企业方案 5:回收站的方案),
 * isMine: 是否是我分享的,
 * callback: 回调
 * }
 */
export const getSchemeList = function (params = { curPage: 1, pageSize: 8, schemeType: 1, isMine: 0, callback: "" }) {
    let url;
    switch (params.schemeType) {
        case 1:
            url = `/frontAjax/queryAllSchemeListAction.action`;
            break;
        case 2:
            url = `/frontAjax/queryMineSchemeListAction.action`;
            break;
        case 3:
            url = `/frontAjax/queryPublicSchemeListAction.action`;
            break;
        case 4:
            url = `/frontAjax/optQueryMerchantSchemeAction.action`;
            break;
        case 5:
            url = `/frontAjax/optQueryMerchantRecycleSchemeAction.action`;
            break;
    }
    Request.get(url, {
        params: {
            curPage: params.curPage,
            pageSize: params.pageSize || 8,
            isMine: params.isMine,
            floorAreaStr: params.floorAreaStr || -1,
            houseRoom: params.houseRoom || -1,
            keyWords: params.keyWords
        }
    }).then(response => {
        let data = response.data;
        params.callback && params.callback.call(this, data);
    });
}

/**
 * 恢复或删除企业方案回收站方案
 * @author liuxiaoyi
 * 2018-05-04
 * @param {Object} params 
 * {
 * gid: 要删除或者恢复的企业方案gid,删除的时候gid是企业方案gid,恢复的时候是回收站的方案gid，
 * isDel: 操作类型,删除还是恢复,0.恢复,1.删除,
 * type: 操作方案库类型,3：企业方案 1：我的方案  
 * schemeType: 操作方案类型 1.我创建的方案 3.我接收的方案
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const recoverOrDeleteMerchantScheme = function (params = { gid: "", isDel: "", type: 1, schemeType: 1, callback: "" }) {
    let url = "";
    if (params.type == 3) {
        url = `/frontAjax/optDeleteMerchantSchemeAction.action`;
    } else {
        url = `/frontAjax/memberDeleteMemberSchemeAction.action`;
    }
    Request.get(url, {
        params: {
            gid: params.gid,
            isDel: params.isDel,
            schemeType: params.schemeType
        }
    }).then(response => {
        let data = response.data;
        if (data.code === 1000) {
            params.callback && params.callback.call(this, data);
        } else {
            jBox.remove("#shareLoad", {}, function () {
                jBox.error("没有权限，请联系管理员！");
            });
            return false;
        }
    });
}

/**
 * 分享方案
 * @author xag
 * 2018-05-04
 * @param {Object} params 
 * {
 * gid: 方案GID，
 * shareMemberInfoLoginName: 分享目标会员登陆名(手机号),
 * schemeType: 原始方案类型  1.我的方案  2.接收的方案 3.企业方案,
 * memberType: 会员类型 1.普通会员类型 2.企业会员类型,
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const shareScheme = function (params = { gid: "", shareMemberInfoLoginName: "", schemeType: "", memberType: "", callback: "" },
    url = `/frontAjax/memberShareMemberShareSchemeInfo.action`) {
    Request.get(url, {
        params: {
            gid: params.gid,
            shareMemberInfoLoginName: params.shareMemberInfoLoginName,
            schemeType: params.schemeType,
            memberType: params.memberType
        }
    }).then(response => {
        let data = response.data;
        switch (data.code) {
            case 1000:
                jBox.remove("#shareLoad", {}, function () {
                    jBox.success("分享成功！", {
                        closeFun: function () {
                            params.callback && params.callback.call(this, data);
                        }
                    })
                });
            case 1018:
                jBox.remove("#shareLoad", {}, function () {
                    jBox.error("分享失败，该账号不存在！");
                });
                break;
            default:
                jBox.remove("#shareLoad", {}, function () {
                    jBox.error("分享失败，请联系管理员！");
                });
                break;
        }
    });
}

/**
 * 获取方案详情
 * @author liuxiaoyi
 * 2018-05-04
 * @param {Object} params 
 * {
 * gid: 方案GID，
 * type: 方案类型: 1.我的方案, 2.公共方案, 3.接收到的方案.4.企业方案,
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const getSchemeDetail = function (params = { gid: "", type: "", callback: "" },
    url = `/frontAjax/memberQuerySchemeDetailAction.action`) {
    Request.get(url, {
        params: {
            gid: params.gid,
            type: params.type
        }
    }).then(response => {
        let data = response.data;
        if (data.code === 1000) {
            params.callback && params.callback.call(this, data);
        }
    });
}

/**
 * 下载文件到本地
 * @author liuxiaoyi
 * 2018-05-07
 * @param {Object} params 
 * {
 * files: [
 *     {
 *        url: 文件下载地址,
 *        fileName：文件名,
 *        option: 请求设置,eg: { responseType: 'arraybuffer' } 
 *     }
 * ],
 * callback: 回调
 * }
 */
export const downloadFiles = function (params = { files: [], callback: "" }) {
    let downloadFile = function (n, files) {
        if (n > files.length - 1) {
            params.callback && params.callback.call(this, result);
        } else {
            let opt = files[n].option && files[n].option != undefined ? files[n].option : {}
            axios.get(files[n].url, opt).then(response => {
                result[files[n].fileName] = response;
                downloadFile(++n, files);
            });
        }
    }
    let result = {};
    downloadFile(0, params.files);
}

///////////////////////////////////////////////////////////////////////户型库接口///////////////////////////////////////////////////////////////////////

/**
 * 查询合作楼盘
 * @author liuxiaoyi
 * 2018-05-08
 * @param {Object} params 
 * {
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const getRecommendPremises = function (params = { callback: "" }, url = `/frontAjax/queryConfigPremisesRecommend.action`) {
    Request.get(url, {}).then(response => {
        let data = response.data;
        if (data.code === 1000) {
            params.callback && params.callback.call(this, data);
        }
    });
}

/**
 * 查询城市列表
 * @author liuxiaoyi
 * 2018-05-08
 * @param {Object} params 
 * {
 * parentCode: 城市编码(注意: 初次进入时,该值传0 ,查询的是所有的省份)
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const getCityList = function (params = { parentCode: "", callback: "" }, url = `/frontDesginAjax/findCityByCode.action`) {
    Request.get(url, {
        params: {
            parentCode: params.parentCode
        }
    }).then(response => {
        let data = response.data;
        if (data.code === 1000) {
            params.callback && params.callback.call(this, data);
        }
    });
}

/**
 * 公共户型库列表查询
 * @author liuxiaoyi
 * 2018-05-08
 * @param {Object} params 
 * {
 * curPage: 当前页
 * keyWord: 搜索关键字
 * cityCode: 城市编码(对应查询城市列表接口返回的cityCode字段, 可以为空)
 * parentCityCode: 父级城市编码(对应查询城市列表接口返回的parentCode字段, 查询全国时传空)
 * houseRoom: 面积(默认-1,50m2以下 传值1;50-80m2传值2;80-100m2传值3;100-130m2传值4;130m2以上传值5)
 * floorAreaStr: 户型(默认-1,1\2\3\4 对应 一室\二室\三室\四室 ,其他对应0)
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const getHouseTypeList = function (params = {
    curPage: 1, keyWord: "", cityCode: "", parentCityCode: "", houseRoom: -1, floorAreaStr: -1, callback: ""
}, url = `/frontAjax/memberQueryHouseTypeListAction.action`) {
    Request.get(url, {
        params: {
            keywords: params.keywords,
            curPage: params.curPage,
            pageSize: 8,
            cityCode: params.cityCode,
            parentCityCode: params.parentCityCode,
            floorAreaStr: params.floorAreaStr,
            houseRoom: params.houseRoom
        }
    }).then(response => {
        let data = response.data;
        if (data.code === 1000) {
            params.callback && params.callback.call(this, data);
        }
    });
}

/**
 * 查询户型详情和相关方案列表
 * @author liuxiaoyi
 * 2018-05-08
 * @param {Object} params 
 * {
 * curPage: 当前页,
 * gid: 户型对应gid,
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const getHouseTypeDetail = function (params = { curPage: 1, gid: "", callback: "" }, url = `/frontAjax/memberQueryHouseTypeDetailsAction.action`) {
    Request.get(url, {
        params: {
            curPage: params.curPage,
            pageSize: 8,
            gid: params.gid
        }
    }).then(response => {
        if (response.data && response.data.code === 1000) {
            params.callback && params.callback.call(this, response.data);
        }
    });
}

///////////////////////////////////////////////////////////////////////开始设计接口///////////////////////////////////////////////////////////////////////

/**
 * 获取模型列表
 * @author liuxiaoyi
 * 2018-05-08
 * @param {Object} params 
 * {
 * curPage: 当前页,
 * parentTypeGid: 模型分类父级GID,
 * typeGid: 模型分类子级GID,
 * keyWords: 搜索关键字,
 * type: 列表类型(1: 公共库, 2: 品牌库)
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const getModelList = function (params = {
    curPage: 1, parentTypeGid: "", typeGid: "", keyWords: "", type: 1, callback: ""
}) {
    let url;
    switch (params.schemeType) {
        case 1:
            url = `/frontDesginAjax/desginQueryPublicBaseModelInfoList.action`;
            break;
        case 2:
            url = `/frontDesginAjax/desginQuerySpreadBaseModelInfoList.action`;
            break;
    }

    Request.get(url, {
        params: {
            curPage: params.curPage,
            pageSize: 10,
            parentTypeGid: params.parentTypeGid,
            typeGid: params.typeGid,
            keyWords: params.keyWords
        }
    }).then(response => {
        if (response.data && response.data.code === 1000) {
            params.callback && params.callback.call(this, response.data);
        }
    });
}

/**
 * 保存/另存/更新 方案
 * @author virgoheRomAn
 * 2018-05-015
 * @param {Object} options {saveType:'create'/'saveAs'/'update', params:保存需要参数, callback:成功回调, eCallback:错误回调}
 * params {
    * gid: 更新时候方案gid,
    * sourceGid: 另存方案源的GID,
    * sourceType: 另存来源方案类型, 1.自己的方案, 2.公共方案. 3.分享的方案，4.企业方案,
    * schemeName: 方案名称, 
    * cityCode: 城市编码, 
    * configPremisesInfoGid: 楼盘GID(注意: 当找不到楼盘的时候,就传楼盘名称),
    * configPremisesName: 楼盘名称,
    * houseTypeName: 户型名称,
    * houseRoom: 几室,
    * houseLiving: 几厅, 
    * floorArea: 地面积, 
    * topArea: 顶面积,
    * wallArea: 墙面积,
    * schemeDesignImageFileGid: 方案展示2D图片,
    * houseTypeGid: 户型来源GID(可选，户型库进入2D保存必须传),
    * houseTypeFileGid: 户型文件GID,
    * modelFileGid: 模型文件GID
 * }
 */
export const saveMemberScheme = (options) => {
    let opt = options.params;
    let url = "", params = {
        schemeName: encodeURI(opt.schemeName),
        cityCode: Number.parseInt(opt.cityCode),
        configPremisesInfoGid: Number.parseInt(opt.configPremisesInfoGid),
        configPremisesName: encodeURI(opt.configPremisesName),
        houseTypeName: encodeURI(opt.houseTypeName),
        houseRoom: Number.parseInt(opt.houseRoom),
        houseLiving: Number.parseInt(opt.houseLiving),
        floorArea: opt.floorArea,
        topArea: opt.topArea,
        wallArea: opt.wallArea,
        schemeDesignImageFileGid: opt.schemeDesignImageFileGid,
        houseTypeFileGid: opt.houseTypeFileGid,
        modelFileGid: opt.modelFileGid,
        patchFileGid: opt.patternFileGid
    };
    switch (options.saveType) {
        //保存
        case "create":
            url = G.sourceType === 4 ? "/frontAjax/optCreateMerchantSchemeAction.action" : `/frontAjax/memberCreateMemberSchemeAction.action`;
            Object.assign(params, {
                houseTypeGid: opt.houseTypeGid
            });
            break;
        case "saveAs":
            url = `/frontDesginAjax/createMemberSchemeSaveAs.action`;
            Object.assign(params, {
                sourceType: opt.sourceType,
                sourceGid: opt.sourceGid
            });
            break;
        case "update":
            url = G.sourceType === 4 ? `/frontAjax/optUpdateMerchantSchemeAction.action` : `/frontAjax/memberUpdateMemberSchemeAction.action`;
            Object.assign(params, {
                gid: opt.gid
            });
            break;
    }

    Request.get(url, {
        params: params
    }).then(response => {
        let data = response.data;
        if (data.code === 1000) {
            options.callback && options.callback.call(this, data);
        } else {
            options.eCallback && options.eCallback.call(this, data);
        }
    });
};

///////////////////////////////////////////////////////////////////////开始设计(3D)///////////////////////////////////////////////////////////////////////

/**
 * 获取模型编组列表
 * @author liuxiaoyi
 * 2018-05-08
 * @param {Object} params 
 * {
 * curPage: 当前页,
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const getModelGroupList = function (params = { curPage: 1, callback: "" }, url = `/frontAjax/memberQueryMemberModelGroupList.action`) {
    Request.get(url, {
        params: {
            curPage: params.curPage,
            pageSize: 4
        }
    }).then(response => {
        if (response.data && response.data.code === 1000) {
            params.callback && params.callback.call(this, response.data);
        }
    });
}

/**
 * 删除模型编组信息
 * @author liuxiaoyi
 * 2018-05-08
 * @param {Object} params 
 * {
 * gid: 模型编组GID,
 * callback: 回调
 * }
 * @param {string} url 请求地址
 */
export const deleteMemberModelGroup = function (params = { gid: "", callback: "" }, url = `/frontAjax/memberDeleteMemberModelGroup.action`) {
    Request.get(url, {
        params: {
            gid: params.gid
        }
    }).then(response => {
        if (response.data && response.data.code === 1000) {
            params.callback && params.callback.call(this, response.data);
        }
    });
}

/**
 * 获取楼盘信息
 * @author virgoheRomAn
 * 2018/05/08
 * @param {Object} params {cityCode: 城市Code, premisesName: 楼盘名称, callback: 回调函数}
 * @param {String} url 
 */
export const getBuildInfor = (params, url = `/frontAjax/queryListLikePremisesName.action`) => {
    Request.get(url, {
        params: {
            cityCode: params.cityCode,
            premisesName: params.premisesName || ""
        }
    }).then((resp) => {
        let data = resp.data;
        if (data.code === 1000) {
            params.callback && params.callback.call(this, data);
        } else {
            params.callback && params.callback.call(this, data);
        }
    })
}

/**
 * 输出集合
 */
export default {
    getLoginState,
    getConfigInfor,
    getBuildInfor,
    registerMemberInfo,
    getRegisterPhoneCode,
    saveDataTransfer,
    getForgetPhoneCode,
    forgetLoginPwd,
    customizedInfo,
    getDesignTopImageByModelGidStr,

    getSchemeList,
    recoverOrDeleteMerchantScheme,
    shareScheme,
    getSchemeDetail,
    downloadFiles,

    getRecommendPremises,
    getCityList,
    getHouseTypeList,
    getHouseTypeDetail,

    getModelList,
    saveMemberScheme,
    getModelGroupList,
    deleteMemberModelGroup
}