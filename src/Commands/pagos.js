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
	name: "pagos"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();

				
			let stats = await db.collection('log').find({type:'slp_jugador'},  { sort: { date: -1 } }).toArray();
			stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
			
			data={days:[],slp:[],mmr:[]}
			for(let i in stats){
				let stat=stats[i]
				let anteultimo=stats[i-1]
				if(stat && anteultimo){
					data.slp.push(stat['slp'])
					data['days'].push(utils.getDayName(stat.date, "es-ES"))
				}
			}
			let chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: data.days,
					datasets:[{label: 'SLP', data: data.slp}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);

	}catch(e){
		console.log(e.message)
	}

	}
});
