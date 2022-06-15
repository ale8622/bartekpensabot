require("./app")
const redisClient = require("./redisClient")
const utility = require("./utility")
const { Constants } = require("./constants");
const { Commands } = require("./commands");
const questions_bck = require('./questions.json');
const TelegramBot =require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_API_KEY, {polling:true});
const fs = require('fs');
var questions = "";
var done = 0;
var today_global = new Date();
var dayOfWeek_global  = today_global.getDay();

var lastMangiamoCall = addMinutes(new Date('0001-01-01T00:00:00Z'), 0);
var global_apranzo = null;

async function readQuestions(msg) {
    try{
        console.log("readQuestions");
        return await redisClient.getJsonQuestions(msg.chat.id, Constants.questionsRedisKey);
    } 
    catch (ex){
        console.log("Non riesco a leggere da redis");
        console.log(ex);
        return null;
    }
 } 


 function addMinutes(date, minutes) {
    return new Date(date + minutes*60000);
}


 async function readMessageForUser(msg) {
    return await redisClient.getInt(msg.chat.id, msg.from.username);
 } 

 async function setMessageForUser(msg) {
    try{
        console.log("setMessageForUser");
        var num = await readMessageForUser(msg) ?? 0;
        await redisClient.setInt(msg.chat.id, msg.from.username, num + 1);
        return num + 1;
    } catch {
        num = 1;
    }
 } 
 

 async function CheckAndSet(msg){
    if(!questions) {
        questions = questions_bck;
        try{
            await redisClient.setJson(msg.chat.id, Constants.questionsRedisKey, JSON.stringify(questions_bck));
        } catch (ex) {
            console.log("error 1");
            console.log(ex);
        }
    } else {
        await redisClient.setJson(msg.chat.id, Constants.questionsRedisKey, JSON.stringify(questions));
    }
    

 }
bot.onText(/^[\/]{1}Start/, async (msg) => {
    console.log("Start from " + msg.from.username);
    questions = await readQuestions(msg);
    lastMangiamoCall = addMinutes(new Date('0001-01-01T00:00:00Z'), 0);
    global_apranzo = null;
    await CheckAndSet(msg);
    console.log(msg.chat.id);
    if(msg.chat.id == -706101238) {
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
    } else {

        bot.sendMessage(msg.chat.id, Constants.WelcomeMessage);
            
    }
    
});


bot.onText(Commands.Init, async (msg) => {
    done = 0;
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
    ElencaTutti(msg, questions.pranzo , "POSTI ANCORA NON ICS");
});

bot.onText(Commands.IcsAll, async (msg) => { 
    ElencaTutti(msg, questions.ics , "Tutte le ICS: n/");
});
bot.onText(Commands.AllBartek, async (msg) => { 
    ElencaTutti(msg, questions.domandone, "DOMANDONI DI BARTEK");
});

bot.onText(Commands.Dio, async (msg) => { 

    if(msg.chat.id == -706101238 || 
        msg.chat.id == 1057386387) 
        {

        var folder ='dioImages/';
        var files = fs.readdirSync(folder);
        var filename = folder + files[Math.floor(Math.random() * files.length)];
        if(filename.endsWith("mp4")) {
        await bot.sendVideo(msg.chat.id , 
            filename,
            {
                caption: Constants.Giorni[new Date().getDay()] ,
                reply_markup : {
                        keyboard : [[Constants.Question],[Constants.Lunch],[Constants.Ics],[Constants.RDiceCose]], 
                    force_reply : true 
                }
            }
            );
        } else if(filename.endsWith("mp3")) {

            await bot.sendAudio(msg.chat.id , 
                filename ,
                {
                    caption: Constants.Giorni[new Date().getDay()] ,
                    reply_markup : {
                            keyboard : [[Constants.Question],[Constants.Lunch],[Constants.Ics],[Constants.RDiceCose]], 
                        force_reply : true 
                    }
                }
                );
        } else {
            await bot.sendPhoto(msg.chat.id , 
                filename ,
                {
                    caption: Constants.Giorni[new Date().getDay()] ,
                    reply_markup : {
                            keyboard : [[Constants.Question],[Constants.Lunch],[Constants.Ics],[Constants.RDiceCose]], 
                        force_reply : true 
                    }
                }
                );
        }
    } else {
        console.log("Dio" + msg.chat.id )
    }

});
bot.onText(/^[\/]{1}ppp/, async (msg) => {
    var wd = new Date().getDay();
    var a = await utility.ElencaTuttiFiltratiPerOggiPesati(questions.pranzoSerio, wd);
    var dove  =utility.rispondi(a);
    bot.sendMessage(msg.chat.id, dove);

});

   
bot.onText(Commands.RDiceCose, async (msg) => {
    if(questions && questions.RDiceCose) {
        bot.sendMessage( msg.chat.id, Constants.RDiceCose_Answer +  utility.rispondi(questions.RDiceCose));
    } else {
        console.log("leggo da redis perche non ho trovato " + Commands.RDiceCose);
        questions=  await redisClient.getJsonQuestions(msg.chat.id, Constants.questionsRedisKey);    
        if(questions && questions.RDiceCose) {
            bot.sendMessage(msg.chat.id, Constants.RDiceCose_Answer + utility.rispondi(questions.RDiceCose));
        } else {
            bot.sendMessage(msg.chat.id, Constants.Whats);
        }

        bot.sendMessage(msg.chat.id, Constants.Whats);
    }
});


