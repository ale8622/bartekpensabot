require("./app")
const { Constants } = require("./constants");
const questions = require('./questions.json');


const TelegramBot =require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling:true});

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
    const quest = questions.domandone[Math.floor(Math.random() * questions.domandone.length)]
    bot.sendMessage(msg.chat.id,quest);
});