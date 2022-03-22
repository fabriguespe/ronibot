const QuickChart = require('quickchart-js');
const path = require('path');
var secrets = require(path.resolve(__dirname, "./Data/secrets"));
const fetch = require( "node-fetch")
var slp_abi = require(path.resolve(__dirname, "./Data/slp_abi.json"));
var balance_abi = require(path.resolve(__dirname, "./Data/balance_abi.json"));
var DbConnection = require(path.resolve(__dirname, "./Data/db.js"));
const Web3 = require('web3');
var axie_abi = require(path.resolve(__dirname, "./Data/axie_abi.json"));
const {MessageEmbed} = require('discord.js');

TABULADORES={uno:60,dos:45,tres:35,cuatro:25}
DISCORD_JSON=877625345996632095//jeisson
DISCORD_FABRI=533994454391062529

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36"
TIMEOUT_MINS = 5
AXIE_CONTRACT = "0x32950db2a7164ae833121501c797d79e7b79d74c"
AXS_CONTRACT = "0x97a9107c1793bc407d6f527b77e7fff4d812bece"
SLP_CONTRACT = "0xa8754b9fa15fc18bb59458815510e40a12cd2014"
WETH_CONTRACT = "0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5"
RONIN_PROVIDER_FREE = "https://proxy.roninchain.com/free-gas-rpc"
RONIN_PROVIDER = "https://api.roninchain.com/rpc"


var log4js = require("log4js");
const { sign } = require('crypto');
log4js.configure({
	appenders: { cheese: { type: "file", filename: "log.log" } },
	categories: { default: { appenders: ["cheese"], level: "error" } }
});
var logger = log4js.getLogger();
logger.level = "debug";

