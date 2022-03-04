const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var utils = require(path.resolve(__dirname, "../utils.js"));




module.exports = new Command({
	name: "cambio"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
     
        if(args.length==4){
            let user_from=await utils.getUserByNum(args[2])
            if(args[2]=='1' && !utils.esFabri(message))return message.channel.send('No tienes permisos ')
            let user_to=await utils.getUserByNum(args[3])
            
            let from_acc=(user_from && user_from.accountAddress?user_from.accountAddress:user_from)
            let to_acc=(user_to && user_to.accountAddress?user_to.accountAddress:user_to)
            let num_from=(user_from && user_from.num)?user_from.num:args[2]
            let num_to=(user_to && user_to.num)?user_to.num:args[3]

            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')
            
            
            let axies_ids=args[1].split(",");
            for(let i in axies_ids){
                let axie_id=axies_ids[i]
                await utils.transferAxie(from_acc,to_acc,num_from,num_to,axie_id,message)
            }
            utils.log("Listo!",message);           
        }

	}
});
