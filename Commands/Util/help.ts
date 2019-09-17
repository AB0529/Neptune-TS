import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';
import fs from 'fs';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Information on categories and commands.`,
			longHelp: `Returns a list of commands and more info on usage of a command.`,
			usage: [ `• ${cmd}`, `• ${cmd} <category>`, `• ${cmd} <command>` ],
			examples: [
				`Shows help list\n• ${cmd}`,
				`Shows help for the music category\n• ${cmd} music`,
				`Shows help for the queue command\n• ${cmd} queue`
			],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'h' ],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let categories = fs.readdirSync(`${nep.config.dir}/Commands`); // Command categories
		let categoryCollection = new discord.Collection(); // Place to store them

		// Set categories in the collection
		// NOTE: Probably not needed but I'm scared to remove in case something breaks so it stays
		categories.forEach((c) => categoryCollection.set(c.toLowerCase(), c.toLowerCase()));

		// Place to store help message
		let commandListLong: string[] = [];
		let commandListSmall: string[] = [];

		// Cat fact for extra flair
		let catFact: any = await util.getJSON(`https://catfact.ninja/fact`);

		// Handle args
		if (
			!args[0] // If no args send usage and categories
		)
			return msg.channel.send({
				embed: new discord.MessageEmbed()
					.addField(`📜 Categories`, `**${categories.join('\n')}**`)
					.addField(
						`🤷 Misc.`,
						`- [Support Server](https://discord.gg/R9ykDC3)\n- [Random Cat](http://random.cat/)\n- [Random YouTube Video](https://ytroulette.com/)\n\n*${catFact.fact}*`
					)
					.addField(
						`📄 Notes`,
						`\`\`\`\nHello, it's been a while but I'm back! I've completly rewritten the bot so many commands are gone. However, the commands are being worked on and will return. If you find any problems or have suggestions join the support server or shoot \`Moist#9999\` a DM!\`\`\``
					)
					.setFooter(`Do ${nep.prefix}${this.info.name} <Command or Category>`)
					.setColor(nep.rColor)
			});
		// Send help for aliases
		if (nep._commands.get(nep._aliases.get(args.join(' ').toLowerCase()))) {
			let cmd: any = nep._commands.get(nep._aliases.get(args.join(' ').toLowerCase()));
			return sendLong(cmd.info.name);
		} else if (categoryCollection.has(args.join(' ').toLowerCase()))
			// Send command list for a category
			return sendSmall(args.join(' ').toLowerCase());
		else if (nep._commands.has(args.join(' ').toLowerCase()))
			// Send help for command
			return sendLong(args.join(' ').toLowerCase());
		else
			// Nothing found
			return nep.util.embed(
				`:x: | No **command or category** was found for your query! Try \`${nep.prefix}${this.info.name}\`!`
			);

		// Functions
		// Send long help
		function sendLong(cmd: string) {
			// Get the command
			let command: any = nep._commands.get(cmd.toLowerCase());

			// Push formated into temp list
			commandListLong.push(
				`**${nep.prefix}${command.info.name}** *${command.info
					.longHelp}*\n\`\`\`css\nUsage:\n\n${command.info.usage.join(
					'\n'
				)}\n\nExample:\n\n${command.info.examples.join('\n')}\n\`\`\``
			);
			// Send message
			return msg.channel.send({
				embed: new discord.MessageEmbed()
					.setDescription(commandListLong.join(' '))
					.setFooter(
						`Aliases: ${command.config.aliases.length > 0
							? `${command.config.aliases.map((a: any) => `${nep.prefix}${a}`).join(' • ')}`
							: 'None'}`
					)
					.setColor(nep.rColor)
			});
		}
		// Send command list and short help
		function sendSmall(cat: string) {
			// Get each category
			categories.forEach((c) => {
				// Get each command
				let cmd: any = fs.readdirSync(`${nep.config.dir}/Commands/${c}`);
				// Push formated into temp list
				for (let i = 0; i < cmd.length; i++) {
					let command: any = nep._commands.get(path.basename(cmd[i], '.ts'));
					// If category matches
					if (command.info.category.toLowerCase() == cat)
						commandListSmall.push(`**${nep.prefix}${command.info.name}** - *${command.info.help}*`);
				}
			});
			// Send message
			return msg.channel.send({
				embed: new discord.MessageEmbed()
					.setTitle(cat[0].toUpperCase() + cat.replace(cat[0], ''))
					.setDescription(commandListSmall.join(`\n\n`))
					.setFooter(msg.author.tag, msg.author.displayAvatarURL())
					.setColor(nep.rColor)
			});
		}
	}
}

export default Command;
