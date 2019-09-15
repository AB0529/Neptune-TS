import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Usual 'ping' command.`,
			longHelp: `Returns the round trip ping and API latency`,
			usage: [ `• ${cmd}` ],
			examples: [ `• ${cmd}` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'pong' ],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let m = await util.embed(`*Pinging...*`);

		m.edit({
			embed: new discord.MessageEmbed()
				.addField(
					`:ping_pong: Ping my Pong`,
					`⏱ | **Message Delay:** \`${Math.round(
						m.createdTimestamp - msg.createdTimestamp
					)}ms\`\n 📡 | **Websocket:**  \`${Math.round(nep.ws.ping)}ms\``
				)
				.setColor(nep.rColor)
		});
	}
}

export default Command;
