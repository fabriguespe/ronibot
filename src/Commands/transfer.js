const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "transfer"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send("You don't have the propper rights to run this command.")
        let from=args.length==5?args[3]:'breed'
        let to=args.length==5?args[4]:args[3]

        if(args[1]=='axie' && (args.length==5 || args.length==4)){
            let user_from=await utils.getUserByNum(from)
            let user_to=await utils.getUserByNum(to)
            
            let from_acc=(user_from && user_from.accountAddress?user_from.accountAddress:user_from)
            let to_acc=(user_to && user_to.accountAddress?user_to.accountAddress:user_to)
            let num_from=(user_from && user_from.num)?user_from.num:args[3]
            let num_to=(user_to && user_to.num)?user_to.num:args[4]

            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')
            
            
            let axies_ids=args[2].split(",");
            try{    
                for(let i in axies_ids){
                    let axie_id=axies_ids[i]
                    await utils.transferAxie(from_acc,to_acc,num_from,num_to,axie_id,message)
                }
                utils.log("Success!",message);     
            }catch{
                utils.log("Error",message);     
            }
        }else if(args[1]=='slp' && (args.length==5 || args.length==4)){

            let qty=args[2]
            let from_acc=await utils.getPaymentWalletByNum(from)
            let to_acc=await utils.getPaymentWalletByNum(to)
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            await utils.transfer(from_acc,to_acc,qty,message)

        }else if(args[1]=='usd' && (args.length==5 || args.length==4)){

            let qty=args[2]
            let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
            let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
            qty=Math.round(qty/slp_price)
            console.log(from,to)
            let from_acc=await utils.getPaymentWalletByNum(from)
            let to_acc=await utils.getPaymentWalletByNum(to)
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            await utils.transfer(from_acc,to_acc,qty,message)
        }else{
            utils.log("Command is incorrect, check spelling, parameters, etc",message);       
        }
	}
});
