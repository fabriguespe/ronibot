/** @format */
const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));

const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
const NUEVOS_CATE="INGRESOS"

const ID_ROL_JUGADOR="909513474563014717"

async function asociar(message,chan,psw){
	
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
			let rJugador = message.guild.roles.cache.find(r => r.id === ID_ROL_JUGADOR);
			message.member.roles.add(rJugador);
			chan.send('Fuiste validado con exito.')
			//chan.delete()
		}
	}catch(e){
		utils.log(e)
	}
}

async function remover(message,chan){
	console.log('entra')
	let db = await DbConnection.Get();
	var myquery = { discord:message.author.id };
	console.log(myquery)
	var newvalues = { $set: {discord: null} };
	
	let rJugador = message.guild.roles.cache.find(r => r.id === ID_ROL_JUGADOR);
	message.member.roles.remove(rJugador);
	await db.collection("users").updateOne(myquery, newvalues)
	chan.send('Fuiste removido con exito.')
}

module.exports = new Command({
	name: "validar",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		
		try {
			client.on('interactionCreate', async (interaction) => {
				if (!interaction.isButton()) return;
				if(interaction.customId=='primary'){
					let existe=message.guild.channels.cache.find(c => c.id === interaction.message.channel.id)
					
					
					if(existe){
						console.log(interaction.message.channel)
						//interaction.message.channel.delete()
					}
					else console.log('no existe el canal')
				}
			});
			if (message.author.bot) return false; 
			let db = await DbConnection.Get();

			let rCategoria = message.guild.channels.cache.find(c => c.name == NUEVOS_CATE && c.type == "GUILD_CATEGORY");

			let chan=await message.guild.channels.create('validacion-'+message.author.username, { 
				type: 'GUILD_TEXT',
				parent:rCategoria.id,
				permissionOverwrites: [
					{id: message.author.id,allow: ['VIEW_CHANNEL']},
					{id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
				]})
			.then(chan=>{return chan})
			.catch(console.error);

			let result = await db.collection('users').findOne({discord:message.author.id})

			message.reply('Continua tu validación de una manera segura aquí: '+message.guild.channels.cache.get(chan.id).toString())
			
			let row = new MessageActionRow().addComponents(new MessageButton().setCustomId('primary').setLabel('Cerrar').setStyle('PRIMARY'));
			//if(result)row=new MessageActionRow().addComponents(new MessageButton().setCustomId('primary').setLabel('Cerrar').setStyle('PRIMARY'),new MessageButton().setCustomId('secondary').setLabel('Remover').setStyle('SECONDARY'));
			if(!result)chan.send(`Hola ${message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`)
			else chan.send('Ya estas validado con discord\nDeseas salir? Escribe: remover')
			
			
			chan.send({content:'Acciones:',components: [row] });

			utils.log('Channel creado: '+chan.id)

			chan.awaitMessages({ filter: (m) => m.author.id === message.author.id, max: 1 })
			.then(async (collected) => {
				if(collected.size==0)return
				let comando=collected.first().content
				if(comando=='remover')remover(message,chan)
				else if(comando.length>10)asociar(message,chan,comando)
				else chan.send('Comando incorrecto.')
			});
			
		} catch (e) {
			return e;
		}
	}
});
