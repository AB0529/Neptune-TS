import { _Command, Neptune, Util, discord, neko } from '../../index';
import { Message, TextChannel } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `OwOify text.`,
			longHelp: `*Nyotices youw buwdge* owo what's this?`,
			usage: [ `• ${cmd} <text>` ],
			examples: [ `• ${cmd} hello I like anime girls.` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		if (!args[0]) return util.embed(`:x: | You nyeed to give something to owoify ^w^ `);

		let resp = await neko.sfw.OwOify({
			text: args.join(' ')
		});

		msg.channel.send(resp.owo);
	}
}

export default Command;
