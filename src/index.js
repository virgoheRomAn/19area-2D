
import ReactDOM from 'react-dom';
import React from 'react';
import querystring from 'querystring';
import Loading from './components/Plugins/loading/Loading';

Loading.show();

import {
    HashRouter as Router,
    Route,
    Link
} from 'react-router-dom'

require('normalize.css'); //样式重置
require('./config/flexible'); //rem 适应方案
require("./less/App.less");
require("./less/Antd.less");
import Index from './components/UI/Index';
import Editor from './components/Editor';
import PatternEditor, { Pattern } from './components/PatternEditor';

class Main extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    componentDidMount() {
    }
    render() {
        return (
            <Router>
                <div style={{ height: "100%", width: "100%" }} >
                    <Route exact path="/" component={Index} />
                    <Route exact path="/editor" component={Editor} />
                    <Route exact path="/pattern-editor" component={Pattern} />
                </div>
            </Router>
        );
    }
}

// wxInit(() => {
//     ReactDOM.render(<Main />, document.getElementById('app'));
//     Loading.hide();
// });

ReactDOM.render(<Main />, document.getElementById('app'));
Loading.hide();