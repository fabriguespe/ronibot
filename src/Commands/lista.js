/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');
const QuickChart = require('quickchart-js');
const { stat } = require('fs');
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
TABULADORES={uno:60,dos:45,tres:35,cuatro:1}

module.exports = new Command({
	name: "lista"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		if(!utils.esFabri(message) && args[1]=='pro')return message.channel.send('No tienes permisos para correr este comando')
		
		try{
			let db = await DbConnection.Get();
			let query={nota:args[1]=='pro'?'pro':'aprobado'}
			if(args[1]=='all')query={}
			let users = await db.collection('users').find(query).toArray()
			let limit_prom=args[1]?parseInt(args[1]):3
			let tipo=args[2]
			
			for(let ii in users){
				let eluser=users[ii]
				users[ii]['mmr_sum']=0
				users[ii]['slp_sum']=0
				users[ii]['slp_prom']=0
				users[ii]['mmr_prom']=0
				users[ii]['stat_count']=0
				let stats = await db.collection('slp').find({accountAddress:eluser.accountAddress},  { sort: { timestamp: -1 } }).limit(limit_prom).toArray();
				stats=stats.sort(function(a, b) {return a.timestamp - b.timestamp});
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
			let aretirar=[]
			for(let ii in users){
				let user=users[ii]
				if(user.name)user.name=user.name.replaceAll('*','')
				let value='#'+user.num+"[***"+user.name+"***](https://marketplace.axieinfinity.com/profile/"+user.accountAddress+") "+user.slp_prom+(user.mmr==undefined?'':'('+user.mmr+')')+(args[1]=='all'?user.nota:'')+'\n'
				
				proms.slp_sum+=user.slp_prom
				proms.mmr_sum+=user.mmr
				proms.cant+=1

				//Texto
				if(user.slp_prom>=TABULADORES.uno)colores['GREEN']+=value
				else if(user.slp_prom>=TABULADORES.dos && user.slp_prom<TABULADORES.uno)colores['YELLOW']+=value
				else if(user.slp_prom>=TABULADORES.tres && user.slp_prom<TABULADORES.dos)colores['ORANGE']+=value
				else if(user.slp_prom>=TABULADORES.cuatro && user.slp_prom<TABULADORES.tres)colores['RED']+=value
				else if(user.slp_prom>=0 && user.slp_prom<TABULADORES.cuatro)colores['BLACK']+=value
				
				//Contadores
				if(user.slp_prom>=TABULADORES.uno)numcolores['GREEN']+=1
				else if(user.slp_prom>=TABULADORES.dos && user.slp_prom<TABULADORES.uno)numcolores['YELLOW']+=1
				else if(user.slp_prom>=TABULADORES.tres && user.slp_prom<TABULADORES.dos)numcolores['ORANGE']+=1
				else if(user.slp_prom>=TABULADORES.cuatro && user.slp_prom<TABULADORES.tres)numcolores['RED']+=1
				else if(user.slp_prom>=0 && user.slp_prom<TABULADORES.cuatro)numcolores['BLACK']+=1

				//Otros
				if(user.slp_prom>=0 && user.slp_prom<TABULADORES.cuatro)aretirar.push(user.num)
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

			if(args[2]=='Retiro' && args[3]=='auto' && aretirar.length>0)message.channel.send('!retiro '+aretirar[0])///uno por dia
			
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
			utils.log(e,message)
		}

	}
});