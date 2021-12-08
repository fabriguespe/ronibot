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
		.setColor('BLUE').setAuthor(message.guild.name, message.guild.iconURL({dynamic: true})).setDescription("__**Hola! Soy Roni**__\n> Elige la opción deseada")

        message.channel.send({embeds: [embed], components: [row]});
	}
});
