
const Command = require("../Structures/Command.js");

const path = require('path');
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));


module.exports = new Command({
	name: "retiro"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
        if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
        if(args.length==2 || args.length==3){
            try{
                //IDs
                    
                let ids=args[1].split(",");
                for(let i in ids){
                    let el_num=ids[i]
                    let user_from=await utils.getUserByNum(el_num)
                    if(!args[2]){//si no hay destino auto asigna un retirado
                        let db = await DbConnection.Get();
                        let users=await db.collection('users').find({nota:"retiro"}).toArray()
                        users=users.sort(function(a, b) {return parseInt(a.num) - parseInt(b.num)});
                        for(let i in users){
                            let mmr=await utils.getMMR(users[i].accountAddress,message,false)
                            if(mmr>=1200){
                                args[2]=users[0].num
                                message.channel.send(`Se va a asignar la cuenta `+args[2]);
                                break;
                            }
                        }
                    }
                    
                    let user_to=await utils.getUserByNum(args[2])
                    let from_acc=(user_from && user_from.accountAddress?user_from.accountAddress:user_from)
                    let to_acc=(user_to && user_to.accountAddress?user_to.accountAddress:user_to)
                    let num_from=(user_from && user_from.num)?user_from.num:el_num
                    let num_to=(user_to && user_to.num)?user_to.num:args[2]
                    
                    //build
                    let axies_to=await utils.getAxiesIds(to_acc)
                    if((!axies_to || axies_to.count==3) && args[2].toLowerCase()!='breed')return message.channel.send(`La cuenta destino ya tiene axies!`);
                    //Data
                    from_acc=from_acc.replace('ronin:','0x')
                    to_acc=to_acc.replace('ronin:','0x')

                    //build
                    let axies=await utils.getAxiesIds(from_acc)
                    if(!axies || !axies.axies)return message.channel.send(`Failed to get axies!`);
                    for(let i in axies.axies){
                        let axie_id=axies.axies[i].id
                        await utils.transferAxie(from_acc,to_acc,num_from,num_to,axie_id,message)
                    }
                    await utils.cambiarEstado(user_from.num,user_from.nota,'retiro',message)
                    await utils.cambiarEstado(user_to.num,user_to.nota,'libre',message)
                    utils.log("Listo!",message);
                }
        
        }catch(e){
            utils.log(e,message)
        }   
     }else{
            utils.log(`not a valid command!`);
    }
	}
});
