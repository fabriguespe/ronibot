const path = require('path');
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
                from_acc=await utils.getWalletByNum()
                from_acc=!args[2]?await utils.getWalletByNum("BREED"):args[2].length<=10?await utils.getWalletByNum(args[2]):args[2]
                args[3]=='amaloa'?args[3]='ronin:9a9dc8ab2474625cb58bca01beb72759e2c7efaa':args[3]=='pablo'?args[3]='ronin:f0c889583622f97c67e2fc4cf2a5ce214f7eee8c':args[3]=='jeisson'?args[3]='ronin:9f1c0c36728b3341084adaad489a651394c9e40a':args[3]
                to_acc=!args[3]?await utils.getWalletByNum("BREED"):args[3].length<=10?await utils.getWalletByNum(args[3]):args[3]
                
            from_acc=from_acc.replace('ronin:','0x')
            let t1=await utils.transfer(from_acc,to_acc,slp,message)
            if(t1){
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+t1+")").setColor('GREEN').setTimestamp()
                message.channel.send({content: ` `,embeds: [embed]})
            }
        }else{
            return message.channel.send(`Cantidad de argumentos invalida!`);
        }

	}
});
