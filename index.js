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
var questions = "";
var done = 0;
var perPranzo = 0;
var today_global = new Date();
var dayOfWeek_global  = today_global.getDay();


async function readQuestions(msg) {
    console.log("Leggo da redis (readQuestions)");
    try{
        console.log("legegndo da redis");
        return await redisClient.getJson(msg.chat.id,questionsRedisKey);
    } 
    catch (ex){
        console.log("Non riesco a leggere da redis");
        console.log(ex);
        return null;
    }
 } 

 async function readMessageForUser(msg) {
    return await redisClient.getInt(msg.chat.id, msg.from.username);
 } 

 async function     setMessageForUser(msg) {
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
       redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions_bck));
       questions = questions_bck;
       console.log("Init redis values - ended");
    }else {
        console.log("Setting the redis values");
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
    bot.sendMessage(msg.chat.id, Constants.Version);
});

bot.onText(Commands.Help, async (msg) => {
    bot.sendMessage(msg.chat.id, utility.helpMessage());
});

bot.onText(Commands.AddIcs, async (msg) => { 
    aggiugiSuRedis(Commands.AddIcs, msg, "ics");
});

bot.onText(Commands.RemoveIcs, async (msg) => { 
    rimuoviSuRedis(Commands.RemoveIcs, msg, "ics");
});

bot.onText(Commands.AddMangiamo, async (msg) => { 
    aggiugiSuRedis(Commands.AddMangiamo, msg, "pranzo");
});

bot.onText(Commands.RemoveMangiamo, async (msg) => { 
    aggiugiSuRedis(Commands.RemoveMangiamo, msg, "pranzo");
});

bot.onText(Commands.AddBartek, async (msg) => { 
    aggiugiSuRedis(Commands.AddBartek, msg, "domandone");
});

bot.onText(Commands.RemoveBartek, async (msg) => { 
    rimuoviSuRedis(Commands.RemoveBartek, msg, "domandone");
});

bot.onText(Commands.AddRDiceCose, async (msg) => { 
    aggiugiSuRedis(Commands.AddRDiceCose, msg, "RDiceCose");
});

bot.onText(Commands.RemoveRDiceCose, async (msg) => { 
    rimuoviSuRedis(Commands.RemoveRDiceCose, msg, "RDiceCose");
});

bot.onText(Commands.AllRDiceCose, async (msg) => { 
    ElencaTutti(msg, questions.RDiceCose);
});

bot.onText(Commands.AllMangiamo, async (msg) => { 
    ElencaTutti(msg, questions.pranzo);
});

bot.onText(Commands.AllBartek, async (msg) => { 
    ElencaTutti(msg, questions.domandone);
});


   
bot.onText(Commands.RDiceCose, async (msg) => {
    if(questions && questions.RDiceCose) {
        var quest = utility.rispondi(questions.RDiceCose);
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

    if( utility.giornoCambiato(dayOfWeek_global )) {
        dayOfWeek_global =  dayOfWeek;
        done = 0;
        perPranzo = 0;
        console.log("Cambiato Giorno " + dayOfWeek_global);
    }
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
    ElencaTutti(msg, questions.ics);    
});

async function  ElencaTutti(msg, list) {
    if(list) {
        var quest = list.map(x=> x + " \n");
        bot.sendMessage(msg.chat.id, "Questi sono ICS: \n" +quest);
    } else {
        bot.sendMessage(msg.chat.id, whats);
    }
};

bot.onText(Commands.Bartek, async (msg) => {
    await setMessageForUser(msg);

    if(questions && questions.domandone) {
        var quest = utility.rispondi(questions.domandone);
        bot.sendMessage(msg.chat.id, "Bartek si Domanda: \n" + quest);
    } else {
        bot.sendMessage(msg.chat.id, whats);
    }
});

 async function  aggiugiSuRedis(mode, msg, arrayname){
    if (questions && questions != ''){
        var newone = msg.text.replace(mode, "").replace("/", "").trim();
        var check = questions[arrayname].filter(x=> x.includes(newone) || newone.includes(x)) ;  
        if(check.length == 0){
            questions[arrayname].push(newone);
            await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
            utility.delay(100).then(() => console.log('ran after .1 second1 passed'));
            await redisClient.getJson(msg.chat.id,questionsRedisKey);
            console.log("aggiunto " + newone);
            bot.sendMessage(msg.chat.id, "Aggiuto:  " +newone);
            return true;
        } else {
            bot.sendMessage(msg.chat.id, "esiste già " +newone);
            console.log("esiste già " +newone);
            return false;
        }
    }
    else {
        bot.sendMessage(msg.chat.id, "Problemi com " + mode);
        console.log("Problemi com " + mode);
        return false;
    }
};

 async function  rimuoviSuRedis(mode, msg, arrayname){
    console.log(mode);
    if (questions && questions != ''){
        var newone = msg.text.replace(mode, "").trim();
        var check = questions[arrayname].filter(x=> x.includes(newone) || newone.includes(x)) ;  
        if(check.length = 1 && questions[arrayname].filter(x=> x== newone).length == 1){
            questions[arrayname] = questions[arrayname].filter(x=> x!= newone);
            await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
            utility.delay(100).then(() => console.log('ran after .1 second1 passed'));
            await redisClient.getJson(msg.chat.id,questionsRedisKey);
            console.log("rimosso " + newone);
            bot.sendMessage(msg.chat.id, "Rimosso:  " +newone);
        } else {
            bot.sendMessage(msg.chat.id, "Non ne ho trovati: " +newone);
            console.log("Non ne ho trovati: " +newone);
        }
    }
    else {
        bot.sendMessage(msg.chat.id, "Problemi con " + mode);
        console.log("Problemi con " + mode);
    }
}