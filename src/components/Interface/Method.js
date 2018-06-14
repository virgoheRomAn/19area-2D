import $ from "jquery";
import Load from "../Plugins/loading/LoadingData";
import { svgAsDataUri, svgAsPngUri } from 'save-svg-as-png';
import Module from "../Interface/Module";

let verifyExp = {
    telephone: /^(1[0-9]{10})$/,
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

/**
 * 补零
 * @param num 补零的数字
 * @param n 补零的位数
 * @returns {string}   补零之后的字符
 */
export const padZero = function (num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

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
 * 方案库/户型库 进入2D
 * @author xag
 * 2018.5.21
 * @param gid 方案id
 * @param type  方案类型 1.我的方案, 2.公共方案, 3.分享给我的方案，4.企业方案
 */
export const build2D = function (gid, type, callBack) {
    Load.show("加载中...", "", "", "mySchemeLoad");
    Module.getSchemeDetail({
        gid: gid,
        type: type,
        callback: (data) => {
            spellingFlower(data.memberScheme, () => {
                Object.assign(G.currentScheme, data.memberScheme);
                //户型文件名
                let houseFileName = `${G.currentScheme.schemeNo}_House`;
                //模型文件名
                let modelFileName = `${G.currentScheme.schemeNo}_Model`;
                let files = [{
                    url: data.memberScheme.schemeHouseTypeDataFile + '?t=' + Date.now(),
                    fileName: houseFileName
                }, {
                    url: data.memberScheme.schemeModelDataFile + '?t=' + Date.now(),
                    fileName: modelFileName
                }];
                Module.downloadFiles({
                    files: files,
                    callback: (repFiles) => {
                        if (!repFiles) {
                            message.error("项目文件不存在");
                            return;
                        }
                        G.saveHouseTypeFile = repFiles[houseFileName].data;
                        G.saveModelFile = repFiles[modelFileName].data;
                        G.currentScheme.copyDraft = G.saveHouseTypeFile.copyDraft;
                        window.Native.saveProject(G.saveHouseTypeFile, houseFileName, () => {
                            window.Native.saveProject(G.saveModelFile, modelFileName, () => {
                                let project = {};
                                Object.assign(project, G.saveHouseTypeFile, G.saveModelFile);
                                window.EM.emit("openProject", project, () => {
                                    Load.hide("", "mySchemeLoad", () => {
                                        callBack && callBack(data);
                                    });
                                });
                            });
                        });
                    }
                });
            })
        }
    });
}

/**
 * 下载、解压拼花并转成png
 * @author xag
 * @param data 当前方案数据
 */
export const spellingFlower = function (data, callback) {
    // 是否有拼花文件
    if (data.schemePatchDataFile) {
        //创建文件夹
        window.Native.addSvgFile(data.schemeNo, () => {
            //保存zip到本地文件
            window.Native.saveZip(data.schemePatchDataFile, data.schemeNo, (files) => {
                try {
                    //解压zip
                    window.Native.unzip(data.schemeNo, function (files) {
                        let [i, k] = [0, 0];
                        files.forEach((file, k) => {
                            let suffix = file.split(".")[file.split(".").length - 1];
                            if (suffix == "webp") {
                                i++;
                            }
                        });
                        //删除zip文件
                        window.Native.delFile(`${data.schemeNo}.zip`, data.schemeNo);
                        if (i == 0) {
                            callback && callback.call();
                        }
                        files.forEach((file) => {
                            let suffix = file.split(".")[file.split(".").length - 1];
                            if (suffix == "webp") {
                                window.Native.saveSvgToImg({
                                    schemeNo: data.schemeNo,
                                    fileName: file,
                                    callback: () => {
                                        k++;
                                        //是否是最后一个svg文件
                                        if (i == k) {
                                            callback && callback.call();
                                        }
                                        //png保存后删除svg文件
                                        //window.Native.delFile(file, data.schemeNo);
                                    }
                                });
                            }
                        });
                    });
                } catch (error) {
                    console.log(error);
                    callback && callback.call();
                }
            });
        });
    } else {
        callback && callback.call();
    }
}
/**
 * 自定义复选框
 * @param {string} ele 
 * @param {function} callback 
 */
export const formCheckbox = function (ele, callback) {
    var _ele = ele || ".fb-radio-box";
    if ($(_ele).hasClass("inited")) return false;
    $(_ele).addClass("inited");
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
 *清楚输入框文字
 * @param tag   点击目标
 * @param clearBox  清楚对象
 * @param type  阻止默认
 */
export const clearText = function (tag, clearBox, callback, type = false) {
    $(tag).click(function () {
        if (clearBox[0].nodeName.toLowerCase() == "input" || clearBox[0].nodeName.toLowerCase() == "textarea") {
            clearBox.val("");
            callback && callback();
        } else {
            clearBox.html("");
            callback && callback();
        }
        if (!type) {
            clearBox.focus();
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

//公共UI操作方法
export const commonFuns = function (option) {
    let opt = $.extend({
        //清除文本回调
        cleanTextCallback: () => { },
        //选择回调
        checkboxCallback: () => { }
    }, option);

    $(".clean").each(function () {
        if (!$(this).hasClass("inited")) {
            $(this).addClass("inited");

            //显示隐藏清除按钮
            $(".clean > input").addClass("inited").focus(function () {
                if (!$(this).attr("readonly")) {
                    $(this).next().show();
                    $(this).parent().removeClass("error");
                }
            }).blur(function () {
                $(this).next().hide();
            }).on("input propertychange", function () {
                if (!$(this).val()) {
                    $(this).next().hide();
                } else {
                    $(this).next().show();
                }
            });

            //清除内容
            $(".clean-btn").each(function () {
                clearText(this, $(this).prev(), opt.cleanTextCallback);
            });

            //选中
            formCheckbox(".fb-check-box", opt.checkboxCallback);
        }
    });
};


/**
 * 显示弹出窗jBox
 * 比较大的Modal
 * @param {*} jBox      jBox对象
 * @param {*} id        弹出层ID    
 * @param {*} options    弹出层显示参数
 * defaults = {
        isMove: true,       //弹出窗位置是否可以移动
        top: "auto",        //弹出窗位置，默认垂直居中
        title: "",          //标题
        content: "",        //内容
        ID: "",             //模块ID
        cls: "",            //样式名称     
        removeElement: true, //是否移除弹出框元素，默认是true-移除， false-不移除   
        isCustomBtns: false,//是否启用自定义按钮
        cancelID: "",       //（自定义按钮模式）取消按钮ID
        okID: "",           //（自定义按钮模式）确定按钮ID
        closeType: 1,       //关闭选项：默认：1-自动延时关闭（弹出提示），2-触发关闭（非自动关闭，没有延时），3-不关闭，手动调用函数关闭
        cancelText: "",     //取消按钮的文字
        okText: "",         //确定按钮的文字
        initFun: "",        //初始化时函数
        initAfterFun: "",   //初始化之后的函数
        cancelFun: "",      //取消函数
        okFun: ""           //确定函数
    };
 */
export const jBoxModalShowFun = function (jBox, id, options) {
    let defaults = {
        isMove: true,
        top: "auto",
        title: "",
        content: "",
        ID: "",
        cls: "",
        removeElement: true,
        isCustomBtns: false,
        cancelID: "",
        okID: "",
        closeType: "",
        cancelText: "",
        okText: "",
        initFun: "",
        initAfterFun: "",
        cancelFun: "",
        okFun: ""
    };

    let option = $.extend({}, defaults, options);
    if (jBox) {
        let btnObj = {};
        //按钮
        if (option.isCustomBtns) {
            btnObj = {
                custom: [
                    {
                        ID: options.cancelID || "jBoxCancel",
                        callback: (opt) => {
                            option.cancelFun && option.cancelFun.call(this, opt);
                        }
                    },
                    {
                        ID: options.okID || "jBoxSure",
                        closeType: option.closeType || 2,
                        callback: (opt) => {
                            option.okFun && option.okFun.call(this, opt);
                        }
                    }
                ]
            }
        } else {
            btnObj = {
                array: [
                    {
                        text: option.cancelText || "取消",
                        callback: (opt) => {
                            option.cancelFun && option.cancelFun.call(this, opt);
                        }
                    },
                    {
                        text: option.okText || "确定",
                        closeType: option.closeType || 2,
                        callback: (opt) => {
                            option.okFun && option.okFun.call(this, opt);
                        }
                    }
                ]
            }
        }

        jBox.confirm(option.content, {
            isMove: option.isMove,
            top: option.top,
            boxID: id || "",
            confirmType: 3,
            title: option.title,
            removeElement: option.removeElement,
            cls: {
                titleCls: "specail"
            },
            element: {
                id: option.ID || "",
                cls: `jBox-modal ${option.cls}`,
                width: option.width || "700px",
                height: option.height || "auto"
            },
            btn: btnObj,
            initBeforeFun: function (opt) {
                option.initBeforeFun && option.initBeforeFun.call(this, opt);
            },
            initFun: function (opt) {
                option.initFun && option.initFun.call(this, opt);
            },
            initAfterFun: function (opt) {
                option.initAfterFun && option.initAfterFun.call(this, opt);
            },
            cancelFun: function (opt) {
                option.cancelFun && option.cancelFun.call(this, opt);
            }
        });
    }
}

/**
 * 移除弹出层
 * @param {*} jBox      jBox对象
 * @param {*} id        指定关闭ID
 * @param {*} callBack  关闭回调
 */
export const jBoxModalHideFun = function (jBox, id, callBack) {
    let closeID = id || "";
    if (jBox) {
        jBox.close(closeID, null, () => {
            callBack && callBack.call(this, closeID);
        });
    }
}

/**
 * 隐藏弹出层
 * @param {*} jBox      jBox对象
 * @param {*} option    指定关闭ID
 * @param {*} callBack  关闭回调
 */
export const jBoxModalHideElementFun = function (jBox, option, callBack) {
    let opt = $.extend({
        id: "",
        removeElement: true
    }, option);

    let closeID = opt.id || "";
    if (jBox) {
        jBox.remove(closeID, {
            removeElement: opt.removeElement
        }, () => {
            callBack && callBack.call(this, closeID);
        });
    }
}


/**
 * 显示图片缩略图
 * @param {File} file  文件对象
 * @param {Function} callback 回调函数
 */
export const showImageThumb = (jBox, file, callback, eCallback) => {
    if (!file) return false;
    let fileType = file.name.split("").reverse().join("").split(".")[0].split("").reverse().join("");
    let errorText = "", fileImageType = false;
    switch (fileType.toString().toLocaleLowerCase()) {
        case "jpg":
        case "png":
        case "gif":
        case "jpeg":
            fileImageType = true;
            break;
        case "zip":
        case "rar":
            errorText = "压缩文件";
            fileImageType = false;
            break;
        case "txt":
            errorText = "文本文件";
            fileImageType = false;
            break;
        case "ppt":
            errorText = "幻灯片文件";
            fileImageType = false;
            break;
        case "psd":
            errorText = "PS文件";
            fileImageType = false;
            break;
        case "swf":
            errorText = "Flash文件";
            fileImageType = false;
            break;
        case "mp3":
            errorText = "音频文件";
            fileImageType = false;
            break;
        case "mp4":
            errorText = "视频文件";
            fileImageType = false;
            break;
        case "pdf":
            errorText = "PDF文件";
            fileImageType = false;
            break;
        default:
            errorText = "其他文件";
            fileImageType = false;
            break;
    }

    if (!fileImageType) {
        jBox.error(`请选择图片文件，你选择的是：${errorText}`);
        eCallback && eCallback.call();
        return false;
    } else {
        Load.show("加载图片中...");
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            callback && callback.call(this, reader.result);
            Load.hide();
        });

        reader.addEventListener('error', () => {
            eCallback && eCallback.call();
            Load.hide();
        })
        reader.readAsDataURL(file);
    }


}

/**
 * 显示加载的图片
 * @param {String} src 
 * @param {Function} callback 
 * @param {Function} eCallback 
 */
export const showLoadImages = (src, callback, eCallback) => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
        let width = image.width;
        let height = image.height;
        callback && callback.call(this, image, width, height);
    };
    image.onerror = () => {
        console.log("图片上传失败");
        eCallback && eCallback.call(this, image);
    };
}

export default {
    verifyPhone,
    verifyPassword,
    padZero,
    countDown,
    hoverShowFun,
    tabChangFun,
    selectBar,
    formCheckbox,
    clearText,
    commonFuns,

    jBoxModalShowFun,
    jBoxModalHideFun,
    jBoxModalHideElementFun,
    showImageThumb,
    showLoadImages,
    build2D,
    spellingFlower
}