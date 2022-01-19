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
	name: "lista"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();
			let users = await db.collection('users').find().toArray()
			let limit_prom=args[1]?parseInt(args[1]):3
			let tipo=args[2]
			
			for(let ii in users){
				let eluser=users[ii]
				console.log(eluser.num,eluser.nota)
				if(!utils.esFabri(message) && utils.esPro(eluser.num))continue
				users[ii]['mmr_sum']=0
				users[ii]['slp_sum']=0
				users[ii]['slp_prom']=0
				users[ii]['mmr_prom']=0
				users[ii]['stat_count']=0
				let stats = await db.collection('stats').find({accountAddress:eluser.accountAddress},  { sort: { cache_last_updated: -1 } }).limit(limit_prom).toArray();
				stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined){
						if(stat.in_game_slp<anteultimo.in_game_slp)users[ii]['slp_sum']+=stat.in_game_slp
						else users[ii]['slp_sum']+=stat.in_game_slp-anteultimo.in_game_slp
						
						if(stat.in_game_slp<anteultimo.in_game_slp)users[ii]['slp']=stat.in_game_slp
						else users[ii]['slp']=stat.in_game_slp-anteultimo.in_game_slp

						users[ii]['mmr_sum']+=stat['mmr']
						users[ii]['mmr']=stat['mmr']
						if(users[ii]['slp']>0)users[ii]['stat_count']+=1
					}
				}
				
				if(users[ii]['slp_sum']>0 && users[ii]['stat_count']>0)users[ii]['slp_prom']=Math.round(users[ii]['slp_sum']/users[ii]['stat_count'])
				if(users[ii]['mmr_sum']>0 && users[ii]['stat_count']>0)users[ii]['mmr_prom']=Math.round(users[ii]['mmr_sum']/users[ii]['stat_count'])

			}
			users=users.sort(function(a, b) {return b.slp_prom - a.slp_prom})
			let colores={GREEN:'',YELLOW:'',ORANGE:'',RED:'',BLACK:''}
			let numcolores={GREEN:0,YELLOW:0,ORANGE:0,RED:0,BLACK:0}
			let proms={slp_sum:0,mmr_sum:0,cant:0}
			for(let ii in users){
				let user=users[ii]
				if(user.name)user.name=user.name.replaceAll('*','')
				let value='#'+user.num+"[***"+user.name+"***](https://marketplace.axieinfinity.com/profile/"+user.accountAddress+") "+user.slp_prom+'('+user.mmr+(args[1]=='all'?user.nota:'')+'\n'
				if(args[1]!='all' && (!user.nota || !user.nota == 'aprobado'))continue
				
				proms.slp_sum+=user.slp_prom
				proms.mmr_sum+=user.mmr
				proms.cant+=1

				
				if(user.slp_prom>=130)colores['GREEN']+=value
				else if(user.slp_prom>=100 && user.slp_prom<130)colores['YELLOW']+=value
				else if(user.slp_prom>=80 && user.slp_prom<100)colores['ORANGE']+=value
				else if(user.slp_prom>=50 && user.slp_prom<80)colores['RED']+=value
				else if(user.slp_prom>=0 && user.slp_prom<50)colores['BLACK']+=value
				
				if(user.slp_prom>=130)numcolores['GREEN']+=1
				else if(user.slp_prom>=100 && user.slp_prom<130)numcolores['YELLOW']+=1
				else if(user.slp_prom>=80 && user.slp_prom<100)numcolores['ORANGE']+=1
				else if(user.slp_prom>=50 && user.slp_prom<80)numcolores['RED']+=1
				else if(user.slp_prom>=0 && user.slp_prom<50)numcolores['BLACK']+=1
			}

			let titulo=''
			let pie_chart={}
			for(let i in Object.keys(colores)){
				let color=Object.keys(colores)[i]
				let lista=colores[color]
				let partes=Math.floor(lista.length/4095)+1
				for(let j=1;j<=partes;j++){
					titulo=(color=='GREEN')?'Generando 60%':(color=='YELLOW')?'Generando 50%':(color=='ORANGE')?'Generando 40%':(color=='RED')?'Alerta 30%':(color=='BLACK')?'Retiro':''
					if(tipo && tipo!=titulo)continue
					let init=(j==1)?0:(lista.length/partes*(j-1))
					let fin=(lista.length/partes*j)
					let text=lista?lista.substring(Math.floor(init), Math.floor( fin) ):"No hay"
					message.channel.send({content: ` `,embeds: [new MessageEmbed().setTitle(titulo).setDescription(text).setColor(color)]})
				}
				pie_chart[(color=='GREEN')?'Generando 60%':(color=='YELLOW')?'Generando 50%':(color=='ORANGE')?'Generando 40%':(color=='RED')?'Alerta 30%':(color=='BLACK')?'Retiro':'']=numcolores[color]

			}
			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});

			if(tipo)return //vuelve si no tiene nada mas
			
			let exampleEmbed = new MessageEmbed().setColor('#0099ff')
			exampleEmbed = exampleEmbed.addFields(
				{ name: 'Precio SLP', value: ''+slp_price,inline:true},
				{ name: 'Jugadores', value: ''+proms.cant,inline:true},
				{ name: 'Axies', value: ''+(proms.cant*3),inline:true},
				{ name: 'Copas Promedio', value: ''+Math.round(proms.mmr_sum/proms.cant),inline:true},
				{ name: 'SLP Promedio', value: ''+Math.round(proms.slp_sum/proms.cant),inline:true},
				{ name: 'SLP día', value: ''+Math.round(proms.slp_sum),inline:true},
			)
			if(utils.esFabri(message) ){
				exampleEmbed = exampleEmbed.addFields(
					{ name: 'USD por dia', value: ''+Math.round(proms.slp_sum*slp_price),inline:true},
					{ name: 'USD semana', value: ''+Math.round(proms.slp_sum*7*slp_price),inline:true},
					{ name: 'USD mes', value: ''+Math.round(proms.slp_sum*30*slp_price),inline:true},
				)
			}
			message.channel.send({ embeds: [exampleEmbed] });


			let chart = new QuickChart().setConfig({
				type: 'pie',
				data: { 
					labels: Object.keys(pie_chart),
					datasets:[{label: 'SLP', data: Object.values(pie_chart)}] 
				},
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
			



		}catch(e){
			utils.log(e.message,message)
		}

	}
});