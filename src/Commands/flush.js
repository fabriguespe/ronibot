
const Command = require("../Structures/Command.js");

const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
const path = require('path');
var secrets = require(path.resolve(__dirname, "../Data/secrets"));
var utils = require(path.resolve(__dirname, "../utils.js"));

var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
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
	name: "flush"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	description: "Shows the price of the slp!",
	async run(message, args, client) {
		if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
        try{
            if(args.length==2){


                let db = await DbConnection.Get();

                let roni_wallet=await utils.getWalletByNum("BREED")
                roni_wallet=roni_wallet.replace('ronin:','0x')
                
                //build
                let ids=args[1].split(",");
                for(let i in ids){
                    let num=ids[i]
                    let currentUser=await utils.getUserByNum(num)
                    let from_acc=currentUser.accountAddress
                    console.log(num,from_acc)
                    //Data
                    if(!utils.isSafe(from_acc))return message.channel.send(`Una de las wallets esta mal!`);
                   
                    let unclaimed=await utils.getSLP(currentUser.accountAddress,message)
                    if(unclaimed>0){
                        let tx=await utils.transfer(from_acc,roni_wallet,unclaimed,message)
                        if(tx){
                            let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tx+")").setColor('GREEN').setTimestamp()
                            message.channel.send({content: ` `,embeds: [embed]})
                            await db.collection('log').insertOne({tx:tx,type:'flush_ronimate',timestamp:utils.timestamp_log(),date:utils.date_log(), slp:slp,num:num,from_acc:from_acc,wallet:roni_wallet})

                        }
                    }else{
                        utils.log('Cuenta '+num+' no tiene slp',message);
                    }
                }

            }else{
                utils.log(`Comando invalido`,message);
            }
        }catch(e){
            message.channel.send("ERROR: "+e.message);
        }
	}
});
