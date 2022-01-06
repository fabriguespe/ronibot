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
    esFechaCobros(){
        var today = new Date();
        let diadelmes=today.getDate()
        var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate()
        if((diadelmes>=(lastDayOfMonth-2) &&  diadelmes<=lastDayOfMonth) || diadelmes>=15 &&  diadelmes<=16) return true
        return false
    },
    FROM_UNIX_EPOCH:function(epoch_in_secs){
        return new Date(epoch_in_secs * 1000).toLocaleString("es-ES", {timeZone: "America/Caracas"})
    },
    claim2:async function(num,from_acc,message){
        try{
            let db = await DbConnection.Get();
            let from_private = secrets[(from_acc)]    
            from_acc=from_acc.replace('ronin:','0x')

            let random_msg=await this.create_random_msg()
            let jwt=await this.get_jwt(from_acc,random_msg,from_private)
            let jdata=await fetch("https://game-api.skymavis.com/game-api/clients/"+from_acc+"/items/1/claim", { method: 'post', headers: { 'User-Agent': USER_AGENT, 'authorization': 'Bearer '+jwt},body: ""}).then(response => response.json()).then(data => { return data});
            console.log(jdata)
            let slp_claim=jdata.total
            if(slp_claim<=0) return message.channel.send('No hay slp')

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
            message.channel.send(num+" Realizando el claim de "+slp_claim+" SLP...");
            let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
            let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)

            let timestamp_log=new Date(Date.now())
            let date_log=new Date().getDate()+'/'+(new Date().getMonth()+1)+'/'+new Date().getFullYear()

            if(tr_raw.status){            
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tr_raw.transactionHash+")").setColor('GREEN').setTimestamp()
                message.channel.send({content: ` `,embeds: [embed]})
				await db.collection('log').insertOne({tx:tr_raw.transactionHash,type:'slp_claim',date:timestamp_log,date:date_log, slp:slp_claim,num:num,from_acc:from_acc})
                return true
            }  
        }catch(e){
            this.log(e.message,message)
            return false
        }
    },claim:async function(data,message){

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
            let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
            let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)

            let timestamp_log=new Date(Date.now())
            let date_log=new Date().getDate()+'/'+(new Date().getMonth()+1)+'/'+new Date().getFullYear()

            if(tr_raw.status){            
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tr_raw.transactionHash+")").setColor('GREEN').setTimestamp()
                message.channel.send({content: ` `,embeds: [embed]})
				await db.collection('log').insertOne({tx:tr_raw.transactionHash,type:'slp_claim',date:timestamp_log,date:date_log, slp:data.unclaimed,num:data.num,from_acc:from_acc})
            }  
            
            let roni_slp=data.unclaimed-data.recibe
            let jugador_slp=data.recibe
            if(roni_slp==jugador_slp)roni_slp-=1
            let roniPrimero=(roni_slp>=jugador_slp)

            let player_wallet=data.scholarPayoutAddress
            let roni_wallet=await utils.getWalletByNum("BREED")
            
            let fallo=false
            try{
                let tx=await this.transfer(from_acc,(roniPrimero?roni_wallet:player_wallet),(roniPrimero?roni_slp:jugador_slp),message)
                if(tx){
                    let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tx+")").setColor('GREEN').setTimestamp()
                    message.channel.send({content: ` `,embeds: [embed]})
                    await db.collection('log').insertOne({tx:tx,type:'slp_'+(roniPrimero?'ronimate':'jugador'),date:timestamp_log,date:date_log,num:data.num, slp:(roniPrimero?roni_slp:jugador_slp),num:data.num,from_acc:from_acc,wallet:(roniPrimero?roni_wallet:player_wallet)})
                }
            }catch(e){
                fallo=true
                this.log("ERROR: "+e.message,message)
            }
            roniPrimero=!roniPrimero
            try{
                tx=await this.transfer(from_acc,(roniPrimero?roni_wallet:player_wallet),(roniPrimero?roni_slp:jugador_slp),message)
                if(tx){
                    let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tx+")").setColor('GREEN').setTimestamp()
                    message.channel.send({content: ` `,embeds: [embed]})
                    await db.collection('log').insertOne({tx:tx,type:'slp_'+(roniPrimero?'ronimate':'jugador'),date:timestamp_log,date:date_log,num:data.num, slp:(roniPrimero?roni_slp:jugador_slp),num:data.num,from_acc:from_acc,wallet:(roniPrimero?roni_wallet:player_wallet)})
                    
                }
            }catch(e){
                fallo=true
                this.log("ERROR: "+e.message,message)
            }

            return fallo
             
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
            //nonce+=nonceplus
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
            let breed=await utils.getWalletByNum("BREED")
            if(to_acc==breed)message.channel.send("Estamos procesando la transacción....");
            else message.channel.send("Enviando "+balance+" SLP a la cuenta del jugador");
            
            
            let from_private = secrets[(from_acc.replace('0x','ronin:'))]    
            let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
            let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)
       

            if(tr_raw.status)return tr_raw.transactionHash
            else return false          
        }catch(e){
            console.log(e)
            this.log("ERROR:"+from_acc,message)
        }
    },
    getSLP:async function(currentUser,message){
        try{

            let from_acc=currentUser.accountAddress
            if(!this.isSafe(from_acc))return message.channel.send(`Una de las wallets esta mal!`);
            from_acc=from_acc.replace('ronin:','0x')
            let from_private = secrets[(from_acc.replace('0x','ronin:'))]    

            let data= await fetch("https://game-api.axie.technology/api/v1/"+from_acc, { method: "Get" }).then(res => res.json()).then((json) => { return json});
            let ronin_slp= data.ronin_slp
            let random_msg=await this.create_random_msg()
            let jwt=await this.get_jwt(from_acc,random_msg,from_private)
            let jdata=await fetch("https://game-api.skymavis.com/game-api/clients/"+from_acc+"/items/1/claim", { method: 'post', headers: { 'User-Agent': USER_AGENT, 'authorization': 'Bearer '+jwt},body: ""}).then(response => response.json()).then(data => { return data});

            let unclaimed=jdata.total

            return {ronin_slp:ronin_slp,unclaimed:unclaimed}

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
            let date_next_claim=this.FROM_UNIX_EPOCH(data.next_claim)
            let diffInMilliSeconds=(ahora/1000)-data.last_claim
            let days = (Math.floor(diffInMilliSeconds / 3600) /24).toFixed(2)
            let prom=Math.round(unclaimed/days)
            let porcetage=prom<=50?20:prom<80?30:prom<100?40:prom<130?50:prom>=130?60:0;
            
            let embed = new MessageEmbed().setTitle('Calculo').setColor('GREEN').setTimestamp()
            embed.addFields(
                //{ name: 'Precio', value: ''+slp+'USD'},
                { name: 'Wallet', value: ''+currentUser.scholarPayoutAddress},
                { name: 'Comprobantes', value: 'https://explorer.roninchain.com/address/'+currentUser.accountAddress},
                { name: 'Fecha actual', value: ''+date_ahora,inline:true},
                { name: 'Ultimo reclamo', value: ''+date_last_claim,inline:true},
                { name: 'Proximo reclamo', value: ''+date_next_claim,inline:true},
                { name: 'ID', value: ''+currentUser.num,inline:true},
                { name: 'SLP Unclaimed', value: ''+unclaimed,inline:true},
                { name: 'Tu promedio', value: ''+prom,inline:true},
                { name: 'Dias', value: ''+days,inline:true},
                { name: 'Porcentaje', value: ''+porcetage+'%',inline:true},
                { name: 'A recibir', value: ''+Math.round(unclaimed/(100/porcetage)),inline:true},
            )

            let bono=0
            if(bono>0){
                embed.addFields(
                    { name: 'Feliz Año!', value: '😀',inline:true},
                    { name: 'Bono', value: bono+'%',inline:true},
                    { name: 'A recibir', value: ''+Math.round(unclaimed/(100/bono)),inline:true}
                )
            }
            embed.addFields(
                { name: 'Información', value: 'Revisa que tu wallet sea correcta\nTu promedio de SLP se baso en el calculo de los dias y el total acumulado. Si estas de acuerdo escribe "si" para poder cobrar, de lo contrario, "no"'},
                { name: 'IMPORTANTE', value: 'Dado que es fin de año y sabemos que la situacion esta dificil Ronimate va a estar haciendose cargo de un 10% extra para cada jugador. \nEstamos orgullosos de contar con gente comprometida y responsable como vos en la academia. \nEsto es solo temporal! 2022 sin dudas sera el año que esperamos.'},
            )
            message.channel.send({content: ` `,embeds: [embed]})


            porcetage+=bono
            let recibe=Math.round(unclaimed/(100/porcetage))
            return {unix_ahora:(ahora/1000),unix_prox:data.next_claim,next_claim:data.next_claim,num:currentUser.num,scholarPayoutAddress:currentUser.scholarPayoutAddress,from_acc:from_acc,ahora:ahora,date_ahora:date_ahora,date_last_claim:date_last_claim,date_next_claim:date_next_claim,days:days,porcetage:porcetage,recibe:recibe,unclaimed:unclaimed}

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
        message.channel.send('Fuiste desasociado con exito.\nEste canal se cerrara en 3 segundos.')
        setTimeout(() => { message.channel.delete()}, 3000)
    },
    asociar:async function(message){
        let msg=message.content
        let db = await DbConnection.Get();
        let resultpw = await db.collection('users').findOne({pass:msg})
        //if(resultpw && (resultpw.num.includes('2_') || parseInt(resultpw.num)>=20))return message.channel.send('Todavia no le toca a tu lote. Por favor espera a ser llamado')
        if(resultpw && resultpw.nota && resultpw.nota.includes('Entrevista')){
            message.channel.send('Estas en estado de Entrevista, por tal motivo no podemos validarte aún cuando sea aprobado podrás validarte\nEste canal se cerrara en 5 segundos.')
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
            message.channel.send('Fuiste validado con exito!.\nEste canal se cerrara en 3 segundos.')
            setTimeout(() => { message.channel.delete()}, 3000)
        }else{
            return message.channel.send('Ese código es invalido')
        }
    },
    esJeissonPagos:function(message){
        return message.author.id==877625345996632095 && message.channel.name.includes('comandos') 
    },
    esIngresos:function(message){
        return message.channel.id==909165024642203658//canal ingreso
    },
    esFabri:function(message){
        return message.author.id==533994454391062529 && message.channel.name.includes('comandos-admin')
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
        if(message)message.channel.send(log)
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
        if(num=='BREED' || num=='breed')return 'ronin:b1c0e5cb955ac17d9cb42fb4ee6b6ae01b5a9c82'
        if(num=='VENTA' || num=='venta')return 'ronin:29e29959cbb316923e57238467e14135d19c16f9'
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({num:num.toString()})
        if(user)return user
        else return null
    },
    getWalletByNum:async function(num){
        if(num=='BREED' || num=='breed')return 'ronin:b1c0e5cb955ac17d9cb42fb4ee6b6ae01b5a9c82'
        if(num=='VENTA' || num=='venta')return 'ronin:29e29959cbb316923e57238467e14135d19c16f9'
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