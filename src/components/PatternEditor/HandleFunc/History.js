//历史记录
export const handleRecord = function () {
    let history = this.state.history;
    let historyIndex = this.state.historyIndex;
    if (historyIndex != history.length - 1) {
        history.splice(historyIndex + 1);
    }
    let { data: { shapes } } = this.state;
    let temp = {
        data: {
            shapes: shapes.map((shape) => {
                return this.getShapeSerializable(shape);
            })
        }
    };
    history.push(JSON.stringify(temp));
    this.setState({
        history: history,
        historyIndex: history.length - 1
    });
}
//根据index还原页面
export const handleReset = function () {
    let temp = JSON.parse(this.state.history[this.state.historyIndex]);
    temp.data.shapes.forEach((shape) => {
        if (!!shape.parent) {
            let parent = temp.data.shapes.find(x => x.id === shape.parent);
            shape.parent = parent;
        }
    });
    // let scenes = this.getSaveData();
    this.setState({
        data: temp.data,
        mouseType: 'scale',
        distanceLines: []
    })
}
//重做
export const handleRecordFront = function () {
    let index = this.state.historyIndex;
    index++;
    if (index >= this.state.history.length) {
        return;
    }
    this.setState({ historyIndex: index }, () => {
        this.handleReset();
    });
}

//撤销
export const handleRecordBack = function () {
    let index = this.state.historyIndex;
    index--;
    if (index < 0) {
        return;
    }
    this.setState({ historyIndex: index }, () => {
        this.handleReset();
    });
}