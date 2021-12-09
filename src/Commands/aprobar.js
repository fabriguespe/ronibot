
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
			await db.collection("users").updateOne({ num:args[1]}, { $set: {entrevista: null} })
			message.reply('El jugador fue aprobado con exito')
		}


	}
});
