import { _Command, Neptune, Util, discord, neko } from '../../index';
import { Message, TextChannel, Role } from 'discord.js';
import path from 'path';

import gm from 'gm';

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
		let checkUrlReg = /\.(jpeg|jpg|png)$/;
		let attachment = msg.attachments.first();

		// Implode image
		const nega = async (link: string) => {
			let bufLink: any = await util.toBuffer(link);
			let m = await util.embed(`*Negatiavzing...*`);
			// red = ((254, 0, 2), (255, 255, 15))
			// blue = ((36, 113, 229), (255,) * 3)

			if (link.indexOf('.gif') >= 0)
				return util.embed(`:x: | The format **GIF is not supported**, choose something else.`);

			gm(bufLink).clip().sharpen(100).autoOrient().toBuffer(`jpg`, (err, buffer) => {
				if (err) return util.error(`Gm Write Error`, err);
				msg.channel
					.send(`Here you go ${msg.author}:`, {
						files: [
							{
								attachment: buffer,
								name: `${msg.author.id}-neg.jpg`
							}
						]
					})
					.then(() => m.delete({ timeout: 1e3 }).catch((err) => util.error(`GM Delete Error`, err)))
					.catch((err) => util.error(`GM Send Buffer Error`, err));
			});
		};

		// Handle no args
		if (!args[0] && !attachment)
			return util.embed(`:x: | Provide a **user, image attachment or a link** to negatize.`);
		else if (attachment) {
			// Handle attachment
			msg.delete({ timeout: 1e3 }).catch((err) => err);
			return nega(attachment.url);
		} else if (checkUrlReg.test(args.join(' '))) {
			// Handle regex match
			msg.delete({ timeout: 1e3 }).catch((err) => err);
			return nega(args.join(' '));
		} else if (!checkUrlReg.test(args.join(' ')) && !attachment) {
			// Handle no attachment and no regex match
			let user = await util.getUsers(args.join(' '));

			nega(user.displayAvatarURL({ size: 2048 }).replace('.webp', '.jpg').replace('.gif', '.jpg'));
		} else return util.error(`No match error`, `Idfk what you did but you did it wrong`);
	}
}

export default Command;
