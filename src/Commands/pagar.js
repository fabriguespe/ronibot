const path = require('path');
const Command = require("../Structures/Command.js");
var utils = require(path.resolve(__dirname, "../utils.js"));

const { MessageEmbed} = require('discord.js');


module.exports = new Command({
	name: "pagar"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
        if(args.length==4 || args.length==3){
            let slp =args[1]
            let from_acc=args[2].length<=10?await utils.getWalletByNum(args[2]):args[2]
            let to_acc=args[3]?args[3]:'ronin:b1c0e5cb955ac17d9cb42fb4ee6b6ae01b5a9c82'
            //Data
            if(!utils.isSafe(from_acc))return message.channel.send(`Una de las wallets esta mal!`);
            from_acc=from_acc.replace('ronin:','0x')

            try{
                let t1=await utils.transfer(from_acc,to_acc,slp,message)
                if(t1){
                    let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+t1+")").setColor('GREEN').setTimestamp()
                    message.channel.send({content: ` `,embeds: [embed]})
                }
            }catch(e){
                utils.log("ERROR: "+e.message,message)
            }
        }else{

            return message.channel.send(`Cantidad de argumentos invalida!`);
        }

	}
});
