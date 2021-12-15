/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "crons",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.reply('No tienes permisos para correr este comando')
			
		utils.log('Timezone!')
		let db = await DbConnection.Get();
		let new_data=[]
		let users=await db.collection('users').find({}).toArray()
		try{
			for(let i in users){
				let user=users[i]
				url = "https://game-api.axie.technology/api/v1/"+user.accountAddress;
				let data= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return json});
				data.accountAddress=user.accountAddress
				data.user_id=user._id
				data.last_updated=user.last_updated
				
				data.timestamp = new Date();
				data.timestamp.setDate(data.timestamp.getDate() - 1)
				data.date=data.timestamp.getDate()+'/'+(data.timestamp.getMonth()+1)+'/'+data.timestamp.getFullYear(); 
				new_data.push(data)
				await db.collection('stats-test').insertOne(data)
			}
		}catch (e) {
			utils.log(e)
		}
	
		utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);

	}
});
