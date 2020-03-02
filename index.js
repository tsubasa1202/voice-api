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
    'VoiceId': 'Takumi' // Takumi Mizuki
}

let texts = [
   {id: 1, text: "テスト1"},
   {id: 2, text: "テスト2"},
   {id: 3, text: "テスト3"}
]

const outputFileName = 'out.mp3'

let command = 'ffmpeg '
converTextsToMP3(texts, command)


// 出力結果は消してから実行
async function converTextsToMP3(texts, command){

    let result = []

    try{
        for(let i = 0; i < texts.length; i++) {
            params.Text = texts[i].text
            const fileName = `./file_${i}.mp3`
            command += `-i line.mp3 -i ${fileName} `
            await getM3data(params, fileName)
            const duration = await getMP3duration(fileName)
            result.push(
                {id: texts[i].id, time: duration}
            )
            console.log(fileName + ' ' + duration * 1000 + ' ms long');
        }

        command  += ` -filter_complex "concat=n=${texts.length * 2}:v=0:a=1" ${outputFileName}`
        console.log(command)
        await joinMP3(command)
        console.log(JSON.stringify(result))
        return result
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
                resolve(duration * 1000) // ms
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



/*
var http = require('http')
var server = http.createServer();

server.on('request', async function(req, res) {

    let command = 'ffmpeg '
    const result = await converTextsToMP3(texts, command)

    res.writeHead(200, {'Content-Type' : 'application/json'});
    res.write(JSON.stringify(result));
    res.end();
});

server.listen(3000);
*/
