/** @format */

console.clear();
const path = require('path');

const ID_ROL_JUGADOR="Jugador"
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
/*
client.on('interactionCsreate', async (interaction) => {
	await interaction.deferUpdate();
	if (!interaction.isButton()) return;
	console.log(interaction.customId)
	if( interaction.customId=='ticket_soporte'){
		let tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nCon que deseas que te ayude?`)
	}else if( interaction.customId=='asociar'){
		let tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`)
	}else if( interaction.customId=='desvalidarme'){
		let tr=await crearThread(interaction,`Hola ${interaction.message.author}, soy Roni. \nVoy a validar que eres un jugador Ronimate.\nPor favor ingresa tu contraseña. \nCuidado, no la compartas con nadie mas.`)
	}else if( interaction.customId=='cobros'){
	}else if( interaction.customId=='cerrar_ticket'){
		const thread = interaction.channel
		thread.delete();
	}
});
*/


TEST ='OTA5NTEyMjE4NjI0ODA3MDMy.YZFXQg.3_Cs0tajVJ152ySKLaDTMnF5J2Y'
client.login(TEST);
