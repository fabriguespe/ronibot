
const Command = require("../Structures/Command.js");

const path = require('path');
var utils = require(path.resolve(__dirname, "../utils.js"));

const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "retiro"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
        if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
        try{
            if(args.length==3){

                //IDs
                let user_from=await utils.getUserByNum(args[1])
                let user_to=await utils.getUserByNum(args[2])
                
                let from_acc=(user_from && user_from.accountAddress?user_from.accountAddress:user_from)
                let to_acc=(user_to && user_to.accountAddress?user_to.accountAddress:user_to)
                let num_from=(user_from && user_from.num)?user_from.num:args[1]
                let num_to=(user_to && user_to.num)?user_to.num:args[2]

                //Data
                if(!utils.isSafe(from_acc) || !utils.isSafe(to_acc))return message.channel.send(`Una de las wallets esta mal!`);
                from_acc=from_acc.replace('ronin:','0x')
                to_acc=to_acc.replace('ronin:','0x')

                //build
                let axies=await utils.getAxiesIds(from_acc)
                for(let i in axies.axies){
                    let axie_id=axies.axies[i].id
                    //Transfer
                    await utils.transferAxie(from_acc,to_acc,num_from,num_to,axie_id,message)
            
                    //Retirar
                    await utils.cambiarEstado(user_from.num,'retiro',message)
                    
                    let rCanal = message.guild.channels.cache.find(c => c.id == 867150874912882688);//canal ingresos
                    rCanal.send({content: ` `,embeds: [new MessageEmbed().setTitle('Retiro').setDescription("El jugador #"+user_from.num+" fue retirado").setColor('GREEN').setTimestamp()]})
                    
                }
                
                utils.log("Listo!",message);
            }else{
                utils.log(`not a valid command!`);
            }
        }catch(e){
            message.channel.send("ERROR: "+e.message);
        }
	}
});
