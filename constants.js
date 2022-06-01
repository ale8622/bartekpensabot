const emoji = require("node-emoji");

module.exports.Constants = {
 WelcomeMessage : "Cosa si starà chiedendo Bartek oggi?",
 Question : emoji.get('question')+"Domandati"+emoji.get('question'),
 Lunch :emoji.get('spaghetti') +" mangiamo"+emoji.get('question'),
 Ics : emoji.get('x')+" ics",
 QuestionAdd : emoji.get('question')+"AddDomandati"+emoji.get('question'),
 LunchAdd :emoji.get('spaghetti') +" AddMangiamo"+emoji.get('question'),
 IcsAdd : emoji.get('x')+" Addics",
 FaiCose: emoji.get('x')+" sistema"
}