import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Solves math expressions.`,
			longHelp: `Can solve simple and complex math expressions.`,
			usage: [ `• ${cmd} <Expression>` ],
			examples: [ `• ${cmd} 69^12 / 5 + 42 - root 4` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		// Handle no args
		if (!args[0]) return util.embed(`:x: | You must **provide an equation** to solve.`);

		// Evaluate equation
		try {
			msg.channel.send({
				embed: new discord.MessageEmbed()
					.addField('🔶 Expression', `\`\`\`css\n${util.parseArgs(args.join(' '), 500)}\`\`\``)
					.addField(
						`🔷 Answer`,
						`\`\`\`css\n${require('math-expression-evaluator')
							.eval(util.parseArgs(args.join(' '), 500))
							.toFixed(2)}\`\`\``
					)
					.setColor(nep.rColor)
					.setFooter(msg.author.tag, msg.author.displayAvatarURL())
			});
		} catch (err) {
			util.error(`Math Eval Error`, err.message, false);
		}
	}
}

export default Command;
