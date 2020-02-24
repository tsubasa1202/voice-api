'use strict';

// Load the SDK
const AWS = require('aws-sdk')
const Fs = require('fs')

AWS.config.loadFromPath('./config.json');

// Create an Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'ap-northeast-1'
})

let params = {
    'Text': '今日はとっても天気がいいですね。外に遊びにいきたいなー',
    // 'Engine': 'neural',
    'LanguageCode': 'ja-JP',
    'OutputFormat': 'mp3',
    'VoiceId': 'Takumi' // Takumi Mizuki
}

Polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
        console.log(err.code)
    } else if (data) {
        if (data.AudioStream instanceof Buffer) {
            Fs.writeFile("./speech.mp3", data.AudioStream, function(err) {
                if (err) {
                    return console.log(err)
                }
                console.log("The file was saved!")
            })
        }
    }
})