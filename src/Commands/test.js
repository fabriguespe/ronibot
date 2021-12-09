/** @format */
const path = require('path');

const Command = require("../Structures/Command.js");
const fetch = require( "node-fetch")
const { MessageEmbed} = require('discord.js');
const utils = require('../utils.js');
module.exports = new Command({
	name: "test",
	description: "Shows the price of the slp!",
	async run(message, args, client) {
				
		/*let url = `https://graphql-gateway.axieinfinity.com/graphql`;
		let query = `{"operationName": "GetAxieBriefList","variables": {"owner":"${'ronin:858984a23b440e765f35ff06e896794dc3261c62'.replace('ronin:','0x')}"},
		"query": "query GetAxieBriefList($auctionType: AuctionType, $criteria: AxieSearchCriteria, $from: Int, $sort: SortBy, $size: Int, $owner: String) {  axies(auctionType: $auctionType, criteria: $criteria, from: $from, sort: $sort, size: $size, owner: $owner) {    total    results {      ...AxieBrief      __typename    }    __typename  }}fragment AxieBrief on Axie {  id  name  stage  class  breedCount  image  title  battleInfo {    banned    __typename  }  auction {    currentPrice    currentPriceUSD    __typename  }  parts {    id    name    class    type    specialGenes    __typename  }  __typename}"
		}`
		console.log(query)
		
		let axies=await fetch(url, { credentials: 'include',method: 'post',headers: { 'Content-Type': 'application/json'},body: JSON.stringify(JSON.parse(query))}).then(response => response.json()).then(data => { return data});
		console.log(axies)*/

		


	}
});

function FROM_UNIX_EPOCH(epoch_in_secs) {
	return new Date(epoch_in_secs * 1000).toLocaleString("es-ES", {timeZone: "America/Caracas"})
  }