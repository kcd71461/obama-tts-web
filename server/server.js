var express = require('express');
var http = require('http');
var app = express();
var fs = require('fs');
var path = require('path');
var axios = require('axios');
const querystring = require('querystring');
var proxy = require('express-http-proxy');


var ttsApiUrl = 'http://175.193.224.48:9000/synthesize';
var port = 5000;
var cachePath = path.join(__dirname, 'cache');
var scoreDataPath = path.join(__dirname, 'score.json');
var historyDataPath = path.join(__dirname, 'history.json');
var sampleDataPath = path.join(__dirname, 'assets/sample/sample.json');
var scoreData = [];
var historyData = {};

//<editor-fold desc="캐시 폴더 생성">
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath);
}
//</editor-fold>

//<editor-fold desc="스코어 데이터 불러오기">
fs.readFile(scoreDataPath, 'utf8', function (err, data) {
    if (err) {
        console.log('score data is not exists');
        scoreData = [];
        saveJsonFile(scoreDataPath, scoreData)
    } else {
        console.log('score data load success!');
        scoreData = JSON.parse(data);
    }
});
fs.readFile(historyDataPath, 'utf8', function (err, data) {
    if (err) {
        console.log('history data is not exists');
        historyData = {};
        saveJsonFile(historyDataPath, historyData)
    } else {
        console.log('history data load success!');
        historyData = JSON.parse(data);
    }
});
//</editor-fold>

// static routing
app.use('/static', express.static(__dirname + '/assets'));

app.get('/api/tts', function (req, res) {
    var text = req.query.text;
    if (!text || text.trim().length < 0) {
        res.status(500).send('Something broke!');
        return;
    }
    text = text.trim();
    var filePath = path.join(cachePath, `${encodeURIComponent(text)}.wav`);
    if (getFilesizeInBytes(filePath) > 0) {
        res.sendFile(filePath);
        addHistory(text);
    } else {
        proxyTts(text, res);
    }
});

app.get('/api/history', function (req, res) {
    res.send(historyData)
});

app.get('/api/sample', function (req, res) {
    res.sendFile(sampleDataPath)
});

// app.use('/', proxy('localhost:3000'));

app.use('/static', express.static(path.join(__dirname, '../', 'build/static')));
app.use('/', express.static(path.join(__dirname, '../', 'build/')));
app.use('*', express.static(path.join(__dirname, '../', 'build/index.html')));

//Listen
app.listen(port, function () {
    console.log(`listening on port ${port}!`);
});


function proxyTts(text, res) {
    var url = `${ttsApiUrl}?${querystring.stringify({text})}`;

    var fileName = `${encodeURI(text)}.wav`;
    var filePath = path.join(cachePath, fileName);
    var file = fs.createWriteStream(filePath);
    var request = http.get(url, function (response) {
        var stream = response.pipe(file);
        stream.on('finish', function () {
            res.sendFile(filePath);
            addHistory(text);
        });
    });
}

function getFilesizeInBytes(filename) {
    try {
        const stats = fs.statSync(filename);
        const fileSizeInBytes = stats.size;
        return fileSizeInBytes
    } catch (error) {
        return -1;
    }
}

function addHistory(text) {
    if (!historyData[text]) {
        historyData[text] = 1;
    } else {
        historyData[text]++;
    }
    saveJsonFile(historyDataPath, historyData);
}

function saveJsonFile(path, obj) {
    fs.writeFileSync(path, JSON.stringify(obj));
}