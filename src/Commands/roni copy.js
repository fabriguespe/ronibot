const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
const jsid=877625345996632095//jeisson

module.exports = new Command({
	name: "roni"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		let temporal=false
		
		let esPagos=(utils.esJeissonPagos(message) || utils.esFabri(message) && args[1])
		if(args[1] && !esPagos)return message.channel.send('No tienes permisos para correr este comando')
		let currentUsers=args[1]?await utils.getUserByNum(args[1]):await utils.getUserByDiscord(message.author.id)
		
		let rows=[]
		for(let i in currentUsers){
			
			if(i==0){
				rows[i]=new MessageActionRow()
				rows[i].addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('🗑️ Cerrar Ticket').setStyle('DANGER'));
				rows[i].addComponents(new MessageButton().setCustomId('asociar').setLabel('🗺 Asociar').setStyle('SUCCESS'));
			}
			let currentUser=currentUsers[i]

			if(!temporal && (!utils.esIngresos(message) && !currentUser))return message.channel.send('Usuario invalido')
			if(!temporal && (!utils.esIngresos(message) && !currentUser.discord))return message.channel.send('Usuario no validado')
			
			if(utils.esJugador(message)){
				if(temporal || utils.esFechaCobros())rows[i].addComponents(new MessageButton().setCustomId('cobros_'+i).setLabel('🤑 Cobrar '+currentUser.num).setStyle('SUCCESS'));
				rows[i].addComponents(new MessageButton().setCustomId('ticket_'+i).setLabel('👩🏻‍🚒 Hablar con Soporte').setStyle('PRIMARY'));
				rows[i].addComponents(new MessageButton().setCustomId('desasociar_'+i).setLabel('☠️ Desasociar '+currentUser.num).setStyle('DANGER'));
				rows[i].addComponents(new MessageButton().setCustomId('datos_'+i).setLabel('🔑 Ver mis datos '+currentUser.num).setStyle('SUCCESS'));
			}else if(esPagos){
				rows[i].addComponents(new MessageButton().setCustomId('cobros_'+i).setLabel('🤑 Pagar '+currentUser.num).setStyle('SUCCESS'));
			}
		}


		let ticket_name=(!esPagos?'ticket':'pagos')+(currentUsers?"-"+currentUsers[0].num:"")+"-"+(esPagos?'':message.author.username)
			
		try{
			let eliminar = message.guild.channels.cache.find(c => c.name == ticket_name)
			if(eliminar)await eliminar.delete()
		}catch(e){
			console.log("ERROR",e.message)
		}

		let rSoporte = message.guild.roles.cache.find(r => r.name === "Soporte");
		//909634641030426674 INGRESOS
		//866879155350143006 COMUNIDAD
		//921106145811263499 PAGOS
        let rCategoria = message.guild.channels.cache.find(c => c.id == (args[1]?921106145811263499:utils.esJugador(message)?866879155350143006:909634641030426674) && c.type=='GUILD_CATEGORY');
	
		let thread=await message.guild.channels.create(ticket_name, { 
		type: 'GUILD_TEXT',
		parent:rCategoria?rCategoria.id:null,
		permissionOverwrites: [
			{id: message.author.id,allow: ['VIEW_CHANNEL']},
			{id: rSoporte.id,allow: ['VIEW_CHANNEL']},
			{id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
		]}).then(chan=>{return chan})
        let embed = new MessageEmbed().setTitle('Nuevo Ticket')
        .setDescription(`CLICK AQUI PARA CONTINUAR ----->>> <#${thread.id}>`).setColor('GREEN').setTimestamp()

        await message.channel.send({content: ` `, embeds: [embed]})
		
		embed = new MessageEmbed().setTitle('Ticket')
        .setDescription(`Hola ${message.author}, soy Roni. \nPor favor seleccioná una opción tocando el boton correspondiente`).setColor('GREEN').setTimestamp()

        await thread.send({content: ` `,embeds: [embed],components: [rows] })
		let lascomnd=''
		const mcollector = thread.createMessageCollector({filter:(m) => m.author.id === message.author.id,max:1/*,time:600000*/})
		mcollector.on('collect', async message => {
			if(lascomnd=='desasociar')return utils.desasociar(message)
			else if(lascomnd=='asociar')return utils.asociar(message)
		});

		const collector = thread.createMessageComponentCollector({ componentType: 'BUTTON'/*, time: 600000*/ });
		collector.on('collect',  async interaction => {
			await interaction.deferUpdate();
			let customId=interaction.customId
			let id_inte=interaction.customId.split('_')[1]
			console.log(customId,id_inte)
			lascomnd=interaction.customId
			if( customId=='ticket'){
				interaction.channel.send(`Hola! <@${jsid}>, necesito de tu ayuda`)
			}else if( customId.includes('datos')){
				return utils.ver_datos(currentUsers[id_inte],interaction.message)
			}else if( customId=='asociar' || customId.includes('desasociar')){
				interaction.channel.send('Por favor ingresa tu contraseña. Tenes 60 segundos.')
			}else if( customId.includes('cobros')){
				interaction.channel.send('Aguarde un momento...') 
				let data=await utils.claimData(currentUsers[id_inte],interaction.message)
				if(!(data.unclaimed>=0)){
					interaction.channel.send('Tu cuenta no tiene SLP para reclamar\nEste canal se cerrara en 20 segundos.') 
					setTimeout(() => { interaction.channel.delete()}, 2000*10)
				}else if(data.unix_ahora<data.unix_prox){
				
					let diffInMilliSeconds=(data.unix_prox)-(data.unix_ahora)
					let hours = (diffInMilliSeconds / 3600).toFixed(2)
					interaction.channel.send('Faltan '+hours+' hs para que puedas reclamar\nEste canal se cerrara en 20 segundos.') 
					setTimeout(() => { interaction.channel.delete()}, 2000*10)
				}else if( data.scholarPayoutAddress==null ||  data.scholarPayoutAddress==undefined || data.scholarPayoutAddress.length<=20){
					thread.send(`La cuenta no tiene wallet para depositar.\nNotificale cual a <@${jsid}>\nEste canal se cerrara en 20 segundos.`) 
					setTimeout(() => { interaction.channel.delete()}, 2000*10)
				}else{
					interaction.channel.send('Escribe un comando (si/no) para continuar...').then(function (message) {
						const filter = m => m.author.id === message.author.id;
						const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ['time'] })
						collector.on('collect',async m => {
							if(m.author.id==908739379059626094 || (!esPagos && (m.author.id==877625345996632095  || m.author.id==533994454391062529)))return //ronibot
							if (m.content.toLowerCase() == "si") {
								let fallo=await utils.claim(data,message)
								if(!fallo && !args[1]){
									message.channel.send('Exito!\nEste canal se cerrara en 30 segundos.')
									setTimeout(() => { message.channel.delete()}, 3000*10)
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
