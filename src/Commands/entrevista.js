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
			let users = await db.collection('users').find({nota:'entrevista'}).toArray()
			let limit_prom=args[1]?parseInt(args[1]):3

			let num_aprobado=50
			let num_retirar=30	

			for(let ii in users){
				let eluser=users[ii]
				users[ii]['slp_sum']=0
				users[ii]['slp_prom']=0
				users[ii]['stat_count']=0
				let stats = await db.collection('slp').find({accountAddress:eluser.accountAddress},  { sort: { timestamp: -1 } }).toArray();
				stats=stats.sort(function(a, b) {return a.timestamp - b.timestamp});


				for(let i in stats){
					let stat=stats[i]
					let anteultimo=stats[i-1]
					if(stat && anteultimo && anteultimo.in_game_slp!=undefined && stat.in_game_slp!=undefined){
						if(i>=(stats.length-limit_prom)){
							if(stat.in_game_slp<anteultimo.in_game_slp )users[ii]['slp_sum']+=stat.in_game_slp
							else users[ii]['slp_sum']+=stat.in_game_slp-anteultimo.in_game_slp
						}
						
						if(stat.in_game_slp<anteultimo.in_game_slp)users[ii]['slp']=stat.in_game_slp
						else users[ii]['slp']=stat.in_game_slp-anteultimo.in_game_slp
					
						users[ii]['mmr_sum']+=stat['mmr']
						users[ii]['mmr']=stat['mmr']
						if(users[ii]['slp']>0)users[ii]['stat_count']+=1
					}
				}
				let divisor=users[ii]['stat_count']>=limit_prom?limit_prom:users[ii]['stat_count']
				users[ii]['slp_prom']=Math.round(users[ii]['slp_sum']/divisor)
			}
			let top=users.sort(function(a, b) {return b.slp_prom - a.slp_prom})
			let aprobar=''
			let nuevos=''
			let evaluar=''
			let retirar=''
			let fin=''
			let embed=''
			console.log(users)
			for(let ii in top){
				let user=top[ii]
				if(user.name)user.name=user.name.replaceAll('*','')
				let valores=user.slp_prom+(user.mmr==undefined?'':'('+user.mmr+')')+'('+user.stat_count+')'
				console.log(valores)
				if(!user.slp_prom)valores=' No empezó'
				let value='#'+user.num+" [***"+user.name+"***](https://marketplace.axieinfinity.com/profile/"+user.accountAddress+") "+valores+'\n'
				
				if(user.stat_count<3){//FASE 1
					nuevos+=value
				}else if(user.stat_count==3){//FASE 1
					if(user.slp_prom<num_retirar)retirar+=value
					else if(user.slp_prom>=num_retirar && user.slp_prom<=num_aprobado)evaluar+=value
					else if(user.slp_prom>num_aprobado)aprobar+=value
				}else if(user.stat_count<=7){//FASE 2
					if(user.slp_prom<num_retirar)retirar+=value
					else if(user.slp_prom>=num_retirar && user.slp_prom<=num_aprobado)evaluar+=value
					else if(user.slp_prom>num_aprobado)aprobar+=value
				}else if(user.stat_count<=14){// FASE 3
					if(user.slp_prom<num_aprobado)retirar+=value
					else if(user.slp_prom>=num_aprobado)aprobar+=value
				}else fin+=value
			}
			
			embed = new MessageEmbed().setTitle("Nuevos").setDescription(nuevos).setColor('WHITE').setFooter( 'PROM SLP - COPAS - DIAS')
			message.channel.send({content: ` `,embeds: [embed]})
			embed = new MessageEmbed().setTitle("Aprobar").setDescription(aprobar).setColor('GREEN').setFooter( 'PROM SLP - COPAS - DIAS')
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