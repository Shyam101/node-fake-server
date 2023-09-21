const express = require('express')
const request = require('request')
// parse urlencoded request bodies into req.body
const bodyParser = require('body-parser')
const app = express()
const port = 8080
const fs = require('fs');
const logFileName = 'server-logs.txt';

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/', (req, res) => {
  let body = ''

  req.on('data', (chunk) => {
    body += chunk.toString()
  })
  
  req.on('end', () => {
    let payload = JSON.parse(body)
    
    if (payload.Type === 'SubscriptionConfirmation') {
      const promise = new Promise((resolve, reject) => {
        const url = payload.SubscribeURL
        console.log(payload)
        request(url, (error, response) => {
          if (!error && response.statusCode == 200) {
            console.log('Yess! We have accepted the confirmation from AWS')
            return resolve()
          } else {
            return reject()
          }
        })
      })

      promise.then(() => {
        res.end("ok")
      })
    } else {
        console.log(payload)
        writeToLogFile(JSON.stringify(payload));
        res.status(200).send('OK');
    }
  })
})

function writeToLogFile(message) {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFile(logFileName, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

app.listen(port, () => console.log('Example app listening on port ' + port + '!'))
