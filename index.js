require("./app")
//const redisClient = require("./redisClient")
const { Constants } = require("./constants");
const friday = require('./friday.json'); 
const questionsRedisKey = "questions";
const questions = require('./questions.json');


const TelegramBot =require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling:true});
var done = 0;
var today_global = new Date();
var dayOfWeek_global  = today_global.getDay();

bot.onText(/^[\/]{1}Start/, async (msg) => {
    //await redisClient.setJson(msg.chat.id,questionsRedisKey,"{}");
    bot.sendMessage(msg.chat.id, Constants.WelcomeMessage, {
        reply_markup : {
            keyboard : [[Constants.Question],[Constants.Lunch],[Constants.Ics]],
            force_reply : true
        }
    })
});

bot.onText(/init/, async (msg) => {
    done = 0;
    Console.console.log("init");
});


bot.onText(/mangiamo/, async (msg) => {
    const quest = rispondi(questions.pranzo);
    bot.sendMessage(msg.chat.id,quest);
});
bot.onText(/ics/, async (msg) => {
    const quest = rispondi(questions.ics);
    bot.sendMessage(msg.chat.id,quest);
});
bot.onText(/Domandati/, async (msg) => {
    bot.sendMessage(msg.chat.id,quest);
});

function rispondi(lista){
    
    var today = new Date();
    var dayOfWeek = today.getDay();
    if(dayOfWeek_global != dayOfWeek) done = 0;
    var isFriday = (dayOfWeek === 5) ; 

    if(isFriday && done < friday.esclamazioni.length) {     
         return friday.esclamazioni[done++] 
   }
   else{
       return lista[Math.floor(Math.random() * lista.length)]
   }
}
