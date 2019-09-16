import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Shows user info from user.`,
			longHelp: `Shows information about a user`,
			usage: [ `• ${cmd}`, `• ${cmd} <Mention, ID, Tag>` ],
			examples: [ `• ${cmd}` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'uinf' ],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let user = args[0] ? await util.getUsers(args.join(' ')) : msg.author;

		let member = msg.guild.members.get(user.id);
		let joinedGuild = member.joinedTimestamp;
		let accountCreated = user.createdTimestamp;

		return util.embed(`Todo: Finish this later`);
	}
}

export default Command;
