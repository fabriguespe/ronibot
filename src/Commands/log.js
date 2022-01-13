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
	name: "log"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		let db = await DbConnection.Get();
			
		if(args[1]=='pagos'){
			let query={$or:[{type:'slp_jugador'},{type:'slp_ronimate'}]}
			let stats = await db.collection('log').find(query,  { sort: { timestamp_log: -1 } }).toArray();
			let data_por_dia=[]
			for(let i in stats){
				let undia=stats[i]
				let fecha=undia.date
				if(!data_por_dia[fecha])data_por_dia[fecha]={date:undia.date,slp:0,cant:0}
				data_por_dia[fecha]={date:undia.date,slp:data_por_dia[fecha].slp+=undia.slp,cant:data_por_dia[fecha].cant+=1}
			}
			let chart_data={days:[],slp:[],cant:[]}
			for(let i in data_por_dia){
				message.channel.send(data.date+' '+data.slp+' '+data.cant)
				chart_data.days.push(data.date)
				chart_data.slp.push(data.slp)
				chart_data.cant.push(data.cant)
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


		}else if(args[1]=='estados'){
			let query={type:'status_change'}

			let stats = await db.collection('log').find(query,  { sort: { timestamp_log: -1 } }).toArray();
		
			let data_por_dia=[]
			for(let i in stats){
				let undia=stats[i]
				let fecha=undia.date
				if(!data_por_dia[fecha])data_por_dia[fecha]={fecha:fecha,aprobado:0,aspirante:0,entrevista:0,retiro:0}
				if(undia.status=='aprobado')data_por_dia[fecha]={fecha:fecha,aprobado:data_por_dia[fecha].aprobado+=1,entrevista:data_por_dia[fecha].entrevista,retiro:data_por_dia[fecha].retiro,aspirante:data_por_dia[fecha].aspirante,}
				if(undia.status=='retiro')data_por_dia[fecha]={fecha:fecha,retiro:data_por_dia[fecha].retiro+=1,entrevista:data_por_dia[fecha].entrevista,aprobado:data_por_dia[fecha].aprobado,aspirante:data_por_dia[fecha].aspirante,}
				if(undia.status=='entrevista')data_por_dia[fecha]={fecha:fecha,entrevista:data_por_dia[fecha].entrevista+=1,aprobado:data_por_dia[fecha].aprobado,retiro:data_por_dia[fecha].retiro,aspirante:data_por_dia[fecha].aspirante,}
				if(undia.status=='aspirante')data_por_dia[fecha]={fecha:fecha,aspirante:data_por_dia[fecha].aspirante+=1,aprobado:data_por_dia[fecha].aprobado,retiro:data_por_dia[fecha].retiro,entrevista:data_por_dia[fecha].entrevista,}
			}
			
			let chart_data={days:[],aprobado:[],entrevista:[],retiro:[],aspirante:[]}
			for(let i in data_por_dia){
				let data=data_por_dia[i]

				chart_data.days.push(data.fecha)
				chart_data.aprobado.push(data.aprobado)
				chart_data.entrevista.push(data.entrevista)
				chart_data.aspirante.push(data.aspirante)
				chart_data.retiro.push(data.retiro)
			}

			console.log(chart_data)
			let chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[
						{label: 'Aspirante', data: chart_data.aspirante},
						{label: 'Entrevista', data: chart_data.entrevista},
						{label: 'Aprobado', data: chart_data.aprobado},
						{label: 'Retiro',backgroundColor:'black', data: chart_data.retiro},
					] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
		
		}else if(args[1]=='aspirante'){
			
			await utils.cambiarEstado(null,'aspirante',message)
			utils.log('exito')
		}

	}
});
