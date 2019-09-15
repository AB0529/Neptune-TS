import { nep, discord, Util, Servers } from '../index';
import { Message } from 'discord.js';

const _run = async (msg: Message) => {
	// Generate random color
	nep.rColor = Math.floor(Math.random() * 16777215).toString(16);
	nep.util = new Util(nep, msg);
	nep.servers = Servers;

	let _Servers = await nep.util.getData(msg.guild.id);

	// Handle multiple prefixes
	[ nep.config.discord.prefix, `<@${nep.user.id}>`, _Servers.prefix ].forEach(
		(p) => (msg.content.startsWith(p) ? (nep.prefix = p) : nep.prefix)
	);

	// Ignore bots
	if (msg.author.bot) return;
	// Male sure prefix exists
	if (!msg.content.toLowerCase().startsWith(nep.prefix)) return;

	let args: String[] = msg.content.slice(nep.prefix.length).trim().split(/ +/g);
	let cmd: String = args.shift();
	let command: any = nep._commands.get(cmd) || nep._commands.get(nep._aliases.get(cmd));
	let isOwner: boolean = nep.config.discord.owner.map((o: string) => (msg.author.id == o ? true : false));

	// Make sure command exists
	if (!command) return;
	else if (command.info.category.toLowerCase() == 'Owner' && !isOwner)
		// Handle owner lock
		return nep.util.embed(`<:NepShock:475055910830735372> | You're **not my master**, go away! Shoo, shoo!`);
	else if (command.cooldown.has(msg.author.id)) {
		// Handle cooldown
		if (command.sentCooldownMessage.has(msg.author.id)) return;
		else if (!isOwner)
			return msg.channel
				.send({
					embed: new discord.MessageEmbed()
						.setDescription(
							`⏲ | *Please wait* \`${nep.util.msParser(
								command.config.cooldown
							)}\` *until using this command again!*`
						)
						.setColor(nep.rColor)
						.setFooter(msg.author.tag, msg.author.displayAvatarURL())
				})
				.then(() => command.sentCooldownMessage.add(msg.author.id));
	}

	// Command handler
	try {
		switch (command.config) {
			// Reset cooldown
			case command.config.cooldown > 0:
				command.startCooldown(msg.author.id);
			// Make sure commands can be used in DMs
			case !command.config.allowDM && !msg.guild:
				return nep.util.embed(`:x: | **${command}** cannot be used in a DM!`);
			// Check lock
			case command.config.locked && msg.author.id !== nep.config.discord.owner:
				return nep.util.embed(`🔒 | \`${command}\` has been **locked to the public**! Try again later!`);
			// Run command
			default:
				command._run(msg, args, nep.util, nep);
		}
	} catch (err) {
		nep.util.error(`Command Error`, err);
	}
};

export default { _run };
