const path = require('path');
var utils = require(path.resolve(__dirname, "../utils.js"));
const Command = require("../Structures/Command.js");
var DbConnection = require(path.resolve(__dirname, "../Data/db.js"));
const { MessageActionRow, MessageButton ,MessageEmbed} = require('discord.js');

module.exports = new Command({
	name: "ticket",
	description: "Shows the price of the slp!",
	async run(message, args, client) {

		const embed = new MessageEmbed()
            .setColor('BLUE')
            .setAuthor(message.guild.name, message.guild.iconURL({
                dynamic: true
            }))
            .setDescription(
                "__**How to make a ticket**__\n" +


                "> Click on the reaction that relates to your need\n" +

                "> Once the ticket is made you will be able to type in there"

            )
            .setTitle('Tickets')


        const bt = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('tic')
                .setLabel('🎫 Create Ticket!')
                .setStyle('PRIMARY'),
            );

        message.channel.send({
            embeds: [embed],
            components: [bt]
        });
	}
});
