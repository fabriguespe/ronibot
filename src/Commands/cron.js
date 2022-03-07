/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const {MessageEmbed} = require('discord.js');
const cron = require('node-cron'), spawn = require('child_process').spawn;
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "cron"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
		
		if(args[1]=='bk'){
			// mongorestore --archive=archive
			try{
				let backupProcess = spawn('mongodump', ['--db=ronimate','--archive=.','--gzip']);
	
				backupProcess.on('exit', (code, signal) => {
					if(code) 
						console.log('Backup process exited with code ', code);
					else if (signal)
						console.error('Backup process was killed with singal ', signal);
					else 
						console.log('Successfully backedup the database')
				});
			}catch (e) {
				utils.log(e,message)
			}

		}else if(args[1]=='api'){
			
		}else if(args[1]=='stats'){

			//cd /node/ronicron;git pull;forever restart 0
			//Copiar desde aca
			try{
				let db = await DbConnection.Get();
				let new_data=[]
				let users=await db.collection('users').find({}).toArray()
				users=users.sort(function(a, b) {return parseInt(a.num) - parseInt(b.num)});
				let data={}
				if(typeof message !== 'undefined' && message.channel)message.channel.send('Se empezara a procesar')
				for(let i in users){
					let user=users[i]
					if(!user.accountAddress || user.accountAddress.length!=46)continue
					if(typeof args !== 'undefined' && args[2] && user.num!=args[2])continue
					
					try{
						data= await fetch("https://game-api.axie.technology/api/v1/"+user.accountAddress, { method: "Get" }).then(res => res.json()).then((json) => { return json});
						console.log(data)
					}catch (e) {
						utils.log(e,message)
					}
					console.log(data)
					data.accountAddress=user.accountAddress
					data.user_id=user._id
					data.num=user.num
					data.timestamp = new Date();
					data.timestamp.setDate(data.timestamp.getDate() - 2)
					data.date=data.timestamp.getDate()+'/'+(data.timestamp.getMonth()+1)+'/'+data.timestamp.getFullYear(); 
					new_data.push(data)
					await db.collection('slp').insertOne(data)
				}
				utils.log('Proceso corrido a las ' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
			}catch (e) {
				utils.log(e,message)
			}	
			//hasta aca

		}else if(args[1]=='slp'){

			//cd /node/ronicron;git pull;forever restart 0
			//DESDE ACA
			try{
				//Copiar desde aca
				let db = await DbConnection.Get();
				let new_data=[]
				let users=await db.collection('users').find({}).toArray()
				users=users.sort(function(a, b) {return parseInt(a.num) - parseInt(b.num)});
				if(typeof message !== 'undefined' && message.channel)message.channel.send('Se empezara a procesar')
				for(let i in users){
					let user=users[i]
					if(user.nota!='aprobado' && user.nota!='entrevista')continue
					if(!user.accountAddress || user.accountAddress.length!=46)continue
					if(typeof args !== 'undefined' && args[2] && user.num!=args[2])continue
					let data=await utils.getSLP(user.accountAddress,null,false)

					data.accountAddress=user.accountAddress
					data.nota=user.nota
					data.user_id=user._id
					data.num=user.num
					data.timestamp = new Date();
					data.timestamp.setDate(data.timestamp.getDate() - 1)
					data.date=data.timestamp.getDate()+'/'+(data.timestamp.getMonth()+1)+'/'+data.timestamp.getFullYear(); 
					
					new_data.push(data)
					await db.collection('slp').insertOne(data)
					//break
				}
				
				if(typeof message !== 'undefined' && message.channel)utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
			}catch (e) {
				utils.log(e,message)
			}	
			//HASTA ACA

		}else if(args[1]=='mmr'){

			//cd /node/ronicron;git pull;forever restart 0
			//DESDE ACA
			try{
				//Copiar desde aca
				let db = await DbConnection.Get();
				let new_data=[]
				let users=await db.collection('users').find({}).toArray()
				users=users.sort(function(a, b) {return parseInt(a.num) - parseInt(b.num)});
				if(typeof message !== 'undefined' && message.channel)message.channel.send('Se empezara a procesar')
				
				for(let i in users){
					let user=users[i]
					if(user.nota!='aprobado' && user.nota!='entrevista')continue
					if(!user.accountAddress || user.accountAddress.length!=46)continue
					if(typeof args !== 'undefined' && args[2] && user.num!=args[2])continue
					let url = "https://game-api.axie.technology/api/v2/"+user.accountAddress.replace('0x','ronin:')  ;
					let data= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return json})
					if(data.mmr)data=data.mmr
					console.log(data)
					var myquery = { num:user.num };
					var newvalues = { $set: {	mmr: data	}}
					await db.collection("users").updateOne(myquery, newvalues)
					break
				}
				
				if(typeof message !== 'undefined' && message.channel)utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
			}catch (e) {
				utils.log(e,message)
			}	
			//HASTA ACA

		}else if(args[1]=='flushall'){

			try{
				//Copiar desde aca
				let db = await DbConnection.Get();
				let users=await db.collection('users').find({$or:[{nota:'retirar'},{nota:'retiro'}]}).toArray()
				users=users.sort(function(a, b) {return parseInt(a.num) - parseInt(b.num)});
				if(typeof message !== 'undefined' && message.channel)message.channel.send('Se empezara a procesar')
				for(let i in users){
					let user=users[i]
					if(!user.accountAddress || user.accountAddress.length!=46)continue
					if(typeof args !== 'undefined' && args[2] && user.num!=args[2])continue
					console.log(user.num)
					let data=await utils.getSLP(user.accountAddress,null,false)
					user.in_game_slp=data.in_game_slp
					if(data.in_game_slp>0){		
						message.channel.send('#'+user.num+': Se encontraron '+user.in_game_slp+' SLP sin reclamar')
						await utils.claim(user,message)
					}
				}
				
				if(typeof message !== 'undefined' && message.channel)utils.log('Claim corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
			}catch (e) {
				utils.log(e,message)
			}	
			try{
				//Copiar desde aca
				let db = await DbConnection.Get();
				let users=await db.collection('users').find({$or:[{nota:'retirar'},{nota:'retiro'}]}).toArray()
				users=users.sort(function(a, b) {return parseInt(a.num) - parseInt(b.num)});
				if(typeof message !== 'undefined' && message.channel)message.channel.send('Se empezara a procesar')
				for(let i in users){
					let user=users[i]
					if(!user.accountAddress || user.accountAddress.length!=46)continue
					if(typeof args !== 'undefined' && args[2] && user.num!=args[2])continue
					console.log(user.num)
					let data=await utils.getSLP(user.accountAddress,null,false)
					user.ronin_slp=data.ronin_slp
					if(data.ronin_slp>0){		
						message.channel.send('#'+user.num+': Se encontraron '+user.ronin_slp+' SLP para transferir')
						await utils.transfer(user.accountAddress,await utils.getWalletByNum("BREED"),user.ronin_slp,message)
					}
				}
				
				if(typeof message !== 'undefined' && message.channel)utils.log('Flush corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
			}catch (e) {
				utils.log(e,message)
			}	
			//HASTA ACA

		}else if(args[1]=='updateall'){
			let db = await DbConnection.Get();
			let users=await db.collection('users-db').find({}).toArray()
			utils.log('Se empezara a procesar',message)
			for(let i in users){
				let user=users[i]
				user.num=user.num.toString()
				var myquery = { num:user.num };
				let find=await db.collection("users").findOne(myquery)
				if(!find)await db.collection("users").insertOne(user)
			}
			utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
			
		}else if(args[1]=='fixall'){
			let db = await DbConnection.Get();
			let users=await db.collection('users').find({nota:'retirar'}).toArray()
			utils.log('Se empezara a procesar',message)
			for(let i in users){
				let user=users[i]
				var myquery = { num:user.num };
				var newvalues = { $set: {	nota: 'retiro'	}}
				await db.collection("users").updateOne(myquery, newvalues)
			}
			
			utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
			
		}else{
			return message.channel.send("Comando incorrecto");

		}
	}
});
