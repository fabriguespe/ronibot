
const path = require('path');
const Command = require("../Structures/Command.js");
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));

module.exports = new Command({
	name: "update"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!(utils.esJeissonPagos(message) || utils.esFabri(message)))return message.channel.send('No tienes permisos para correr este comando')
	
		let db = await DbConnection.Get();
	
			let ids=args[1].split(",");
			for(let i in ids){
				let elnum=ids[i]
				let quien=await utils.getWalletByNum(elnum)
				let key=args[2]
				if(key=='wallet')key='scholarPayoutAddress'
				let value=utils.erase(args,args[0]+' '+args[1]+' '+args[2])
				if(!utils.esFabri(message) && value=='nota')return message.channel.send('El estado debe actualizarse con los procesos')
				let armado={}
				armado[key]=value
				let values={ $set: armado }
				await db.collection("users").updateOne({ accountAddress:quien},values )
				message.channel.send('El jugador ***#'+elnum+'*** fue actualizado con exito')
				
			}
		
	}
});
