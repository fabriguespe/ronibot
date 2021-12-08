/** @format */
const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

const ID_ROL_JUGADOR="Jugador"

module.exports = new Command({
	name: "r",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		let db = await DbConnection.Get();
		client.on('interactionCreate', async (interaction) => {
			if (!interaction.isButton()) return;
			await interaction.deferUpdate()
			if( interaction.customId=='ticket_soporte'){
				//const chan = await message.channel.threads.create({name:'ticket-'+message.author.username,autoArchiveDuration: 60}) 
				//await chan.setLocked(true)
				let rCategoria = message.guild.channels.cache.find(c => c.name == 'INGRESOS' && c.type == "GUILD_CATEGORY");
				const chan=await message.guild.channels.create('validacion-'+message.author.username, { 
					type: 'GUILD_TEXT',
					parent:rCategoria.id,
					permissionOverwrites: [
						{id: message.author.id,allow: ['VIEW_CHANNEL']},
						{id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
					]})
				.then(chan=>{return chan})
				.catch(console.error);
				let row=new MessageActionRow()
				row.addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('☠️ Cerrar Ticket').setStyle('DANGER'));
				chan.send({content:`Hola ${message.author}, soy Roni. \nCon que deseas que te ayude?`,components: [row]})	
				
			}else if( interaction.customId=='validar'){
				//const chan = await message.channel.threads.create({name:'ticket-'+message.author.username,autoArchiveDuration: 60}) 
				//await chan.setLocked(true)
				let rCategoria = message.guild.channels.cache.find(c => c.name == 'INGRESOS' && c.type == "GUILD_CATEGORY");
				const chan=await message.guild.channels.create('validacion-'+message.author.username, { 
					type: 'GUILD_TEXT',
					parent:rCategoria.id,
					permissionOverwrites: [
						{id: message.author.id,allow: ['VIEW_CHANNEL']},
						{id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
					]})
				.then(chan=>{return chan})
				.catch(console.error);
				let row=new MessageActionRow()
				row.addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('☠️ Cerrar Ticket').setStyle('DANGER'));
				chan.send({content:`Hola ${message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`,components: [row]})	
				chan.awaitMessages({ filter: (m) => m.author.id === message.author.id, max: 1 })
				.then(async (collected) => {
					if(collected.size==0)return
					let comando=collected.first().content
					if(comando.length>10)asociar(message,chan,comando)
				});
			}else if( interaction.customId=='desvalidarme'){
				//const chan = await message.channel.threads.create({name:'ticket-'+message.author.username,autoArchiveDuration: 60}) 
				//await chan.setLocked(true)
				let rCategoria = message.guild.channels.cache.find(c => c.name == 'INGRESOS' && c.type == "GUILD_CATEGORY");
				const chan=await message.guild.channels.create('validacion-'+message.author.username, { 
					type: 'GUILD_TEXT',
					parent:rCategoria.id,
					permissionOverwrites: [
						{id: message.author.id,allow: ['VIEW_CHANNEL']},
						{id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
					]})
				.then(chan=>{return chan})
				.catch(console.error);

				let row=new MessageActionRow()
				row.addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('☠️ Cerrar Ticket').setStyle('DANGER'));
				chan.send({content:`Hola ${message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`,components: [row]})	
				chan.awaitMessages({ filter: (m) => m.author.id === message.author.id, max: 1 })
				.then(async (collected) => {
					if(collected.size==0)return
					let comando=collected.first().content
					if(comando.length>10)remover(message,chan)
					
				});
				
			}else if( interaction.customId=='cobros'){
				//const chan = await message.channel.threads.create({name:'ticket-'+message.author.username,autoArchiveDuration: 60}) 
			}else if( interaction.customId=='cerrar_ticket'){
				//await interaction.message.channel.delete();
			}
		});
		console.log(message.channel.id)
		if(message.content=='!r' || message.channel.id=='918147724229111808'){
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
			message.channel.send({content:`Hola ${message.author}, soy Roni. \nQue deseas hacer?`,components: [row]})
		}else message.channel.bulkDelete(1);

		
    	
		
		
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
