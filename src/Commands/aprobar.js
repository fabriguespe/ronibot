
const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));
const { MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "aprobar"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
		if(args.length==2){	
            let quien=await utils.getUserByNum(args[1])
			await utils.cambiarEstado(quien.num,'aprobado',message)
			if(!quien.discord){//old auth
				let rCanal = message.guild.channels.cache.find(c => c.id == 909165024642203658);//canal ingresos
				let embed = new MessageEmbed().setTitle('Nuevo Ingreso!').setDescription("Felicitaciones a "+quien.name+"(#"+quien.num+")\nYa puedes escribir !roni para validarte").setColor('GREEN').setTimestamp()
				rCanal.send({content: ` `,embeds: [embed]})
			}else{//new auth
				let rCanal = message.guild.channels.cache.find(c => c.id == 867150874912882688);//canal general
				let embed = new MessageEmbed().setTitle('Nuevo Ingreso!').setDescription("Felicitaciones a "+quien.name+"(#"+quien.num+")\nYa eres parte de la academia").setColor('GREEN').setTimestamp()
				rCanal.send({content: ` `,embeds: [embed]})
			}
		}
	}
});
