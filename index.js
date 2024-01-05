require("./app")
const { Constants } = require("./constants");
const friday = require('./friday.json'); 
const questionsRedisKey = "questions";
const questions_bck = require('./questions.json');
const whats ="Cosa?";
const TelegramBot =require('node-telegram-bot-api');
const { setJson } = require("./redisClient");
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling:true});
var id_message_start ="";
var questions = "";
const keyboard = {
    "inline_keyboard": [
        [
            {"text": "Questions", "callback_data": "mangiamo?"},
        ],
        [
            {"text": "Dove mangiare",  "callback_data": "Domandati?"},
            {"text": "Ics", "callback_data": "ics"},
        ]
        ]
    };

var done = 0;
var perPranzo = 0;
var today_global = new Date();
var dayOfWeek_global  = today_global.getDay();
var menutoogle = true;
bot.onText(/^[\/]{1}Start/, (msg) => {

    bot.sendMessage(msg.chat.id, Constants.WelcomeMessage, {
        reply_markup : {
            keyboard : [[Constants.Question]],
            force_reply : false
        }
    }).then(() => {
        bot.clearReplyListeners()
    })
});

bot.onText(/Domandati/, (msg) => {
    var today = new Date();
    var dayOfWeek = today.getDay();
    
    console.log("Start from " + msg.from.username);

    bot.sendMessage(msg.chat.id, Constants.WelcomeMessage, {
        reply_markup : {
            keyboard : [[Constants.Question],[Constants.Lunch],[Constants.Ics],[Constants.Rigat],],
            force_reply : true
        }
    })


    if(dayOfWeek_global != dayOfWeek) done = 0;
    

    var isFriday = (dayOfWeek === 5) ; // 6 = Saturday, 0 = Sunday

    if(isFriday && done < friday.esclamazioni.length) {        
         bot.sendMessage(msg.chat.id, friday.esclamazioni[done] );
         done = done+1;
    }
    else{
        const quest = questions.domandone[Math.floor(Math.random() * questions.domandone.length)]
        bot.sendMessage(msg.chat.id,quest);
    }
    
});

bot.onText(/sistema/, async (msg) => {
    console.log("coseeee");
     menutoogle = !menutoogle;
 
     data = !menutoogle ? 
         {"reply_to_message_id": msg.message_id, "force_reply" : "true"}
         :{"reply_to_message_id": msg.message_id, "reply_markup": JSON.stringify(keyboard), "force_reply" : "true"};
 
     bot.sendMessage(msg.chat.id, menutoogle ? "Menu Disattivato": "Menu Attivato", data , function (isSuccess) {
         console.log(isSuccess);
     });
 
     return;
     
 });
 
  bot.onText(/R.Dicecose/, async (msg) => {
    
     if(questions && questions.Rigat) {
         var quest = rispondi(questions.Rigat);
         bot.sendMessage("R. dice: " +  msg.chat.id,quest);
     } else {
         bot.sendMessage(msg.chat.id, whats);
     }
 });
 
 bot.onText(/Mangiamo/, async (msg) => {
     await setMessageForUser(msg);
     if( GiornoCambiato()) console.log("cambiato Giorno");
     if(perPranzo <= 0) {
         if(questions && questions.pranzo) {
             var quest = rispondi(questions.pranzo);
             bot.sendMessage(msg.chat.id, "Oggi Mangerai da \n" + quest);
         } else {
             bot.sendMessage(msg.chat.id, whats);
         }
         
         perPranzo++;
     } else {
         bot.sendMessage(msg.chat.id, msg.from.first_name + ", per Oggi ho già risposto");
     }
 });
 
 bot.onText(/ics/, async (msg) => {
     await setMessageForUser(msg);
     if(questions && questions.domandone) {
         var quest = questions.ics.map(x=> x + " \n");
 
         bot.sendMessage(msg.chat.id, "Questi sono ICS: \n" +quest);
     } else {
         bot.sendMessage(msg.chat.id, whats);
     }
 });