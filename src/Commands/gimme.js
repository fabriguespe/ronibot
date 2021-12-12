
const Command = require("../Structures/Command.js");

const path = require('path');
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
	name: "gimme",
	description: "Shows the price of the slp!",
	async run(message, args, client) {

        message.channel.send("Yes or no?")
        .then(function (message) {
            const filter = m => m.author.id === message.author.id;
            const collector = message.channel.createMessageCollector(filter, { max: 1, time: 15000, errors: ['time'] })
            collector.on('collect', m => {
                if(m.content=='bruh' || m.content=='cool' || m.content=='not cool')return
                if (m.content == "yes") {
                    message.channel.send("cool")
                } else if (m.content == "no") {
                    message.channel.send("not cool")
                } else {
                    message.channel.send("bruh")
                } 
            })
        })
    }
});
