const client = require('../index')

client.on("messageCreate", message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(config.prefix)) return;
	const args = message.content.substring(config.prefix.length).split(/ +/);
	const command = client.commands.find(cmd => cmd.name == args[0]);
	if(!(message.channel.name.includes('comandos') || message.channel.name.includes('soporte')|| message.channel.name.includes('roni')))return
	if (!command) return message.reply(`${args[0]} is not a valid command!`);
	command.run(message, args, client);
});