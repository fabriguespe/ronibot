/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "fix",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		utils.log('Timezone!')
		let db = await DbConnection.Get();
		let users=await db.collection('users').find({}).toArray()
		try{
			for(let i in users){
				let user=users[i]
				if(user.accountAddress!='ronin:7a5c112d8fa5e091df602c0a6aaafca1f2d9e4fc')continue
				console.log(user.name)
				let stats=await db.collection('stats-test').find({accountAddress:user.accountAddress},  { sort: { date_register: -1 } }).toArray()
				for(let i in stats){
					let ultimo=stats[i-1]
					let data=stats[i]
					if(ultimo && ultimo.total_slp){
						data.day_slp=(data.in_game_slp)-(ultimo.in_game_slp)
						utils.log(data.day_slp)
					}
					//await db.collection('stats').insertOne(data)
				}
			}
		}catch (e) {
			utils.log(e)
		}
		
		utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
	
	}
});
