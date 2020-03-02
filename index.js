'use strict';

// Load the SDK
const AWS = require('aws-sdk')
const Fs = require('fs')
const mp3Duration = require('mp3-duration');
const { exec } = require('child_process')
AWS.config.loadFromPath('./config.json');

// Create an Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'ap-northeast-1'
})

let params = {
    'Text': '',
    // 'Engine': 'neural',
    'LanguageCode': 'ja-JP',
    'OutputFormat': 'mp3',
    'VoiceId': 'Mizuki' // Takumi Mizuki
}

let texts = [
   {id: 1, text: "テスト1"},
   {id: 2, text: "テスト2"},
   {id: 3, text: "テスト3"}
]

const outputFileName = 'out.mp3'
let command = 'ffmpeg '

converTextsToMP3(texts)

async function converTextsToMP3(texts){

    try{
        for(let i = 0; i < texts.length; i++) {
            params.Text = texts[i].text
            const fileName = `./file_${i}.mp3`
            command += `-i ${fileName} `
            await getM3data(params, fileName)
            const duration = await getMP3duration(fileName)
            console.log(fileName + ' ' + duration * 1000 + ' ms long');
        }

        command  += ` -filter_complex "concat=n=${texts.length}:v=0:a=1" ${outputFileName}`
        console.log(command)
        await joinMP3(command)
    }catch(e){
        console.error(e)
    }
}

function getM3data(params, fileName){
    return new Promise(function (resolve, reject) {
        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                reject(err)
            }
            
            if (data.AudioStream instanceof Buffer) {
                Fs.writeFile(fileName, data.AudioStream, function(err) {
                    if (err) {
                        reject(err)
                    }else{
                        console.log("The file was saved!")
                        resolve()
                    }
                })
            }

        })
      })
}

function getMP3duration(fileName){
    return new Promise(function (resolve, reject) {
        mp3Duration(fileName, function (err, duration) {
            if (err){
                reject(err)
            }else{
                resolve(duration)
            }
          });
      })
}

function joinMP3(cmd){
    return new Promise(function (resolve, reject) {
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            }
                console.log("success")
                resolve("")
            }
        )
      })
}