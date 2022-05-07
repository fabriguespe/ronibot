const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "help"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		let help='You can see comands here\n'
		help+='https://github.com/fguespe/ronibot#mongodb\n\n'

		let embed = new MessageEmbed().setTitle('HELP').setDescription(help).setColor('GREEN').setTimestamp()
		return message.channel.send({content: ` `,embeds: [embed]})
		
	}
});
