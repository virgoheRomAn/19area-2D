import React from 'react';
import ReactDOM from 'react-dom';
require('./Loading.less');

class LoadingData extends React.Component {
    render() {
        return (
            <div className="loading-box">
                <div className="container">
                    <img src={require('../../../images/loading.gif')} alt="" />
                    <span id="loadingText">加载中...</span>
                </div>
            </div>
        )
    }
}

let key = parseInt(Date.now() + Math.random() * 100000000).toString(36);
export default {
    show: (text, container, cls, id, callback) => {
        key = id || parseInt(Date.now() + Math.random() * 100000000).toString(36);
        let elem = document.getElementById(key);
        if (!elem) {
            let clsName = !cls ? "" : cls;
            elem = document.createElement('div');
            elem.setAttribute('class', 'loading-bar ' + clsName + '');
            elem.setAttribute('id', key);
            !!container ? document.getElementById(container).appendChild(elem) : document.body.appendChild(elem);
        }
        ReactDOM.render(<LoadingData />, elem);
        elem.getElementsByTagName("span")[0].innerHTML = text;
        callback && callback.call();
    },
    hide: (container, id, callback) => {
        let elem = document.getElementById(id || key);
        if (!!elem) {
            !!container ? document.getElementById(container).removeChild(elem) : document.body.removeChild(elem);
            ReactDOM.unmountComponentAtNode(elem);
            callback && callback.call();
        }
    }
}