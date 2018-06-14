import React from 'react';
import ReactDOM from 'react-dom';
require('./Loading.less');
class Loading extends React.Component {
  render() {
    return (
      <div className="loading-component">
        <div className="warp">
          <img src={require('../../../images/logo.png')} alt="" />
          <p>请稍候...</p>
        </div>
      </div>
    )
  }
}
let key = parseInt(Date.now() + Math.random() * 100000000).toString(36);
export default {
  show: () => {
    let elem = document.getElementById(key);
    if (!elem) {
      elem = document.createElement('div');
      elem.setAttribute('id', key);
      document.body.appendChild(elem);
    }
    ReactDOM.render(<Loading />, elem);
  },
  hide: () => {
    let elem = document.getElementById(key);
    if (!!elem) {
      ReactDOM.unmountComponentAtNode(elem);
    }
  }
}