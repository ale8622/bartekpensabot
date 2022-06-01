require("./app")
const redisClient = require("./redisClient")
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


async function readQuestions(msg) {
    console.log("Leggo da redis (readQuestions)");
    try{
        return await redisClient.getJson(msg.chat.id,questionsRedisKey);
    } 
    catch (ex){
        console.log("non rieco a leggere da redis");
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

bot.onText(/^[\/]{1}Start/, async (msg) => {
    console.log("Start from " + msg.from.username);

    bot.sendMessage(msg.chat.id, Constants.WelcomeMessage, {
        reply_markup : {
            keyboard : [[Constants.Question],[Constants.Lunch],[Constants.Ics],[Constants.Rigat],],
            force_reply : true
        }
    })

    questions = await readQuestions(msg);
    console.log("Read redis values");
    if(!questions) {
       console.log("Init redis values");
       await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions_bck));
       questions = questions_bck;
       console.log("Init redis values - ended");
    }else {
        await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
    }
    console.log("In questions");
    console.log(questions);

});

bot.onText(/init/, async (msg) => {
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


  bot.onText(/addmangiare/, async (msg) => { 
    console.log("addmangiare");
    var newone = msg.text.toLowerCase().replace("addmangiare", "").trim();
    var check = questions.pranzo.filter(x=> x.includes(newone) || newone.includes(x)) ;
    if(check.length == 0){
        questions.pranzo.push(newone);
        await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
        await redisClient.getJson(msg.chat.id,questionsRedisKey);
        console.log("aggiunto " + newone);
    } else {
        bot.sendMessage(msg.chat.id, "esiste già " + newone);
        console.log("esiste già " +newone);
        bot.mess
    }
  });

  bot.onText(/addbartek/, async (msg) => { 
    console.log("addbartek");
    var newone = msg.text.replace("addbartek", "").trim();
    var check = questions.domandone.filter(x=> x.includes(newone) || newone.includes(x)) ;
    if(check.length == 0){
        questions.domandone.push(newone);
        await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
        await redisClient.getJson(msg.chat.id,questionsRedisKey);
        console.log("aggiunto " + newone);
    } else {
        bot.sendMessage(msg.chat.id, "esiste già " +newone);
        console.log("esiste già " +newone);
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

 bot.onText(/RDicecose/, async (msg) => {
   
    if(questions && questions.Rigat) {
        var quest = rispondi(questions.Rigat);
        bot.sendMessage( msg.chat.id, "R. dice: " +  quest);
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

bot.onText(/Domandati/, async (msg) => {
    await setMessageForUser(msg);
    console.log("Domandati");
    console.log(questions.domandone);
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
