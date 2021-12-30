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
	name: "ranking"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();
			let users = await db.collection('users').find().toArray()
			let data_users=[]
			let count_users=0
			for(let ii in users){
				let eluser=users[ii]
				let stats = await db.collection('stats').find({accountAddress:eluser.accountAddress},  { sort: { cache_last_updated: -1 } }).toArray();
				users[ii]['mmr_sum']=0
				users[ii]['slp_sum']=0
				users[ii]['slp_prom']=0
				users[ii]['mmr_prom']=0
				users[ii]['stat_count']=0
				stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});
				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined){
						if(stat.in_game_slp<anteultimo.in_game_slp)users[ii]['slp_sum']+=stat.in_game_slp
						else users[ii]['slp_sum']+=stat.in_game_slp-anteultimo.in_game_slp
						users[ii]['mmr_sum']+=stat['mmr']
						users[ii]['stat_count']+=1
					}
					
					if(users[ii]['stat_count']>=7)break
				}
				
				users[ii]['slp_prom']=Math.round(users[ii]['slp_sum']/users[ii]['stat_count'])
				users[ii]['mmr_prom']=Math.round(users[ii]['mmr_sum']/users[ii]['stat_count'])
				

			}
			users=users.filter(u => u.slp_prom>0)
			let top=users.sort(function(a, b) {return b.slp_prom - a.slp_prom}).slice(0, 10);
			let help=''
			for(let ii in top){
				let user=top[ii]
				help+='#'+user.num+" "+user.name+' SLP:'+user.slp_prom+' COPAS:'+user.mmr_prom+'\n\n'
			}	
			
			let embed = new MessageEmbed().setTitle('Mejores').setDescription(help).setColor('GREEN').setTimestamp()
			
			return message.channel.send({content: ` `,embeds: [embed]})

		}catch(e){
			utils.log(e.message,message)
		}

	}
});
