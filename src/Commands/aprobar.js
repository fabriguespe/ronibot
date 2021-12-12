
const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "update",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(message.author.id!=533994454391062529)return message.reply('No tienes permisos para correr este comando')
		if(args.length==4){
			let field=args[1]
			let value=args[2]
			let key=args[3]
			let db = await DbConnection.Get();
			await db.collection("users").updateOne({ num:field}, { $set: {key: value} })
			message.reply('El jugador fue aprobado con exito')
		}


	}
});
