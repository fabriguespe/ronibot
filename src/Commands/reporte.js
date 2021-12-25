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
	name: "reporte",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!utils.esManager(message))return message.reply('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();
			let eluser = await db.collection('users').findOne({num:args[1]})
			if(!eluser)return utils.log('usuario no encontrado',message)
			

			if(args.length==2){
				url = "https://game-api.axie.technology/api/v1/"+eluser.accountAddress;
				let data= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return json});
				utils.log(data)
				url = `https://graphql-gateway.axieinfinity.com/graphql`;
				query = `{"operationName": "GetAxieBriefList","variables": {"owner":"${eluser.accountAddress.replace('ronin:','0x')}"},
				"query": "query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {    total    results {      ...AxieBrief      __typename    }    __typename  }}fragment AxieBrief on Axie {  id  name  stage  class  breedCount  image  title  battleInfo {    banned    __typename  }  auction {    currentPrice    currentPriceUSD    __typename  }  parts {    id    name    class    type    specialGenes    __typename  }  __typename}"
				}`
				
				let axies=await fetch(url, { credentials: 'include',method: 'post',headers: { 'Content-Type': 'application/json'},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
				axies={count:axies.data.axies.total,axies:axies.data.axies.results}
				let axiesdata=[]
				for(let i in axies.axies){
					let axie=axies.axies[i]
					let pushed={}
					pushed.id=axie.id
					pushed.url= 'https://marketplace.axieinfinity.com/axie/'+axie.id
					pushed.hijos=axie.breedCount
					pushed.image=axie.image
					pushed.tipo=axie.class=='Aquatic'?"Pez":axie.class=='Beast'?"Bestia":axie.class=='Plant'?"Planta":""
					let espalda=axie.parts.find(x => x.type == "Back").name
					let boca=axie.parts.find(x => x.type == "Mouth").name
					let cuerno=axie.parts.find(x => x.type == "Horn").name
					let cola=axie.parts.find(x => x.type == "Tail").name
					pushed.partes={espalda:espalda,boca:boca,cuerno:cuerno,cola:cola}
					axiesdata.push(pushed)
				}
				
				if(axiesdata.length==3){

					const exampleEmbed = new MessageEmbed()
					.setColor('#0099ff')
					.setTitle('Jugador #'+args[1])
					
					exampleEmbed.addFields(
						//{ name: 'Precio', value: ''+slp+'USD'},
						{ name: 'SLP Total', value: ''+data.total_slp,inline:true},
						{ name: 'Copas', value: ''+data.mmr,inline:true},
						{ name: 'Ultimo reclamo', value: ''+utils.FROM_UNIX_EPOCH(data.last_claim),inline:true},
						{ name: 'Nombre', value: ''+data.name,inline:true},
						{ name: 'Estado', value: ''+data.nota==undefined || data.nota==null?'Aceptado':data.nota,inline:true},
						{ name: 'Vacio', value: 'Vacio',inline:true},
					)
					for(let i in axiesdata){
						exampleEmbed.addFields({ name: axiesdata[i].tipo, value: axiesdata[i].partes.cola+'\n'+axiesdata[i].partes.espalda+'\n'+axiesdata[i].partes.cuerno+'\n'+axiesdata[i].partes.boca+'\n'+'[Link]('+axiesdata[i].url+")",inline:true})
					}

					//if(utils.esFabri(message) ){
					exampleEmbed.addFields(
						{ name: 'Wallet', value: '[Link](https://explorer.roninchain.com/address/'+eluser.accountAddress+")",inline:true},
						{ name: 'JSON', value: '[Link](https://game-api.axie.technology/api/v1/'+eluser.accountAddress+")",inline:true},
						{ name: 'Axies', value: '[Link](https://marketplace.axieinfinity.com/profile/'+eluser.accountAddress+")",inline:true},
					)
					//}
					message.reply({ embeds: [exampleEmbed] });


				}

				let stats = await db.collection('stats').find({accountAddress:eluser.accountAddress},  { sort: { cache_last_updated: -1 } }).toArray();
				stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
				
				data={days:[],slp:[],mmr:[]}
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo){
						if(stat.in_game_slp<anteultimo.in_game_slp)stat['slp']=stat.in_game_slp
						else stat['slp']=stat.in_game_slp-anteultimo.in_game_slp
						if(stat['mmr']!=1200 && (stat['slp']==0 || stat['slp']==null || stat['slp']==undefined))continue
						if(stat.date=='16/12/2021'){
							stat['slp']=stat['slp']/3
							data['days'].push(utils.getDayName("14/12/2021", "es-ES"))
							data.slp.push(stat['slp'])
							data.mmr.push(stat['mmr'])
							data['days'].push(utils.getDayName("15/12/2021", "es-ES"))
							data.slp.push(stat['slp'])
							data.mmr.push(stat['mmr'])
						}
						data.slp.push(stat['slp'])
						data.mmr.push(stat['mmr'])
						data['days'].push(utils.getDayName(stat.date, "es-ES"))
					}
				}


				let chart = new QuickChart().setConfig({
					type: 'bar',
					data: { 
						labels: data.days,
						datasets:[{label: 'SLP', data: data.slp}] 
					},
				}).setWidth(800).setHeight(400);
				message.reply(`Grafico: ${await chart.getShortUrl()}`);

				chart = new QuickChart().setConfig({
					type: 'bar',
					data: { 
						labels: data.days,
						datasets:[{label: 'MMR', data: data.mmr}] 
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
