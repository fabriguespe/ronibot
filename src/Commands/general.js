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
	name: "general"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();
			let users = await db.collection('users').find().toArray()
			console.log(users.length)
			let data_users=[]
			let limit_prom=args[1]?parseInt(args[1]):30
			let count_users=0
			for(let ii in users){
				let eluser=users[ii]				
				let stats = await db.collection('stats').find({accountAddress:eluser.accountAddress},  { sort: { cache_last_updated: -1 } }).limit(limit_prom).toArray();
				stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
				let data=[]
				if(stats.length>=limit_prom)count_users++
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined){
						if(stat.in_game_slp<anteultimo.in_game_slp)stat['slp']=stat.in_game_slp
						else stat['slp']=stat.in_game_slp-anteultimo.in_game_slp
						if(stat['mmr']!=1200 && (stat['slp']==0 || stat['slp']==null || stat['slp']==undefined))continue
						if(stat.date=='16/12/2021'){
							stat['slp']=(stat['slp']/3)
							data.push({cache_last_updated:stat.cache_last_updated,date:utils.getDayName("14/12/2021", "es-ES"),slp:stat['slp'],mmr:stat['mmr']})//esto mete a todos
							data.push({cache_last_updated:stat.cache_last_updated,date:utils.getDayName("15/12/2021", "es-ES"),slp:stat['slp'],mmr:stat['mmr']})//esto mete a todos
						}
						data.push({cache_last_updated:stat.cache_last_updated,date:utils.getDayName(stat.date, "es-ES"),slp:stat['slp'],mmr:stat['mmr']})//esto mete a todos
					}
				}
				//if(stats[stats.length-1] && stats[stats.length-2] && stats[stats.length-1].in_game_slp>0 && stats[stats.length-2].in_game_slp>0)count_users++
				data_users.push(data)
			}
			let data_por_dia=[]
			for(let i in data_users){
				let dias_del_user=data_users[i]
				for(let j in dias_del_user){
					let undia=dias_del_user[j]
					let fecha=undia.date
					if(!data_por_dia[fecha])data_por_dia[fecha]={date:undia.date,cache_last_updated:undia.cache_last_updated,slp:0,players:0,mmr:0,grupo1:0,grupo2:0,grupo3:0,grupo4:0,grupo5:0,grupo6:0}
					data_por_dia[fecha]={date:undia.date,cache_last_updated:undia.cache_last_updated,players:data_por_dia[fecha].players+(undia.slp>0?1:0),slp:data_por_dia[fecha].slp+=undia.slp,mmr:data_por_dia[fecha].mmr+=undia.mmr,grupo1:data_por_dia[fecha].grupo1+(undia.slp>0 && undia.slp<=50?1:0),grupo2:data_por_dia[fecha].grupo2+(undia.slp<80 && undia.slp>=50?1:0),grupo3:data_por_dia[fecha].grupo3+(undia.slp<100 && undia.slp>=80?1:0),grupo4:data_por_dia[fecha].grupo4+(undia.slp<130 && undia.slp>=100?1:0),grupo5:data_por_dia[fecha].grupo5+(undia.slp>=130?1:0)}

				}
			}

			data_por_dia=Object.values(data_por_dia)
			data_por_dia=data_por_dia.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});

			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
			
			let chart_data={days:[],slp:[],mmr:[],prom_slp:[],prom_mmr:[],usd:[],players:[],grupo1:[],grupo2:[],grupo3:[],grupo4:[],grupo5:[]}
			for(let i in data_por_dia){
				chart_data.days.push(data_por_dia[i].date)
				chart_data.players.push(data_por_dia[i].players)
				chart_data.grupo1.push(data_por_dia[i].grupo1)
				chart_data.grupo2.push(data_por_dia[i].grupo2)
				chart_data.grupo3.push(data_por_dia[i].grupo3)
				chart_data.grupo4.push(data_por_dia[i].grupo4)
				chart_data.grupo5.push(data_por_dia[i].grupo5)
				chart_data.slp.push(data_por_dia[i].slp)
				chart_data.mmr.push(data_por_dia[i].mmr)
				chart_data.usd.push(data_por_dia[i].slp*slp_price)
				chart_data.prom_slp.push(data_por_dia[i].slp/count_users)
				chart_data.prom_mmr.push(data_por_dia[i].mmr/count_users)
			}

			let exampleEmbed = new MessageEmbed().setColor('#0099ff')
			exampleEmbed = exampleEmbed.addFields(
				{ name: 'Precio SLP', value: ''+slp_price,inline:true},
				{ name: 'Jugadores', value: ''+count_users,inline:true},
				{ name: 'Axies', value: ''+(count_users*3),inline:true},
				{ name: 'Copas Promedio', value: ''+Math.round((utils.getArrSum(chart_data.prom_mmr)/chart_data.prom_mmr.length)),inline:true},
				{ name: 'SLP Promedio', value: ''+Math.round((utils.getArrSum(chart_data.prom_slp)/chart_data.prom_slp.length)),inline:true},
				{ name: 'SLP día', value: ''+Math.round((utils.getArrSum(chart_data.slp)/chart_data.slp.length)),inline:true},
			)
			if(utils.esFabri(message) ){
				exampleEmbed = exampleEmbed.addFields(
					{ name: 'USD por dia', value: ''+Math.round((utils.getArrSum(chart_data.usd)/chart_data.usd.length)),inline:true},
					{ name: 'USD semana', value: ''+Math.round((utils.getArrSum(chart_data.usd)/chart_data.usd.length)*7),inline:true},
					{ name: 'USD mes', value: ''+Math.round((utils.getArrSum(chart_data.usd)/chart_data.usd.length)*30),inline:true},
				)
			}
			message.channel.send({ embeds: [exampleEmbed] });
			
			
			let chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[
						{type: 'bar',"yAxisID": "y1",label: '0 > < 50', data: chart_data.grupo1,"fill": false,backgroundColor: 'black'},
						{type: 'bar',"yAxisID": "y1",label: '50 > < 80', data: chart_data.grupo2,"fill": false,backgroundColor: '#D55040'},
						{type: 'bar',"yAxisID": "y1",label: '80 > < 100', data: chart_data.grupo3,"fill": false,backgroundColor: '#F8D978'},
						{type: 'bar',"yAxisID": "y1",label: '100 > < 130', data: chart_data.grupo4,"fill": false,backgroundColor: '#9EC284'},
						{type: 'bar',"yAxisID": "y1",label: '130 > < ...', data: chart_data.grupo5,"fill": false,backgroundColor: '#9EC284'}
					] 
				},
				"options": {
					"scales": {
					  "xAxes": [{
						"stacked": true
					  }],
					  "yAxes": [
						{
						  "id": "y1",
						  "display": true,
						  "position": "left",
						  "stacked": true
						}
					  ]
					}
				  }
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
			
			
			if(utils.esFabri(message)){
				chart = new QuickChart().setConfig({
					type: 'bar',
					data: { 
						labels: chart_data.days,
						datasets:[{label: 'usd-day', data: chart_data.usd,backgroundColor: '#9EC284'}] 
					},
				}).setWidth(800).setHeight(400);
				message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
			}
	
			
			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'slp-day', data: chart_data.slp,backgroundColor: '#F8D978'}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);

			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'copas-prom', data: chart_data.prom_mmr,backgroundColor: '#5E9DF8'}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
	

		}catch(e){
			utils.log(e.message,message)
		}

	}
});
