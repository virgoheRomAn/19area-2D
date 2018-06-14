import React, { Component } from 'react';
import '../Panorama/contextmenu.css'
export default function () {
    let { walls } = this.state;
    return (
        <div id="wallContextMenu_camera" style={{ left: 100, top: 300, display: "none", boxShadow: '4px 4px 5px #cccccc' }} className="ContextMenu_camera">
            <p onClick={() => {
                //todo:删除墙
                this.deleteWallODoor()
                document.getElementById("wallContextMenu_camera").style.display = "none";
            }}>删除</p>
            <hr style={{ margin: '0px 10px', borderBottom: "none", borderTop: "1px solid #E6E6E6" }} />
            <p id="wallContextMenu_camera_p"
                onClick={(e) => {
                    //todo:设置墙为承重墙
                    walls.filter((wall, index) => {
                        if (wall.selected == true) {
                            wall.mainWall = !wall.mainWall;
                        };
                    })
                    this.setState({})
                    document.getElementById("wallContextMenu_camera").style.display = "none";
                }}
            >设为承重墙</p>
            <hr style={{ margin: '0px 10px', borderBottom: "none", borderTop: "1px solid #E6E6E6" }} />
            <p onClick={(e) => {
                this.setState({ isPatternSelectShow: true });
                document.getElementById("wallContextMenu_camera").style.display = "none";
                let func = (e) => {
                    try {
                        if (e.target.classList.contains("pattern-select-item")) {
                            return;
                        }
                        this.setState({ isPatternSelectShow: false });
                        document.removeEventListener("mousedown", func);
                    } catch (error) {
                        this.setState({ isPatternSelectShow: false });
                        document.removeEventListener("mousedown", func);
                    }
                }
                document.addEventListener("mousedown", func);
            }}
            >拼花定制</p>
            <hr style={{ margin: '0px 10px', borderBottom: "none", borderTop: "1px solid #E6E6E6" }} />
            <p id="wallContextMenu_pattern_unselect" onClick={(e) => {
                if (e.target.classList.contains("disable")) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                this.setState({ isPatternUnSelectShow: true });
                document.getElementById("wallContextMenu_camera").style.display = "none";
                let func = () => {
                    try {
                        if (e.target.classList.contains("pattern-unselect-item")) {
                            return;
                        }
                        this.setState({ isPatternSelectShow: false });
                        document.removeEventListener("mousedown", func);
                    } catch (error) {
                        this.setState({ isPatternSelectShow: false });
                        document.removeEventListener("mousedown", func);
                    }
                }
                document.addEventListener("mousedown", func);
            }}
            >清除拼花</p>
        </div>
    )
}