
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
	name: "asignar",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
        try{
            if(args.length==3){
                const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER_FREE));

                //IDs
                let to_acc=await utils.getWalletByNum(args[2])
                //Data
                if(!utils.isSafe(to_acc))return message.reply(`Una de las wallets esta mal!`);
                let from_acc='0x858984a23b440e765f35ff06e896794dc3261c62'
                to_acc=to_acc.replace('ronin:','0x')

                

                //private
                let from_private = secrets[(from_acc.replace('0x','ronin:'))]
                utils.log(from_private)
                
                let axie_contract = new web3.eth.Contract(axie_abi,web3.utils.toChecksumAddress(AXIE_CONTRACT))
            
                //build
                let axies_ids=args[1].split(",");
                console.log(axies_ids)
                for(let i in axies_ids){
                    let axie_id=axies_ids[i]
                    console.log('Transfer:'+axie_id)

                    message.reply("Listo para transferir el Axie: "+axie_id+" \nAguarde un momento...");
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

                    try{
                        let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
                        let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)
                        utils.log(tr_raw.status)
                        
                        if(tr_raw.status){            
                            let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tr_raw.transactionHash+")").setColor('GREEN').setTimestamp()
                            return message.reply({content: ` `,embeds: [embed]})
                        }        
                        else message.reply("ERROR Status False");

                    }catch(e){
                        utils.log("Fallo la transfer");
                        
                    }
                }
                utils.log("Listo!",message);
            }else{
                utils.log(`${args[0]} is not a valid command!`);
            }
        }catch(e){
            message.reply("ERROR: "+e.message);
        }
	}
});
