import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Gets avatar of user.`,
			longHelp: `Returns avatar URL of user`,
			usage: [ `• ${cmd}`, `• ${cmd} [Mention, ID, Tag, Name]` ],
			examples: [ `• ${cmd}`, `• ${cmd} Moist` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'av', 'profile', 'prof' ],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let user = args[0] ? await util.getUsers(args.join(' ')) : msg.author;

		msg.channel.send({
			embed: new discord.MessageEmbed()
				.setDescription(`**[${user.tag}]**'s Avatar`)
				.setImage(user.displayAvatarURL({ size: 2048 }))
				.setColor(nep.rColor)
		});
	}
}

export default Command;
