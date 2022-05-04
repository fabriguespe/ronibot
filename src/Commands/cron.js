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

		}else if(args[1]=='slp_fullcron'){
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
					//if(user.nota!='aprobado' && user.nota!='entrevista')continue
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

				//Copiar desde aca
				let db = await DbConnection.Get();
				let users=await db.collection('users').find({nota:'retiro'}).toArray()
				users=users.sort(function(a, b) {return parseInt(a.num) - parseInt(b.num)});
				let slpp=0
				
				if(typeof message !== 'undefined' && message.channel)message.channel.send('Procesando los claims pendientes...')
				for(let i in users){
					let user=users[i]
					if(!user.accountAddress || user.accountAddress.length!=46)continue
					if(typeof args !== 'undefined' && args[2] && user.num!=args[2])continue
					let data=await utils.getSLP(user.accountAddress,null,false)
					user.in_game_slp=data.in_game_slp
					console.log(user.num,data.in_game_slp)
					if(data.in_game_slp>0){		
						slpp+=data.in_game_slp
						message.channel.send('#'+user.num+': Se encontraron '+user.in_game_slp+' SLP sin reclamar')
						try{
							await utils.claim(user,message)
						}catch (e) {
							utils.log(e,message)
						}
					}	
				}
				
				if(typeof message !== 'undefined' && message.channel)utils.log(slpp +'SLP totales con una cantidad de registros: '+users.length,message);

				slpp=0
				if(typeof message !== 'undefined' && message.channel)message.channel.send('Revisando las wallets...')
				for(let i in users){
					let user=users[i]
					if(!user.accountAddress || user.accountAddress.length!=46)continue
					if(typeof args !== 'undefined' && args[2] && user.num!=args[2])continue
					let data=await utils.getSLP(user.accountAddress,null,false)
					console.log(user.num,data.ronin_slp)
					user.ronin_slp=data.ronin_slp
					if(data.ronin_slp>0){			
						slpp+=data.ronin_slp
						message.channel.send('#'+user.num+': Se encontraron '+user.ronin_slp+' SLP para transferir')
						try{	
							await utils.transfer(user.accountAddress,await utils.getWalletByNum("BREED"),user.ronin_slp,message)
						}catch (e) {
							utils.log(e,message)
						}
					}
				}
				
				if(typeof message !== 'undefined' && message.channel)utils.log(slpp +'SLP totales con una cantidad de registros: '+users.length,message);
				
			//HASTA ACA

		}else if(args[1]=='totalslp'){
			
			let db = await DbConnection.Get();
			let query={$or:[{nota:'aprobado'},{nota:'pro'}]}
			let users=await db.collection('users').find(query).toArray()
			let slp=0
			for(let i in users){
				let currentUser=await utils.getUserByNum(users[i].num)
				let data=await utils.claimData(currentUser,message,false)
				if(data.hours>0)continue
				slp+=data.in_game_slp
				message.channel.send('Cuenta #'+users[i].num+' '+data.in_game_slp+' '+data.hours+'hs')
			}
			
			let url = "https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd";
			let slp_price= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
			let usd=Math.round(slp*slp_price)
			message.channel.send('Total '+slp+' , aprox $'+usd*0.5+'.') 

		}else if(args[1]=='forcecobrar'){
			
			let db = await DbConnection.Get();
			let query={$or:[{nota:'aprobado'},{nota:'pro'},{nota:'pro'}]}
			let users=await db.collection('users').find(query).toArray()

			for(let i in users){
				let currentUser=await utils.getUserByNum(users[i].num)
				let data=await utils.claimData(currentUser,message,false)
				if(!(data.hours>0 && !data.has_to_claim)){
					message.channel.send('Cuenta #'+users[i].num)
					let fallo=await utils.cobro(data,message)
					if(!fallo)message.channel.send('Exito!')
				}
			}

			
		}else if(args[1]=='cobrarfijos'){
			
			let db = await DbConnection.Get();
			let users=await db.collection('users').find({nota:'fijo'}).toArray()
			for(let i in users){
				message.channel.send('Cuenta #'+users[i].num)
				let currentUser=await utils.getUserByNum(users[i].num)
				
				let data=await utils.claimData(currentUser,message,false)
				if(data.hours>0 && !data.has_to_claim){
					message.channel.send('Faltan '+data.hours+' hs para que puedas reclamar\nEste canal se cerrara en 20 segundos.') 
					continue
				}else{
					let fallo=await utils.cobroRoni(data,message)
					if(!fallo)message.channel.send('Exito!')
				}
			}

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
