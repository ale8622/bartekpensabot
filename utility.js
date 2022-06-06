const { Constants } = require("./constants");
const { Commands } = require("./commands");
const redisClient = require("./redisClient")


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
    },
    
    readMessageForUser: async function (msg) {
        return await redisClient.getInt(msg.chat.id, msg.from.username);
    }


}

