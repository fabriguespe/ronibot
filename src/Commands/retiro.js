
const Command = require("../Structures/Command.js");

const path = require('path');
var utils = require(path.resolve(__dirname, "../utils.js"));


module.exports = new Command({
	name: "retiro"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
        if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
        if(args.length==3){
            try{
           

                //IDs
                let user_from=await utils.getUserByNum(args[1])
                let user_to=await utils.getUserByNum(args[2])
                
                let from_acc=(user_from && user_from.accountAddress?user_from.accountAddress:user_from)
                let to_acc=(user_to && user_to.accountAddress?user_to.accountAddress:user_to)
                let num_from=(user_from && user_from.num)?user_from.num:args[1]
                let num_to=(user_to && user_to.num)?user_to.num:args[2]
                
                //build
                let axies_to=await utils.getAxiesIds(to_acc)
                if((!axies_to || axies_to.count==3) && args[2].toLowerCase()!='breed')return message.channel.send(`La cuenta destino ya tiene axies!`);
                //Data
                if(!utils.isSafe(from_acc) || !utils.isSafe(to_acc))return message.channel.send(`Una de las wallets esta mal!`);
                from_acc=from_acc.replace('ronin:','0x')
                to_acc=to_acc.replace('ronin:','0x')

                //build
                let axies=await utils.getAxiesIds(from_acc)
                if(!axies || !axies.axies)return message.channel.send(`Failed to get axies!`);
                for(let i in axies.axies){
                    let axie_id=axies.axies[i].id
                    await utils.transferAxie(from_acc,to_acc,num_from,num_to,axie_id,message)
                }
                await utils.cambiarEstado(user_from.num,user_from.nota,'retiro',message)
                await utils.cambiarEstado(user_to.num,user_to.nota,'libre',message)
                utils.log("Listo!",message);
        
        }catch(e){
            utils.log(e,message)
        }   
     }else{
            utils.log(`not a valid command!`);
    }
	}
});
