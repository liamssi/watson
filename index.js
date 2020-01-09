var restify = require("restify");
const TextToSpeechV1 = require("ibm-watson/text-to-speech/v1");
const { IamAuthenticator } = require("ibm-watson/auth");
const fs = require("fs");

const port = 8080;
const apiKey = "2NW9YWmRWC6DsmydeXGmqcUlG2ZiLT2ebsbtZ9J4lyfC";
const apiURL =
  "https://api.eu-gb.text-to-speech.watson.cloud.ibm.com/instances/138ddaa1-0192-46e3-8fc0-a50d1a5b67bc";

const textToSpeech = new TextToSpeechV1({
  authenticator: new IamAuthenticator({
    apikey: apiKey
  }),
  url: apiURL
});

function respond(req, res, next) {
console.log("req",req.id())
  let params = {
    text: "مرحبا بك"+req.params.text,
    voice: "ar-AR_OmarVoice", // Optional voice
    accept: "audio/mp3"
  };

  let synthStream = textToSpeech.synthesizeUsingWebSocket(params);

  /*textToSpeech
    .synthesize(params)
    .then(response => {
      const audio = response.result;
      return textToSpeech.repairWavHeaderStream(audio);
    })
    .then(repairedFile => {
      fs.writeFileSync("audio.wav", repairedFile);
      console.log("audio.wav written with a corrected wav header");
      res.send("done!! hello " + req.params.text);
    })
    .catch(err => {
      console.log(err);
    });
*/
  // or, using WebSockets
  let synthesizeStream = textToSpeech.synthesizeUsingWebSocket(params)
  fileName ="./out/"+req.id()+".mp3"
  synthesizeStream.pipe(fs.createWriteStream(fileName));
  synthesizeStream.on('message', (message, data) => {
    console.log('done recieving the file')
    res.send("done!! hello " + req.params.text);
  });
  next();
}







var server = restify.createServer();
server.get("/watson/:text", respond);
server.head("/watson/:text", respond);

server.listen(port, function() {
  console.log('%s listening at %s', server.name, server.url);
});
