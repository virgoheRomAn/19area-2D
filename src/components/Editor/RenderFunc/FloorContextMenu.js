import React, { Component } from 'react';
import PatternEditor from "../../PatternEditor";
import '../Panorama/contextmenu.css'
import $ from "jquery";
import Method from "../../Interface/Method";
import jBox from "../../Plugins/jBox/jQuery.jBox";
import G from "../../Interface/Global";
export default function () {
    let { walls } = this.state;
    return (
        <div id="floorContextMenu_camera" style={{ left: 100, top: 300, display: "none", boxShadow: '4px 4px 5px #cccccc' }} className="ContextMenu_camera">
            <p onClick={(e) => {
                let { floors } = this.state;
                let { floor, index } = document.getElementById("floorContextMenu_camera").data;
                e.preventDefault();
                e.stopPropagation();
                floors.map((floor) => {
                    floor.areaShow = false;
                })
                // let obj = this.state.floors;
                floors[index].areaShow = true;
                floors[index].cardPosition.x = e.pageX;
                floors[index].cardPosition.y = e.pageY;
                this.setState({ floors });

                document.getElementById("floorContextMenu_camera").style.display = "none";
            }
            }>设置空间</p>
            <hr style={{ margin: '0px 10px', borderBottom: "none", borderTop: "1px solid #E6E6E6" }} />
            <p onClick={(e) => {
                let { floor, index } = document.getElementById("floorContextMenu_camera").data;
                PatternEditor.show({
                    data: {
                        schemeNo: G.currentScheme.schemeNo,
                        type: 1,
                        floor: floor,
                    },
                    memberInfo: this.state.memberInfo,
                    callback: (pattern) => {
                        delete pattern.shapes;
                        floor.pattern = pattern;
                        PatternEditor.hide();
                    }
                });
                document.getElementById("floorContextMenu_camera").style.display = "none";
            }}
            >拼花定制</p>
            <hr style={{ margin: '0px 10px', borderBottom: "none", borderTop: "1px solid #E6E6E6" }} />
            <p id="floorContextMenu_pattern_unselect" onClick={(e) => {
                if (e.target.classList.contains("disable")) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                let { floor, index } = document.getElementById("floorContextMenu_camera").data;
                delete floor.pattern;
                document.getElementById("floorContextMenu_camera").style.display = "none";
            }}
            >清除拼花</p>
        </div>
    )
}