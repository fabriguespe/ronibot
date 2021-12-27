/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "cron",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
		
		if(args[1]=='stats'){
			let db = await DbConnection.Get();
			let users=await db.collection('users').find({}).toArray()
			try{
				message.channel.send('Se empezara a procesar')
				for( let ii in [13,14,15]){

					for(let i in users){
						let user=users[i]
						if(user.num!="43")continue
						url = "https://game-api.axie.technology/api/v1/"+user.accountAddress;
						let data= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return json});
						data.accountAddress=user.accountAddress
						data.user_id=user._id
						
						data.last_updated=user.last_updated
						data.timestamp = new Date("12/"+[13,14,15][ii]+"/2021");
						data.date=data.timestamp.getDate()+'/'+(data.timestamp.getMonth()+1)+'/'+data.timestamp.getFullYear(); 
						
						let stats = await db.collection('stats').find({accountAddress:user.accountAddress},  { sort: { cache_last_updated: -1 } }).toArray();
						stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
						let ultimo=stats[stats.length-1]
						let ante=stats[stats.length-2]
						let anteante=stats[stats.length-3]
						if(anteante && ante){
							let dif=ante.in_game_slp-anteante.in_game_slp
							data.in_game_slp=ultimo.in_game_slp+dif
							console.log(dif,data.in_game_slp)
							await db.collection('stats').insertOne(data)
						}
					}
				}
				
			}catch (e) {
				utils.log(e)
			}
		
			utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
	
		}
	}
});
