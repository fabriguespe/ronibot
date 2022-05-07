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
	name: "reporte"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send("You don't have the propper rights to run this command.")
		try{
			let db = await DbConnection.Get();
			let data=''
			let eluser = await db.collection('users').findOne({num:args[1]})
			if(!eluser)return utils.log('User not found',message)
			
			let axie_count=0
			if(args.length==2 || args.length==3){
				message.channel.send("Aguarde un momento...")
				let axies=await utils.getAxiesIds(eluser.accountAddress.replace('ronin:','0x'))
				let axiesdata=[]

				if(axies && axies.axies){
					for(let i in axies.axies){
						let axie=axies.axies[i]
						let pushed={}
						pushed.id=axie.id
						pushed.url= 'https://marketplace.axieinfinity.com/axie/'+axie.id
						pushed.hijos=axie.breedCount
						pushed.image=axie.image
						pushed.tipo=axie.class
						let espalda=axie.parts.find(x => x.type == "Back").name
						let boca=axie.parts.find(x => x.type == "Mouth").name
						let cuerno=axie.parts.find(x => x.type == "Horn").name
						let cola=axie.parts.find(x => x.type == "Tail").name
						pushed.partes={espalda:espalda,boca:boca,cuerno:cuerno,cola:cola}
						axiesdata.push(pushed)
						axie_count++
					}
				}
				
				let slp=await utils.getSLP(eluser.accountAddress,message,false)

				let exampleEmbed = new MessageEmbed().setColor('#0099ff').setTitle('Jugador #'+args[1]+' ('+axie_count+' Axies)')
				exampleEmbed.addFields(
					//{ name: 'Precio', value: ''+slp+'USD'},
					{ name: 'SLP Total', value: ''+slp.in_game_slp,inline:true},
					{ name: 'Nombre', value: ''+eluser.name,inline:true},
					{ name: 'Copas', value: ''+(slp.mmr?slp.mmr:'Error'),inline:true},
					{ name: 'Ultimo reclamo', value: ''+utils.FROM_UNIX_EPOCH(slp.last_claim),inline:true},
					{ name: 'Proximo', value: ''+utils.ADD_DAYS_TO_UNIX(slp.last_claim,15),inline:true},
					{ name: 'Estado', value: ''+eluser.nota,inline:true},
				)
				
				let stats = await db.collection('log').find({num:eluser.num},  { sort: { timestamp: -1 } }).toArray();
				let help='No hay'
				for(let j in stats){
					if(j==0)help=''
					let log=stats[j]
					if(log.type=='status_change')help+='El '+log.date+' se cambio el estado a ***'+log.status+'***\n'
					else if(log.type=='slp_claim')help+='El '+log.date+' se hizo un claim de ***'+log.slp+'*** SLP\n'
					else if(log.type=='slp_jugador')help+='El '+log.date+' se retiraron ***'+log.slp+'*** SLP\n'
				}
				exampleEmbed.addFields(
					{ name: 'Wallet', value: '[Link](https://explorer.roninchain.com/address/'+eluser.accountAddress+")",inline:true},
					{ name: 'JSON', value: '[Link](https://game-api.axie.technology/api/v1/'+eluser.accountAddress+")",inline:true},
					{ name: 'Axies '+'('+axie_count+')', value: '[Link](https://marketplace.axieinfinity.com/profile/'+eluser.accountAddress+")",inline:true},
					{ name: 'Pass', value: ''+eluser.pass,inline:true},
					{ name: 'Puesto', value: 'AxieMasterC',inline:true},
					{ name: 'Discord', value: ''+eluser.discord,inline:true},
					{ name: 'Binance', value: ''+eluser.scholarPayoutAddress,inline:true},
					{ name: 'Registros', value: ''+help},
				)
				message.channel.send({ embeds: [exampleEmbed] });
				
				if(args[2]=='axies'){

					let exampleEmbed = new MessageEmbed().setColor('#0099ff').setTitle('Axies #'+args[1])
					for(let i in axiesdata)exampleEmbed.addFields({ name: axiesdata[i].tipo, value: axiesdata[i].partes.cola+'\n'+axiesdata[i].partes.espalda+'\n'+axiesdata[i].partes.cuerno+'\n'+axiesdata[i].partes.boca+'\n'+'[Link]('+axiesdata[i].url+")",inline:true})
					message.channel.send({ embeds: [exampleEmbed] });
	
				}

				stats = await db.collection('slp').find({accountAddress:eluser.accountAddress},  { sort: { timestamp: -1 } }).toArray();
				stats=stats.sort(function(a, b) {return a.timestamp - b.timestamp});
				data={days:[],slp:[],mmr:[]}
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo){
						if(stat.in_game_slp<anteultimo.in_game_slp)stat['slp']=stat.in_game_slp
						else stat['slp']=stat.in_game_slp-anteultimo.in_game_slp
					}
					data.slp.push(stat['slp'])
					data.mmr.push(stat['mmr'])
					data['days'].push(utils.getDayName(stat.date, "es-ES"))
				}

				let chart = new QuickChart().setConfig({
					type: 'bar',
					data: { 
						labels: data.days,
						datasets:[{label: 'SLP', data: data.slp}] 
					},
				}).setWidth(800).setHeight(400);
				message.channel.send(`Grafico: ${await chart.getShortUrl()}`);

				chart = new QuickChart().setConfig({
					type: 'bar',
					data: { 
						labels: data.days,
						datasets:[{label: 'MMR', data: data.mmr}] 
					},
				}).setWidth(800).setHeight(400);
				//message.channel.send(`Grafico: ${await chart.getShortUrl()}`);
	
			}else{
				message.channel.send(`Comando incompleto`);
			}
		}catch(e){
			utils.log(e,message)
		}

	}
});
