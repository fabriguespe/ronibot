const QuickChart = require('quickchart-js');
const path = require('path');
var secrets = require(path.resolve(__dirname, "./Data/secrets"));
const fetch = require( "node-fetch")
var DbConnection = require(path.resolve(__dirname, "./Data/db.js"));
const Web3 = require('web3');

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36"
RONIN_PROVIDER_FREE = "https://proxy.roninchain.com/free-gas-rpc"

var log4js = require("log4js");
log4js.configure({
	appenders: { cheese: { type: "file", filename: "log.log" } },
	categories: { default: { appenders: ["cheese"], level: "error" } }
});
var logger = log4js.getLogger();
logger.level = "debug";

module.exports = {
    desasociar:async function(message){
        let msg=message.content
        console.log('entra',msg)
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
        if(resultpw && resultpw.nota=='Entrevista')return message.reply('Estas en entrevista aún, no puedes ingresar')
        else if(resultpw){
            var myquery = { pass: msg };
            var newvalues = { $set: {
                discord: message.author.id,
                username:message.author.username,
                last_updated:new Date(Date.now()),
                timestamp:new Date(Date.now()),
                date:new Date().getDate()+'/'+(new Date().getMonth()+1)+'/'+new Date().getFullYear()
                
            }};
            console.log('jaja')
            await db.collection("users").updateOne(myquery, newvalues)
            let rJugador = message.guild.roles.cache.find(r => r.name === "Jugador");
            message.member.roles.add(rJugador);
            message.reply('Fuiste validado con exito!.\nEste canal se cerrara en 3 segundos.')
            setTimeout(() => { message.channel.delete()}, 3000)
        }else{
            return message.reply('Ese código es invalido')
        }
    },
    esJugador:function(message){
        let r1=message.guild.roles.cache.find(r => r.name === "Jugador")
        if(r1 && message.member.roles.cache.has(r1.id))return true
        //let r1=message.guild.roles.cache.find(r => r.name === "Manager")
        //if(r1 && message.member.roles.cache.has(r1.id))return true
        
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
    create_random_msg:async function (wallet){
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
    getWalletByNum:async function(num){
        if(num=='BREED')return 'ronin:858984a23b440e765f35ff06e896794dc3261c62'
        if(num=='VENTA')return 'ronin:33cd85881e79cc7c21d92218711821c7c919f330'
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({num:num+""})
        if(user)return user.accountAddress
        else return null
    },
    isSafe:function(wallet){
        return wallet in secrets
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
        //console.log(dateStr,final)
        return date.toLocaleDateString(locale, { weekday: 'long' });        
    }
}