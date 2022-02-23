
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
			
			let ids=args[1].split(",");
			for(let i in ids){
				let el_num=ids[i]
				let quien=await utils.getUserByNum(el_num)
				await utils.cambiarEstado(quien.num,quien.nota,'aprobado',message)

				let rJugador = message.guild.roles.cache.find(r => r.name === "Jugador");
				await message.guild.members.fetch()
				let ingreso=message.guild.members.cache.find(c => c.id==quien.discord)
				ingreso.roles.add(rJugador);

				let rCanal = message.guild.channels.cache.find(c => c.id == 867150874912882688);//canal general
				let embed = new MessageEmbed().setTitle('Nuevo Ingreso!').setDescription("Felicitaciones a <@"+quien.discord+"> "+quien.name+"(#"+quien.num+")\nYa eres parte de la academia").setColor('GREEN').setTimestamp()
				rCanal.send({content: ` `,embeds: [embed]})


			}
		}
	}
});
