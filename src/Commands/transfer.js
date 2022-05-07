const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "transfer"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send("You don't have the propper rights to run this command.")
        
        if(args[1]=='axie' && args.length==4){
            let user_from=await utils.getUserByNum(args[3])
            let user_to=await utils.getUserByNum(args[4])
            
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
        }else if(args[1]=='slp' ){

            let qty=args[2]
            if(qty.includes('usd')){
                let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
                let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
                usd=qty.replace('usd','')
                qty=Math.round(usd/slp_price)
            }
            let from_acc=await utils.getPaymentWalletByNum("BREED")
            let to_acc=await utils.getPaymentWalletByNum(args[2])
            console.log(to_acc)
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            await utils.transfer(from_acc,to_acc,qty,message)

        }else{
            utils.log("El comando tiene un error (espacios, mal escrito, etc)",message);       
        }
	}
});
