import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

class VolumeBar {
	public volume: number;
	constructor(volume: number) {
		this.volume = volume || 0;
	}

	format() {
		let string = '';

		for (let i = 0; i < this.volume / 10; i++) string += '⬜';

		if (string.length !== 10) while (string.length !== 10) string += '⬛';

		return string;
	}
}

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Change volume.`,
			longHelp: `Changes volume of the queue and playing song.`,
			usage: [ `• ${cmd} <number>` ],
			examples: [ `Changes the volume (0-100)• ${cmd} 69` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'vol' ],
			locked: false,
			allowDM: false
		});
	}

	public async _run(msg: Message, args: any[], util: Util, nep: Neptune) {
		if (!msg.member.hasPermission('ADMINISTRATOR') && !util.findRole('NeptuneDJ'))
			return util.embed(
				`:x: | You can only use this if you:\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `
			);
		try {
			var voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;
			var dispatcher = (voiceConnection.player as any).dispatcher; // Dispatcher
			var q = await util.getQueue(msg.guild.id); // Guilds' queue
		} catch (err) {
			// Make sure something is playing
			return util.embed(`:x: | I'm not **playing anything**, leave me alone!`);
		}
		// Make sure args is a number
		if (!parseInt(args[0]) && isNaN(parseInt(args[0])))
			return util.embed(
				`:x: | Did you learn your numbers, because \`${util.parseArgs(args[0])}\` isn't one of them!`
			);
		else if (parseInt(args[0]) > 100 && isFinite(parseInt(args[0])))
			// Make sure args is in range of 1-100
			args[0] = 100;
		else if (parseInt(args[0]) <= 0) args[0] = 1;

		// If everything checks out, set volume for the queue
		q.volume = parseInt(args[0]);
		dispatcher.setVolume(Math.floor(args[0]) / 100);

		const bar = new VolumeBar(Math.floor(args[0])); // Initalize volume bar class

		return util.embed(`🎧 | Okay, the volume is now \`${Math.floor(args[0])}\`!\n[${bar.format()}]`);
	}
}

export default Command;
