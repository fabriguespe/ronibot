/** @format */
const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

const ID_ROL_JUGADOR="Jugador"

module.exports = new Command({
	name: "roni",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		let db = await DbConnection.Get();
		
		//const newChannel = await message.channel.clone()
		//console.log(newChannel.id) // Do with this new channel ID what you want
		//await message.channel.delete()
		message.channel.bulkDelete(2);
		let row=new MessageActionRow()
		row.addComponents(new MessageButton().setCustomId('ticket_soporte').setLabel('🎫 Crear Ticket').setStyle('PRIMARY'));
		if(utils.esJugador(message)){
			row.addComponents(new MessageButton().setCustomId('desvalidarme').setLabel('☠️ Desasociar').setStyle('DANGER'));
		}else{
			row.addComponents(new MessageButton().setCustomId('validar').setLabel('🔑 Ingresar').setStyle('SUCCESS'));
			//row.addComponents(new MessageButton().setCustomId('cobros').setLabel('🤑 Cobrar').setStyle('SUCCESS'));
		} 

		const embed = new MessageEmbed()
            .setColor('BLUE')
				.setAuthor(message.guild.name, message.guild.iconURL({
					dynamic: true
				}))
				.setDescription(`Hola ${message.author}, soy Roni. \nQue deseas hacer?`)
				.setTitle('Tickets')



			message.channel.send({
				embeds: [embed],
				components: [row]
			});
		
	}
});

async function remover(message,chan,client){
	let db = await DbConnection.Get();
	var myquery = { discord:message.author.id };
	var newvalues = { $set: {discord: null} };
	let rJugador = message.guild.roles.cache.find(r => r.name === ID_ROL_JUGADOR);
	message.member.roles.remove(rJugador);
	await db.collection("users").updateOne(myquery, newvalues)
	chan.send('Fuiste removido con exito.')
}

async function asociar(message,chan,psw,client){
	
	try{
		let db = await DbConnection.Get();
		let resultpw = await db.collection('users').findOne({pass:psw})

		if(resultpw && resultpw.nota=='Entrevista')return message.reply('Estas en entrevista aún, no puedes ingresar')
		else if(resultpw){
			var myquery = { pass: psw };
			var newvalues = { $set: {
				discord: message.author.id,
				username:message.author.username,
				last_updated:new Date(Date.now()),
				timestamp:new Date(Date.now()),
				date:new Date().getDate()+'/'+(new Date().getMonth()+1)+'/'+new Date().getFullYear()
				
			}};
			await db.collection("users").updateOne(myquery, newvalues)
			let rJugador = message.guild.roles.cache.find(r => r.name === ID_ROL_JUGADOR);
			message.member.roles.add(rJugador);
			chan.send('Fuiste validado con exito.')
			//chan.delete()
		}
	}catch(e){
		utils.log(e)
	}
}
