const emoji = require("node-emoji");

module.exports.Constants = {
 Version: "0.0.2",
 WelcomeMessage : "Cosa si starà chiedendo Bartek oggi?",
 Question : emoji.get('question')+" Domandati"+emoji.get('question'),
 Lunch :emoji.get('spaghetti') +" Mangiamo"+emoji.get('question'),
 Ics : emoji.get('x')+" ics",
 RDiceCose : emoji.get('x')+" RDicecose ",
 FaiCose: emoji.get('x')+" sistema"
}