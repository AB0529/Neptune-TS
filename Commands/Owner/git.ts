import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

import { execSync } from 'child_process';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Do git stuff faster`,
			longHelp: `Git commit and git push`,
			usage: [ `• ${cmd} <Commit Message>` ],
			examples: [ `• ${cmd} Did stuff` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let m = await util.embed(`*Adding files...*`);
		let output = ``;

		execSync(`git add .`);
		output += `**[Git Add]** - Files added\n`;
		util.embed(output, m);
		execSync(`git commit -m "${args.join(' ')}"`);
		output += `**[Git Commit]** - Commited ${util.parseArgs(args.join(' '), 10)}\n`;
		util.embed(output, m);
		execSync(`git push orgin master`);
		output += `**[Git Push]** - Pushed to orgin/master\n`;
		execSync(`git push orgin master`);
		output += `Done.`;
		util.embed(output, m);
	}
}

export default Command;
