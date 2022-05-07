const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');
const QuickChart = require('quickchart-js');
const { stat } = require('fs');
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));

module.exports = new Command({
	name: "help"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		let help='!reporte XX para ver info del jugador\n\n
			!transfer AXIE_ID,AXIE_ID FROM_ACCOUNT FROM_ACCOUNTs\n\n
			!update XX FIELD VALUE para actualizar (nota,wallet,name)\n\n
			!ranking para traer los 10 mejores\n\n
			!lista para traer los 10 mejores\n\n
			!entrevista para traer los 10 mejores\n\n
			!general para ver el estado de la academia\n\n
			!retiro DESDE_XX HASTA_XX para transferir todos los axies\n\n
			!aprobar XX para aprobar una entrevista\n\n
			!ingreso  discord_username\n\n
			!cron flushall \n\n
			!pagar cant_de_slp/plata_usd DE_ID/BREED HASTA_ID para hacer un pago normal\n\n
			!pagar todos\n\n
			!cron totalslp -> para ver el estado de todo'

		let embed = new MessageEmbed().setTitle('Comandos').setDescription(help).setColor('GREEN').setTimestamp()
		return message.channel.send({content: ` `,embeds: [embed]})
		
	}
});
