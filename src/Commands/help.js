/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');
const QuickChart = require('quickchart-js');
const { stat } = require('fs');
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));

module.exports = new Command({
	name: "help",
	description: "Shows the price of the slp!",
	async run(message, args, client) {

		let help=""
		help+="!roni para poder validarte y realizar cobros"
		if(utils.esManager(message))help+="!reporte XX para ver info del jugador"
		if(utils.esManager(message))help+="!reporte XX slp/copas para ver graficos"
		if(utils.esManager(message))help+="!cambio AXIE_ID DESDE_XX HASTA_XX para transferir axies"
		if(utils.esFabri(message))help+="!retiro DESDE_XX HASTA_XX para transferir todos los axies"
		if(utils.esFabri(message))help+="!aprobar XX NAME"
		help+="!reporte XX para ver info del jugador"
		let embed = new MessageEmbed().setTitle('Exito!')
		.setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tr_raw.transactionHash+")").setColor('GREEN').setTimestamp()
		return message.reply({content: ` `,embeds: [embed]})

	}
});
