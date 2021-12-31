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
			let stats = await db.collection('log').find({$or:[{type:'slp_jugador'},{type:'slp_ronimate'}]},  { sort: { date: -1 } }).toArray();
			stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
		
			let data_por_dia=[]
			for(let i in stats){
				let undia=stats[i]
				let fecha=undia.date
				if(!data_por_dia[fecha])data_por_dia[fecha]={date:undia.date,slp:0,cant:0}
				data_por_dia[fecha]={date:undia.date,slp:data_por_dia[fecha].slp+=undia.slp,cant:data_por_dia[fecha].cant+=1}
			}
			console.log(data_por_dia)
			let chart_data={days:[],slp:[],cant:[]}
			for(let i in data_por_dia){
				chart_data.days.push(data_por_dia[i].date)
				chart_data.slp.push(data_por_dia[i].slp)
				chart_data.cant.push(data_por_dia[i].cant)
			}
			let chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'SLP', data: chart_data.slp}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);

			
			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'Jugadores', data: chart_data.cant}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);


		}catch(e){
			console.log(e.message)
		}

	}
});
