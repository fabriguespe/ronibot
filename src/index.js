/** @format */

console.clear();
const path = require('path');
var cron = require("cron");
var utils = require(path.resolve(__dirname, "./utils.js"));
const Client = require(path.resolve(__dirname, "./Structures/Client.js"));
const config = require(path.resolve(__dirname, "./Data/config.json"));
const fetch = require( "node-fetch")
const spawn = require('child_process').spawn;
const client = new Client();
const Command = require(path.resolve(__dirname, "./Structures/Command.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
const fs = require("fs");
fs.readdirSync(__dirname+"/Commands")
.filter(file => file.endsWith(".js"))
.forEach(file => {
	const command = require(__dirname+`/Commands/${file}`);
	console.log(`Command ${command.name} loaded`);
	client.commands.set(command.name, command);
});

client.on("ready", message => {
	utils.log('Listo!')
	
	scheduledMessage = new cron.CronJob('10 0 * * *', () => {
		let admin = message.channels.cache.find(c => c.id == 930958850713079838);//ranking en admin
		let backupProcess = spawn('mongodump', ['--db=ronimate','--archive=.','--gzip']);
		backupProcess.on('exit', (code, signal) => {
			if(code) admin.send('ERROR BACKUP ', code);
			else if (signal)admin.send('ERROR BACKUP ', signal);
			else admin.send('BACKUP de base datos se realizó con Exito!')
		});

	}, null, true, 'UTC');
	scheduledMessage.start()

	scheduledMessage = new cron.CronJob('15 0 * * *', () => {
		let rCanal = message.channels.cache.find(c => c.id == 903282885971300362);//ranking en anuncios
		rCanal.send("@here" + "Soy Roni, este es el reporte de la academia.\nPrimero nuestras entrevistas")
		rCanal.send('!entrevista')

	}, null, true, 'UTC');
	scheduledMessage.start()

	scheduledMessage = new cron.CronJob('20 0 * * *', () => {
		let rCanal = message.channels.cache.find(c => c.id == 903282885971300362);//ranking en anuncios
		rCanal.send("@here" + "Seguimos con el ranking del día")
		rCanal.send('!diario')

	}, null, true, 'UTC');
	scheduledMessage.start()

	let scheduledMessage = new cron.CronJob('30 0 * * *', () => {
		let rCanal = message.channels.cache.find(c => c.id == 903282885971300362);//ranking en anuncios
		rCanal.send("@here" + " Por último veamos quienes estan con bajo promedio y en riesgo a ser retirados")
		rCanal.send('!lista 7 Retiro')
	}, null, true, 'UTC');
	scheduledMessage.start()
})


client.on("messageCreate", message => {
	if (message.author.bot && !message.content=='!diario'  && !message.content=='!log aspirante' && !message.content=='!lista 7 Retiro' && !message.content=='!entrevista') return;

	if (!message.content.startsWith(config.prefix)) return;
	const args = message.content.substring(config.prefix.length).split(/ +/);
	const command = client.commands.find(cmd => cmd.name == args[0]);
	
	if(!(message.channel.name.includes('comandos') || message.channel.name.includes('chat') || message.channel.name.includes('entrevista') || message.channel.name.includes('soporte') || message.channel.name.includes('anuncios')))return
	if (!command) return message.channel.send(`${args[0]} is not a valid command!`);
	command.run(message, args, client);
});

TEST ='OTA5NTEyMjE4NjI0ODA3MDMy.YZFXQg.3_Cs0tajVJ152ySKLaDTMnF5J2Y'
client.login(config.token);
