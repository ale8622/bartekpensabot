require("./app")
const redisClient = require("./redisClient")
const utility = require("./utility")
const { Constants } = require("./constants");
const { Commands } = require("./commands");
const questions_bck = require('./questions.json');
const TelegramBot =require('node-telegram-bot-api');
const { setJson, getJson } = require("./redisClient");
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling:true});
var questions = "";
var done = 0;
var perPranzo = 0;
var today_global = new Date();
var dayOfWeek_global  = today_global.getDay();

async function readQuestions(msg) {
    try{
        return await redisClient.getJson(msg.chat.id, Constants.questionsRedisKey);
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
    questions = await readQuestions(msg);
    if(!questions) {
        questions = questions_bck;
       await redisClient.setJson(msg.chat.id, Constants.questionsRedisKey, JSON.stringify(questions_bck));
    } else {
        await redisClient.setJson(msg.chat.id, Constants.questionsRedisKey, JSON.stringify(questions));
    }
    await bot.sendPhoto(msg.chat.id , 
                        Constants.Tektek[Math.floor(Math.random() * Constants.Tektek.length)] ,
                        {
                            caption: Constants.WelcomeMessage ,
                            reply_markup : {
                                    keyboard : [[Constants.Question],[Constants.Lunch],[Constants.Ics],[Constants.RDiceCose]], 
                                force_reply : true 
                            }
                        }
                        );
});


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
    ElencaTutti(msg, questions.RDiceCose, "COSE DETTE DA R");
});

bot.onText(Commands.AllMangiamo, async (msg) => { 
    ElencaTutti(msg, questions.pranzo , "POSTI ANOCRA NON ICS");
});

bot.onText(Commands.AllBartek, async (msg) => { 
    ElencaTutti(msg, questions.domandone, "DOMANDONI DI BARTEK");
});

   
bot.onText(Commands.RDiceCose, async (msg) => {
    if(questions && questions.RDiceCose) {
        bot.sendMessage( msg.chat.id, "R. dice: " +  utility.rispondi(questions.RDiceCose));
    } else {
        bot.sendMessage(msg.chat.id, Constants.Whats);
    }
});
bot.onText(Commands.Mangiamo, async (msg) => {+
    await setMessageForUser(msg);
    if(questions && questions.pranzo) {
        await redisClient.getJson(msg.chat.id, Constants.questionsRedisKey);         
    }

    if( utility.giornoCambiato(dayOfWeek_global )) {
        dayOfWeek_global =  dayOfWeek;
        done = 0;
        perPranzo = 0;
        console.log("Cambiato Giorno " + dayOfWeek_global);
    }
    if(perPranzo <= 0) {
        if(questions && questions.pranzo) {
            bot.sendMessage(msg.chat.id, "Oggi Mangerai da \n" + utility.rispondi(questions.pranzo));
        } else {
            bot.sendMessage(msg.chat.id, Constants.Whats);
       }
        perPranzo++;
    } else {
        bot.sendMessage(msg.chat.id, msg.from.first_name + ", per Oggi ho già risposto");
    }
});

bot.onText(Commands.Ics, async (msg) => {
    await setMessageForUser(msg);
    ElencaTutti(msg, questions.ics, "ICS");    
});

async function  ElencaTutti(msg, list, label) {
    if(list) {
        bot.sendMessage(msg.chat.id, "Questi sono " + label + ": \n" + list.map(x=> x + " \n"));
    } else {
        bot.sendMessage(msg.chat.id, Constants.Whats);
    }
};

bot.onText(Commands.Bartek, async (msg) => {
    await setMessageForUser(msg);
    if(questions && questions.domandone) {
        bot.sendMessage(msg.chat.id, "Bartek si Domanda: \n" + utility.rispondi(questions.domandone));
    } else {
        bot.sendMessage(msg.chat.id, Constants.Whats);
    }
});

async function  aggiugiSuRedis(mode, msg, arrayname){
    if (questions && questions != ''){
        var newone = msg.text.replace(mode, "").replace("/", "").trim();
        var check = questions[arrayname].filter(x=> x.includes(newone) || newone.includes(x)) ;  
        if(check.length == 0){
            questions[arrayname].push(newone);
            await redisClient.setJson(msg.chat.id, Constants.questionsRedisKey, JSON.stringify(questions));
            utility.delay(100).then(() => console.log('ran after .1 second1 passed'));
            await redisClient.getJson(msg.chat.id, Constants.questionsRedisKey);
            bot.sendMessage(msg.chat.id, "Aggiunto: " + newone);
            return true;
        } else {
            bot.sendMessage(msg.chat.id, "Esiste già " +newone);
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
            await redisClient.setJson(msg.chat.id, Constants.questionsRedisKey, JSON.stringify(questions));
            utility.delay(100).then(() => console.log('ran after .1 second1 passed'));
            await redisClient.getJson(msg.chat.id, Constants.questionsRedisKey);
            bot.sendMessage(msg.chat.id, "Rimosso: " +newone);
        } else {
            bot.sendMessage(msg.chat.id, "Non ne ho trovati: " +newone);
        }
    }
    else {
        bot.sendMessage(msg.chat.id, "Problemi con " + mode);
        console.log("Problemi con " + mode);
    }
}