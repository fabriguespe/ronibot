/** @format */

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "slp",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
		let slp= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
		

		const exampleEmbed = new MessageEmbed()
		.setColor('#0099ff')
		.setTimestamp()
		.addFields(
			{ name: 'Precio', value: ''+slp+'USD'},
		)

		message.reply({ embeds: [exampleEmbed] });

	}
});
