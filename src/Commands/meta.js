/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const {MessageEmbed} = require('discord.js');
const cron = require('node-cron'), spawn = require('child_process').spawn;
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "meta"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
		
		try{
			let db = await DbConnection.Get();
			let users=await db.collection('users').find({}).toArray()
			users=users.sort(function(a, b) {return parseInt(a.num) - parseInt(b.num)});
			if(typeof message !== 'undefined' && message.channel)message.channel.send('Se empezara a procesar')
			let datos={total:0,energias:0,raros:'',energias:52,buenos:24,libres:0,breed:0}
			let meta={}
			for(let i in users){
				let user=users[i]
				let axies=await utils.getAxiesIds(user.accountAddress.replace('ronin:','0x'))
				if(axies && axies.axies){
					let total=axies.axies.length
					if(total==0)continue
					datos.total+=total

					//breed y buenos
					if(user.num=='2' || user.num=='1' || user.num=='43' || user.num=='186' || user.num=='187')continue
					


					//META
					let metas=[]
					for(let j in axies.axies){
						let clase=axies.axies[j].class
						if(clase=='Plant')clase='Planta'
						else if(clase=='Plant')clase='Planta'
						else if(clase=='Aquatic')clase='Pez'
						else if(clase=='Bird')clase='Ave'
						else if(clase=='Reptile')clase='Reptil'
						else if(clase=='Beast')clase='Bestia'
						else if(clase=='Dusk')clase='Tierra'
						else if(clase=='Bug')clase='Bicho'
						metas.push(clase)
					}

					metas=metas.sort().join('-')
					if(!Object.keys(meta).includes(metas))meta[metas]=1
					else meta[metas]++
					

					if(total==0 || user.nota=='pro')continue
					if(total==10 && user.nota=='energia')datos.energias+=7
					if(total==10 &&  user.nota=='energia')datos.pro+=1
					if(total==3 &&  user.nota=='libre')datos.libres+=1
					if(total==3 && user.nota!='retiro')continue
					if(total==10 && user.nota=='energia')continue
					let value=('#'+user.num+': Se encontraron '+total+' Axies | '+user.nota)
					datos.raros+=value+'\n'
				}
			}
			let embed = new MessageEmbed().setTitle('Casos').setDescription(datos.raros).setColor('GREEN').setTimestamp()
			message.channel.send({content: ` `,embeds: [embed]})
			embed = new MessageEmbed().setColor('#0099ff')
			embed = embed.addFields(
				{ name: 'Axies Totales', value: ''+datos.total,inline:true},
				{ name: 'Axies Libres', value: ''+datos.libres,inline:true},
				{ name: 'Axies Jugando', value: ''+datos.pro,inline:true},
				{ name: 'Buenos', value: ''+datos.buenos,inline:true},
				{ name: 'Energias', value: ''+datos.breed,inline:true},
			)
			message.channel.send({content: ` `,embeds: [embed]})
			
			let msg=''
			for(let i in meta){
				if(meta[i]>0)msg+=i+' '+meta[i]+'\n'
			}
			embed = new MessageEmbed().setTitle('Metas').setDescription(msg).setColor('GREEN').setTimestamp()
			message.channel.send({content: ` `,embeds: [embed]})
			embed = new MessageEmbed().setColor('#0099ff')
		}catch (e) {
			utils.log(e,message)
		}
	}
});
