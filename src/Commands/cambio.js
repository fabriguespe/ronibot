const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var utils = require(path.resolve(__dirname, "../utils.js"));




module.exports = new Command({
	name: "cambio"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
        if(args.length==4){

            //IDs
            let user_from=await utils.getUserByNum(args[2])
            let user_to=await utils.getUserByNum(args[3])
            let from_acc=user_from.accountAddress
            let to_acc=user_to.accountAddress
            let num_from=user_from.num
            let num_to=user_to.num

            let axie_id=args[1]
            //Data
            if(!utils.isSafe(from_acc) || !utils.isSafe(to_acc))return message.channel.send(`Una de las wallets esta mal!`);
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            await utils.transferAxie(from_acc,to_acc,num_from,num_to,axie_id,message)
           
        }else{

            return message.channel.send(`${args[0]} is not a valid command!`);
        }

	}
});