module.exports = {

    parseDate:function(dateStr, locale){
        if(!dateStr)return 0
        var initial =dateStr.split(/\//);
        let final=[ initial[1], initial[0], initial[2] ].join('/'); 
        return new Date(final);     
    },
    esFechaCobros(){
        let today = new Date(Date.UTC(0, 0, 0, 0, 0, 0));
        let diadelmes=today.getDate()
        let lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate()
        if((diadelmes>=(lastDayOfMonth-2) &&  diadelmes<=lastDayOfMonth) || diadelmes>=15 &&  diadelmes<=16) return true
        return false
    },
    getNumberOfDays(start, end) {
        const date1 = new Date(start);
        const date2 = new Date(end);
    
        // One day in milliseconds
        const oneDay = 1000 * 60 * 60 * 24;
    
        // Calculating the time difference between two dates
        const diffInTime = date2.getTime() - date1.getTime();
    
        // Calculating the no. of days between two dates
        const diffInDays = Math.round(diffInTime / oneDay);
    
        return diffInDays;
    },    
    HOURS_NEXT_CLAIM:function(epoch_in_secs){
        let today = new Date();
        let next_claim = new Date(epoch_in_secs * 1000)
        next_claim.setDate(next_claim.getDate() + 15)
        let diffInMilliSeconds=next_claim.getTime()-today.getTime()
        let hours = (diffInMilliSeconds /1000 / 3600).toFixed(2)
        return hours
    },
    FROM_UNIX_EPOCH:function(epoch_in_secs){
        return new Date(epoch_in_secs * 1000).toLocaleString("es-ES", {timeZone: "America/Caracas"})
    },
    ADD_DAYS_TO_UNIX_DATE:function(epoch_in_secs,days){
        let last_claim = new Date(epoch_in_secs * 1000)
        last_claim.setDate(last_claim.getDate() + days)
        return last_claim
    },
    ADD_DAYS_TO_UNIX:function(epoch_in_secs,days){
        let last_claim = new Date(epoch_in_secs * 1000)
        last_claim.setDate(last_claim.getDate() + days)
        return last_claim.toLocaleString("es-ES", {timeZone: "America/Caracas"})
    },
    async crearCanalSoporte(num,message){
		let rSoporte = message.guild.roles.cache.find(r => r.name === "Soporte");
		let rCategoria = message.guild.channels.cache.find(c => c.id == (args[1]?921106145811263499:utils.esJugador(message)?866879155350143006:909634641030426674) && c.type=='GUILD_CATEGORY');
        let thread=await message.guild.channels.create('ayuda-', { 
        type: 'GUILD_TEXT',parent:rCategoria?rCategoria.id:null,permissionOverwrites: [{id: message.author.id,allow: ['VIEW_CHANNEL']},{id: rSoporte.id,allow: ['VIEW_CHANNEL']},{id: message.guild.roles.everyone.id,deny: ['VIEW_CHANNEL']},
        ]}).then(chan=>{return chan})

        embed = new MessageEmbed().setTitle('Ticket')
		.setDescription(`Hola ${message.author}, soy Roni. \nPor favor seleccioná una opción tocando el boton correspondiente\nROL:`+(utils.esJugador(message)?'Jugador':'Sin Rol')).setColor('GREEN').setTimestamp()
		await thread.send({content: ` `,embeds: [embed],components: [row] })

    },
    mensajeIngresos(tit,msg,message){

        let embed = new MessageEmbed().setTitle(tit).setDescription(msg).setColor('GREEN').setTimestamp()
        let rCanal = message.guild.channels.cache.find(c => c.id == 909165024642203658);//canal ingresos
        rCanal.send({content: ` `,embeds: [embed]})
    },
    claim:async function (data,message){
        try{
            let db = await DbConnection.Get();
            let from_acc=data.accountAddress
            from_acc=from_acc.replace('ronin:','0x')
            let from_private = secrets[(from_acc.replace('0x','ronin:'))]    
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
            message.channel.send("Realizando el claim de "+data.in_game_slp+" SLP...");
            let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
            let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)


            if(tr_raw.status){            
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tr_raw.transactionHash+")").setColor('GREEN').setTimestamp()
                message.channel.send({content: ` `,embeds: [embed]})
                await db.collection('log').insertOne({tx:tr_raw.transactionHash,type:'slp_claim',timestamp:this.timestamp_log(),date:this.date_log(), slp:data.in_game_slp,num:data.num,from_acc:from_acc})
                return true
            }  
            return null
        }catch(e){
            console.log(e)
            this.log(e,message)
        }
    },
    isTesting(){
        if(process.env.LOGNAME=='fabrizioguespe')return true
        return false
    },
    isProFabri(num){
        return num=='43' || num=='186' || num=='187'|| num=='21'
    },
    cobro:async function(data,message){

        try{
            let db = await DbConnection.Get();
            if(data.in_game_slp>0)await this.claim(data,message)
            let slp_total=data.in_game_slp+data.ronin_slp
            let roni_slp=slp_total-data.jugador_slp
            let jugador_slp=data.jugador_slp
            if(roni_slp==jugador_slp)roni_slp-=1
            let roniPrimero=(roni_slp>=jugador_slp)
            this.log('Jugador:'+jugador_slp + ' Ronimate:' +roni_slp)
            if(!data.scholarPayoutAddress)return message.channel.send("Wallet de cobro no existente")
            let player_wallet=data.scholarPayoutAddress.replace('ronin:','0x')
            let roni_wallet=(this.isProFabri(data.num))?await this.getWalletByNum("PRO"):await this.getWalletByNum("BREED")
            roni_wallet=roni_wallet.replace('ronin:','0x')
            let fallo=false
            try{
                let tx=await this.transfer(data.accountAddress,(roniPrimero?roni_wallet:player_wallet),(roniPrimero?roni_slp:jugador_slp),message)
                if(tx)await db.collection('log').insertOne({tx:tx,type:'slp_'+(roniPrimero?'ronimate':'jugador'),timestamp:this.timestamp_log(),date:this.date_log(),num:data.num, slp:(roniPrimero?roni_slp:jugador_slp),num:data.num,from_acc:data.accountAddress,wallet:(roniPrimero?roni_wallet:player_wallet)})
                
            }catch(e){
                fallo=true
                this.log(e,message)
            }
            roniPrimero=!roniPrimero
            try{
                let tx=await this.transfer(data.accountAddress,(roniPrimero?roni_wallet:player_wallet),(roniPrimero?roni_slp:jugador_slp),message)
                if(tx) await db.collection('log').insertOne({tx:tx,type:'slp_'+(roniPrimero?'ronimate':'jugador'),timestamp:this.timestamp_log(),date:this.date_log(),num:data.num, slp:(roniPrimero?roni_slp:jugador_slp),num:data.num,from_acc:data.accountAddress,wallet:(roniPrimero?roni_wallet:player_wallet)})
                
            }catch(e){
                fallo=true
                this.log(e,message)
            }

            return fallo
             
        }catch(e){
            this.log(e,message)
        }
    },timestamp_log:function(){
        return new Date(Date.now())
    },date_log:function(){
        return new Date().getDate()+'/'+(new Date().getMonth()+1)+'/'+new Date().getFullYear()
    },
    cambiarEstado:async function(num,old_estado,estado,message){
        if(num=='1' || num=='2' || num=='buenos' || num=='breed')return
        let db = await DbConnection.Get();
        let obj={nota:estado}
        if(estado.includes('retir'))obj['discord']=null
        await db.collection("users").updateOne({ num:num},{ $set: obj } )
        await db.collection('log').insertOne({type:'status_change',timestamp:this.timestamp_log(),date:this.date_log(), old_status:old_estado, status:estado,num:num})
        
        if(num){
            let help="El estado del jugador #"+num+" fue cambiado a ***"+estado+"***"
            message.channel.send(help)
            let rCanal = message.guild.channels.cache.find(c => c.id == 903282885971300362);//canal chat managers
            rCanal.send({content: ` `,embeds: [new MessageEmbed().setTitle('Retiro').setDescription(help).setColor('GREEN').setTimestamp()]})
        }
    },
    transferAxie:async function(from_acc,to_acc,num_from,num_to,axie_id,message){
        if(!this.isSafe(from_acc) || !this.isSafe(to_acc))return message.channel.send(`Una de las wallets esta mal!`);
        try{
            
            let db = await DbConnection.Get();
            const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER_FREE));
            let from_private = secrets[(from_acc.replace('0x','ronin:'))]
            let axie_contract = new web3.eth.Contract(axie_abi,web3.utils.toChecksumAddress(AXIE_CONTRACT))
            let nonce = await web3.eth.getTransactionCount(from_acc, function(error, txCount) { return txCount}); 
            let myData=axie_contract.methods.safeTransferFrom((web3.utils.toChecksumAddress(from_acc)),(web3.utils.toChecksumAddress(to_acc)),(axie_id)).encodeABI()
            
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
                 
            message.channel.send("Listo para transferir el Axie: "+axie_id+"\nAguarde un momento...");
            let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
            let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)
            
            if(tr_raw.status){            
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tr_raw.transactionHash+")").setColor('GREEN').setTimestamp()
				await db.collection('log').insertOne({tx:tr_raw.transactionHash,type:'axie_transfer',timestamp:this.timestamp_log(),date:this.date_log(), axie_id:axie_id,num_from:num_from,num_to:num_to,from_acc:from_acc,to_acc:to_acc})
                return message.channel.send({content: ` `,embeds: [embed]})
            }        
            else message.channel.send("ERROR Status False");
        }catch(e){
            this.log(e,message)
        }
    },
    transfer:async function(from_acc,to_acc,balance,message){
        //if(!this.isSafe(from_acc) || !this.isSafe(to_acc))return message.channel.send(`Una de las wallets esta mal!`);
        try{
            from_acc=from_acc.replace('ronin:','0x')
            to_acc=to_acc.replace('ronin:','0x')

            const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER_FREE));
            let nonce = await web3.eth.getTransactionCount(from_acc, function(error, txCount) { return txCount}); 
            //nonce+=nonceplus
            let contract = new web3.eth.Contract(slp_abi,web3.utils.toChecksumAddress(SLP_CONTRACT))
            
            let myData=contract.methods.transfer((web3.utils.toChecksumAddress(to_acc)),balance).encodeABI()
            
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
    
            let breed=await this.getWalletByNum("BREED")
            breed=breed.replace('ronin:','0x')
            if(to_acc==breed)message.channel.send("Estamos procesando la transacción....");
            else message.channel.send("Enviando "+balance+" SLP a la cuenta del jugador");
            
            
            let from_private = secrets[(from_acc.replace('0x','ronin:'))]    
            let signed  = await web3.eth.accounts.signTransaction(trans, from_private)
            let tr_raw=await web3.eth.sendSignedTransaction(signed.rawTransaction)
            

            if(tr_raw.status){
                let tx=tr_raw.transactionHash
                let embed = new MessageEmbed().setTitle('Exito!').setDescription("La transacción se procesó exitosamente. [Ir al link]("+"https://explorer.roninchain.com/tx/"+tx+")").setColor('GREEN').setTimestamp()
                message.channel.send({content: ` `,embeds: [embed]})   
                return tx
            }else return false          
        }catch(e){
            this.log("ERROR:"+e.message,message)
        }
    },
    balance:async function(from_acc, token='slp'){
        let contract = SLP_CONTRACT
        /*if(token == 'slp') contract = SLP_CONTRACT
        else if(token == 'axs') contract = AXS_CONTRACT
        else if(token == "axies")contract = AXIE_CONTRACT
        else if(token == "weth")contract = WETH_CONTRACT
        else return 0
        console.log(token,contract)*/
        const web3 = await new Web3(new Web3.providers.HttpProvider(RONIN_PROVIDER));
        contract = new web3.eth.Contract(balance_abi,web3.utils.toChecksumAddress(contract))
        let balance = await  contract.methods.balanceOf( web3.utils.toChecksumAddress(from_acc.replace("ronin:", "0x"))).call()
        return balance
    },
    getMMR:async function(from_acc,message,cache=false){
        try{
            from_acc=from_acc.replace('ronin:','0x')  
            let = await fetch("https://game-api.axie.technology/api/v2/"+from_acc.replace('0x','ronin:') , { method: "Get" }).then(res => res.json()).then((json) => { return json});
            return data.mmr

        }catch(e){
            this.log(e,message)
        }
    },
    getSLP:async function(from_acc,message=null,cache=false){
        try{
            let data={}
            if(!cache) {
                console.log("https://game-api.skymavis.com/game-api/clients/"+from_acc.replace('ronin:','0x')+"/items/1")
                let jdata=await fetch("https://game-api.skymavis.com/game-api/clients/"+from_acc.replace('ronin:','0x')+"/items/1").then(response => response.json()).then(data => { return data});     
                if(!jdata || !jdata.blockchain_related){
                    console.log(jdata)
                    jdata=await fetch("https://game-api.skymavis.com/game-api/clients/"+from_acc.replace('ronin:','0x')+"/items/1").then(response => response.json()).then(data => { return data});  
                    if(!jdata || !jdata.blockchain_related){   
                        jdata=await fetch("https://game-api.skymavis.com/game-api/clients/"+from_acc.replace('ronin:','0x')+"/items/1").then(response => response.json()).then(data => { return data});  
                        if(!jdata || !jdata.blockchain_related){   
                            this.log("error: "+from_acc)
                            return null
                        }
                    }
                }
                console.log(jdata)
                let balance=jdata.blockchain_related.balance
                let total=jdata.total-jdata.blockchain_related.balance
                data= {in_game_slp:total,ronin_slp:balance?balance:0,last_claim:jdata.last_claimed_item_at,has_to_claim:(jdata.claimable_total>0)}
                
                try{//MMR
                    let mmrdata= await fetch("https://game-api.axie.technology/api/v2/"+from_acc.replace('0x','ronin:'), { method: "Get" }).then(res => res.json()).then((json) => { return json})
                    if(mmrdata.mmr)data.mmr=mmrdata.mmr
                }catch(e){
                    utils.log(e,message)
                }
                return data
            }else{
                let url = "https://game-api.axie.technology/api/v2/"+from_acc.replace('0x','ronin:')  ;
                data= await fetch(url, { method: "Get" }).then(res => res.json()).then((json) => { return json});
            }
            return data

        }catch(e){
            this.log("ERROR: "+e.message,message)
        }
    },
    claimData:async function(currentUser,message){
        try{

            let from_acc=currentUser.accountAddress
            if(!this.isSafe(from_acc))return message.channel.send(`Una de las wallets esta mal!`);

            let data=await this.getSLP(currentUser.accountAddress,message,false)
            let ahora=new Date().getTime()
            let date_ahora=this.FROM_UNIX_EPOCH(ahora/1000)
            let date_last_claim=this.FROM_UNIX_EPOCH(data.last_claim)
            let date_next_claim=this.ADD_DAYS_TO_UNIX(data.last_claim,15)
            let diffInMilliSeconds=(ahora/1000)-data.last_claim
            let days = (Math.floor(diffInMilliSeconds / 3600) /24).toFixed(2)
            if(days==0)days=15

            let slp=data.in_game_slp?data.in_game_slp:data.ronin_slp
            let prom = Math.round(slp/days)
            

            let porcetage=prom<=TABULADORES.cuatro?20:prom<TABULADORES.tres?30:prom<TABULADORES.dos?40:prom<TABULADORES.uno?50:prom>=TABULADORES.uno?60:0;
            
            let arecibir=Math.round(slp/(100/porcetage))
            let embed = new MessageEmbed().setTitle('Calculo').setColor('GREEN').setTimestamp()
            
            embed.addFields(
                //{ name: 'Precio', value: ''+slp+'USD'},
                { name: 'ID', value: ''+currentUser.num,inline:true},
                { name: 'Wallet', value: ''+currentUser.scholarPayoutAddress},
                { name: 'Comprobantes', value: 'https://explorer.roninchain.com/address/'+currentUser.accountAddress},
                { name: 'Fecha actual', value: ''+date_ahora,inline:true},
                { name: 'Ultimo reclamo', value: ''+date_last_claim,inline:true},
                { name: 'Proximo reclamo', value: ''+date_next_claim,inline:true},
                { name: 'SLP Total', value: ''+(slp),inline:true},
                { name: 'Dias', value: ''+days,inline:true},
                { name: 'Tu promedio', value: ''+prom,inline:true},
                { name: 'Porcentaje', value: ''+porcetage+'%',inline:true},
                { name: 'A recibir', value: ''+arecibir,inline:true},
                { name: 'Vacio', value: 'Vacio',inline:true},
            )

			let bono=10
            //let slp_price= await fetch("https://api.coingecko.com/api/v3/simple/price?ids=smooth-love-potion&vs_currencies=usd", { method: "Get" }).then(res => res.json()).then((json) => { return (Object.values(json)[0].usd)});
            //let min=15/2/slp_price*(1+(bono/100))
            /*if(arecibir<min)bono=30
            min=15/2/slp_price*(1+(bono/100))
            if(arecibir<min)bono=40
            min=15/2/slp_price*(1+(bono/100))
            if(arecibir<min)bono=50
            */
            if(bono>0){
                embed.addFields(
                    { name: 'Gracias!', value: '😀',inline:true},
                    { name: 'Bono', value: bono+'%',inline:true},
                    { name: 'A recibir', value: ''+Math.round(data.in_game_slp/(100/bono)),inline:true}
                )
            }
            embed.addFields(
                { name: 'Información', value: 'Revisa que tu wallet sea correcta\nTu promedio de SLP se baso en el calculo de los dias y el total acumulado. Si estas de acuerdo escribe "si" para poder cobrar, de lo contrario, "no"'},
                { name: 'Ajuste', value: 'Debito a que a partir del 9/2/2022 se cambio la cantidad de SLP emitido ahora el tabulador es diferente. Pero para este cobro hubo 9 dias en donde se tiene que ajustar el promedio a la cantidad de SLP anterior. Por eso es que este mes no hay bono pero fuimos generosos en el ajuste de promedio para compensar ese 10%.'},
            )
            message.channel.send({content: ` `,embeds: [embed]})


            porcetage+=bono
            currentUser.jugador_slp=Math.round(data.in_game_slp/(100/porcetage))
            if(data.in_game_slp==0 && data.ronin_slp>0)currentUser.jugador_slp=Math.round(data.ronin_slp/(100/porcetage))
            let hours=this.HOURS_NEXT_CLAIM(data.last_claim)
            currentUser.hours=hours
            currentUser.in_game_slp=data.in_game_slp
            currentUser.ronin_slp=data.ronin_slp
            currentUser.has_to_claim=data.has_to_claim
            return currentUser

        }catch(e){
            this.log(e,message)
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
    ver_datos:async function(currentUser,message){
        message.channel.send('Datos de acceso')
        message.channel.send("Email: manager+"+currentUser.num+"@ronimate.xyz")
        message.channel.send("Password: "+currentUser.pass)
        message.channel.send("Este canal se cerrara en 60 segundos\nMucha suerte!")
        setTimeout(() => { message.channel.delete()}, 60000)
    },
    ingresar:async function(num,username,discord){
        let db = await DbConnection.Get();
        var myquery = { num: num };
        var newvalues = { $set: {
            discord: discord,
            name:username,
            timestamp:this.timestamp_log(),
            date:this.date_log()
        }};
        await db.collection("users").updateOne(myquery, newvalues)
    },
    asociar:async function(message){
        let msg=message.content
        let db = await DbConnection.Get();
        let resultpw = await db.collection('users').findOne({pass:msg})
        if(resultpw && resultpw.nota && resultpw.nota.includes('entrevist')){
            message.channel.send('Estas en estado de Entrevista, por tal motivo no podemos validarte aún cuando sea aprobado podrás validarte\nEste canal se cerrara en 5 segundos.')
            setTimeout(() => { message.channel.delete()}, 5000)
        }else if(resultpw){
            var myquery = { pass: msg };
            var newvalues = { $set: {
                discord: message.author.id,
                name:message.author.username,
                timestamp:this.timestamp_log(),
                date:this.date_log()
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
        if(this.esFabri(message))return true
        return message.channel.id==909165024642203658//canal entrevistas
    },
    esFabri:function(message){
        return message.author.id==533994454391062529 && message.channel.name.includes('comandos-admin')
    },
    async checkAspirante(message){
        try{    
            console.log('Check aspirante '+message.author.username)
            if(!this.isTesting() && this.esManager(message))return
            if(!this.isTesting() && !message.channel.name.includes('entrevista'))return
            let db = await DbConnection.Get();
            let user=await db.collection('aspirantes').findOne({discord:message.author.id.toString()})
            if(user){
                console.log('Entra')
                let user = await db.collection('users').findOne({nota:'libre'})
                console.log(user)
                if(user){
                    let rCanal = message.guild.channels.cache.find(c => c.id == 903282885971300362);//canal chat managers
                    rCanal.send("!ingreso "+user.num+" "+message.author.usnermae+"#"+message.author.discriminator)
                }
            }  
        }catch(e){
            this.log(e,message)
        }
    },
    getDiscordDByID:async function(el_id,message){
        await message.guild.members.fetch()
        let ingreso=message.guild.members.cache.find(c => {return c.id ==el_id});
        if(ingreso)return ingreso.user
    },
    getUserIDByUsername:async function(name,message){
        if(!name.includes('#'))name+="#"
        console.log(name)
        let username=name.split('#')[0]
        let discriminator=name.split('#')[1]
        await message.guild.members.fetch()
        let ingreso=message.guild.members.cache.find(c => {return (c.user.username.toLowerCase() == username.toLowerCase() && c.user.discriminator == discriminator) || c.user.username.toLowerCase() == username.toLowerCase()  || c.user.discriminator.toLowerCase() == discriminator.toLowerCase() });
        return ingreso
    },
    esManager:function(message){
        if(message.author.bot)return true
        let r1=message.guild.roles.cache.find(r => r.name === "Manager")
        if(r1 && message.member.roles.cache.has(r1.id) && message.channel.name.includes('comandos'))return true
        return false
    },
    esJugador:function(message){
        let r1=message.guild.roles.cache.find(r => r.name === "Jugador")
        if(r1 && message.member.roles.cache.has(r1.id))return true
        return false
    },
    log:function (e,message=null){        
        console.log(e)
        let log=e
        if(e.message)log=e.message
        if(log && log.includes('ERROR:Transaction has been reverted by the EVM'))log='ERROR: Transaction has been reverted by the EVM'
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
        let response=await fetch(url, { method: 'post',headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
        if(!response || !response.data || !response.data.createAccessTokenWithSignature)return null
        return response.data.createAccessTokenWithSignature.accessToken
    },
    create_random_msg:async function (){
        let url = `https://graphql-gateway.axieinfinity.com/graphql`;
        let query = `
        {
            "operationName": "CreateRandomMessage",
            "variables": {},
            "query": "mutation CreateRandomMessage{createRandomMessage}"
        }`

        let response=await fetch(url, { method: 'post',headers: { 'Content-Type': 'application/json'},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
        //console.log(response)
        if(!response || !response.data || !response.data.createRandomMessage)return null
        return response.data.createRandomMessage
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

        let response=await fetch(url, { method: 'post',headers: { 'Content-Type': 'application/json'},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
        if(!response || !response.data || !response.data.axies)return null
        let dev= {count:response.data.axies.total,axies:response.data.axies.results}
        return dev

    },
    getUsersByDiscord:async function(ID){
        let db = await DbConnection.Get();
		return await db.collection('users').find({discord:""+ID.toString()}).toArray()
    },
    getUserByDiscord:async function(ID){
        let db = await DbConnection.Get();
		return await db.collection('users').findOne({discord:""+ID.toString()})
    },
    getUserByNum:async function(num){
        if(num=='amaloa' || num=='AMALOA')return 'ronin:9a9dc8ab2474625cb58bca01beb72759e2c7efaa'
        if(num=='pablo' || num=='PABLO')return 'ronin:f0c889583622f97c67e2fc4cf2a5ce214f7eee8c'
        if(num=='jeisson' || num=='JEISSON')return 'ronin:9f1c0c36728b3341084adaad489a651394c9e40a'
        if(num=='BREED' || num=='breed')return 'ronin:b1c0e5cb955ac17d9cb42fb4ee6b6ae01b5a9c82'
        if(num=='PRO' || num=='pro')return 'ronin:bfc07b770a4bfab0e9ac114ae2ca8275c701c28e'
        if(num=='VENTA' || num=='venta')return 'ronin:29e29959cbb316923e57238467e14135d19c16f9'
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({num:num.toString()})
        if(user)return user
        else return null
    },
    getPaymentWalletByNum:async function(num){
        if(num=='amaloa' || num=='AMALOA')return 'ronin:9a9dc8ab2474625cb58bca01beb72759e2c7efaa'
        if(num=='pablo' || num=='PABLO')return 'ronin:f0c889583622f97c67e2fc4cf2a5ce214f7eee8c'
        if(num=='jeisson' || num=='JEISSON')return 'ronin:9f1c0c36728b3341084adaad489a651394c9e40a'
        if(num=='BREED' || num=='breed')return 'ronin:b1c0e5cb955ac17d9cb42fb4ee6b6ae01b5a9c82'
        if(num=='PRO' || num=='pro')return 'ronin:bfc07b770a4bfab0e9ac114ae2ca8275c701c28e'
        if(num=='VENTA' || num=='venta')return 'ronin:29e29959cbb316923e57238467e14135d19c16f9'
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({num:num.toString()})
        if(user)return user.scholarPayoutAddress
        else return null
    },
    getWalletByNum:async function(num){
        if(num=='amaloa' || num=='AMALOA')return 'ronin:9a9dc8ab2474625cb58bca01beb72759e2c7efaa'
        if(num=='pablo' || num=='PABLO')return 'ronin:f0c889583622f97c67e2fc4cf2a5ce214f7eee8c'
        if(num=='jeisson' || num=='JEISSON')return 'ronin:9f1c0c36728b3341084adaad489a651394c9e40a'
        if(num=='BREED' || num=='breed')return 'ronin:b1c0e5cb955ac17d9cb42fb4ee6b6ae01b5a9c82'
        if(num=='PRO' || num=='pro')return 'ronin:bfc07b770a4bfab0e9ac114ae2ca8275c701c28e'
        if(num=='VENTA' || num=='venta')return 'ronin:29e29959cbb316923e57238467e14135d19c16f9'
        let db = await DbConnection.Get();
		let user = await db.collection('users').findOne({num:num.toString()})
        if(user)return user.accountAddress
        else return null
    },
    isSafe:function(wallet){
        return wallet.replace('0x','ronin:') in secrets
    },
    getArrSum(array){
        let sum=0
        for(let i in array){
            sum+=array[i]
        }
        return sum
    },
    getPaymentName:function(dateStr, locale){
        var initial =dateStr.split(/\//);
        let final=[ initial[1], initial[0], initial[2] ].join('/'); 
        var date = new Date(final);

        Date.prototype.monthNames = [
            "January", "February", "March","April", "May", "June","July", "August", "September","October", "November", "December"
        ];
        Date.prototype.getMonthName = function() {
            return this.monthNames[this.getMonth()];
        };
        Date.prototype.getShortMonthName = function () {
            return this.getMonthName().substr(0, 3);
        };
        if(date.getDate()>=15 && date.getDate()<=16)return "Mid-"+date.getShortMonthName()
        else if(date.getDate()>=27 )return "End-"+date.getShortMonthName()
        else return dateStr        
    },
    getDayName:function(dateStr, locale){
        
        var initial =dateStr.split(/\//);
        let final=[ initial[1], initial[0], initial[2] ].join('/'); 
        var date = new Date(final);
        return initial[0]+'-'+date.toLocaleDateString(locale, { weekday: 'long' });        
    }
}