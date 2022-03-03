const path = require('path');
const fetch = require( "node-fetch")
const Command = require("../Structures/Command.js");
var utils = require(path.resolve(__dirname, "../utils.js"));

const { MessageEmbed} = require('discord.js');


module.exports = new Command({
	name: "pagar"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
        let slp=args[1]
        let from_acc=''
        let to_acc=''
        if(args.length==4 /*&& (args[2]=='amaloa' || args[2]=='jeisson' || args[2]=='pablo')*/){
            from_acc=await utils.getWalletByNum(args[2])
            to_acc=await utils.getPaymentWalletByNum(args[3])
            
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')
            console.log(from_acc,to_acc,slp)
            let t1=await utils.transfer(from_acc,to_acc,slp,message)

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

            let t1=await utils.transfer(from_acc,to_acc,slp,message)

        }else if(args.length==3){//sale de breed
            
            from_acc=await utils.getPaymentWalletByNum("BREED")
            to_acc=await utils.getPaymentWalletByNum(args[2])
            console.log(to_acc)
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            let t1=await utils.transfer(from_acc,to_acc,slp,message)
        }else{
            return message.channel.send(`Cantidad de argumentos invalida!`);
        }

	}
});
