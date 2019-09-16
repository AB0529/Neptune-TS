import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Exec commands.`,
			longHelp: `Runs commands on terminal.`,
			usage: [ `• ${cmd} <cmd>` ],
			examples: [ `• ${cmd} ls` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let m = await util.embed(`*Running...*`);

		try {
			// Run the command
			var run = require('child_process').execSync(args.join(' '));
		} catch (err) {
			var run = err;
		}

		if (run.toString().length >= 1e3) {
			// If output is too long send paginton
			m.edit(`Too lazy I'll add later \`7/27/19 12:11 AM\``);
		}
		// If not, send the output
		m.edit({
			embed: new discord.MessageEmbed()
				.addField(`Input`, `\`\`\`css\n${args.join(' ')}\n\`\`\``)
				.addField(
					`${run.toString().indexOf('Error') >= 0 ? ':x:' : '✅'} Output`,
					`\`\`\`css\n${run.toString()}\n\`\`\``
				)
		});
	}
}

export default Command;
