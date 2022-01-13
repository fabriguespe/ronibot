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
	name: "entrevista"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		try{
			let db = await DbConnection.Get();
			let users = await db.collection('users').find().toArray()
			let limit_prom=args[1]?parseInt(args[1]):3
			for(let ii in users){
				let eluser=users[ii]
				users[ii]['slp_sum']=0
				users[ii]['slp_prom']=0
				users[ii]['days']=0
				let stats = await db.collection('stats').find({accountAddress:eluser.accountAddress},  { sort: { cache_last_updated: -1 } }).toArray();
				stats=stats.sort(function(a, b) {return a.cache_last_updated - b.cache_last_updated});

				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined && stat.total_slp>0){
						if(i>=(stats.length-limit_prom)){
							if(stat.in_game_slp<anteultimo.in_game_slp )users[ii]['slp_sum']+=stat.in_game_slp
							else users[ii]['slp_sum']+=stat.in_game_slp-anteultimo.in_game_slp
						}
						
						if(stat.in_game_slp<anteultimo.in_game_slp)users[ii]['slp']=stat.in_game_slp
						else users[ii]['slp']=stat.in_game_slp-anteultimo.in_game_slp

						
						users[ii]['mmr']=stat['mmr']
						users[ii]['days']+=1
					}
				}
				let divisor=users[ii]['days']>=limit_prom?limit_prom:users[ii]['days']
				users[ii]['slp_prom']=Math.round(users[ii]['slp_sum']/divisor)
			}
			//users=users.filter(u => u.slp_prom>0 && (u.nota == null || u.nota == undefined || u.nota == 'aprobada'))
			let top=users.sort(function(a, b) {return b.slp_prom - a.slp_prom})
			let aprobar=''
			let evaluar=''
			let retirar=''
			let fin=''
			
			for(let ii in top){
				let user=top[ii]
				if(user.nota && user.nota.toLowerCase().includes('entrevist')){
					if(user.name)user.name=user.name.replaceAll('*','')
					let value='#'+user.num+" [***"+user.name+"***](https://marketplace.axieinfinity.com/profile/"+user.accountAddress+") "+user.slp_prom+'('+user.mmr+')'+'('+user.days+')\n'
					let aprobado=85
					if(user.days<=3){//FASE 1
						if(user.slp_prom<50)retirar+=value
						else if(user.slp_prom>=50 && user.slp_prom<=aprobado)evaluar+=value
						else if(user.slp_prom>aprobado)aprobar+=value
					}else if(user.days<=7){//FASE 2
						if(user.slp_prom<75)retirar+=value
						else if(user.slp_prom>=75 && user.slp_prom<=aprobado)evaluar+=value
						else if(user.slp_prom>aprobado)aprobar+=value
					}else if(user.days<=14){// FASE 3
						if(user.slp_prom<aprobado)retirar+=value
						else if(user.slp_prom>=aprobado)aprobar+=value
					}else fin+=value
				}
			}
			let embed = new MessageEmbed().setTitle("Aprobar").setDescription(aprobar).setColor('GREEN').setFooter( 'PROM SLP - COPAS - DIAS')
			message.channel.send({content: ` `,embeds: [embed]})
			embed = new MessageEmbed().setTitle("Prorroga").setDescription(evaluar).setColor('RED').setFooter( 'PROM SLP - COPAS - DIAS')
			message.channel.send({content: ` `,embeds: [embed]})
			embed = new MessageEmbed().setTitle("Retirar").setDescription(retirar).setColor('BLACK').setFooter( 'PROM SLP - COPAS - DIAS')
			message.channel.send({content: ` `,embeds: [embed]})
			embed = new MessageEmbed().setTitle("Fin - Vacio").setDescription(fin).setColor('ORANGE').setFooter( 'PROM SLP - COPAS - DIAS')
			message.channel.send({content: ` `,embeds: [embed]})



		}catch(e){
			utils.log(e.message,message)
		}

	}
});