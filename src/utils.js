const QuickChart = require('quickchart-js');
const path = require('path');
var secrets = require(path.resolve(__dirname, "./Data/secrets"));
const fetch = require( "node-fetch")
var slp_abi = require(path.resolve(__dirname, "./Data/slp_abi.json"));
var DbConnection = require(path.resolve(__dirname, "./Data/db.js"));
const Web3 = require('web3');

const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36"
RONIN_PROVIDER_FREE = "https://proxy.roninchain.com/free-gas-rpc"

var log4js = require("log4js");
const { sign } = require('crypto');
log4js.configure({
	appenders: { cheese: { type: "file", filename: "log.log" } },
	categories: { default: { appenders: ["cheese"], level: "error" } }
});
var logger = log4js.getLogger();
logger.level = "debug";

module.exports = {
    FROM_UNIX_EPOCH:function(epoch_in_secs){
        return new Date(epoch_in_secs * 1000).toLocaleString("es-ES", {timeZone: "America/Caracas"})
    },
    claim:async function(data,message){

        try{
            let db = await DbConnection.Get();
            let from_acc=data.from_acc
            from_acc=from_acc.replace('ronin:','0x')
            data.scholarPayoutAddress=data.scholarPayoutAddress.replace('ronin:','0x')

            let from_private = secrets[(from_acc.replace('0x','ronin:'))]    

            //random message
            let random_msg=await this.create_random_msg()
            let jwt=await this.get_jwt(from_acc,random_msg,from_private)
            let jdata=await fetch("https://game-api.skymavis.com/game-api/clients/"+from_acc+"/items/1/claim", { method: 'post', headers: { 'User-Agent': USER_AGENT, 'authorization': 'Bearer '+jwt},body: ""}).then(response => response.json()).then(data => { return data});
            let signature=jdata.blockchain_related.signature
            
            const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER_FREE));
            let contract = new web3.eth.Contract(slp_abi,web3.utils.toChecksumAddress(SLP_CONTRACT))
            let nonce = await web3.eth.getTransactionCount(from_acc, function(error, txCount) { return txCount}); 
            
            //build
            let myData=contract.methods.checkpoint(
                (web3.utils.toChecksumAddress(from_acc)),
                signature['amount'],
                signature['timestamp'],
                signature['signature']).encodeABI()
            
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
        
            //CLAIM
            message.channel.send("Realizando el claim de "+data.unclaimed+" SLP...");
            console.log(trans)
            let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
            let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)

            let timestamp_log=new Date(Date.now())
            let date_log=new Date().getDate()+'/'+(new Date().getMonth()+1)+'/'+new Date().getFullYear()

            if(tr_raw.status){            
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tr_raw.transactionHash+")").setColor('GREEN').setTimestamp()
                message.channel.send({content: ` `,embeds: [embed]})
				await db.collection('log').insertOne({type:'slp_claim',date:timestamp_log,date:date_log, slp:data.unclaimed,num:data.num,from_acc:from_acc})
            }  
            
            let t1=await this.transfer(from_acc,'0x858984a23b440e765f35ff06e896794dc3261c62',data.unclaimed-data.recibe,message)
            if(t1){
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+t1+")").setColor('GREEN').setTimestamp()
                message.channel.send({content: ` `,embeds: [embed]})
				await db.collection('log').insertOne({type:'slp_transfer',date:timestamp_log,date:date_log, slp:data.unclaimed-data.recibe,num:data.num,from_acc:from_acc,scholarPayoutAddress:data.scholarPayoutAddress})
            }
             
            let t2=await this.transfer(from_acc,data.scholarPayoutAddress,data.recibe,message)
            if(t2){
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+t2+")").setColor('GREEN').setTimestamp()
                message.channel.send({content: ` `,embeds: [embed]})
				await db.collection('log').insertOne({type:'slp_transfer',date:timestamp_log,date:date_log, slp:data.recibe,num:data.num,from_acc:from_acc,scholarPayoutAddress:data.scholarPayoutAddress})
            }
        }catch(e){
            this.log("ERROR: "+e.message,message)
        }
        
    },
    transfer:async function(from_acc,to_acc,balance,message){
        try{
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')


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
    
        
            //TRANSFER
            message.channel.send("Enviando "+balance+" SLP a la cuenta de "+(to_acc=='0x858984a23b440e765f35ff06e896794dc3261c62'?'Ronimate':'el jugador'));
            console.log(trans)
            
            let from_private = secrets[(from_acc.replace('0x','ronin:'))]    
            let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
            let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)
       

            if(tr_raw.status)return tr_raw.transactionHash
            else return false          
        }catch(e){
            this.log("ERROR: "+e.message,message)
        }
    },
    claimData:async function(currentUser,message){
        try{

            let from_acc=currentUser.accountAddress
            if(!this.isSafe(from_acc))return message.channel.send(`Una de las wallets esta mal!`);

            let data= await fetch("https://game-api.skymavis.com/game-api/clients/"+from_acc+"/items/1", { method: "Get" }).then(res => res.json()).then((json) => { return json});
            let unclaimed=data.total

            data= await fetch("https://game-api.axie.technology/api/v1/"+from_acc, { method: "Get" }).then(res => res.json()).then((json) => { return json});
            unclaimed=data.total>=0?data.total:data.in_game_slp

            let ahora=new Date().getTime()
            let date_ahora=this.FROM_UNIX_EPOCH(ahora/1000)
            let date_last_claim=this.FROM_UNIX_EPOCH(data.last_claim)
            let date_next_claim=this.FROM_UNIX_EPOCH(1639659803)
            let diffInMilliSeconds=(ahora/1000)-data.last_claim
            let days = (Math.floor(diffInMilliSeconds / 3600) /24).toFixed(2)
            let prom=Math.round(unclaimed/days)
            let porcetage=prom<=50?10:prom<80?30:prom<100?40:prom<130?50:prom>=130?60:0;
            let recibe=Math.round(unclaimed/(100/porcetage))

            let embed = new MessageEmbed().setTitle('Calculo').addFields(
                //{ name: 'Precio', value: ''+slp+'USD'},
                { name: 'Wallet', value: ''+currentUser.scholarPayoutAddress},
                { name: 'Fecha actual', value: ''+date_ahora,inline:true},
                { name: 'Ultimo reclamo', value: ''+date_last_claim,inline:true},
                { name: 'Proximo reclamo', value: ''+date_next_claim,inline:true},
                { name: 'ID', value: ''+currentUser.num,inline:true},
                { name: 'SLP Unclaimed', value: ''+unclaimed,inline:true},
                { name: 'Tu promedio', value: ''+prom,inline:true},
                { name: 'Dias', value: ''+days,inline:true},
                { name: 'Porcentaje', value: ''+porcetage+'%',inline:true},
                { name: 'A recibir', value: ''+recibe,inline:true}
            ).setColor('GREEN').setTimestamp()
            message.channel.send({content: ` `,embeds: [embed]})

            return {num:currentUser.num,scholarPayoutAddress:currentUser.scholarPayoutAddress,from_acc:from_acc,ahora:ahora,date_ahora:date_ahora,date_last_claim:date_last_claim,date_next_claim:date_next_claim,days:days,porcetage:porcetage,recibe:recibe,unclaimed:unclaimed}

        }catch(e){
            this.log("ERROR: "+e.message,message)
        }
    },
    desasociar:async function(message){
        let msg=message.content
        let db = await DbConnection.Get();
        var myquery = { discord:message.author.id,pass:msg };
        var newvalues = { $set: {discord: null} };
        let rJugador = message.guild.roles.cache.find(r => r.name === "Jugador");
        message.member.roles.remove(rJugador);
        await db.collection("users").updateOne(myquery, newvalues)
        message.reply('Fuiste desasociado con exito.\nEste canal se cerrara en 3 segundos.')
        setTimeout(() => { message.channel.delete()}, 3000)
    },
    asociar:async function(message){
        let msg=message.content
        let db = await DbConnection.Get();
        let resultpw = await db.collection('users').findOne({pass:msg})
        //if(resultpw && (resultpw.num.includes('2_') || parseInt(resultpw.num)>=20))return message.reply('Todavia no le toca a tu lote. Por favor espera a ser llamado')
        if(resultpw && resultpw.nota=='Entrevista'){
            message.reply('Estas en estado de Entrevista, por tal motivo no podemos validarte aún cuando sea aprobado podrás validarte\nEste canal se cerrara en 5 segundos.')
            setTimeout(() => { message.channel.delete()}, 5000)
        }else if(resultpw){
            var myquery = { pass: msg };
            var newvalues = { $set: {
                discord: message.author.id,
                username:message.author.username,
                last_updated:new Date(Date.now()),
                timestamp:new Date(Date.now()),
                date:new Date().getDate()+'/'+(new Date().getMonth()+1)+'/'+new Date().getFullYear()
                
            }};
            await db.collection("users").updateOne(myquery, newvalues)
            let rJugador = message.guild.roles.cache.find(r => r.name === "Jugador");
            message.member.roles.add(rJugador);
            message.reply('Fuiste validado con exito!.\nEste canal se cerrara en 3 segundos.')
            setTimeout(() => { message.channel.delete()}, 3000)
        }else{
            return message.reply('Ese código es invalido')
        }
    },
    get_balance:function(){
        return 10
    },
    esJeissonPagos:function(message){
        return message.author.id==877625345996632095 && message.channel.name.includes('comandos-admin') 
    },
    esFabri:function(message){
        return message.author.id==533994454391062529 && message.channel.id==917380557099380816
    },
    esManager:function(message){
        let r1=message.guild.roles.cache.find(r => r.name === "Manager")
        if(r1 && message.member.roles.cache.has(r1.id))return true
        return false
    },
    esJugador:function(message){
        let r1=message.guild.roles.cache.find(r => r.name === "Jugador")
        if(r1 && message.member.roles.cache.has(r1.id))return true
        return false
    },
    log:function (log,message=null){
        logger.debug(log)
        console.log(log)
        if(message)message.reply(log)
    },
    get_jwt:async function (wallet,msg,from_private){
        wallet=wallet.replace('ronin:','0x')
        const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER_FREE));
        let signed_msg = await web3.eth.accounts.sign(msg, from_private)
        let hex_msg = signed_msg['signature']
        msg=JSON.stringify(msg)
        let url = `https://graphql-gateway.axieinfinity.com/graphql`;
        let query = `
        {
            "operationName": "CreateAccessTokenWithSignature",
            "variables": {
                "input": {
                    "mainnet": "ronin",
                    "owner": "${wallet}",
                    "message": ${msg},
                    "signature": "${hex_msg}"
                }
            },
            "query":"mutation CreateAccessTokenWithSignature($input: SignatureInput!){createAccessTokenWithSignature(input: $input) {newAccount result accessToken __typename}}"
        }`
        let axies=await fetch(url, { method: 'post',headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
        return axies.data.createAccessTokenWithSignature.accessToken
    },
    create_random_msg:async function (){
        let url = `https://graphql-gateway.axieinfinity.com/graphql`;
        let query = `
        {
            "operationName": "CreateRandomMessage",
            "variables": {},
            "query": "mutation CreateRandomMessage{createRandomMessage}"
        }`

        let axies=await fetch(url, { method: 'post',headers: { 'Content-Type': 'application/json'},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
        return axies.data.createRandomMessage
    },
    getAxiesIds:async function (wallet){
        wallet=wallet.replace('ronin:','0x')
        let url = `https://graphql-gateway.axieinfinity.com/graphql`;
        let query = `
        {
            "operationName": "GetAxieBriefList",
            "variables": {
                    "owner":"${wallet}"
            },
            "query": "query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {    total    results {      ...AxieBrief      __typename    }    __typename  }}fragment AxieBrief on Axie {  id  name  stage  class  breedCount  image  title  battleInfo {    banned    __typename  }  auction {    currentPrice    currentPriceUSD    __typename  }  parts {    id    name    class    type    specialGenes    __typename  }  __typename}"
        }`

        let axies=await fetch(url, { method: 'post',headers: { 'Content-Type': 'application/json'},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
        axies={count:axies.data.axies.total,axies:axies.data.axies.results}
        return axies
    },
    getUserByDiscord:async function(ID){
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({discord:""+ID.toString()})
        if(user)return user
        else return null
    },
    getUserByNum:async function(num){
        if(num=='BREED' || num=='breed')return 'ronin:858984a23b440e765f35ff06e896794dc3261c62'
        if(num=='VENTA' || num=='venta')return 'ronin:33cd85881e79cc7c21d92218711821c7c919f330'
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({num:num.toString()})
        if(user)return user
        else return null
    },
    getWalletByNum:async function(num){
        if(num=='BREED' || num=='breed')return 'ronin:858984a23b440e765f35ff06e896794dc3261c62'
        if(num=='VENTA' || num=='venta')return 'ronin:33cd85881e79cc7c21d92218711821c7c919f330'
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({num:num.toString()})
        if(user)return user.accountAddress
        else return null
    },
    isSafe:function(wallet){
        return wallet in secrets
    },
    getArrSum(array){
        let sum=0
        for(let i in array){
            sum+=array[i]
        }
        return sum
    },
    parseDate:function(dateStr, locale){
        var initial =dateStr.split(/\//);
        let final=[ initial[1], initial[0], initial[2] ].join('/'); 
        return new Date(final);     
    },
    getDayName:function(dateStr, locale){
        var initial =dateStr.split(/\//);
        let final=[ initial[1], initial[0], initial[2] ].join('/'); 
        var date = new Date(final);
        return initial[0]+'-'+date.toLocaleDateString(locale, { weekday: 'long' });        
    }
}