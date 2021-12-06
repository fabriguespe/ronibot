/** @format */

console.clear();
const path = require('path');

var utils = require(path.resolve(__dirname, "./utils.js"));
const Client = require(path.resolve(__dirname, "./Structures/Client.js"));
const config = require(path.resolve(__dirname, "./Data/config.json"));
const fetch = require( "node-fetch")
const client = new Client();


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
})

client.on('interactionCreate', interaction => {
	if (!interaction.isButton()) return;
	interaction.message.channel.delete()
});

client.on("messageCreate", message => {
	if (message.author.bot) return;

	if (!message.content.startsWith(config.prefix)) return;

	const args = message.content.substring(config.prefix.length).split(/ +/);

	const command = client.commands.find(cmd => cmd.name == args[0]);
	if(!message.channel.name.includes('comandos'))return
	if (!command) return message.reply(`${args[0]} is not a valid command!`);

	command.run(message, args, client);
});

client.login(config.token);