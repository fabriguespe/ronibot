const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var secrets = require(path.resolve(__dirname, "../Data/secrets"));
var axie_abi = require(path.resolve(__dirname, "../Data/axie_abi.json"));
var utils = require(path.resolve(__dirname, "../utils.js"));

const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
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
	name: "cambio",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!utils.esManager(message))return message.channel.send('No tienes permisos para correr este comando')
        if(args.length==4){
            const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER_FREE));

            //IDs
            let from_acc=await utils.getWalletByNum(args[2])
            let to_acc=await utils.getWalletByNum(args[3])
            //Data
            if(!utils.isSafe(from_acc) || !utils.isSafe(to_acc))return message.channel.send(`Una de las wallets esta mal!`);
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            //private
            let from_private = secrets[(from_acc.replace('0x','ronin:'))]
            
            let axie_contract = new web3.eth.Contract(axie_abi,web3.utils.toChecksumAddress(AXIE_CONTRACT))
            let nonce = await web3.eth.getTransactionCount(from_acc, function(error, txCount) { return txCount}); 
        
            //build
            let roni_slp=data.unclaimed-data.recibe
            let jugador_slp=data.recibe
            if(roni_slp==jugador_slp)roni_slp-=1
            let roniPrimero=(roni_slp>=jugador_slp)

            let player_wallet=data.scholarPayoutAddress
            let roni_wallet='0x858984a23b440e765f35ff06e896794dc3261c62'
            
            try{
                let t1=await this.transfer(from_acc,(roniPrimero?roni_wallet:player_wallet),(roniPrimero?roni_slp:jugador_slp),message)
                if(t1){
                    let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+t1+")").setColor('GREEN').setTimestamp()
                    message.channel.send({content: ` `,embeds: [embed]})
                    await db.collection('log').insertOne({type:'slp_'+(roniPrimero?'ronimate':'jugador'),date:timestamp_log,date:date_log, slp:(roniPrimero?roni_slp:jugador_slp),num:data.num,from_acc:from_acc,wallet:(roniPrimero?roni_wallet:player_wallet)})
                }
            }catch(e){
                fallo=true
                this.log("ERROR: "+e.message,message)
            }
        }else{

            return message.channel.send(`${args[0]} is not a valid command!`);
        }

	}
});
