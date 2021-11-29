const path = require('path');
const Command = require(path.resolve(__dirname, "../Structures/Command.js"))
const fetch = require( "node-fetch")

var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
var utils = require(path.resolve(__dirname, "../utils.js"));


module.exports = new Command({
	name: "all",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		
		if(args.length==2){

			let db = await DbConnection.Get();

			let stats = await db.collection('stats-test').find({
				timestamp: {
					$gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
				}
			},{ sort: { accountAddress:1}} ).toArray() ;
			
			let allusers=[]
			let day=0
			let avg_slp=0
			let avg_mmr=0
			for(let i in stats){
				let stat=stats[i]
				//datos
				let finded=allusers.findIndex(function(i){return i.accountAddress == stat.accountAddress})
				if(finded>=0){
					let labe='day_'+day++
					if(stat.day_slp)avg_slp=(avg_slp+stat.day_slp)/day
					if(stat.avg_mmr)avg_mmr=(avg_mmr+stat.mmr)/day

					allusers[finded].slp.push({[`${labe}`]:stat.day_slp})
					allusers[finded].mmr.push({[`${labe}`]:stat.mmr})
					allusers[finded].avg_mmr=Math.round(avg_mmr)
					allusers[finded].avg_slp=Math.round(avg_slp)
				}else{
					allusers.push({accountAddress:stat.accountAddress,slp:[],mmr:[],avg_slp:0,avg_mmr:0})
					day=0
				}
			}
			if(args[1]=='top')allusers=allusers.sort((a,b) => b-a)
			if(args[1]=='bottom')allusers=allusers.sort((a,b) => b-a)
			allusers=allusers.slice(0,5);
			
			for(let i in allusers){
				let user=allusers[i]
				utils.double_chart(message,user)
			}
		}

	}
});
