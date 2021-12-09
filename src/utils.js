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
        message.reply('Fuiste removido con exito.')
    },
    asociar:async function(message){
        let msg=message.content
        
        console.log('jaja',msg)
        let db = await DbConnection.Get();
        let resultpw = await db.collection('users').findOne({pass:msg})
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
            message.reply('Fuiste validado con exito.')
            
        }
    },
    crearThread:async function(interaction,msg){
        const thread = await interaction.channel.threads.create({
            name: `ticket-${interaction.user.tag}`,
            autoArchiveDuration: 1440, // this is 24hrs 60 will make it 1 hr
            //type: 'private_thread', // for private tickets u need server boosted to lvl 1 or 2 ok u need lvl 2, since mine is not boosted i will remove this LINE ONLY!
        });
        await thread.setLocked(true)
        const embed = new MessageEmbed().setTitle('Ticket')
        .setDescription(msg).setColor('GREEN').setTimestamp()
        .setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true}));


        const del = new MessageActionRow().addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('🗑️ Cerrar Ticket').setStyle('DANGER'),);
        await thread.send({
            content: `Hola! <@${interaction.user.id}>`,
            embeds: [embed],
            components: [del]
        }).then(interaction.followUp({
            content: 'Created Ticket!',
            ephemeral: true
        }))
        console.log(`Created thread: ${thread.name}`);
        setTimeout(() => { interaction.channel.bulkDelete(1)}, 5000)
        return thread
    },
    crearChannel:async function(interaction,msg){
        
        let rCategoria = interaction.message.guild.channels.cache.find(c => c.name == 'INGRESOS' && c.type == "GUILD_CATEGORY");
        let thread=await interaction.message.guild.channels.create('validacion-'+interaction.message.author.username, { 
            type: 'GUILD_TEXT',
            parent:rCategoria.id,
            permissionOverwrites: [
                {id: interaction.message.author.id,allow: ['VIEW_CHANNEL']},
                {id: interaction.message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
            ]})
        .then(chan=>{return chan})
        .catch(console.error);
        
        const embed = new MessageEmbed().setTitle('Ticket')
        .setDescription(msg).setColor('GREEN').setTimestamp()
        .setAuthor(interaction.guild.name, interaction.guild.iconURL({dynamic: true}));


        const del = new MessageActionRow().addComponents(new MessageButton().setCustomId('cerrar_ticket').setLabel('🗑️ Cerrar Ticket').setStyle('DANGER'),);
        await thread.send({
            content: `Hola! <@${interaction.user.id}>`,
            embeds: [embed],
            components: [del]
        })
        console.log(`Created thread: ${thread.name}`);
        setTimeout(() => { interaction.channel.bulkDelete(1)}, 5000)
        
        return thread
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
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({num:num})
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