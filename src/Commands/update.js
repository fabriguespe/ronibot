
const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "update"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!(utils.esJeissonPagos(message) || utils.esFabri(message)))return message.channel.send('No tienes permisos para correr este comando')
		if(args.length==4){	
            let quien=await utils.getWalletByNum(args[1])
			let key=args[2]
			if(key=='wallet')key='scholarPayoutAddress'
			let value=args[3]
			let armado={}
			armado[key]=value
			let values={ $set: armado }
			let db = await DbConnection.Get();
			await db.collection("users").updateOne({ accountAddress:quien},values )
			message.channel.send('El jugador fue actualizado con exito')
			//let rCanal = message.guild.channels.cache.find(c => c.id == 917380557099380816);//canal ingresos
			//if(value=='aprobada')rCanal.send('El jugador fue actualizado con exito')
		}else if(args[1]=='all'){
			if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
			let db = await DbConnection.Get();
			let users=await db.collection('users-db').find({}).toArray()
			try{
				message.channel.send('Se empezara a procesar')
				for(let i in users){
					let user=users[i]
					user.num=user.num.toString()
					let db = await DbConnection.Get();
					var myquery = { num:user.num };
					let find=await db.collection("users").findOne(myquery)
					if(find){
						var newvalues = { $set: {
							name: user.name,
							scholarPayoutAddress: user.scholarPayoutAddress,
							nota: user.nota,
							pass: user.pass,
							ingreso: user.ingreso,
							referido: user.referido,
							estado: user.estado
						}};
						await db.collection("users").updateOne(myquery, newvalues)
					}else{
						await db.collection("users").insertOne(user)
					}
					console.log(user.num)
				}
			}catch (e) {
				utils.log(e)
			}
		
			utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
		}
	}
});
