const emoji = require("node-emoji");

module.exports.Commands = {
    Start : "Start",
    Init : /init/,
    AddIcs : /IcsAdd /,
    RemoveIcs : /IcsRemove /,
    AddMangiamo : /MangiareAdd /,
    RemoveMangiamo : /MangiareRemove /,
    AddBartek : /BartekAdd /,
    RemoveBartek: /BarteKRemove /,
    Ics : /ics/,
    Bartek : /Domandati/,
    Mangiamo : /Mangiamo/,
    RDiceCose: /RDicecose/,
    AddRDiceCose: /RDiceAdd /,
    RemoveRDiceCose: /RDiceRemove /,
   },
   module.exports.CommandsFake = {
    Start : "No sStart",
    Init : /No init/,
    AddIcs : /No IcsAdd /,
    RemoveIcs : /No IcsRemove /,
    AddMangiamo : /No MangiareAdd /,
    AddBartek : /No BartekAdd /,
    RemoveBartek: /No BarteKRemove /,
    Ics : /No ics/,
    Bartek : /No Domandati/,
    Mangiamo : /No Mangiamo/,
    RDiceCose: /No RDicecose/
   }