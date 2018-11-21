import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {Input, Button} from "reactstrap";

class SampleInput extends React.Component {
    static propTypes = {};

    state = {text: '', playState: states.none, history: [], samples: []};

    componentDidMount() {
        this.fetchHistory();
        this.fetchSamples();
    }


    onChange = (e) => {
        this.setState({text: e.target.value});
    };

    onRequestClick = (e) => {
        e.preventDefault();
        const {text} = this.state;
        if (text.length <= 8) {
            alert('text length must be over 8');
        } else {
            this.synthesize(text);
        }
    };

    synthesize = (text) => {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
        }

        const url = `${window.location.protocol}//${window.location.host}/api/tts?text=${encodeURI(text)}`;
        this.setState({playState: states.waiting});
        axios.get(url).then(respons => {
            const audio = new Audio(url);
            audio.oncanplay = () => {
                this.setState({playState: states.complete});
                this.fetchHistory();
                audio.play();
            };
            this.audio = audio;
        }).catch(error => {
            console.error(error);
            this.setState({playState: states.error});
        });
    };

    playTTS = (text) => {
        if (this.downloadedWaveAudio) {
            this.downloadedWaveAudio.pause();
            this.downloadedWaveAudio.src = '';
        }

        const url = `${window.location.protocol}//${window.location.host}/api/tts?text=${encodeURI(text)}`;
        axios.get(url).then(respons => {
            const audio = new Audio(url);
            audio.oncanplay = () => {
                this.fetchHistory();
                audio.play();
            };
            this.downloadedWaveAudio = audio;
        }).catch(error => {
            console.error(error);
        });
    };

    playSample = (path) => {
        if (this.downloadedWaveAudio) {
            this.downloadedWaveAudio.pause();
            this.downloadedWaveAudio.src = '';
        }

        const url = `${window.location.protocol}//${window.location.host}/static/sample/${path}`;
        axios.get(url).then(respons => {
            const audio = new Audio(url);
            audio.oncanplay = () => {
                this.fetchHistory();
                audio.play();
            };
            this.downloadedWaveAudio = audio;
        }).catch(error => {
            console.error(error);
        });
    };

    fetchHistory() {
        axios.get('/api/history').then(response => {
            const history = Object.keys(response.data).map(key => {
                return {text: key, count: response.data[key]};
            });
            history.sort((a, b) => b.count - a.count);
            this.setState({
                history
            })
        })
    }

    fetchSamples() {
        axios.get('/api/sample').then(response => {
            console.log(response.data);
            this.setState({samples: response.data});
        })
    }

    render() {
        const waiting = this.state.playState === states.waiting;
        return [
            <div className="sample-input" key={0}>
                <form onSubmit={this.onRequestClick}>
                    <Input type="textarea" onChange={this.onChange} disabled={waiting} value={this.state.text} placeholder="Enter text"/>
                    <Button disabled={waiting} size="lg" type="submit" color="primary" block>Speech</Button>
                    {
                        waiting ? <div className="loading">
                            <div/>
                            <div/>
                            <div/>
                        </div> : undefined
                    }
                </form>
            </div>,
            <div className="history" style={styles.history} key={1}>
                <h1>History</h1>
                <ul>
                    {
                        this.state.history.map((item, key) => {
                            return <li key={key} style={{cursor: 'pointer'}} onClick={() => {
                                this.setState({text: item.text});
                                this.playTTS(item.text);
                            }}>
                                {item.text} <span> - {item.count} times played</span>
                            </li>
                        })
                    }
                </ul>
            </div>,
            <div className="samples" style={styles.samples} key={2}>
                <h1>Sample</h1>
                <ul>
                    {
                        this.state.samples.map((item, key) => {
                            return <li key={key} style={{cursor: 'pointer'}} onClick={() => {
                                this.playSample(item.path);
                            }}>
                                {item.title}
                            </li>
                        })
                    }
                </ul>
            </div>];
    }
}

const styles = {
    buttonContainer: {
        position: 'relative'
    },
    history: {
        position: 'absolute',
        textAlign: 'center',
        left: 0,
        top: 20,
        width: '33.33%',
        bottom: 0,
        padding: 30
    },
    samples: {
        position: 'absolute',
        textAlign: 'center',
        right: 0,
        top: 20,
        width: '33.33%',
        bottom: 0,
        padding: 30
    }
};

const states = {
    none: 'none',
    waiting: 'waiting',
    complete: 'complete',
    error: 'error',
}

export default SampleInput;