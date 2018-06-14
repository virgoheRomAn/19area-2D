import $ from "jquery";
import Request from "../../../config/Request";
import axios from 'axios';
import { svgAsDataUri, svgAsPngUri } from 'save-svg-as-png';

let verifyExp = {
    telephone: /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/,
    strengthA: {
        number: /^[0-9]+$/,
        letterCaps: /^[A-Z]+$/,
        letterLows: /^[a-z]+$/,
        symbol: /^\W+$/
    },
    strengthB: {
        numLetterA: /^(([0-9]+[a-z]+)|([a-z]+[0-9]+))[0-9a-z]*$/,
        numLetterB: /^(([0-9]+[A-Z]+)|([A-Z]+[0-9]+))[0-9A-Z]*$/,
        numSymbol: /^((\W+[0-9]+)|([0-9]+\W+))[\W0-9]*$/,
        LetterALetterB: /^(([A-Z]+[a-z]+)|([a-z]+[A-Z]+))[A-Za-z]*$/,
        LetterASymbol: /^((\W+[a-z]+)|([a-z]+\W+))[\Wa-z]*$/,
        LetterBSymbol: /^((\W+[A-Z]+)|([A-Z]+\W+))[\WA-Z]*$/
    }
};


let _countDown_timer_ = 0;
/**
 * 倒计时
 * @param {string} dom 选择的DOM元素
 * @param {number} time 倒计时时间
 * @param {string} format 时间后面跟随的字符
 * @param {function} finishFun 结束函数回调
 * @param {function} countFun 倒计时函数回调
 */
export const countDown = function (dom, time, format, finishFun, countFun) {
    clearInterval(_countDown_timer_);
    var that = this;
    var _times = !time ? 120 : time;
    var $this = $(dom);
    $this.text(padZero(_times, 2) + format[1]).addClass("active");
    _countDown_timer_ = setInterval(function () {
        countFun && countFun.call(dom, _times);
        _times--;
        if (_times == 0) {
            $this.text(format[0]).removeClass("active");
            clearInterval(_countDown_timer_);
            finishFun && finishFun.call($this);
        } else {
            $this.text(padZero(_times, 2) + format[1]).addClass("active");
        }
    }, 1000);

    that.stopTimeFun = function () {
        clearInterval(_countDown_timer_);
        $this.text(format[0]).removeClass("active");
        finishFun && finishFun.call($this);
    }
};

/**
 * 验证手机号码
 * @param {string} val 
 * @returns {number} 0-空，1-大于11位，2-验证通过，3-格式不对
 */
export const verifyPhone = function (val) {
    var _length = val.length;
    if (_length == 0) return 0;
    if (_length > 11) return 1;
    if (eval(verifyExp.telephone).test(val)) {
        return 2;
    } else {
        return 3;
    }
};

/**
 * 验证密码强度
 * @param {string} val 
 * @param {object} options 
 */
export const verifyPassword = function (val, options) {
    var defaults = {
        isSimple: true,    //开启简单密码检验
        isCaps: true,  //开启键盘大写验证
        isShift: false,   //开启Shift按键验证
        showTag: true, //开启小tag提示
        minLength: 6,
        simpleLength: 6,
        strongLength: 12,
        nullText: "密码不能为空！",
        lengthLess: "密码不能小于6位！",
        successText: "设置密码成功！",
        capsText: "注意：键盘大写锁定已打开，请注意大小写！",
        shiftText: "注意：您按住了Shift键",
        psdSimple: "密码太简单，有被盗风险，请换复杂的密码组合！"
    };
    var opt = $.extend({}, defaults, options);
    var l = val.toString().length;
    var resultOPT = {};
    if (l == 0) {
        resultOPT.type = 0;
        resultOPT.text = opt.nullText;
    } else if (l < opt.minLength) {
        resultOPT.type = 0;
        resultOPT.text = opt.lengthLess;
    } else {
        if (eval(FB.verifyExp.strengthA.number).test(val) || eval(FB.verifyExp.strengthA.letterCaps).test(val) || eval(FB.verifyExp.strengthA.letterLows).test(val) || eval(FB.verifyExp.strengthA.symbol).test(val)) {
            //弱
            if (!opt.isSimple) {
                resultOPT.type = 1;
                resultOPT.text = opt.successText;
            } else {
                //等于简单长度
                if (l == opt.simpleLength) {
                    resultOPT.type = 0;
                    resultOPT.text = opt.psdSimple;
                } else {
                    resultOPT.type = 1;
                    resultOPT.text = opt.successText;
                }
            }
        } else if (eval(FB.verifyExp.strengthB.numLetterA).test(val) || eval(FB.verifyExp.strengthB.numLetterB).test(val) || eval(FB.verifyExp.strengthB.numSymbol).test(val) || eval(FB.verifyExp.strengthB.LetterALetterB).test(val) || eval(FB.verifyExp.strengthB.LetterASymbol).test(val) || eval(FB.verifyExp.strengthB.LetterBSymbol).test(val)) {
            if (l == opt.strongLength) {
                //强
                resultOPT.type = 3;
                resultOPT.text = opt.successText;
            } else {
                //中
                resultOPT.type = 2;
                resultOPT.text = opt.successText;
            }
        } else {
            //强
            resultOPT.type = 3;
            resultOPT.text = opt.successText;
        }
    }
    //回调
    resultOPT.options = opt;
    return resultOPT;
};

