import { _Command, Neptune, Util, discord, neko } from '../../index';
import { Message, TextChannel } from 'discord.js';
import path from 'path';

import gm from 'gm';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `'Rape' a user.`,
			longHelp: `You're welcome Jon.`,
			usage: [ `• ${cmd} <User, Mention, ID, Tag>` ],
			examples: [ `• ${cmd} Amy` ],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 30e3,
			aliases: [],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		// NSFW channel check
		if (msg.guild && !(msg.channel as TextChannel).nsfw)
			return util.embed(`:x: | This channel is **not marked as NSFW**, how boring.`);

		let checkUrlReg = /\.(jpeg|jpg|png)$/;
		let attachment = msg.attachments.first();

		// Implode image
		const rape = async (link: string) => {
			let bufLink: any = await util.toBuffer(link);
			let m = await util.embed(`*Doing the stuff...*`);

			if (link.indexOf('.gif') >= 0)
				return util.embed(`:x: | The format **GIF is not supported**, choose something else.`);

			gm(bufLink).toBuffer(`gif`, (err, buffer) => {
				if (err) return util.error(`Gm Write Error`, err);
				msg.channel
					.send(`[TEST] Here you go ${msg.author}:`, {
						files: [
							{
								attachment: buffer,
								name: `${msg.author.id}-rape.jpg`
							}
						]
					})
					.then(() => m.delete({ timeout: 1e3 }).catch((err) => util.error(`GM Delete Error`, err)))
					.catch((err) => util.error(`GM Send Buffer Error`, err));
			});
		};

		// Handle no args
		if (!args[0] && !attachment) return util.embed(`:x: | Provide a **user, image attachment or a link** to rape.`);
		else if (attachment) {
			// Handle attachment
			msg.delete({ timeout: 1e3 }).catch((err) => util.error(`Delete Message Error (1)`, err));
			return rape(attachment.url);
		} else if (checkUrlReg.test(args.join(' '))) {
			// Handle regex match
			msg.delete({ timeout: 1e3 }).catch((err) => util.error(`Delete Message Error (2)`, err));
			return rape(args.join(' '));
		} else if (!checkUrlReg.test(args.join(' ')) && !attachment) {
			// Handle no attachment and no regex match
			let user = await util.getUsers(args.join(' '));

			rape(user.displayAvatarURL({ size: 2048 }).replace('.webp', '.jpg').replace('.gif', '.jpg'));
		} else return util.error(`No match error`, `Idfk what you did but you did it wrong`);
	}
}

export default Command;
