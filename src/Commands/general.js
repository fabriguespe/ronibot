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
				
				let db = await DbConnection.Get();
				let users = await db.collection('users').find().toArray()
				let data_users=[]
				let value=args[1]
				let count_users=0
				for(let ii in users){
					let eluser=users[ii]
					let stats = await db.collection('stats').find({accountAddress:eluser.accountAddress},  { sort: { cache_last_updated: -1 } }).limit(17).toArray();
					//console.log(eluser.accountAddress,stats.length)
					stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
					let data=[]
					
					if(value=="copas")value="mmr"
					for(let i in stats){
						let stat=stats[i]
						let anteultimo=stats[i-1]
						if((stat[value] || value=='slp') && anteultimo){
							if(value=='slp' && stat.in_game_slp<anteultimo.in_game_slp)stat[value]=stat.in_game_slp
							else if(value=='slp')stat[value]=stat.in_game_slp-anteultimo.in_game_slp
							data.push({date:utils.getDayName(stat.date, "es-ES"),slp:stat[value]})
						}
					}
					if(stats[stats.length-1].in_game_slp>0 && stats[stats.length-2].in_game_slp>0)count_users++
					data_users.push(data)
				}
				let data_final={}
				for(let i in data_users){
					let je=data_users[i]
					for(let j in je){
						let ja=je[j]
						if(!data_final[ja.date])data_final[ja.date]=0
						data_final[ja.date]+=ja.slp
					}
				}
				let chart_data={days:[],values:[],proms:[],usd:[]}
				for(let i in Object.keys(data_final)){
					chart_data.days.push(Object.keys(data_final)[i])
					chart_data.values.push(Object.values(data_final)[i])
					chart_data.usd.push(Object.values(data_final)[i]*0.045)
					chart_data.proms.push(Object.values(data_final)[i]/count_users)
				}

				let chart = new QuickChart().setConfig({
					type: 'bar',
					data: { 
						labels: chart_data.days,
						datasets:[{label: value, data: chart_data.proms}] 
					},
				}).setWidth(800).setHeight(400);
				message.reply(`Grafico: ${await chart.getShortUrl()}`);
				console.log(message.author.id)

				/*
				if(message.author.id==533994454391062529){
					chart = new QuickChart().setConfig({
						type: 'bar',
						data: { 
							labels: chart_data.days,
							datasets:[{label: value, data: chart_data.usd}] 
						},
					}).setWidth(800).setHeight(400);
					message.reply(`Grafico: ${await chart.getShortUrl()}`);
				}*/
				
				if(value=='mmr')return
				chart = new QuickChart().setConfig({
					type: 'bar',
					data: { 
						labels: chart_data.days,
						datasets:[{label: value, data: chart_data.values}] 
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