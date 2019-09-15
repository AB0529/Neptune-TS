import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Pauses currently playing.`,
			longHelp: `Puases whatevers currently playing.`,
			usage: [ `• ${cmd}` ],
			examples: [ `• ${cmd}` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'ps' ],
			locked: false,
			allowDM: false
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let q = await util.getQueue(msg.guild.id);
		let vc = msg.guild.members.get(nep.user.id).voice.connection;

		// Handle empty queue
		if (q.length <= 0)
			return util.embed(`:x: | The **queue is empty**, add something with \`${nep.prefix}play Song\`.`);
		else if (!vc)
			// Handle no vc
			return util.embed(`:x: | I'm not **palying anything** go away!`);
		// Check if permissions check out
		if (
			msg.author !== q[0].video.author &&
			!msg.member.hasPermission('ADMINISTRATOR') &&
			!util.findRole('NeptuneDJ')
		)
			return util.embed(
				`:x: | You can only skip if you:\n- \`Queued this\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `
			);

		// The dispatcher
		let dispatcher = (vc.player as any).dispatcher;

		// Handle if already paused
		if (dispatcher.paused)
			return util.embed(`:x: | I **already paused this**! Use \`${nep.prefix}resume\` to resume!`);

		// Pause
		return util
			.embed(
				`⏸ | [${q[0].video.title}](${q[0].video
					.url}) has been **paused** by **[${msg.author}]**! (\`${nep.prefix}resume\`)`
			)
			.then(() => {
				if (!dispatcher) return;

				return dispatcher.pause();
			});
	}
}

export default Command;
