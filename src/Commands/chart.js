const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
const QuickChart = require('quickchart-js');
var utils = require(path.resolve(__dirname, "../utils.js"));



module.exports = new Command({
	name: "chart",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
	
		if(args.length==2){

			let db = await DbConnection.Get();
			let eluser = await db.collection('users').findOne({num:parseInt(args[1])?parseInt(args[1]):args[1]})
			if(!eluser)return
			let stats = await db.collection('stats-test').find({accountAddress:eluser.accountAddress}).toArray();

			let data={days:[],day_slp:[],mmr:[]}
			for(let i in stats){
				let stat=stats[i]
				data['mmr'].push(stat['mmr'])
				data['day_slp'].push(stat['day_slp'])
				data['days'].push(utils.getDayName(stat.timestamp, "es-ES"))
			}
			
			let chart = new QuickChart().setConfig({
				type: 'bar',
				data: { 
					labels: data.days,
					datasets:[{label: 'day_slp', data: data['day_slp']},{label: 'mmr',data: data['mmr']}] 
				},
			}).setWidth(800).setHeight(400);
			message.reply(`Grafico: ${await chart.getShortUrl()}`);

		}
	}
});
