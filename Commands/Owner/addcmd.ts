import { _Command, Neptune, Util, discord, neko } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

import fs from 'fs';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Adds commands.`,
			longHelp: `Adds commands.`,
			usage: [ `• ${cmd} <name>:<category>` ],
			examples: [ `• ${cmd} test:Fun` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'cadd', 'ac' ],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let userCode = args[1] ? args.slice(1).join(' ') : 'msg.channel.send(`Sick`);';
		let code = fs.readFileSync(`${nep.config.dir}/commandBoiler.ts.example`).toString().replace('CODE', userCode);

		// Handle no args
		if (!args[0]) return util.embed(`:x: | Gimme a **command name** idiot, god damn.`);

		let cmd = args[0].split(':');

		// Make sure category input
		if (!cmd[1]) return util.embed(`:x: | Gimme a **category** idiot.`);
		else if (!fs.existsSync(`${nep.config.dir}/Commands/${cmd[1]}`))
			// Make sure category exists
			return util.embed(`:x: | **Category doesn't exist** idiot.`);

		// Create file
		fs.writeFileSync(`${nep.config.dir}/Commands/${cmd[1]}/${cmd[0]}.ts`, code);
		util.embed(`✅ | Added command \`${cmd[0]}\` to category \`${cmd[1]}\`\n\n\`\`\`ts\n${userCode}\n\`\`\``);
	}
}

export default Command;
