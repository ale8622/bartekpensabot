require("./app")
const { Constants } = require("./constants");
const questions = require('./questions.json');
const friday = require('./friday.json'); 


const TelegramBot =require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling:true});
var done = 0;
var today_global = new Date();
var dayOfWeek_global  = today_global.getDay();

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