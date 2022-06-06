module.exports = {
    rispondi: function (lista){
        if( this.giornoCambiato()) console.log("cambiato Giorno");
        var isFriday = (new Date().getDay() === 5) ; 
        if(isFriday && done < friday.esclamazioni.length) {  
            perPranzo = -1;   
            return friday.esclamazioni[done++] 
    }
    else{
        return lista[Math.floor(Math.random() * lista.length)]
    }
    },

    aggiugiSuRedis: async function  (mode, msg, arrayname){
        if (questions && questions != ''){
            var newone = msg.text.replace(mode, "").trim();
            var check = questions[arrayname].filter(x=> x.includes(newone) || newone.includes(x)) ;  
            if(check.length == 0){
                questions[arrayname].push(newone);
                await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
                this.delay(100).then(() => console.log('ran after .1 second1 passed'));
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
    },

    rimuoviSuRedis: async function  (mode, msg, arrayname){
        console.log(mode);
        if (questions && questions != ''){
            var newone = msg.text.replace(mode, "").trim();
            var check = questions[arrayname].filter(x=> x.includes(newone) || newone.includes(x)) ;  
            if(check.length = 1 && questions[arrayname].filter(x=> x== newone).length == 1){
                questions[arrayname] = questions[arrayname].filter(x=> x!= newone);
                await redisClient.setJson(msg.chat.id,questionsRedisKey, JSON.stringify(questions));
                this.delay(100).then(() => console.log('ran after .1 second1 passed'));
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
    },
    
    delay: function (time) {
        return new Promise(resolve => setTimeout(resolve, time));
    },
    
    helpMessage: function  (){

        var risposta = "";
        risposta += "\n" + Commands.AddBartek + " <tx>: to Add New answer to " + Constants.Question +"";
        risposta += "\n" + Commands.RemoveBartek + " <tx>: to Remove an answer to " + Constants.Question +"";
        risposta += "\n" + Commands.AddIcs + " <tx>: to Add New item to the " + Constants.Ics +" list";
        risposta += "\n" + Commands.RemoveIcs + " <tx>: to Remove an item to the " + Constants.Ics +" list";
        risposta += "\n" + Commands.AddMangiamo + " <tx>: to Add New place where we can EAT " + Constants.Lunch +"";
        risposta += "\n" + Commands.RemoveMangiamo + " <tx>: to Remove a place where we can EAT " + Constants.Lunch +"";
        risposta += "\n" + Commands.AddRDiceCose + " <tx>: to Add New Smart Eclamation to " + Constants.RDiceCose +"";
        risposta += "\n" + Commands.RemoveRDiceCose + " <tx>: to Remove an Esclamation to " + Constants.RDiceCose +"";
        risposta += "\n" + Commands.Version + " the current version.";
        risposta += "\n" + Commands.Init + " WIP";

        return risposta;
    },

    giornoCambiato: function (dayOfWeek_global ){
        var dayOfWeek = new Date().getDay();
        if(dayOfWeek_global != dayOfWeek) {
            return true;
        }
        return false;
    }
}

