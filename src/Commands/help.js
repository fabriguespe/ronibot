const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "help"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		let help='!reporte XX para ver info del jugador\n\n'
		help+='!transfer AXIE_ID,AXIE_ID FROM_ACCOUNT FROM_ACCOUNT\n\n'
		help+='!roni ACCOUNT\n\n'
		help+='!cron flushall \n\n"\n\n'
			

		let embed = new MessageEmbed().setTitle('Comandos').setDescription(help).setColor('GREEN').setTimestamp()
		return message.channel.send({content: ` `,embeds: [embed]})
		
	}
});
