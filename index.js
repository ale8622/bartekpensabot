require("./app")
const redisClient = require("./redisClient")
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
 
// bot.on("message", async (msg) => {
//     var n = await setMessageForUser(msg);
//         if (n> 4)  {
//             console.log(msg.from.username + "! Clicca di meno merda!");
//         }
//     }
// );



//


  bot.onText(/^[\/]{1}Start/, async (msg) => {
    console.log("Start from " + msg.from.username);
    delay(500).then(() => console.log('ran after time second1 passed'));
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
       
       delay(500).then(() => console.log('ran after .1 second1 passed'));
       await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions_bck));
       questions = questions_bck;
       console.log("Init redis values - ended");
    }else {
        await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
    }
    console.log("In questions");
    console.log(questions);

});

bot.onText(Commands.Init, async (msg) => {
    done = 0;
    perPranzo = 0;
    questions = await readQuestions(msg);
    console.log("Init from " + msg.from.username);
});

bot.on('callback_query', function onCallbackQuery(msg) {
    // increment counter when everytime the button is pressed
    console.log('callback_query');
    bot.on('message', message => {
        console.log(message);
    });
id_message_start = msg.message_id;
    menutoogle
    var data_after = { 
        "reply_to_message_id": id_message_start==""?  msg.message_id: id_message_start,
        "force_reply" : "true"
    };

    if(msg.data){
        bot.sendMessage(msg.message.chat.id, msg.data, data_after);
    } else {

    }

  });

//

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

bot.onText(Commands.Version, async (msg) => {
    bot.sendMessage(msg.chat.id, Constants.Version);
});

bot.onText(Commands.Helè, async (msg) => {
    bot.sendMessage(msg.chat.id, "help");
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

    if( GiornoCambiato()) console.log("Cambiato Giorno");
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
        var quest = rispondi(questions.domandone);
        bot.sendMessage(msg.chat.id, "Bartek si Domanda: \n" + quest);
    } else {
        bot.sendMessage(msg.chat.id, whats);
    }
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

async function  aggiugiSuRedis(mode, msg, arrayname){
    if (questions && questions != ''){
        var newone = msg.text.replace(mode, "").trim();
        var check = questions[arrayname].filter(x=> x.includes(newone) || newone.includes(x)) ;  
        if(check.length == 0){
            questions[arrayname].push(newone);
            await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
            delay(100).then(() => console.log('ran after .1 second1 passed'));
            await redisClient.getJson(msg.chat.id,questionsRedisKey);
            console.log("aggiunto " + newone);
            bot.sendMessage(msg.chat.id, "Aggiuto:  " +newone);
        } else {
            bot.sendMessage(msg.chat.id, "esiste già " +newone);
            console.log("esiste già " +newone);
        }
    }
    else {
        bot.sendMessage(msg.chat.id, "Problemi com " + mode);
        console.log("Problemi com " + mode);
    }
  }

  async function  rimuoviSuRedis(mode, msg, arrayname){
    console.log(mode);
    if (questions && questions != ''){
        var newone = msg.text.replace(mode, "").trim();
        var check = questions[arrayname].filter(x=> x.includes(newone) || newone.includes(x)) ;  
        if(check.length = 1 && questions[arrayname].filter(x=> x== newone).length == 1){
            questions[arrayname] = questions[arrayname].filter(x=> x!= newone);
            await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
            delay(500).then(() => console.log('ran after .1 second1 passed'));
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
  
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
  
//