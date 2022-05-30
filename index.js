require("./app")
//const redisClient = require("./redisClient")
const { Constants } = require("./constants");
const friday = require('./friday.json'); 
const questionsRedisKey = "questions";
const questions = require('./questions.json');


const TelegramBot =require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling:true});
var done = 0;
var perPranzo = 0;
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
    perPranzo = 0;
    console.log("init");
});


bot.onText(/mangiamo/, async (msg) => {

    if( GiornoCambiato()) console.log("cambiato Giorno");
    if(perPranzo <= 0) {
        const quest = rispondi(questions.pranzo);
        bot.sendMessage(msg.chat.id,quest);
        perPranzo++;
    } else {
        bot.sendMessage(msg.chat.id,"per Oggi ho già risposto");
    }
});
bot.onText(/ics/, async (msg) => {
    const quest = rispondi(questions.ics);
    bot.sendMessage(msg.chat.id,quest);
});
bot.onText(/Domandati/, async (msg) => {
    const quest = rispondi(questions.domandone);
    bot.sendMessage(msg.chat.id,quest);
});
function GiornoCambiato(){
    var dayOfWeek = new Date().getDay();
    if(dayOfWeek_global != dayOfWeek) {
        dayOfWeek_global =  dayOfWeek;
        done = 0;
        perPranzo = 0;
        return true;
    }
    return false;
}
function rispondi(lista){
    
    if( GiornoCambiato()) console.log("cambiato Giorno");

    var isFriday = (new Date().getDay() === 5) ; 

    if(isFriday && done < friday.esclamazioni.length) {  
        perPranzo = -1;   
        return friday.esclamazioni[done++] 
   }
   else{
       return lista[Math.floor(Math.random() * lista.length)]
   }
}
