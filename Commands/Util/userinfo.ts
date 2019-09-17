import { _Command, Neptune, Util, discord } from '../../index';
import { Message, Role } from 'discord.js';
import moment from 'moment';
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
			aliases: [ 'uinf', 'uinfo' ],
			locked: false,
			allowDM: true
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let user = args[0] ? await util.getUsers(args.join(' ')) : msg.author;

		let member = msg.guild.members.get(user.id);
		let joinedGuild = moment(member.joinedTimestamp).format('MMM Do YY');
		let accountCreated = moment(user.createdTimestamp).format('MMM Do YY');
		let id = user.id;
		let roles = member.roles.map((r: Role) => r).filter((r) => r.name !== '@everyone');
		let nickname = !member.nickname ? 'None' : member.nickname;
		let status = () => {
			let s = member.presence.status;

			switch (s) {
				case 'online':
					return `💚`;
				case 'idle':
					return `💛`;
				case 'dnd':
					return `❤`;
				case 'offline':
					return `🖤`;
				default:
					return `🤷`;
			}
		};

		msg.channel
			.send({
				embed: new discord.MessageEmbed()
					.setDescription(`**[${user.tag}]**`)
					.addField(`🆔 ID`, `**${id}**`, true)
					.addField(`✏ Nickname`, `**${nickname}**`, true)
					.addField(`🐤 Account Created`, `**${accountCreated}**`, true)
					.addField(`🚀 Joined Guild`, `**${joinedGuild}**`, true)
					.addBlankField()
					.addField(`${status()} Status`, `**${member.presence.status.toUpperCase()}**`, true)
					.addField(`📜 Roles [${roles.length}]`, util.parseArgs(roles.join(', '), 1e3), true)
					.setFooter(user.tag, user.displayAvatarURL())
					.setThumbnail(user.displayAvatarURL())
					.setColor(nep.rColor)
			})
			.catch((err) => util.error(`Embed Send Error`, err));
	}
}

export default Command;
