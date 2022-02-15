/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const cron = require('node-cron'), spawn = require('child_process').spawn;
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "cron"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
		
		if(args[1]=='bk'){
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
				utils.log(e.message,message)
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
					}catch (e) {
						utils.log(e)
					}

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
				utils.log(e)
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
				let data={}
				if(typeof message !== 'undefined' && message.channel)message.channel.send('Se empezara a procesar')
				for(let i in users){
					let user=users[i]
					if(!user.accountAddress || user.accountAddress.length!=46)continue
					if(typeof args !== 'undefined' && args[2] && user.num!=args[2])continue
					let jdata=await fetch("https://game-api.skymavis.com/game-api/clients/"+user.accountAddress.replace('ronin:','0x')+"/items/1").then(response => response.json()).then(data => { return data});           
					let balance=jdata.blockchain_related.balance
					let total=jdata.total-jdata.blockchain_related.balance
					data= {in_game_slp:total,ronin_slp:balance?balance:0,last_claim:jdata.last_claimed_item_at}

					data.accountAddress=user.accountAddress
					data.nota=user.nota
					data.user_id=user._id
					data.num=user.num
					data.timestamp = new Date();
					data.timestamp.setDate(data.timestamp.getDate() - 1)
					data.date=data.timestamp.getDate()+'/'+(data.timestamp.getMonth()+1)+'/'+data.timestamp.getFullYear(); 
					new_data.push(data)
					console.log(data)
					await db.collection('slp').insertOne(data)
				}
				utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
			}catch (e) {
				utils.log(e)
			}	
			//HASTA ACA

		}else if(args[1]=='jeje'){
			let msg=''
			for(let i=32;i<=307;i++){
				msg+=i+','
			}
			return message.channel.send(msg);
		}else{
			return message.channel.send("Comando incorrecto");

		}
	}
});
