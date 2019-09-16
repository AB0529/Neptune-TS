import { _Command, Neptune, Util, discord, neko } from '../../index';
import { Message, TextChannel } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `You like traps?`,
			longHelp: `Boku no Pico kind.`,
			usage: [ `• ${cmd}` ],
			examples: [ `• ${cmd}` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: true,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let link = await neko.nsfw.trap();

		if (msg.guild && !(msg.channel as TextChannel).nsfw)
			return util.embed(`:x: | This channel is **not marked as NSFW**, how boring.`);
		else if (!msg.guild || (msg.channel as TextChannel).nsfw)
			return msg.channel.send({
				embed: new discord.MessageEmbed()
					.setDescription(`<a:SlowWank:539164416222953526> Here you go **[${msg.author}]**`)
					.setColor(nep.rColor)
					.setImage(link.url)
			});
	}
}

export default Command;