/**
 * 滑动切换显示
 * @param ele   出发元素
 * @param tag   响应元素
 * @param animate   切换动画（可以是函数）
 */
export const hoverShowFun = function (ele, tag, animate) {
    var $win = $(window);
    var _ele = !ele ? ".fn-hover-bar" : ele;
    var _tag = !tag ? ".fn-hover-menu" : tag;
    $(_ele).hover(function (e) {
        var $tag = $(this).addClass("active").children(_tag);
        // e.stopPropagation();
        if (!animate) $tag.show();
        else {
            if (animate.show) animate.show.call($tag[0]);
            else $tag.show();
        }

        $(this).parents(".fn-hover-box").css({
            "position": "relative",
            "z-index": "9999"
        });

        var left = $tag.length != 0 && $tag.offset().left;
        var width = $tag.length != 0 && $tag.outerWidth(true);

        if (left <= 0) {
            if ($(this).offset().left !== 0) {
                $tag.css({
                    left: "0",
                    marginLeft: -$(this).offset().left,
                    right: "auto"
                });
            } else {
                $tag.css({
                    left: "0",
                    marginLeft: "0",
                    right: "auto"
                });
            }
            return false;
        }
        if (left + width >= $win.width()) {
            $tag.css({
                left: "auto",
                right: "0",
                marginRight: "0"
            });
            return false;
        }
    }, function (e) {
        var $tag = $(this).removeClass("active").children(_tag);
        // e.stopPropagation();
        if (!animate) $tag.hide();
        else {
            if (animate.hide) animate.hide.call($tag[0]);
            else $tag.hide();
        }
        $tag.removeAttr("style");
        $(this).parents(".fn-hover-box").removeAttr("style");
    });
};

/**
 * Tab选项卡切换
 * @param {objeect} option 
 */
export const tabChangFun = function (option) {
    var defaults = {
        tab: ".fb-tab-box",
        nav: ".tab-nav",
        content: ".tab-cont",
        animate: "classAni",
        changeCallback: null
    };
    var opt = $.extend({}, defaults, option);
    var $tab = $(opt.tab),
        $nav = $tab.find(opt.nav);
    $nav.find("li").click(function (e) {
        var evt = e || window.event;
        evt.preventDefault();
        var href = $(this).find("a").attr("href");
        $(this).addClass("active").siblings().removeClass("active");
        if (opt.animate === "classAni") {
            $(href).addClass("active").siblings().removeClass("active");
        } else if (opt.animate === "showHide") {
            $(href).show().siblings().hide();
        }
        opt.changeCallback && opt.changeCallback.call(this, href);
    });
};


/**
 * 模拟下拉列表
 * @param ele
 * @param options
 */
