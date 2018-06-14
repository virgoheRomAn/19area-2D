import React from 'react';
import Request from '../../config/Request';
import { EventEmitter } from 'events';
import $ from "jquery";

import RegisterLogin from "./User/RegisterLogin";
import Header from './Header/Header';
import HouseType from "./HouseTypeLibrary/HouseType";
import Schemelibrary from "./Schemelibrary/Schemelibrary";
import DesignHeader from './Design/DesignHeader';
import DesignHandle from './Design/DesignHandle';
import DesignModel from './Design/DesignModel';
import Editor from '../Editor/index';

import Method from "../Interface/Method";
import G from "../Interface/Global";
import Load from "../Plugins/loading/LoadingData";

require('./Index.less');
require('../../less/Common.less');

export default class Index extends React.Component {
    constructor(props, context) {
        super(props, context);
        let EM = new EventEmitter();
        window.EM = EM;

        //从3D回来返回2D-待修改
        window.EM.on("openToolof3D", () => {
            Load.show("加载中...");
            window.Native.getBootParams();
            window.Native.getProjectAsId(G.currentScheme.gid, `${G.currentScheme.schemeNo}_House`, (project) => {
                let houseTypeProject = project;
                G.saveHouseTypeFile = houseTypeProject;
                window.Native.getProjectAsId(G.currentScheme.gid, `${G.currentScheme.schemeNo}_Model`, (project) => {
                    G.saveModelFile = project;
                    Object.assign(project, houseTypeProject);
                    window.EM.emit("openProject", project, () => {
                        setTimeout(() => {
                            Load.hide();
                            //如果存在启动拼花参数（3D直接启动到拼花）
                            if (window.BootParams['--patternId']) {
                                window.EM.emit("bootOpenProjectPattren", {
                                    bind_id: window.BootParams['--patternId'],
                                    side: window.BootParams['--side'],
                                });
                            }
                            $("a[href='#designBox']").click();
                        }, 1000);
                    });
                });
            });
        });
    }

    componentDidMount() {
        Method.commonFuns();
    }

    render() {
        return (
            <div className="wrap-component">
                <div className="index-component">
                    {/* 新版头部 */}
                    <Header />
                    {/* 内容切换信息 */}
                    <div className="index-container">
                        <div className="index-relative">
                            {/* 登录，注册，找回密码 */}
                            <RegisterLogin />

                            {/* 方案库 */}
                            <div className="scheme-library-container active" id="schemeBox">
                                <Schemelibrary />
                            </div>

                            {/* 户型库 */}
                            <div className="house-type-container" id="houseTypeBox">
                                <HouseType />
                            </div>

                            {/* 开始设计部分 */}
                            <div className="design-container " id="designBox">
                                <DesignHeader />
                                <DesignHandle />
                                <DesignModel />
                                <main>
                                    <div className="editor">
                                        <Editor EM={EM} />
                                    </div>
                                </main>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}