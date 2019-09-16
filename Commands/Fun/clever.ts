import { _Command, Neptune, Util, discord, neko } from '../../index';
import { Message, TextChannel } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Cleverbot.`,
			longHelp: `Gives you celver response.`,
			usage: [ `• ${cmd} <text>` ],
			examples: [ `• ${cmd} hello.` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'clev' ],
			locked: true,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		if (!args[0]) return util.embed(`:x: | You need to enter something!`);

		let resp = await neko.sfw.chat({
			text: args.join(' ')
		});

		msg.channel.send(resp.response);
	}
}

export default Command;