export const selectBar = function (options) {
    var that = this;
    var defaults = {
        ele: ".fb-select-bar",
        cls: "fb-select-bar",
        width: "auto",
        body: false
    };
    var opt = $.extend({}, defaults, options);
    var cls = opt.cls;
    var $ele = $(opt.ele);
    var $select = $ele.find("select");
    var str = "", l = $select.find("option").length;
    for (var i = 0; i < l; i++) {
        str += '<li><a data-val="' + $select.find("option").eq(i).val() + '">' + $select.find("option").eq(i).text() + '</a></li>';
    }

    if (!opt.body) {
        $ele.addClass(cls).append(`
            <label class="text def">${$select.find("option:selected").text()}</label>
            <b class="fb-arrow-dir down"></b>
            <div class="list"><ul></ul></div>         
        `);
        $ele.find("label.text").data("val", $select.find("option:selected").val());
        $ele.find(".list").width(opt.width.toString().toLowerCase() !== "auto" ? opt.width : $ele.outerWidth(true) + 30).find("ul").append(str).hide();
        $select.hide();
        opt.renderCallback && opt.renderCallback.call($ele);
    } else {
        $ele.addClass(cls).append(`
            <label class="text def">${$select.find("option:selected").text()}</label>
            <b class="fb-arrow-dir down"></b>
        `);
        $ele.find("label.text").data("val", $select.find("option:selected").val());
        $(document.body).append(`<div class="list fb-select-list ${$ele.data("list")}"><ul></ul></div>`);
        var $list = $("." + $ele.data("list"));
        $list.width(opt.width.toString().toLowerCase() !== "auto" ? opt.width : $select.outerWidth(true) + 30).find("ul").append(str).hide();
        $select.hide();
        $list.css({ "top": $ele.offset().top + $ele.outerHeight(true) + 5, "left": $ele.offset().left });
        opt.renderCallback && opt.renderCallback.call($ele);
        onResize($list, $ele);
    }


    $ele.click(function (e) {
        var evt = e || window.event;
        evt.stopPropagation();
        $(".fb-select-bar .list ul").not($(this).find(".list ul")[0]).removeClass("active").hide();
        if (!opt.body) {
            $ele.find(".list ul").toggleClass("active").toggle();
        } else {
            $("." + $ele.data("list")).find("ul").toggleClass("active").toggle();
        }
    });

    function onResize($list, $ele) {
        $(window).resize(function () {
            $list.css({ "top": $ele.offset().top + $ele.outerHeight(true) + 5, "left": $ele.offset().left });
        });
    }

    $select.click(function (e) {
        var evt = e || window.event;
        evt.stopPropagation();
    });

    $(document).on("click", function (e) {
        var evt = e || window.event;
        evt.stopPropagation();
        var $target = $(evt.target);

        if (!$target.hasClass(cls) && !$target.parents("." + cls).hasClass(cls)) {
            if (!opt.body) {
                $ele.find(".list ul").removeClass("active").hide();
            } else {
                $("." + $ele.data("list")).find("ul").removeClass("active").hide();
            }
        }
    });

    that.refreshFun = function (ele, list) {
        var $ele = $(ele);
        $(list).css({
            "top": $ele.offset().top + $ele.outerHeight(true) + 5,
            "left": $ele.offset().left,
            "width": $ele.find("select").outerWidth(true) + 30
        });
    };

    that.refreshListFun = function (select, ul) {
        select.parent().find(".text").text(select.find("option:selected").length === 0 ? select.find("option").eq(0).text() : select.find("option:selected").text());
        select.parent().find(".text").data("val", select.find("option:selected").length === 0 ? select.find("option").eq(0).val() : select.find("option:selected").val());
        var str = "";
        for (var i = 0; i < select.find("option").length; i++) {
            str += '<li><a data-val="' + select.find("option").eq(i).val() + '">' + select.find("option").eq(i).text() + '</a></li>';
        }
        ul.empty().append(str);
        selectItem(select.parent());
    };

    function selectItem($ele) {
        if (!opt.body) {
            $ele.find(".list li").click(function (e) {
                var evt = e || window.event;
                evt.stopPropagation();
                $(this).index() == 0 ? $ele.find(".text").addClass("def") : $ele.find(".text").removeClass("def");
                $ele.find(".text").text($(this).text()).data("val", $(this).find("a").data("val"));
                $ele.find(".list ul").removeClass("active").hide();
                if (opt.selectCallback) opt.selectCallback.call(this, $(this).text(), $(this).find("a").data("val"));
            });
        } else {
            $("." + $ele.data("list")).find("ul li").click(function (e) {
                var evt = e || window.event;
                evt.stopPropagation();
                $(this).index() == 0 ? $ele.find(".text").addClass("def") : $ele.find(".text").removeClass("def");
                $ele.find(".text").text($(this).text()).data("val", $(this).find("a").data("val"));
                $(this).parents("ul").removeClass("active").hide();
                that.refresh($ele, $("." + $ele.data("list")));
                if (opt.selectCallback) opt.selectCallback.call(this, $(this).text(), $(this).find("a").data("val"));
            });
        }
    }

    selectItem($ele);

    return {
        refresh: function (ele, list) {
            that.refreshFun(ele, list);
        },
        refreshList: function (select, ul) {
            that.refreshListFun(select, ul);
        },
        destroy: function () {
            $ele.off("click");
            $ele.find("label.text").remove();
            $ele.find(".list").remove();
            $ele.find("b.fb-arrow-dir").remove();
        },
        close: function (list) {
            $(list).removeClass("active").hide();
        }
    }
};


