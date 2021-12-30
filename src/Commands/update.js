
const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "update",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
		if(args.length==4){	
            let quien=await utils.getWalletByNum(args[1])
			let key=args[2]
			if(key=='wallet')key='scholarPayoutAddress'
			let value=args[3]
			let armado={}
			armado[key]=value
			let values={ $set: armado }
			let db = await DbConnection.Get();
			await db.collection("users").updateOne({ accountAddress:quien},values )
			message.channel.send('El jugador fue actualizado con exito')
			//let rCanal = message.guild.channels.cache.find(c => c.id == 917380557099380816);//canal ingresos
			//if(value=='aprobada')rCanal.send('El jugador fue actualizado con exito')
		}
	}
});
