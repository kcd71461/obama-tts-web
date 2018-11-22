import React, {Component} from 'react';
import './assets/stylesheet/App.scss';
import Obama from './assets/img/obama.png';
import SampleInput from "./component/SampleInput";

class App extends Component {
    render() {
        return (
            <div className="waveWrapper waveAnimation">
                <div className="waveWrapperInner bgTop">
                    <div className="wave waveTop wave-top"></div>
                </div>
                <div className="waveWrapperInner bgMiddle">
                    <div className="wave waveMiddle wave-mid"></div>
                </div>
                <div className="waveWrapperInner bgBottom">
                    <div className="wave waveBottom wave-bot"></div>
                </div>
                <div className="content">
                    <div className="profile">
                        <img src={Obama}/>
                        <p>Barack Obama<br/>Text to Speech</p>
                    </div>
                    <SampleInput/>
                </div>
            </div>
        );
    }
}

export default App;
