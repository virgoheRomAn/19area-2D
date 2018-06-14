const G = {
    /**会员状态 1.卖场会员, 2.设计师会员, 8.场景管理员*/
    memberType: 1,
    /**方案类型 1.全部方案, 2.我的方案, 3.公共方案，4.企业方案, 5.回收站的方案*/
    schemeType: 1,
    /**方案类型 1.我的方案, 2.公共方案, 3.分享给我的方案，4.企业方案*/
    sourceType: window.BootParams["--projectType"],
    /**是否展示方案信息*/
    isMessage: false,
    /**更新方案信息*/
    isUpdateMessage: false,
    /**保存类型 true：保存和另存为, false：只有另存为*/
    isSaveType: true,
    /**保存类型 create/saveAs/update*/
    saveSchemeType: "create",
    /**保存方案创建临时ID*/
    isUseTempId: false,
    /**当前方案信息 @liuxiaoyi*/
    currentScheme: {
        /**方案GID*/
        gid: "",
        /**方案编码*/
        schemeNo: "",
        /**方案名称*/
        schemeName: "",
        /**区域名称*/
        areaName: "",
        /**省编码*/
        provinceCode: "",
        /**省名称*/
        provinceName: "",
        /**城市编码*/
        cityCode: "",
        /**城市名称*/
        cityName: "",
        /**楼盘GID*/
        configPremisesInfoGid: "",
        /**楼盘名称*/
        configPremisesName: "",
        /**户型名称*/
        houseTypeName: "",
        /**几室*/
        houseRoom: "",
        /**几厅*/
        houseLiving: "",
        /**地面积*/
        floorArea: "",
        /**顶面积*/
        topArea: "",
        /**墙面积*/
        wallArea: "",
        /**墙高*/
        wallHeight: 3000,
        /**是否拥有编辑权限*/
        hasEditPermission: "",
        /**方案展示3D图片地址*/
        schemeImageFilePath: "",
        /**方案展示2D图片地址*/
        schemeDesignImageFilePath: "",
        /**创建时间*/
        createTimeStr: "",
        /**是否有报价清单(0或者空: 没有报价清单， 1: 有报价清单)*/
        isCreateQuotation: "",
        /**报价清单URL*/
        quotationListURL: "",
        /**保存项目的类型(1:新建，2:读取)*/
        saveSchemeType: 1,
        /**楼盘名称是否存在（用户输入的楼盘没有匹配）*/
        isHasBuildName: true,
        /**当前方案临摹图信息*/
        copyDraft: {
            imageDataUrl: "",
            height: 0,
            width: 0,
            realeDistance: 0,
            fakeDistance: 0,
            moveCoord: {
                moveLeftX: 0,
                moveRightX: 0,
                moveY: 0
            }
        }
    },
    /**方案列表信息*/
    schemeList: {
        /**是否有新的方案创建-用于刷新方案库*/
        hasNewScheme: false,
        /**默认-1；1\2\3\4 对应 一室\二室\三室\四室 ,其他对应0*/
        schemeHouseType: -1,
        /**默认-1,50m2以下 传值1;50-80m2传值2;80-100m2传值3;100-130m2传值4;130m2以上传值5*/
        schemeAreaType: -1,
        /**搜索关键字*/
        schemeKeyWords: ""
    },
    /**户型列表信息*/
    houseType: {
        /**是否有相关方案*/
        htDetailsSchemeList: true,
        /**城市编码 */
        htCityCode: "",
        /**父级城市编码 */
        htParentCityCode: "",
        /**户型 */
        familyData: -1,
        /**面积 */
        areaData: -1,
        /**当前户型gid */
        houseTypeGid: 0,
        /**城市是否加载完成 */
        cityLoaded: false
    },
    /**保存城市信息*/
    saveCityList: [],
    /**保存品牌信息*/
    saveModelTypeList: [],
    /**保存用户信息*/
    saveMemberInfor: {},
    /**保存当前户型文件数据信息*/
    saveHouseTypeFile: {
        areaName: "",
        ceils: [],
        copyDraft: {},
        data: {},
        id: "",
        name: "",
        projectName: "",
        schemeNo: ""
    },
    /**保存当前模型文件数据信息*/
    saveModelFile: {
        ccs: [],
        fms: [],
        items: [],
        wbs: [],
        wcs: [],
        wms: [],
        patterns: []
    },
    /**当前操作 1:方案库 2户型库 3开始设计 */
    currentOperation: 1,

    /**清空当前方案信息*/
    clearCurrentScheme: () => {
        Object.assign(G.currentScheme, {
            gid: "",
            schemeNo: "",
            schemeName: "",
            areaName: "",
            provinceCode: "",
            provinceName: "",
            cityCode: "",
            cityName: "",
            configPremisesInfoGid: "",
            configPremisesName: "",
            houseTypeName: "",
            houseRoom: "",
            houseLiving: "",
            floorArea: "",
            topArea: "",
            wallArea: "",
            wallHeight: 3000,
            hasEditPermission: "",
            schemeImageFilePath: "",
            schemeDesignImageFilePath: "",
            createTimeStr: "",
            isCreateQuotation: "",
            quotationListURL: "",
            saveSchemeType: 1,
            isHasBuildName: false,
            copyDraft: {
                imageDataUrl: "",
                height: 0,
                width: 0,
                realeDistance: 0,
                fakeDistance: 0,
                moveCoord: {
                    moveLeftX: 0,
                    moveRightX: 0,
                    moveY: 0
                }
            }
        });
        /**清空户型文件*/
        G.saveHouseTypeFile = {
            areaName: "",
            ceils: [],
            copyDraft: {},
            data: {},
            id: "",
            name: "",
            projectName: "",
            schemeNo: ""
        };
        /**清空模型文件*/
        G.saveModelFile = {
            ccs: [],
            fms: [],
            items: [],
            wbs: [],
            wcs: [],
            wms: [],
            patterns: []
        };
        /**模式为新建*/
        G.saveSchemeType = "create";
        /**变成我的方案*/
        G.sourceType = 1;
    }
};

//开发使用
window.G = G;

export default G