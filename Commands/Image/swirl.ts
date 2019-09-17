import { _Command, Neptune, Util, discord } from '../../index';
import { Message } from 'discord.js';
import path from 'path';

import gm from 'gm';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `"Swrirls" and image..`,
			longHelp: `Adds a swirl effect to an image.`,
			usage: [ `• ${cmd} <Mention, User, ID, Tag>`, `• ${cmd} <Direct Link, Attachment>` ],
			examples: [
				`Explodes user profile\n• ${cmd} Moist#999`,
				`Explodes image provided\n${cmd} https://i.imgur.com/i2nFAcD.png`
			],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 10e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let checkUrlReg = /\.(jpeg|jpg|png)$/;
		let attachment = msg.attachments.first();

		// Implode image
		const explode = async (link: string) => {
			let bufLink: any = await util.toBuffer(link);
			let m = await util.embed(`*Swirling...*`);

			if (link.indexOf('.gif') >= 0)
				return util.embed(`:x: | The format **GIF is not supported**, choose something else.`);

			gm(bufLink).resize(512, 512).swirl(200).autoOrient().toBuffer(`jpg`, (err, buffer) => {
				if (err) return util.error(`Gm Write Error`, err);
				msg.channel
					.send(`Here you go ${msg.author}:`, {
						files: [
							{
								attachment: buffer,
								name: `${msg.author.id}-swirl.jpg`
							}
						]
					})
					.then(() => m.delete({ timeout: 1e3 }).catch((err) => util.error(`GM Delete Error`, err)))
					.catch((err) => util.error(`GM Send Buffer Error`, err));
			});
		};

		// Handle no args
		if (!args[0] && !attachment)
			return util.embed(`:x: | Provide a **user, image attachment or a link** to swirl.`);
		else if (attachment) {
			// Handle attachment
			msg.delete({ timeout: 1e3 }).catch((err) => util.error(`Delete Message Error (1)`, err));
			return explode(attachment.url);
		} else if (checkUrlReg.test(args.join(' '))) {
			// Handle regex match
			msg.delete({ timeout: 1e3 }).catch((err) => util.error(`Delete Message Error (2)`, err));
			return explode(args.join(' '));
		} else if (!checkUrlReg.test(args.join(' ')) && !attachment) {
			// Handle no attachment and no regex match
			let user = await util.getUsers(args.join(' '));

			explode(user.displayAvatarURL({ size: 2048 }).replace('.webp', '.jpg').replace('.gif', '.jpg'));
		} else return util.error(`No match error`, `Idfk what you did but you did it wrong`);
	}
}

export default Command;
