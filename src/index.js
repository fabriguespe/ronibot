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
	let scheduledMessage = new cron.CronJob('0 0 * * *', () => {
		let rCanal = message.channels.cache.find(c => c.id == 904491832556265502);//ranking en general
		let admin = message.channels.cache.find(c => c.id == 926112581054246983);//ranking en admin
		rCanal.send("<@everyone>" + "Hola! Estos son los resultados del día")
		rCanal.send('!ranking')

		let backupProcess = spawn('mongodump', ['--db=ronimate','--archive=.','--gzip']);

		backupProcess.on('exit', (code, signal) => {
			if(code) admin.send('Backup process exited with code ', code);
			else if (signal)admin.send('Backup process was killed with singal ', signal);
			else admin.send('Successfully backedup the database')
		});

	}, null, true, 'UTC');
	scheduledMessage.start()
})


client.on("messageCreate", message => {
	if (message.author.bot && !message.content=='!ranking') return;
	if (!message.content.startsWith(config.prefix)) return;
	const args = message.content.substring(config.prefix.length).split(/ +/);
	const command = client.commands.find(cmd => cmd.name == args[0]);
	
	if(!(message.channel.name.includes('comandos') || message.channel.name.includes('ingresos') || message.channel.name.includes('soporte') || message.channel.name.includes('anuncios')))return
	if (!command) return message.channel.send(`${args[0]} is not a valid command!`);
	command.run(message, args, client);
});

TEST ='OTA5NTEyMjE4NjI0ODA3MDMy.YZFXQg.3_Cs0tajVJ152ySKLaDTMnF5J2Y'
client.login(config.token);
