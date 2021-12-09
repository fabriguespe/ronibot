/** @format */
const path = require('path');

var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));

const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
const NUEVOS_CATE="INGRESOS"

const ID_ROL_JUGADOR="Jugador"
let collector=null
module.exports = new Command({
	name: "t",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if (message.author.bot) return false; 
		let filter= (m) => m.author.id === message.author.id

		client.on('interactionCreate', async (interaction) => {
			const chan = await message.channel.threads.create({
				name:'ticket-'+message.author.username,
				autoArchiveDuration: 60,
				reason: 'Needed a separate thread for food',
				//type:'private_thread'
			}) 
				
			collector = chan.createMessageCollector({filter,max:1,time:600000})
			
			
		})
		if(collector)collector.on('collect',message=>{
			console.log(message.content)
		})
		const chan = await message.channel.threads.create({
			name:'ticket-'+message.author.username,
			autoArchiveDuration: 60,
			reason: 'Needed a separate thread for food',
			//type:'private_thread'
		}) 
		
	}
});
