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

			let db = await DbConnection.Get();
			let new_data=[]
			let users=await db.collection('users').find({}).toArray()
			message.channel.send('Se empezara a procesar')
			
			try{
				for(let i in users){
					let user=users[i]
					
					url = "https://game-api.axie.technology/api/v1/"+user.accountAddress;
					let data= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return json});
					data.accountAddress=user.accountAddress
					data.user_id=user._id
					data.last_updated=user.last_updated
					data.num=user.num
					console.log(data.num)
					data.timestamp = new Date();
					data.timestamp.setDate(data.timestamp.getDate() - 1)
					data.date=data.timestamp.getDate()+'/'+(data.timestamp.getMonth()+1)+'/'+data.timestamp.getFullYear(); 
					new_data.push(data)
		
					
					await db.collection('stats').insertOne(data)
				}
			}catch (e) {
				utils.log(e)
			}
				
		
			utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
	
		}else if(args[1]=='jeje'){
			let msg=''
			for(let i=32;i<=307;i++){
				msg+=i+','
			}
			return message.channel.send(msg);
		}
	}
});
