
const Command = require("../Structures/Command.js");

const path = require('path');
var secrets = require(path.resolve(__dirname, "../Data/secrets"));
var axie_abi = require(path.resolve(__dirname, "../Data/axie_abi.json"));
var utils = require(path.resolve(__dirname, "../utils.js"));
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));

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
	name: "retiro"+(process.env.LOGNAME=='fabrizioguespe'?'t':''),
	async run(message, args, client) {
        if(!utils.esFabri(message))return message.channel.send('No tienes permisos para correr este comando')
        try{
			let db = await DbConnection.Get();
            if(args.length==3){
                const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER_FREE));

                //IDs
                let from_acc=await utils.getWalletByNum(args[1])
                let to_acc=await utils.getWalletByNum(args[2])
                //Data
                if(!utils.isSafe(from_acc) || !utils.isSafe(to_acc))return message.channel.send(`Una de las wallets esta mal!`);
                
                from_acc=from_acc.replace('ronin:','0x')
                to_acc=to_acc.replace('ronin:','0x')

                

                //private
                let from_private = secrets[(from_acc.replace('0x','ronin:'))]
                
                let axie_contract = new web3.eth.Contract(axie_abi,web3.utils.toChecksumAddress(AXIE_CONTRACT))
            
                //build
                let axies=await utils.getAxiesIds(from_acc)
                for(let i in axies.axies){
                    let axie_id=axies.axies[i].id
                    console.log('Transfer:'+axie_id)

                    message.channel.send("Listo para transferir el Axie: "+axie_id+" \nAguarde un momento...");
                    let nonce = await web3.eth.getTransactionCount(from_acc, function(error, txCount) { return txCount}); 
                    let myData=axie_contract.methods.safeTransferFrom(
                    (web3.utils.toChecksumAddress(from_acc)),
                    (web3.utils.toChecksumAddress(to_acc)),
                    (axie_id)).encodeABI()
                    
                    let trans={
                            "chainId": 2020,
                            "gas": 492874,
                            "from": from_acc,
                            "gasPrice": 0,
                            "value": 0,
                            "to": AXIE_CONTRACT,
                            "nonce": nonce,
                            data:myData
                    }

                        
                    let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
                    let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)
                    
                    if(tr_raw.status){            
                        let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tr_raw.transactionHash+")\n").setColor('GREEN').setTimestamp()
                        message.channel.send({content: ` `,embeds: [embed]})
                        console.log({ accountAddress:from_acc},{ $set: {nota:"retirar",discord:null} })
                        await db.collection("users").updateOne({ accountAddress:from_acc},{ $set: {nota:"retirar",discord:null} } )
                    }        
                    else message.channel.send("ERROR Status False");
                }
                
                utils.log("Listo!",message);
            }else{
                utils.log(`not a valid command!`);
            }
        }catch(e){
            message.channel.send("ERROR: "+e.message);
        }
	}
});