async function getTodayAnswer(msg, oggi_str) {
    lastMangiamoCall = addMinutes(Date.now() , 2 );
    global_apranzo = await redisClient.getJson(msg.chat.id, Constants.mangiatoRedisKey + oggi_str); 
    return  global_apranzo;
}


bot.onText(Commands.Mangiamo, async (msg) => {
    var oggi = new Date();
    var oggi_str = oggi.getFullYear().toString() + "-"  + (oggi.getMonth()+1).toString() + "-" + oggi.getDate().toString();
    //await setMessageForUser(msg);
    if(!questions || !questions.pranzoSerio) {
        console.log("leggo da redis perche non ho trovato " + Commands.Mangiamo);
        questions = await redisClient.getJsonQuestions(msg.chat.id, Constants.questionsRedisKey);    
    }

    if( utility.giornoCambiato(dayOfWeek_global )) {
        dayOfWeek_global = oggi.getDay();
        done = 0;
        console.log("Cambiato Giorno " + oggi.getDate() + " " + dayOfWeek_global);
    }


    var last = lastMangiamoCall;
    var ttl = addMinutes(Date.now(), 0);
    var apranzo = ttl <= last && global_apranzo? 
                    global_apranzo :
                    await getTodayAnswer(msg, oggi_str);


    if(!apranzo) {
        if(questions && questions.pranzoSerio) {

            var elencoPranzo =  questions.pranzoSerio ? await utility.ElencaTuttiFiltratiPerOggiPesati(questions.pranzoSerio, oggi.getDay()) : questions.pranzo;
            var dove  =utility.rispondi(elencoPranzo);;
            bot.sendMessage(msg.chat.id, Constants.Lunch_Answer + dove );
            apranzo =  {"quando" :  oggi_str  , "dove": dove};
            await redisClient.setJsonWithTTL(msg.chat.id, 
                            Constants.mangiatoRedisKey + oggi_str, 
                            JSON.stringify(apranzo),
                            60 * 60 * 24); 
        } else {
            bot.sendMessage(msg.chat.id, Constants.Whats);
       }
    } else {
        bot.sendMessage(msg.chat.id, msg.from.first_name + ", per Oggi, "+ apranzo.quando +", ho già risposto che dovresti andare da " + apranzo.dove);
    }
});

bot.onText(Commands.Ics, async (msg) => {
    //await setMessageForUser(msg);
    //ElencaTutti(msg, questions.ics, "ICS");    

    if(questions && questions.ics) {
        bot.sendMessage( msg.chat.id, Constants.Ics_Answer +  utility.rispondi(questions.ics));
    } else {
        console.log("leggo da redis perche non ho trovato " + Commands.ics);
        questions=  await redisClient.getJsonQuestions(msg.chat.id, Constants.questionsRedisKey);    
        if(questions && questions.ics) {
            bot.sendMessage(msg.chat.id, Constants.Ics_Answer + utility.rispondi(questions.ics));
        } else {
            bot.sendMessage(msg.chat.id, Constants.Whats);
        }

        bot.sendMessage(msg.chat.id, Constants.Whats);
    }

});

async function  ElencaTutti(msg, list, label) {
    if(list) {
        bot.sendMessage(msg.chat.id, "Questi sono " + label + ": \n" + list.map(x=> x + " \n"));
    } else {
        bot.sendMessage(msg.chat.id, Constants.Whats);
    }
};


bot.onText(Commands.Bartek, async (msg) => {
    //await setMessageForUser(msg);
    if(questions && questions.domandone) {
        bot.sendMessage(msg.chat.id, "Bartek si Domanda: \n" + utility.rispondi(questions.domandone));
    } else {
        console.log("leggod da redi perche non ho trovato " + Commands.domandone);
        questions = await redisClient.getJsonQuestions(msg.chat.id, Constants.questionsRedisKey);    
        if(questions && questions.domandone) {
            bot.sendMessage(msg.chat.id, "Bartek si Domanda: \n" + utility.rispondi(questions.domandone));
        } else {
            bot.sendMessage(msg.chat.id, Constants.Whats);
        }
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
            console.log("aggiugiSuRedis");
            await redisClient.getJsonQuestions(msg.chat.id, Constants.questionsRedisKey);
            bot.sendMessage(msg.chat.id, "Aggiunto: " + newone);
            return true;
        } else {
            bot.sendMessage(msg.chat.id, "Esiste già " +newone);
            return false;
        }
    }
    else {
        bot.sendMessage(msg.chat.id, "Problemi con " + mode);
        console.log("Problemi con " + mode);
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
            console.log("rimuoviSuRedis");
            await redisClient.getJsonQuestions(msg.chat.id, Constants.questionsRedisKey);
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