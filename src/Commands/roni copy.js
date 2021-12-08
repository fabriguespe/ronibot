/** @format */
const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

const ID_ROL_JUGADOR="Jugador"
module.exports = new Command({
	name: "roni",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		message.channel.bulkDelete(2);
		let row=new MessageActionRow()
		row.addComponents(new MessageButton().setCustomId('ticket_soporte').setLabel('🎫 Crear Ticket').setStyle('PRIMARY'));
		if(utils.esJugador(message)){
			row.addComponents(new MessageButton().setCustomId('desvalidarme').setLabel('☠️ Desasociar').setStyle('DANGER'));
		}else{
			row.addComponents(new MessageButton().setCustomId('asociar').setLabel('🔑 Ingresar').setStyle('SUCCESS'));
			//row.addComponents(new MessageButton().setCustomId('cobros').setLabel('🤑 Cobrar').setStyle('SUCCESS'));
		} 
		const embed = new MessageEmbed()
		.setColor('BLUE').setAuthor(message.guild.name, message.guild.iconURL({dynamic: true})).setDescription("__**Hola! Soy Roni**__\n> Elige la opción deseada")

        let tr=null
		if( interaction.customId=='ticket_soporte'){
			tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nCon que deseas que te ayude?`)
		}else if( interaction.customId=='asociar'){
			tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`)
		}else if( interaction.customId=='desvalidarme'){
			tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`)
		}else if( interaction.customId=='cobros'){
		}else if( interaction.customId=='cerrar_ticket'){
			const thread = interaction.channel
			thread.delete();
		}
		tr.send({embeds: [embed], components: [row]});
	}
});
