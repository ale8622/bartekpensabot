require("./app")
const redisClient = require("./redisClient")
const utility = require("./utility")
const { Constants } = require("./constants");
const { Commands } = require("./commands");
const friday = require('./friday.json'); 
const questionsRedisKey = "questions";
const questions_bck = require('./questions.json');
const whats ="Cosa?";
const TelegramBot =require('node-telegram-bot-api');
const { setJson, getJson } = require("./redisClient");
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling:true});
var id_message_start ="";
var questions = "";


var done = 0;
var perPranzo = 0;
var today_global = new Date();
var dayOfWeek_global  = today_global.getDay();
var menutoogle = true;


async function readQuestions(msg) {
    console.log("Leggo da redis (readQuestions)");
    try{
        console.log("Leggo da redis");
        return await redisClient.getJson(msg.chat.id,questionsRedisKey);
    } 
    catch (ex){
        console.log("non riesco a leggere da redis");
        console.log(ex);
        return null;
    }
 } 

 async function readMessageForUser(msg) {
    return await redisClient.getInt(msg.chat.id, msg.from.username);
 } 

 async function setMessageForUser(msg) {
    try{
        var num = await readMessageForUser(msg) ?? 0;
        await redisClient.setInt(msg.chat.id, msg.from.username, num + 1);
        return num + 1;
    } catch {
        num = 1;
    }
 } 
 
bot.onText(/^[\/]{1}Start/, async (msg) => {
    console.log("Start from " + msg.from.username);
    bot.sendMessage(msg.chat.id, Constants.WelcomeMessage, {
        reply_markup : {
            keyboard : [[Constants.Question],[Constants.Lunch],[Constants.Ics],[Constants.RDiceCose],],
            force_reply : true
        }
    })

    questions = await readQuestions(msg);
    console.log("Read redis values");
    if(!questions) {
       console.log("Init redis values");
       utility.delay(500).then(() => console.log('ran after .1 second1 passed'));
       await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions_bck));
       questions = questions_bck;
       console.log("Init redis values - ended");
    }else {
        console.log("Reading redis values");
        await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
    }
    console.log("In questions");
    console.log(questions);

});


/* */
bot.onText(Commands.Init, async (msg) => {
    done = 0;
    perPranzo = 0;
    questions = await readQuestions(msg);
    console.log("Init from " + msg.from.username);
});

bot.onText(Commands.Version, async (msg) => {
    console.log('Version');
    bot.sendMessage(msg.chat.id, Constants.Version);
});

bot.onText(Commands.Help, async (msg) => {
    console.log(utility.HelpMessage());
    bot.sendMessage(msg.chat.id, HelpMessage());
});

bot.onText(Commands.AddIcs, async (msg) => { 
    utility.aggiugiSuRedis(Commands.AddIcs, msg, "ics");
});

bot.onText(Commands.RemoveIcs, async (msg) => { 
    utility.rimuoviSuRedis(Commands.RemoveIcs, msg, "ics");
});

bot.onText(Commands.AddMangiamo, async (msg) => { 
    utility.aggiugiSuRedis(Commands.AddMangiamo, msg, "pranzo");
});

bot.onText(Commands.RemoveMangiamo, async (msg) => { 
    utility.aggiugiSuRedis(Commands.RemoveMangiamo, msg, "pranzo");
});

bot.onText(Commands.AddBartek, async (msg) => { 
    utility.aggiugiSuRedis(Commands.AddBartek, msg, "domandone");
});

bot.onText(Commands.RemoveBartek, async (msg) => { 
    utility.rimuoviSuRedis(Commands.RemoveBartek, msg, "domandone");
});

bot.onText(Commands.AddRDiceCose, async (msg) => { 
    utility.aggiugiSuRedis(Commands.AddRDiceCose, msg, "RDiceCose");
});

bot.onText(Commands.RemoveRDiceCose, async (msg) => { 
    utility.rimuoviSuRedis(Commands.RemoveRDiceCose, msg, "RDiceCose");
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

bot.onText(Commands.RDiceCose, async (msg) => {
    if(questions && questions.RDiceCose) {
        var quest = rispondi(questions.RDiceCose);
        bot.sendMessage( msg.chat.id, "R. dice: " +  quest);
    } else {
        bot.sendMessage(msg.chat.id, whats);
    }
});

bot.onText(Commands.Mangiamo, async (msg) => {+
    await setMessageForUser(msg);
    
    if(questions && questions.pranzo) {
        await redisClient.getJson(msg.chat.id,questionsRedisKey);         
    }

    if( utility.giornoCambiato(dayOfWeek_global )) console.log("Cambiato Giorno");
    if(perPranzo <= 0) {
        if(questions && questions.pranzo) {
            var quest = utility.rispondi(questions.pranzo);
            bot.sendMessage(msg.chat.id, "Oggi Mangerai da \n" + quest);
        } else {
            bot.sendMessage(msg.chat.id, whats);
        }
        perPranzo++;
    } else {
        bot.sendMessage(msg.chat.id, msg.from.first_name + ", per Oggi ho già risposto");
    }
});

bot.onText(Commands.Ics, async (msg) => {
    await setMessageForUser(msg);
    if(questions && questions.domandone) {
        var quest = questions.ics.map(x=> x + " \n");

        bot.sendMessage(msg.chat.id, "Questi sono ICS: \n" +quest);
    } else {
        bot.sendMessage(msg.chat.id, whats);
    }
});

bot.onText(Commands.Bartek, async (msg) => {
    await setMessageForUser(msg);

    if(questions && questions.domandone) {
        var quest = utility.rispondi(questions.domandone);
        bot.sendMessage(msg.chat.id, "Bartek si Domanda: \n" + quest);
    } else {
        bot.sendMessage(msg.chat.id, whats);
    }
});

