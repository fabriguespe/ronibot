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
	name: "negocios",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.reply('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();
			let users = await db.collection('users').find().toArray()
			let data_users=[]
			let count_users=0
			for(let ii in users){
				let eluser=users[ii]
				let stats = await db.collection('stats').find({accountAddress:eluser.accountAddress},  { sort: { cache_last_updated: -1 } }).toArray();
				//console.log(eluser.accountAddress,stats.length)
				stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
				let data=[]
				
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo){
						if(stat.in_game_slp<anteultimo.in_game_slp)stat['slp']=stat.in_game_slp
						else stat['slp']=stat.in_game_slp-anteultimo.in_game_slp
						data.push({date:utils.getDayName(stat.date, "es-ES"),slp:stat['slp'],mmr:stat['mmr']})//esto mete a todos
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
					if(!data_final[ja.date])data_final[ja.date]={slp:0,mmr:0}
					data_final[ja.date]={slp:data_final[ja.date].slp+=ja.slp,mmr:data_final[ja.date].mmr+=ja.mmr}
				}
			}
			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
			
			let chart_data={days:[],slp:[],mmr:[],prom_slp:[],prom_mmr:[],usd:[]}
			for(let i in Object.keys(data_final)){
				chart_data.days.push(Object.keys(data_final)[i])
				chart_data.slp.push(Object.values(data_final)[i].slp)
				chart_data.mmr.push(Object.values(data_final)[i].mmr)
				chart_data.usd.push(Object.values(data_final)[i].slp*slp_price)
				chart_data.prom_slp.push(Object.values(data_final)[i].slp/count_users)
				chart_data.prom_mmr.push(Object.values(data_final)[i].mmr/count_users)
			}
			const exampleEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.addFields(
				{ name: 'Precio SLP', value: ''+slp_price,inline:true},
				{ name: 'Jugadores', value: ''+count_users,inline:true},
				{ name: 'Axies', value: ''+(count_users*3),inline:true},
				{ name: 'Copas Promedio', value: ''+Math.round((utils.getArrSum(chart_data.prom_mmr)/chart_data.prom_mmr.length)),inline:true},
				{ name: 'SLP Promedio', value: ''+Math.round((utils.getArrSum(chart_data.prom_slp)/chart_data.prom_slp.length)),inline:true},
				{ name: 'SLP día', value: ''+Math.round((utils.getArrSum(chart_data.slp)/chart_data.slp.length)),inline:true},
				{ name: 'USD por dia', value: ''+Math.round((utils.getArrSum(chart_data.usd))),inline:true},
				{ name: 'USD semana', value: ''+Math.round((utils.getArrSum(chart_data.usd)/chart_data.usd.length)*7),inline:true},
				{ name: 'USD mes', value: ''+Math.round((utils.getArrSum(chart_data.usd)/chart_data.usd.length)*30),inline:true},
			)
			message.reply({ embeds: [exampleEmbed] });
			return
			let chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'slp-prom', data: chart_data.prom_slp}] 
				},
			}).setWidth(800).setHeight(400);
			message.reply(`Grafico: ${await chart.getShortUrl()}`);

			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'usd-day', data: chart_data.usd}] 
				},
			}).setWidth(800).setHeight(400);
			message.reply(`Grafico: ${await chart.getShortUrl()}`);
	
			
			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'slp-day', data: chart_data.slp}] 
				},
			}).setWidth(800).setHeight(400);
			message.reply(`Grafico: ${await chart.getShortUrl()}`);

			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'copas-prom', data: chart_data.prom_mmr}] 
				},
			}).setWidth(800).setHeight(400);
			message.reply(`Grafico: ${await chart.getShortUrl()}`);
	

		}catch(e){
			console.log(e.message)
		}

	}
});

function FROM_UNIX_EPOCH(epoch_in_secs) {
	return new Date(epoch_in_secs * 1000).toLocaleString("es-ES", {timeZone: "America/Caracas"})
  }