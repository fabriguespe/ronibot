/** @format */
const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "roni",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		message.channel.bulkDelete(2);
		let row=new MessageActionRow()
		row.addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('🗑️ Cerrar Ticket').setStyle('DANGER'),);
		row.addComponents(new MessageButton().setCustomId('ticket_soporte').setLabel('👩🏻‍🚒 Hablar con Soporte').setStyle('PRIMARY'));
		if(utils.esJugador(message)){
			row.addComponents(new MessageButton().setCustomId('desasociar').setLabel('☠️ Desasociar').setStyle('DANGER'));
		}else{
			row.addComponents(new MessageButton().setCustomId('asociar').setLabel('🔑 Ingresar').setStyle('SUCCESS'));
			row.addComponents(new MessageButton().setCustomId('cobros').setLabel('🤑 Cobrar').setStyle('SUCCESS'));
		} 
		
        let rSoporte = message.guild.roles.cache.find(r => r.name === "Soporte");
        let rCategoria = message.guild.channels.cache.find(c => c.name == 'INGRESOS' && c.type == "GUILD_CATEGORY");////parent:rCategoria.id,
		
        let thread=await message.guild.channels.create('ticket-'+message.author.username, { 
            type: 'GUILD_TEXT',
			time:10000,
            permissionOverwrites: [
                {id: message.author.id,allow: ['VIEW_CHANNEL']},
                {id: rSoporte.id,allow: ['VIEW_CHANNEL']},
                {id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
            ]})
        .then(chan=>{return chan})
        .catch(console.error);
        const embed = new MessageEmbed().setTitle('Ticket')
        .setDescription(`Hola ${message.author}, soy Roni. \nCon que deseas que te ayude?`).setColor('GREEN').setTimestamp()

        await thread.send({
            content: ` `,
            embeds: [embed],
            components: [row]
        })
		let lascomnd=''
		const mcollector = thread.createMessageCollector({filter:(m) => m.author.id === message.author.id,max:1,time:10000})
		mcollector.on('collect', async message => {
			if(lascomnd=='desasociar')return utils.desasociar(message)
			else if(lascomnd=='asociar')return utils.asociar(message)
		});

		const collector = thread.createMessageComponentCollector({ componentType: 'BUTTON', time: 15000 });
		collector.on('collect',  async interaction => {
			await interaction.deferUpdate();
			let customId=interaction.customId
			console.log(interaction.customId)
			lascomnd=interaction.customId
			let jsid=interaction.user.id
			if( customId=='ticket_soporte'){
				interaction.channel.send(`Hola! <@${jsid}>`)
			}else if( customId=='asociar' || customId=='desasociar'){
				interaction.channel.send('Por favor ingresa tu contraseña')
			}else if( customId=='cobros'){
			}else if( customId=='cerrar_ticket'){
				const thread = interaction.channel
				thread.delete();
			}
			return
		});


	}
});
