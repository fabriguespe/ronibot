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
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();
			let data=''
			let eluser = await db.collection('users').findOne({num:args[1]})
			if(!eluser)return utils.log('usuario no encontrado',message)
			

			if(args.length==2){
				
				message.channel.send("Aguarde un momento..")
				let axies={}
				try{

					url = `https://graphql-gateway.axieinfinity.com/graphql`;
					query = `{"operationName": "GetAxieBriefList","variables": {"owner":"${eluser.accountAddress.replace('ronin:','0x')}"},
					"query": "query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {    total    results {      ...AxieBrief      __typename    }    __typename  }}fragment AxieBrief on Axie {  id  name  stage  class  breedCount  image  title  battleInfo {    banned    __typename  }  auction {    currentPrice    currentPriceUSD    __typename  }  parts {    id    name    class    type    specialGenes    __typename  }  __typename}"
					}`
					let response=await fetch(url, { credentials: 'include',method: 'post',headers: { 'Content-Type': 'application/json'},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
					if(response && response.data && response.data.axies)axies=response.data.axies.results
				}catch(e){
					utils.log(e,message)
				}
				
				let axiesdata=[]
				if(axies){
					for(let i in axies){
						let axie=axies[i]
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
					}
				}
				
				const exampleEmbed = new MessageEmbed().setColor('#0099ff').setTitle('Jugador #'+args[1])
				let slp=await utils.getSLP(eluser.accountAddress,message,false)
				

				exampleEmbed.addFields(
					//{ name: 'Precio', value: ''+slp+'USD'},
					{ name: 'SLP Total', value: ''+slp.in_game_slp,inline:true},
					{ name: 'Nombre', value: ''+eluser.name,inline:true},
					{ name: 'Copas', value: ''+(slp.mmr?slp.mmr:'Error'),inline:true},
					{ name: 'Ultimo reclamo', value: ''+utils.FROM_UNIX_EPOCH(slp.last_claim),inline:true},
					{ name: 'Proximo', value: ''+utils.ADD_DAYS_TO_UNIX(slp.last_claim,15),inline:true},
					{ name: 'Estado', value: ''+eluser.nota,inline:true},
				)

				for(let i in axiesdata)exampleEmbed.addFields({ name: axiesdata[i].tipo, value: axiesdata[i].partes.cola+'\n'+axiesdata[i].partes.espalda+'\n'+axiesdata[i].partes.cuerno+'\n'+axiesdata[i].partes.boca+'\n'+'[Link]('+axiesdata[i].url+")",inline:true})
				
					
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
					{ name: 'Axies', value: '[Link](https://marketplace.axieinfinity.com/profile/'+eluser.accountAddress+")",inline:true},
					{ name: 'Pass', value: ''+eluser.pass,inline:true},
					{ name: 'Email', value: 'manager+'+eluser.num+'@ronimate.xyz',inline:true},
					{ name: 'Binance', value: ''+eluser.scholarPayoutAddress},
					{ name: 'Registros', value: ''+help},
				)
				message.channel.send({ embeds: [exampleEmbed] });

				stats = await db.collection('slp').find({accountAddress:eluser.accountAddress},  { sort: { timestamp: -1 } }).toArray();
				stats=stats.sort(function(a, b) {return a.timestamp - b.timestamp});
				console.log(stats)
				data={days:[],slp:[],mmr:[]}
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo){
						console.log('entra')
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
			console.log(e.message)
		}

	}
});
