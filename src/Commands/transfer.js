const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "transfer"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send("You don't have the propper rights to run this command.")
        
        if(args[1]=='axie' && args.length==4 || args.length==5){
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
                    await utils.transferAxie(from_acc,to_acc,num_from,num_to,axie_id,message,args[4]=='--gas'?true:false)
                }
                utils.log("Success!",message);     
            }catch{
                utils.log("Error",message);     
            }
        }
        let slp=args[1]
        let from_acc=''
        let to_acc=''
        if(args.length==4 /*&& (args[2]=='amaloa' || args[2]=='jeisson' || args[2]=='pablo')*/){
            from_acc=await utils.getWalletByNum(args[2])
            to_acc=await utils.getPaymentWalletByNum(args[3])
            
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')
            console.log(from_acc,to_acc,slp)
            await utils.transfer(from_acc,to_acc,slp,message)

        }else if(args.length==2 && args[1]=='todos'){//sale de breed
			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
            usd=slp.replace('usd','')

            from_acc=await utils.getPaymentWalletByNum("BREED")
            from_acc=from_acc.replace('ronin:','0x')

            to_acc=await utils.getPaymentWalletByNum("PABLO")
            to_acc=to_acc.replace('ronin:','0x')
            await utils.transfer(from_acc,to_acc,Math.round(150/slp_price),message)
            
            to_acc=await utils.getPaymentWalletByNum("JEISSON")
            to_acc=to_acc.replace('ronin:','0x')
            await utils.transfer(from_acc,to_acc,Math.round(80/slp_price),message)
            
            to_acc=await utils.getPaymentWalletByNum("AMALOA")
            to_acc=to_acc.replace('ronin:','0x')
            await utils.transfer(from_acc,to_acc,Math.round(150/slp_price),message)

        }else if(args.length==3 && slp.includes('usd')){//sale de breed
			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
            usd=slp.replace('usd','')
            slp=Math.round(usd/slp_price)

            from_acc=await utils.getPaymentWalletByNum("BREED")
            to_acc=await utils.getPaymentWalletByNum(args[2])
            console.log(to_acc)
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            await utils.transfer(from_acc,to_acc,slp,message)

        }else if(args.length==3){//sale de breed
            
            from_acc=await utils.getPaymentWalletByNum("BREED")
            to_acc=await utils.getPaymentWalletByNum(args[2])
            console.log(to_acc)
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            await utils.transfer(from_acc,to_acc,slp,message)
        }else{
            return message.channel.send(`Cantidad de argumentos invalida!`);
        }else{
            
            utils.log("El comando tiene un error (espacios, mal escrito, etc)",message);       
        }
	}
});
