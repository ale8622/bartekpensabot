const emoji = require("node-emoji");

module.exports.Constants = {
    Version: "0.7.0 - COMMAND_VERSION= FAKE to use fake command list and avoid the queue",
    WelcomeMessage : "Cosa si starà chiedendo Bartek oggi?",
    Question : emoji.get('question')+" Domandati"+emoji.get('question'),
    Lunch :emoji.get('spaghetti') +" Mangiamo"+emoji.get('question'),
    Ics : emoji.get('x')+" ics",
    RDiceCose : emoji.get('x')+" RDicecose ",
    FaiCose: emoji.get('x')+" sistema",
    Whats: "Cosa?",
    questionsRedisKey : "questions",
    mangiatoRedisKey : "doveMangiare_",
    Tektek: ["./images/MimmoTek.jpg", "./images/SashaTek.jpg", "./images/MerdaTek.jpg", "./images/FagigioTek.jpg", "./images/IoTek.jpg"]
}