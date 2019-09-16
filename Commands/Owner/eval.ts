import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';
import _Util from 'util';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Eval stuff`,
			longHelp: `Returns output of eval.`,
			usage: [ `• ${cmd} <args>` ],
			examples: [ `• ${cmd} 1 + 1` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'ev' ],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		// Send eval output
		const sendEval = (input: any, output: any, emote: any = '✅') => {
			msg.channel.send({
				embed: new discord.MessageEmbed()
					.setDescription(`${emote} | **Output:**\n\`\`\`js\n${output}\n\`\`\``)
					.setColor(nep.rColor)
			});
		};

		// Handle no args
		if (!args[0]) return util.embed(`:x: | You have **no arguments** provided, gimme some.`);

		try {
			// Eval code
			let evaled = eval(args.join(' '));

			if (typeof evaled !== 'string') evaled = _Util.inspect(evaled);
			else if (evaled.toString().indexOf(nep.token) >= 0)
				evaled = evaled
					.toString()
					.replace(new RegExp(`${nep.config.discord.token}`, 'gi'), 'Go away.')
					.replace(new RegExp(`${nep.config.mongo.password}`, 'gi'), 'No password here xd');
			else if (evaled.length > 1500) return msg.channel.send(`Msg too big fix later.`);

			sendEval(args.join(' '), evaled);
		} catch (err) {
			// Handle error
			sendEval(args.join(' '), err, `:x:`);
		}
	}
}

export default Command;
