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
		if(!utils.esFabri(message))return message.reply('No tienes permisos para correr este comando')
		
		utils.log('Timezone!')
		let db = await DbConnection.Get();
		let new_data=[]
		let users=await db.collection('users').find({}).toArray()
		
		utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
	
	}
});