/**
 * 登录成功/注册成功之后  修改登录信息
 */

export const loginSatus = function (callback) {
    Request.get('/frontDesginAjax/desginQueryConfigSystemInfo.action').then((data) => {
        if (data.data.code === 1000) {
            let { configModelTypeList, memberInfo, configCityList } = data.data;

            //老版
            let configModelTypeListHtml = $(".aside_wrap>.aside_item_left>ul").html();
            if (!configModelTypeListHtml) window.EM.emit("loadTypeList", configModelTypeList);
            window.EM.emit("loadMemberInfo", memberInfo || {});
            window.EM.emit("loadCityList", configCityList);
            window.EM.emit("buildingLocation");

            //新版
            //获取左侧操作菜单信息和品牌信息
            window.EM.emit("getLeftMenuDate", configModelTypeList);
            //获取城市列表
            window.EM.emit("getCityList", configCityList);

            //如果启动参数有schemeNo就打开，没有就新建
            if (!!window.BootParams['--schemeNo']) {
                //TODO detail 

                Request.get('/frontAjax/memberQuerySchemeDetailAction.action', {
                    params: {
                        gid: window.BootParams['--projectid'],
                        memberGid: window.BootParams['--memberGid'],
                        token: window.BootParams['--token'],
                        type: window.BootParams['--projectType']
                    }
                }).then((resp) => {
                    if (resp && resp.data && resp.data.code === 1000) {
                        let item = resp.data.memberScheme;
                        let houseFileName = `${window.BootParams['--schemeNo']}_House`;
                        let modelFileName = `${window.BootParams['--schemeNo']}_Model`;

                        window.Native.getProjectAsId(window.BootParams['--projectid'], houseFileName, (project) => {
                            let houseProject = project;
                            window.Native.getProjectAsId(window.BootParams['--projectid'], modelFileName, (project) => {
                                if (!project) {
                                    project = {};
                                }
                                !!item.schemeImageFilePath ? window.imagePath = item.schemeImageFilePath : window.imagePath = require('../../../images/threedbg.png');
                                
                                project.areaName = item.areaName;
                                project.id = item.gid;
                                project.projectName = item.schemeName;
                                project.schemeNo = item.schemeNo;
                                project.areaName = item.houseTypeName;
                                project.createTimeStr = item.createTimeStr;
                                window.provinceCode = item.provinceCode;
                                window.cityCode = item.cityCode;
                                window.housesGid = item.configPremisesInfoGid;
                                window.h_value = item.configPremisesName;
                                window.houseTypeName = item.houseTypeName;
                                (!!item.houseRoom || item.houseRoom == 0) ? window.houseRoom = item.houseRoom + "室" : window.houseRoom = "室";
                                (!!item.houseLiving || item.houseLiving == 0) ? window.houseLiving = item.houseLiving + "厅" : window.houseLiving = "厅";
                                window.provinceName = item.provinceName;
                                window.cityName = item.cityName;
                                window.schemeName = item.schemeName;
                                window.preceptName = item.schemeName;

                                Object.assign(project, houseProject);

                                window.EM.emit("bootOpenProject", project);
                                window.isChosed = true;
                                let houseTypeFileNameDown = `${item.schemeNo}_House`;
                                let modelFileNameDown = `${item.schemeNo}_Model`;

                                if (!!window.DownLoad) {
                                    Native.getProjectAsId(item.gid, item.schemeNo, (project) => {
                                        //每次都重新下载项目文件 20170817
                                        if (true || !!!project) {
                                            axios.get(item.schemeHouseTypeDataFile + '?t=' + Date.now()).then((resp) => {
                                                if (!resp.data) {
                                                    message.error("项目文件不存在");
                                                    return;
                                                }

                                                let houseTypeProject = resp.data;
                                                project = houseTypeProject;
                                                project.id = item.gid;
                                                project.schemeNo = item.schemeNo;


                                                Native.saveProject(project, houseTypeFileNameDown, () => {
                                                    axios.get(item.schemeModelDataFile + '?t=' + Date.now()).then((resp) => {
                                                        if (!resp.data) {
                                                            message.error("项目文件不存在");
                                                            return;
                                                        }
                                                        Object.assign(project, resp.data, houseTypeProject);
                                                        !!project.fms ? window.xwmObj.fms = project.fms : window.xwmObj.fms = [];
                                                        !!project.wbs ? window.xwmObj.wbs = project.wbs : window.xwmObj.wbs = [];
                                                        !!project.wms ? window.xwmObj.wms = project.wms : window.xwmObj.wms = [];

                                                        Native.saveProject(resp.data, modelFileNameDown, () => {
                                                            Native.getProjectAsId(item.gid, houseTypeFileNameDown, (houseTypeProject) => {
                                                                Object.assign(houseTypeProject, project)
                                                                window.EM.emit("openProject", houseTypeProject, () => {
                                                                    window.EM.emit("bootOpenProject", houseTypeProject);
                                                                    window.isChosed = true;
                                                                    //如果存在启动拼花参数（3D直接启动到拼花）
                                                                    if (window.BootParams['--patternId']) {
                                                                        window.EM.emit("bootOpenProjectPattren", {
                                                                            bind_id: window.BootParams['--patternId'],
                                                                            side: window.BootParams['--side'],
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        }, true);
                                                    })
                                                });
                                            });
                                        }
                                    })
                                    // 是否有拼花文件
                                    if (item.schemePatchDataFile) {
                                        //创建文件夹
                                        window.Native.addSvgFile(item.schemeNo, () => {
                                            //保存zip到本地文件
                                            window.Native.saveZip(item.schemePatchDataFile, item.schemeNo, (files) => {
                                                //解压zip
                                                window.Native.unzip(item.schemeNo, function (files) {
                                                    //删除zip文件
                                                    window.Native.delFile(`${item.schemeNo}.zip`, item.schemeNo);
                                                    files.forEach((file) => {
                                                        let suffix = file.split(".")[file.split(".").length - 1];
                                                        if (suffix == "svg") {
                                                            //读取svg text
                                                            window.Native.readSvg(file, item.schemeNo, (text) => {
                                                                let el_temp = document.createElement("div");
                                                                try {
                                                                    el_temp.innerHTML = text;
                                                                    //.svg另存为png
                                                                    let param;
                                                                    try {
                                                                        let paramStr = decodeURIComponent(el_temp.childNodes[0].getAttribute("data-param"));
                                                                        param = JSON.parse(paramStr);
                                                                    } catch (e) {
                                                                        let viewBox = el_temp.childNodes[0].getAttribute("viewBox");
                                                                        let box = viewBox.split(" ");
                                                                        params = {
                                                                            left: Number.parseFloat(box[0]),
                                                                            top: Number.parseFloat(box[1]),
                                                                            width: Number.parseFloat(box[2]) - Number.parseFloat(box[0]),
                                                                            height: Number.parseFloat(box[3]) - Number.parseFloat(box[1]),
                                                                            scale: .5
                                                                        }
                                                                    }
                                                                    svgAsPngUri(el_temp.childNodes[0], param, (uri) => {
                                                                        let img = Native.dataURLtoBlob(uri);
                                                                        console.log(img);
                                                                        Native.saveSvgToImg({
                                                                            file: img,
                                                                            svgText: text,
                                                                            schemeNo: item.schemeNo,
                                                                            fileName: file.replace("svg", "png"),
                                                                            callback: (url) => {
                                                                                //png保存后删除svg文件
                                                                                //window.Native.delFile(file, item.schemeNo);
                                                                            }
                                                                        });
                                                                    });
                                                                } catch (error) {
                                                                    console.log(error);
                                                                }
                                                            });
                                                        }
                                                    });
                                                });
                                            });
                                            //下载zip文件到本地
                                            // axios.get(item.schemePatchDataFile, { responseType: 'arraybuffer' }).then((resp) => {
                                            //     if (!resp.data) {
                                            //         message.error("项目文件不存在");
                                            //         return;
                                            //     }
                                            //     console.log(resp);
                                            //     let imgBase64 = btoa(new Uint8Array(resp.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                                            //     console.log(item.schemePatchDataFile);
                                            // });
                                        });
                                    }
                                } else {
                                    project.schemeNo = item.schemeNo;
                                    !!project.fms ? window.xwmObj.fms = project.fms : window.xwmObj.fms = [];
                                    !!project.wbs ? window.xwmObj.wbs = project.wbs : window.xwmObj.wbs = [];
                                    !!project.wms ? window.xwmObj.wms = project.wms : window.xwmObj.wms = [];
                                    window.EM.emit("openProject", project, () => {
                                        window.EM.emit("bootOpenProject", project);
                                        window.isChosed = true;
                                        //如果存在启动拼花参数（3D直接启动到拼花）
                                        if (window.BootParams['--patternId']) {
                                            window.EM.emit("bootOpenProjectPattren", {
                                                bind_id: window.BootParams['--patternId'],
                                                side: window.BootParams['--side'],
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }
                })
            } else {
                window.EM.emit("openProject", {});
            }

            callback && callback.call();
        }
    });
}
//公共输出方法
export const commonFuns = function () {
    //显示隐藏清除按钮
    $(".clean > input").focus(function () {
        if (!$(this).attr("readonly")) {
            $(this).next().show();
            $(this).parent().removeClass("error");
        }
    }).blur(function () {
        if (!$(this).val()) {
            $(this).next().hide();
        }
    });

    //清除内容
    $(".clean-btn").each(function () {
        clearText(this, $(this).prev());
    });

    //选中
    formCheckbox(".fb-check-box");
};


/**
 *清楚输入框文字
 * @param tag   点击目标
 * @param clearBox  清楚对象
 * @param type  阻止默认
 */
function clearText(tag, clearBox, type) {
    $(tag).click(function () {
        if (clearBox[0].nodeName.toLowerCase() == "input" || clearBox[0].nodeName.toLowerCase() == "textarea") {
            clearBox.val("");
        } else {
            clearBox.html("");
        }
        if (!type) {
            clearBox.keyup();
            clearBox.blur();
            $(this).hide();
        }
    });
    if (!type) {
        $(tag)[0].onmousedown = function (e) {
            var event = e || window.event;
            if (document.all) {
                event.returnValue = false;
            } else {
                event.preventDefault();
            }
        };
    }
}

/**
 * 自定义复选框
 * @param {string} ele 
 * @param {function} callback 
 */
function formCheckbox(ele, callback) {
    var _ele = ele || ".fb-radio-box";
    $(document).on("click", _ele + " input", function (e) {
        e.stopPropagation();
        var that = this;
        $(that).parents(_ele).toggleClass("active");
        if ($(that).parents(_ele).hasClass("active")) {
            $(that).prop("checked", true);
        } else {
            $(that).prop("checked", false);
        }
        if (callback) callback.call($(_ele)[0], $(_ele).find("input").prop("checked"), $(_ele).hasClass("active"));
    });
}

/**
 * 补零
 * @param num 补零的数字
 * @param n 补零的位数
 * @returns {string}   补零之后的字符
 */
function padZero(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

export default {
    verifyPhone,
    verifyPassword,
    countDown,
    hoverShowFun,
    tabChangFun,
    selectBar,
    commonFuns,
    loginSatus
}