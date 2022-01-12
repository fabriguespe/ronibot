
const Command = require("../Structures/Command.js");

const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
const path = require('path');
var secrets = require(path.resolve(__dirname, "../Data/secrets"));
var axie_abi = require(path.resolve(__dirname, "../Data/axie_abi.json"));
var utils = require(path.resolve(__dirname, "../utils.js"));

const Web3 = require('web3');

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36"
TIMEOUT_MINS = 5
AXIE_CONTRACT = "0x32950db2a7164ae833121501c797d79e7b79d74c"
AXS_CONTRACT = "0x97a9107c1793bc407d6f527b77e7fff4d812bece"
SLP_CONTRACT = "0xa8754b9fa15fc18bb59458815510e40a12cd2014"
WETH_CONTRACT = "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5"
RONIN_PROVIDER_FREE = "https://proxy.roninchain.com/free-gas-rpc"
RONIN_PROVIDER = "https://api.roninchain.com/rpc"



module.exports = new Command({
	name: "asignar"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
        try{
            if(args.length==3){

                //IDs
                let user_from=await utils.getUserByNum(args[2])
                let user_to=await utils.getUserByNum(args[3])
                let from_acc=user_from.accountAddress
                let to_acc=user_to.accountAddress?user_to.accountAddress:user_to
                let num_from=user_from.num
                let num_to=user_to.num?user_to.num:args[3]

                //Data
                if(!utils.isSafe(to_acc))return message.channel.send(`Una de las wallets esta mal!`);
                from_acc=from_acc.replace('ronin:','0x')
                to_acc=to_acc.replace('ronin:','0x')

                //private
            
                //build
                let axies_ids=args[1].split(",");
                for(let i in axies_ids){
                    let axie_id=axies_ids[i]
                    message.channel.send("Listo para transferir el Axie: "+axie_id+" \nAguarde un momento...");
                    await utils.transferAxie(from_acc,to_acc,num_from,num_to,axie_id,message)
                }
                utils.log("Listo!",message);
            }else{
                utils.log(`${args[0]} is not a valid command!`);
            }
        }catch(e){
            message.channel.send("ERROR: "+e.message);
        }
	}
});
