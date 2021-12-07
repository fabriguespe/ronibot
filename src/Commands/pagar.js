const path = require('path');
const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
var secrets = require(path.resolve(__dirname, "../Data/secrets"));
var slp_abi = require(path.resolve(__dirname, "../Data/slp_abi.json"));
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
	name: "pagar",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
        if(args.length==4){
			
            //IDs
            let balance=args[1]
            let from_acc=await utils.getWalletByNum(args[2])
            let to_acc=await utils.getWalletByNum(args[3])
            console.log(balance,from_acc,to_acc)
            //Data
            if(!utils.isSafe(from_acc) || !utils.isSafe(to_acc))return message.reply(`Una de las wallets esta mal!`);
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            let from_private = secrets[(from_acc.replace('0x','ronin:'))]    

			const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER_FREE));
            let nonce = await web3.eth.getTransactionCount(from_acc, function(error, txCount) { return txCount}); 
			
            let contract = new web3.eth.Contract(slp_abi,web3.utils.toChecksumAddress(SLP_CONTRACT))
            
            let myData=contract.methods.transfer(
                (web3.utils.toChecksumAddress(to_acc)),
				balance).encodeABI()
            
            let trans={
                    "chainId": 2020,
                    "gas": 492874,
                    "from": from_acc,
                    "gasPrice": 0,
                    "value": 0,
                    "to": SLP_CONTRACT,
                    "nonce": nonce,
                    data:myData
            }
            
            try{
                //TRANSFER
                message.reply("Se te transferiran tus SLP a tu wallet: "+from_acc+"\nAguarde un momento...");
                let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
                let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)
                utils.log(tr_raw)

                if(tr_raw.status)message.reply(`Exito!\n Hash: https://explorer.roninchain.com/tx/${tr_raw.transactionHash}`);
                else message.reply("ERROR Status False");
            }catch(e){
                message.reply("ERROR: "+e.message);
            }

            

        }else{

            return message.reply(`${args[0]} is not a valid command!`);
        }

	}
});
