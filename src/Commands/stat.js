/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed, User} = require('discord.js');
const QuickChart = require('quickchart-js');
const { stat } = require('fs');
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
TABULADORES={uno:48,dos:45,tres:35,cuatro:1}

module.exports = new Command({
	name: "stat"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		
		try{
			message.channel.send('Aguarde un momento...') 
			let db = await DbConnection.Get();
			let query=(args[1]!=undefined?{nota:args[1]}:'')
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
			let colores={GREEN:'',RED:''}
			let numcolores={GREEN:0,RED:0}
			let proms={slp_sum:0,mmr_sum:0,cant:0}
			let aretirar=[]
			for(let ii in users){
				let user=users[ii]
				if(user.name)user.name=user.name.replaceAll('*','')
				user.axie_count=await utils.getAxiesIds(user.accountAddress.replace('ronin:','0x'))
				console.log(user.axie_count)
				user.axie_count=user.axie_count.axies.length
				let value='#'+user.num+"[***"+user.name+"***](https://marketplace.axieinfinity.com/profile/"+user.accountAddress+") "+user.slp_prom+(user.mmr==undefined?'':'('+user.mmr+')')+'('+user.axie_count+' energias)'+'('+user.puesto+')'+'\n'
				
				proms.slp_sum+=user.slp_prom
				proms.mmr_sum+=user.mmr
				if(user.slp_prom>0)proms.cant+=1

				//Texto
				if(user.slp_prom>=TABULADORES.uno)colores['GREEN']+=value
				else colores['RED']+=value
				
				//Contadores
				if(user.slp_prom>=TABULADORES.uno)numcolores['GREEN']+=1
				else numcolores['RED']+=1

			}

			let titulo=''
			let pie_chart={}
			for(let i in Object.keys(colores)){
				let color=Object.keys(colores)[i]
				let lista=colores[color]
				let partes=Math.floor(lista.length/4095)+1
				for(let j=1;j<=partes;j++){
					titulo=(color=='GREEN')?'Generando':'Alerta'
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
			//message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
			



		}catch(e){
			utils.log(e,message)
		}
		try{
			let db = await DbConnection.Get();
			let query=(args[1]!=undefined?{nota:args[1]}:'')
			let users = await db.collection('users').find(query).toArray()
			let data_users=[]
			//let limit_prom=args[1]?parseInt(args[1]):30
			let count_users=0
			for(let ii in users){
				let eluser=users[ii]				
				let stats = await db.collection('slp').find({accountAddress:eluser.accountAddress},  { sort: { timestamp: -1 } })./*limit(limit_prom).*/toArray();
				stats=stats.sort(function(a, b) {return a.timestamp - b.timestamp});
				
				let data=[]
				//if(stats.length>=limit_prom)
				count_users++
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined){//esto es importante para las starts
						if(stat.in_game_slp<anteultimo.in_game_slp)stat['slp']=stat.in_game_slp
						else stat['slp']=stat.in_game_slp-anteultimo.in_game_slp
						if(stat['mmr']!=1200 && (stat['slp']==0 || stat['slp']==null || stat['slp']==undefined))continue
						data.push({timestamp:stat.timestamp,date:utils.getDayName(stat.date, "es-ES"),slp:stat['slp'],mmr:stat['mmr']})//esto mete a todos
							
					}
				}
				//if(stats[stats.length-1] && stats[stats.length-2] && stats[stats.length-1].in_game_slp>0 && stats[stats.length-2].in_game_slp>0)count_users++
				data_users.push(data)
			}
			console.log(count_users)
			let data_por_dia=[]
			for(let i in data_users){
				let dias_del_user=data_users[i]
				for(let j in dias_del_user){
					let undia=dias_del_user[j]
					let fecha=undia.date
					if(!data_por_dia[fecha])data_por_dia[fecha]={date:undia.date,timestamp:undia.timestamp,slp:0,players:0,mmr:0,grupo1:0,grupo2:0,grupo3:0,grupo4:0,grupo5:0}
					data_por_dia[fecha]={date:undia.date,timestamp:undia.timestamp,players:data_por_dia[fecha].players+(undia.slp>0?1:0),slp:data_por_dia[fecha].slp+=undia.slp,mmr:data_por_dia[fecha].mmr+=undia.mmr,grupo1:data_por_dia[fecha].grupo1+(undia.slp>0 && undia.slp<=TABULADORES.cuatro?1:0),grupo2:data_por_dia[fecha].grupo2+(undia.slp<TABULADORES.tres && undia.slp>=TABULADORES.cuatro?1:0),grupo3:data_por_dia[fecha].grupo3+(undia.slp<TABULADORES.dos && undia.slp>=TABULADORES.tres?1:0),grupo4:data_por_dia[fecha].grupo4+(undia.slp<TABULADORES.uno && undia.slp>=TABULADORES.dos?1:0),grupo5:data_por_dia[fecha].grupo5+(undia.slp>=TABULADORES.uno?1:0)}

				}
			}
			data_por_dia=Object.values(data_por_dia)
			data_por_dia=data_por_dia.sort(function(a, b) {return a.timestamp - b.timestamp});

			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
			
			let chart_data={days:[],slp:[],mmr:[],prom_slp:[],prom_mmr:[],usd:[],players:[],grupo1:[],grupo2:[],grupo3:[],grupo4:[],grupo5:[]}
			for(let i in data_por_dia){
				console.log(data_por_dia[i].slp)
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

			
			let chart = ''
			
			chart=new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[
						{type: 'bar',"yAxisID": "y1",label: '0 > < 25', data: chart_data.grupo1,"fill": false,backgroundColor: 'black'},
						{type: 'bar',"yAxisID": "y1",label: '25 > < 35', data: chart_data.grupo2,"fill": false,backgroundColor: '#D55040'},
						{type: 'bar',"yAxisID": "y1",label: '35 > < 45', data: chart_data.grupo3,"fill": false,backgroundColor: '#F8D978'},
						{type: 'bar',"yAxisID": "y1",label: '45 > < 60', data: chart_data.grupo4,"fill": false,backgroundColor: 'ORANGE'},
						{type: 'bar',"yAxisID": "y1",label: '60 > < ...', data: chart_data.grupo5,"fill": false,backgroundColor: '#9EC284'}
					] 
				},
				"options": {"scales": {"xAxes": [{"stacked": true}],"yAxes": [	{"id": "y1","display": true,"position": "left","stacked": true}]}
				}
			}).setWidth(800).setHeight(400);
			message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
			
			
			chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: chart_data.days,
					datasets:[{label: 'usd-day', data: chart_data.usd,backgroundColor: '#9EC284'}] 
				},
			}).setWidth(800).setHeight(400);
			//message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
		
			
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
					datasets:[{label: 'slp-prom', data: chart_data.prom_slp,backgroundColor: '#5E9DF8'}] 
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
			utils.log(e,message)
		}
	}
});