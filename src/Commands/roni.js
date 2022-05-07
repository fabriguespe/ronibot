const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
DISCORD_JSON=877625345996632095//jeisson
DISCORD_FABRI=533994454391062529

module.exports = new Command({
	name: "roni"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		//if(!utils.esManager(message))return message.channel.send("You don't have the propper rights to run this command.")
		let esPagos=(utils.esJeissonPagos(message) || utils.esFabri(message) && args[1])
		if(args[1] && !esPagos)return message.channel.send("You don't have the propper rights to run this command.")
		let currentUser=args[1]?await utils.getUserByNum(args[1]):await utils.getUserByDiscord(message.author.id)
		
		let temporal=(args[2]=='--force'?true:false)&&utils.esManager(message)
		if(!temporal && (!utils.esIngresos(message) && (!currentUser || !currentUser.discord)))return message.channel.send('Usuario invalido')
		let ticket_name=(!esPagos?'ticket':'pagos')+(currentUser?"-"+currentUser.num:"")+"-"+(esPagos?'':message.author.username)
		try{
			let eliminar = message.guild.channels.cache.find(c => c.name == ticket_name)
			if(eliminar)await eliminar.delete()
		}catch(e){
			console.log("ERROR",e.message)
		}
		
		//909634641030426674 INGRESOS //866879155350143006 COMUNIDAD //921106145811263499 PAGOS
		let rSoporte = message.guild.roles.cache.find(r => r.name === "Soporte");
		let rCategoria = message.guild.channels.cache.find(c => c.id == (args[1]?921106145811263499:utils.esJugador(message)?866879155350143006:909634641030426674) && c.type=='GUILD_CATEGORY');
		let thread=await message.guild.channels.create(ticket_name, { 
		type: 'GUILD_TEXT',parent:rCategoria?rCategoria.id:null,permissionOverwrites: [{id: message.author.id,allow: ['VIEW_CHANNEL']},{id: rSoporte.id,allow: ['VIEW_CHANNEL']},{id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
		]}).then(chan=>{return chan})
		let embed = new MessageEmbed().setTitle('Nuevo Ticket')
		.setDescription(`CLICK AQUI PARA CONTINUAR ----->>> <#${thread.id}>`).setColor('GREEN').setTimestamp()
		await message.channel.send({content: ` `, embeds: [embed]})

		let row=new MessageActionRow()
		row.addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('🗑️ Cerrar Ticket').setStyle('DANGER'));
		row.addComponents(new MessageButton().setCustomId('ver_datos').setLabel('🎮 Datos de Acceso').setStyle('SUCCESS'));
		if(utils.esManager(message) || (temporal || utils.esFechaCobros()))row.addComponents(new MessageButton().setCustomId('cobros').setLabel('🤑 Cobrar').setStyle('SUCCESS'));
		if(utils.esManager(message))row.addComponents(new MessageButton().setCustomId('desasociar').setLabel('☠️ Desasociar').setStyle('DANGER'));
		//row.addComponents(new MessageButton().setCustomId('ticket_soporte').setLabel('👩🏻‍🚒 Hablar con Soporte').setStyle('PRIMARY'));
		//row.addComponents(new MessageButton().setCustomId('asociar').setLabel('🗺 Asociar').setStyle('SUCCESS'));
		
		embed = new MessageEmbed().setTitle('Ticket')
		.setDescription(`Hola ${message.author}, soy Roni. \nPor favor seleccioná una opción tocando el boton correspondiente\nROL:`+(utils.esJugador(message)?'Jugador':'Sin Rol')).setColor('GREEN').setTimestamp()
		await thread.send({content: ` `,embeds: [embed],components: [row] })
		let lascomnd=''
		/*const mcollector = thread.createMessageCollector({filter:(m) => m.author.id === message.author.id,max:1})
		mcollector.on('collect', async message => {
			if(lascomnd=='desasociar')return utils.desasociar(message)
			else if(lascomnd=='asociar')return utils.asociar(message)
		});*/

		const collector = thread.createMessageComponentCollector({ componentType: 'BUTTON'/*, time: 600000*/ });
		collector.on('collect',  async interaction => {
			await interaction.deferUpdate();
			let customId=interaction.customId
			lascomnd=interaction.customId
			if( customId=='ticket_soporte'){
				interaction.channel.send(`Hola! <@${DISCORD_JSON}>, necesito de tu ayuda`)
			}else if( customId=='ver_datos'){
				return utils.ver_datos(currentUser,interaction.message)
			}else if( customId=='asociar' || customId=='desasociar'){
				interaction.channel.send('Por favor ingresa tu contraseña. Tenes 60 segundos.')
			}else if( customId=='cobros'){
				interaction.channel.send('Aguarde un momento...') 
				let data=await utils.claimData(currentUser,interaction.message)
				if(data.jugador_slp==0){
					interaction.channel.send('Tu cuenta no tiene SLP para reclamar\nEste canal se cerrara en 20 segundos.') 
					setTimeout(() => { interaction.channel.delete()}, 2000*10)
				}else if(data.hours>0 && !data.has_to_claim){
					interaction.channel.send('Faltan '+data.hours+' hs para que puedas reclamar\nEste canal se cerrara en 20 segundos.') 
					setTimeout(() => { interaction.channel.delete()}, 2000*10)
				}else if( data.scholarPayoutAddress==null ||  data.scholarPayoutAddress==undefined || data.scholarPayoutAddress.length<=20){
					thread.send(`La cuenta no tiene wallet para depositar.\nNotificale cual a <@${DISCORD_JSON}>\nEste canal se cerrara en 20 segundos.`) 
					setTimeout(() => { interaction.channel.delete()}, 2000*10)
				}else{
					interaction.channel.send('Escribe un comando (si/no) para continuar...').then(function (message) {
					const filter = m => m.author.id === message.author.id;
					const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ['time'] })
					collector.on('collect',async m => {
							if(m.author.id==908739379059626094 || (!esPagos && (m.author.id==DISCORD_JSON  || m.author.id==DISCORD_FABRI)))return
							if (m.content && m.content.toLowerCase() == "si") {
								let fallo=await utils.cobro(data,message)
								if(!fallo && !args[1]){
									message.channel.send('Exito!\nEste canal se cerrara en 30 segundos.')
									setTimeout(() => { message.channel.delete()}, 3000*10)
								}else if(!fallo && args[1]){
									message.channel.send('Exito!\.')
								}else{
									//return interaction.channel.send('Hubo un error!')
								}
							} else if (m.content.toLowerCase() == "no") {
								message.channel.send('Este canal se cerrara en 3 segundos.')
								setTimeout(() => { message.channel.delete()}, 3000)
							}
						})
					})
				}
			}else if( customId=='cerrar_ticket'){
				const thread = interaction.channel
				thread.delete();
			}
			return
		});
	}
});
