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
		
		utils.log('Timezone!')
		let db = await DbConnection.Get();
		let new_data=[]
		let users=await db.collection('users').find({}).toArray()
		try{
			for(let i in users){
				let user=users[i]
				url = "https://game-api.axie.technology/api/v1/"+user.accountAddress;
				let data= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return json});
				//console.log(data)
				data.accountAddress=user.accountAddress
				data.user_id=user._id
				data.last_updated=user.last_updated
				data.timestamp=new Date(Date.now())
				data.date=new Date().getDate()+'/'+(new Date().getMonth()+1)+'/'+new Date().getFullYear(); 
				//utils.log(user.accountAddress+'-'+data.total_slp)
				let ultimo=await db.collection('stats').findOne({accountAddress:user.accountAddress},  { sort: { date_register: -1 } }, undefined)
				utils.log(ultimo)
				if(ultimo && ultimo.total_slp){
					data.day_slp=(data.total_slp)-(ultimo.total_slp)
					utils.log(data.day_slp)
					//utils.log(user.accountAddress+' '+data.day_slp)
				}
				new_data.push(data)
				await db.collection('stats').insertOne(data)
			}
		}catch (e) {
			utils.log(e)
		}
		
		utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
	
	}
});
