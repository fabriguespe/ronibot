
const path = require('path');
const Command = require("../Structures/Command.js");
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "update"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!(utils.esJeissonPagos(message) || utils.esFabri(message)))return message.channel.send('No tienes permisos para correr este comando')
	
		let db = await DbConnection.Get();
		if(args.length==4){	
			
			let ids=args[1].split(",");
			for(let i in ids){
				let elnum=ids[i]
				let quien=await utils.getWalletByNum(elnum)
				let key=args[2]
				if(key=='wallet')key='scholarPayoutAddress'
				let value=args[3]
				if(!utils.esFabri(message) && value=='nota')return message.channel.send('El estado debe actualizarse con los procesos')
				let armado={}
				armado[key]=value
				let values={ $set: armado }
				await db.collection("users").updateOne({ accountAddress:quien},values )
				message.channel.send('El jugador ***#'+elnum+'*** fue actualizado con exito')
				
			}
		}else if(args[1]=='all'){
			if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
			let users=await db.collection('users-db').find({}).toArray()
			try{
				message.channel.send('Se empezara a procesar')
				for(let i in users){
					let user=users[i]
					user.num=user.num.toString()
					var myquery = { num:user.num };
					let find=await db.collection("users").findOne(myquery)
					if(!find)await db.collection("users").insertOne(user)
				}
			}catch (e) {
				utils.log("ERROR: "+e.message,message)
			}
		
			utils.log('Proceso corrido a las :' +new Date(Date.now()).toISOString()+' con una cantidad de registros: '+users.length,message);
		}
	}
});
