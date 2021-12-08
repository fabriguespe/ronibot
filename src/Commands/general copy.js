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
	name: "general",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		try{
			let db = await DbConnection.Get();
			if(args.length==2){
				let stats = await db.collection('stats').find({},  { sort: { cache_last_updated: -1 } }).toArray();
				stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
			
				let data={days:[],values:[]}
				

			
				let value=args[1]
				if(value=="copas")value="mmr"

				var groups = [];
				for(let i in stats){
					let stat=stats[i]
					var date = stat.date
					if (date in groups) {
						groups[date].push(stat[value]);
					} else {
						groups[date] = new Array(stat[value]);
					}
				}

				for(let i in Object.keys(groups)){
					let fecha=Object.keys(groups)[i]
					let anteultimo=Object.keys(groups)[i-1]
					console.log(fecha)
					let total_slp=0
					for(let j in groups[fecha]){
						let slp = groups[fecha][j]
						total_slp+=slp
					}
					console.log(fecha,total_slp)
				}
				return

				let chart = new QuickChart().setConfig({
					type: 'bar',
					data: { 
						labels: data.days,
						datasets:[{label: value, data: data.values}] 
					},
				}).setWidth(800).setHeight(400);
				message.reply(`Grafico: ${await chart.getShortUrl()}`);
	
			}else{
				message.reply(`Comando incompleto`);
			}
		}catch(e){
			console.log(e.message)
		}

	}
});

function FROM_UNIX_EPOCH(epoch_in_secs) {
	return new Date(epoch_in_secs * 1000).toLocaleString("es-ES", {timeZone: "America/Caracas"})
  }