const emoji = require("node-emoji");

module.exports.Constants = {
    Version: "0.9.0 - Dai che è Dio",
    WelcomeMessage : "Cosa si starà chiedendo Bartek oggi?",
    Question : emoji.get('question')+" Domandati"+emoji.get('question'),
    Lunch :emoji.get('spaghetti') +" Mangiamo"+emoji.get('question'),
    Ics : emoji.get('x')+" ics",
    Ics_Answer : "La tua ICS: \n",
    RDiceCose : emoji.get('x')+" RDicecose ",
    RDiceCose_Answer : "R. dice: \n",
    Lunch_Answer : "Oggi Mangerai da \n",
    FaiCose: emoji.get('x')+" sistema",
    Whats: "Cosa?",
    questionsRedisKey : "questions",
    mangiatoRedisKey : "doveMangiare_",
    Tektek: ["./images/MimmoTek.jpg", "./images/SashaTek.jpg", "./images/MerdaTek.jpg", "./images/FagigioTek.jpg", "./images/IoTek.jpg"],
    Giorni: ["[animale]DIO","dai che è LuneDio!", "dai che è MarteDio!", "dai che è MercoleDio!", "dai che è GioveDio!","dai che è VenerDio!", "CazzoFai? è sabato!", "COSA???"]


}