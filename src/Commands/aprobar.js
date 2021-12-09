
const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "aprobar",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(args.length==2){
			let db = await DbConnection.Get();
			var myquery = { num:args[0]};
			let rJugador = message.guild.roles.cache.find(r => r.name === "Jugador");
			message.member.roles.remove(rJugador);
			await db.collection("users").updateOne(myquery, { $set: {entrevista: null} })
			
			message.reply('El jugador fue aprobado con exito')
		}


	}
});
