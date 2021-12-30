/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "update_users"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
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
});
