
const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "aprobar",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.reply('No tienes permisos para correr este comando')
		if(args.length==3){	
            let quien=await utils.getWalletByNum(args[1])
			let name=args[2]
			let db = await DbConnection.Get();
			console.log({ accountAddress:quien},{ $set: {'name':name,'nota':'aprobada'}})
			await db.collection("users").updateOne({ accountAddress:quien},{ $set: {'name':name,'nota':'aprobada'}} )
			message.reply('El jugador fue aprobado con exito')
			let rCanal = message.guild.channels.cache.find(c => c.id == 917380557099380816);//canal ingresos
			rCanal.send('Felicitaciones a '+name+' bienvenido a ronimate!. Ya puedes escribir !roni para validarte.')

		}
	}
});
