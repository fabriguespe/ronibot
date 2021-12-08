/** @format */

console.clear();
const path = require('path');

var utils = require(path.resolve(__dirname, "./utils.js"));
const Client = require(path.resolve(__dirname, "./Structures/Client.js"));
const config = require(path.resolve(__dirname, "./Data/config.json"));
const fetch = require( "node-fetch")
const client = new Client();
const Command = require(path.resolve(__dirname, "./Structures/Command.js"));
var DbConnection = require(path.resolve(__dirname, "./Data/db.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
const fs = require("fs");
fs.readdirSync(__dirname+"/Commands")
.filter(file => file.endsWith(".js"))
.forEach(file => {
	const command = require(__dirname+`/Commands/${file}`);
	console.log(`Command ${command.name} loaded`);
	client.commands.set(command.name, command);
});


TEST ='OTA5NTEyMjE4NjI0ODA3MDMy.YZFXQg.3_Cs0tajVJ152ySKLaDTMnF5J2Y'
client.login(TEST);

client.on("ready", message => {utils.log('Listo!')})
client.on("messageCreate", message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(config.prefix)) return;
	const args = message.content.substring(config.prefix.length).split(/ +/);
	const command = client.commands.find(cmd => cmd.name == args[0]);
	if(!(message.channel.name.includes('comandos') || message.channel.name.includes('soporte')|| message.channel.name.includes('roni')))return
	if (!command) return message.reply(`${args[0]} is not a valid command!`);
	command.run(message, args, client);
});



client.on('interactionCreate', async (interaction) => {
	await interaction.deferUpdate();
	if (!interaction.isButton()) return;
	console.log(interaction.customId)
	if( interaction.customId=='ticket_soporte'){

		let tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nCon que deseas que te ayude?`)
		
	}else if( interaction.customId=='validar'){
		//const chan = await message.channel.threads.create({name:'ticket-'+message.author.username,autoArchiveDuration: 60}) 
		//await chan.setLocked(true)
		let tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`)
		tr.awaitMessages({ filter: (m) => m.author.id === interaction.message.author.id, max: 1 })
		.then(async (collected) => {
			if(collected.size==0)return
			let comando=collected.first().content
			if(comando.length>10)asociar(interaction.message,tr,comando)
		});
	}else if( interaction.customId=='desvalidarme'){
		//const chan = await message.channel.threads.create({name:'ticket-'+message.author.username,autoArchiveDuration: 60}) 
		//await chan.setLocked(true)
		let tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`)
		tr.awaitMessages({ filter: (m) => m.author.id === interaction.message.author.id, max: 1 })
		.then(async (collected) => {
			if(collected.size==0)return
			let comando=collected.first().content
			if(comando.length>10)remover(interaction.message,tr,comando)
		});
		
	}else if( interaction.customId=='cobros'){
		//const chan = await message.channel.threads.create({name:'ticket-'+message.author.username,autoArchiveDuration: 60}) 
	}else if( interaction.customId=='cerrar_ticket'){
		const thread = interaction.channel
		thread.delete();
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

async function crearThread(interaction,msg){
	console.log('jaja')
	const thread = await interaction.channel.threads.create({
		name: `${interaction.user.tag}`,
		autoArchiveDuration: 1440, // this is 24hrs 60 will make it 1 hr
		//type: 'private_thread', // for private tickets u need server boosted to lvl 1 or 2 ok u need lvl 2, since mine is not boosted i will remove this LINE ONLY!
	});
	await thread.setLocked(true)
	const embed = new MessageEmbed().setTitle('Ticket')
	.setDescription(msg).setColor('GREEN').setTimestamp()
	.setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true}));


	console.log('jaja')
	const del = new MessageActionRow().addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('🗑️ Cerrar Ticket').setStyle('DANGER'),);
	thread.send({
		content: `Welcome <@${interaction.user.id}>`,
		embeds: [embed],
		components: [del]
	}).then(interaction.followUp({
		content: 'Created Ticket!',
		ephemeral: true
	}))
	console.log(`Created thread: ${thread.name}`);
	setTimeout(() => {
		interaction.channel.bulkDelete(1)
	}, 5000)
	return thread
}

