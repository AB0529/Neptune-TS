import { _Command, Neptune, Util, discord, _Queues } from '../../index';
import { Message, MessageCollector } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Search videos or play queue.`,
			longHelp: `Plays the queue or searches videos and playlists`,
			usage: [ `• ${cmd}`, `• ${cmd} [title/link]`, `• ${cmd} -d [link/title]` ],
			examples: [
				`Play the queue\n• ${cmd}`,
				`Sends search results for link/title\n• ${cmd} Amazing Song`,
				`Queues first result for link/title\n• ${cmd} -d Amazing Song V2`
			],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'p' ],
			locked: false,
			allowDM: false
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let q = await util.getQueue(msg.guild.id);
		let flagReg = /(^-d)|( -d)/i;
		let notFlagReg = /^((?!( -d)|^(-d)).)*$/;
		let getPlaylistIDReg = /[?&]list=([^#\&\?]+)/;

		// Send list of results and play
		const search = async (term: string) => {
			let videos: _Queues = await util.getJSON(util.getAPIUrl('yt_video', [ `search=${term}`, `maxResults=5` ]));
			let m = await util.embed(`*Searching...*`);

			let formatedVideo: string[];
			let collector: MessageCollector = msg.channel.createMessageCollector(
				(_m) => _m.author.id == msg.author.id,
				{
					time: 3e4,
					dispose: true
				}
			);

			// Handle error
			if (videos.state == 'fail') {
				m.delete().catch((err) => util.error(`Delete Msg Error (5)`, err));
				return util.error(`Search error (${videos.status})`, videos.result, false);
			} else if (getPlaylistIDReg.test(term))
				// Handles playlist
				return playlist(term, m);

			// Format search results
			formatedVideo = videos.result.map(
				(v: _Queues, index: number) =>
					`${index + 1}) [${v.video.title}](${v.video.url}) **[${v.video.channel}]**`
			);

			// Send options
			m.edit({
				embed: new discord.MessageEmbed()
					.setDescription(
						`*Reply your wanted result*\n\n**Results for** \`${util.parseArgs(
							term
						)}\`:\n${formatedVideo.join('\n')}\n**c.** Cancel`
					)
					.setFooter(msg.author.tag, msg.author.displayAvatarURL())
					.setColor(nep.rColor)
			});

			collector.on('end', () =>
				setTimeout(() => {
					m.delete().catch((err) => util.error(`Delete Msg Error (3)`, err));
				}, 1e3)
			);
			collector.on('collect', async (_msg: Message) => {
				// Cancel
				if (_msg.content.toLowerCase() == 'c') {
					_msg.delete().catch((err) => util.error(`Delete Msg Error (1)`, err));
					return collector.stop();
				} else if (!videos.result[parseInt(_msg.content) - 1])
					// Make sure results exist
					return;

				_msg.delete().catch((err) => util.error(`Delete Msg Error (2)`, err));

				// Update queue
				videos.result[parseInt(_msg.content) - 1].author = msg.author.id;
				q.push(videos.result[parseInt(_msg.content) - 1]);
				q = await util.updateQueue(q);

				// Send confirmation
				msg.channel.send({
					embed: new discord.MessageEmbed()
						.setDescription(
							`<:Selfie:390652489919365131> | Enqueued [${videos.result[parseInt(_msg.content) - 1].video
								.title}](${videos.result[parseInt(_msg.content) - 1].video
								.url}) **[${_msg.author}]** Use \`${nep.prefix}${this.info.name}\` to play!`
						)
						.setThumbnail(videos.result[parseInt(_msg.content) - 1].thumbnail.medium.url)
						.setColor(nep.rColor)
				});
				collector.stop();
			});
		};
		// ------------------------------------------------------------------------------------
		// Play first result
		const play = async (term: string) => {
			let videos: _Queues = await util.getJSON(util.getAPIUrl('yt_video', [ `search=${term}`, `maxResults=1` ]));
			let m = await util.embed(`*Searching...*`);

			// Handle error
			if (videos.state == 'fail') {
				m.delete().catch((err) => util.error(`Delete Msg Error (6)`, err));
				return util.error(`Search error (${videos.status})`, videos.result, false);
			} else if (getPlaylistIDReg.test(term))
				// Handles playlist
				return playlist(term, m);

			// Update queue
			videos.result[0].author = msg.author.id;
			q.push(videos.result[0]);
			q = await util.updateQueue(q);

			// Send confirmation
			msg.channel
				.send({
					embed: new discord.MessageEmbed()
						.setDescription(
							`<:Selfie:390652489919365131> | Enqueued [${videos.result[0].video.title}](${videos
								.result[0].video.url}) **[${msg.author}]** Use \`${nep.prefix}${this.info
								.name}\` to play!`
						)
						.setThumbnail(videos.result[0].thumbnail.medium.url)
						.setColor(nep.rColor)
				})
				.then(() => m.delete().catch((err) => util.error(`Delete Msg Error (4)`, err)));
		};
		// ------------------------------------------------------------------------------------
		// Queues playlist
		const playlist = (term: string, m: Message) => {
			let id = getPlaylistIDReg.exec(term)[0];

			util.embed(id, m);
		};
		// ------------------------------------------------------------------------------------

		// Play queue if in vc
		if (!args[0] && q.length <= 0)
			return util.embed(
				`:x: | The **queue is empty**; add something with \`${nep.prefix}${this.info.name} cool song\`.`
			);
		else if (!args[0]) return util.playQueue(q);
		else if (args.join(' ').toLowerCase() == '-d')
			// If flag exists, but no args
			return util.embed(`:x: | You need **something to search**, try a **link** or **title**!`);
		else if (
			!flagReg.test(args.join(' ')) &&
			notFlagReg.test(args.join(' ').replace(flagReg, '')) &&
			args.join(' ').toLowerCase() !== '-d'
		)
			// If args but no flag exist send results
			search(args.join(' '));
		else if (flagReg.test(args.join(' ')) && notFlagReg.test(args.join(' ').replace(flagReg, '')))
			// If flag and args exist, get first result
			play(args.join(' ').replace(flagReg, ' '));
	}
}

export default Command;
