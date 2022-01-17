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
        if(args[2]=='amaloa' || args[2]=='jeisson' || args[2]=='pablo'){
            from_acc=await utils.getWalletByNum("BREED")
            to_acc=args[2]=='amaloa'?'ronin:9a9dc8ab2474625cb58bca01beb72759e2c7efaa':args[2]=='pablo'?'ronin:f0c889583622f97c67e2fc4cf2a5ce214f7eee8c':args[2]=='jeisson'?'ronin:9f1c0c36728b3341084adaad489a651394c9e40a':''
        }else if(args.length==4 || args.length==3){
            from_acc=args[2].length<=10?await utils.getWalletByNum(args[2]):args[2]
            to_acc=!args[3]?await utils.getWalletByNum("BREED"):args[3].length<=10?await utils.getWalletByNum(args[3]):args[3]
        }else{
            return message.channel.send(`Cantidad de argumentos invalida!`);
        }
        from_acc=from_acc.replace('ronin:','0x')
        let t1=await utils.transfer(from_acc,to_acc,slp,message)
        if(t1){
            let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+t1+")").setColor('GREEN').setTimestamp()
            message.channel.send({content: ` `,embeds: [embed]})
        }

	}
});
