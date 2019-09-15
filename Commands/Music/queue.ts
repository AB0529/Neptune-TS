import { _Command, Neptune, Util, discord, _Queues } from '../../index';
import { Message, ReactionCollector } from 'discord.js';
import path from 'path';

class Command extends _Command {
	constructor(nep: Neptune) {
		let cmd = `${nep.prefix}${path.basename(__filename, '.ts')}`;

		super(nep, {
			name: path.basename(__filename, '.ts'),
			help: `Show and modify server queue.`,
			longHelp: `Allows you to show and modify the queue.`,
			usage: [
				`• ${cmd} <list/sq/show/ls>`,
				`• ${cmd} <rm/remove> <item>`,
				`• ${cmd} <cq/clear>`,
				`• ${cmd} <shuffle>`
			],
			examples: [
				`Lists items in queue\n• ${cmd} list\n• ${cmd} sq\n• ${cmd} show`,
				`Remove items in queue\n• ${cmd} rm 3\n• ${cmd} remove 9`,
				`Clears the queue\n• ${cmd} clear\n• ${cmd} cq`,
				`Shuffles the queue\n• ${cmd} shuffle`
			],
			category: path.dirname(__filename).split(path.sep).pop(),
			cooldown: 1e3,
			aliases: [ 'q' ],
			locked: false,
			allowDM: false
		});
	}

	public async _run(msg: Message, args: string[], util: Util, nep: Neptune) {
		let q = await util.getQueue(msg.guild.id);

		let vc = msg.guild.members.get(nep.user.id).voice.connection;
		let queueStatus = vc ? 'playing' : 'stopped';
		let formatedQueue = q.map(
			(i: any, index: number) => `${index + 1}) [${i.video.title}](${i.video.url}) **[<@${i.author}>]**`
		);
		let sepQ: _Queues = [];
		let pagesLength = 10;

		switch (args[0].toLowerCase()) {
			// ---------------------------------------------------------------------------
			// Shows the queue
			case 'sq':
			case 'show':
			case 'list':
			case '-sq':
			case '-show':
			case '-list':
			case '-lq':
			case 'ls':
			case '-ls':
			case 'lq': {
				// Handle empty queue
				if (q.length <= 0)
					return util.embed(
						`<a:WhereTf:539164678480199720> *You can't list something if there's nothing to list!*`
					);
				else if (formatedQueue.length > pagesLength) {
					// Send paginton if too long
					while (formatedQueue.length > 0) sepQ.push(formatedQueue.splice(0, pagesLength).join('\n'));

					// Send first page
					let m = await util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${sepQ[0]}`);
					let collector: ReactionCollector = m.createReactionCollector(
						(x) => x.users.last().id == msg.author.id,
						{
							time: 3e4,
							dispose: true
						}
					);
					let counter = 0;

					// React with page flippers
					new Promise((resolve) => {
						m.react(`◀`).then(() => m.react(`🔵`).then(() => m.react(`▶`).then(() => m.react(`❌`))));
						resolve();
					}).catch((err) => util.error(`Reaction Add Error`, err));

					// Flip through pages
					collector.on('collect', (r) => {
						// Move left
						if (r.emoji.name == `◀` && counter >= 0) {
							counter--;
							if (counter < 0) counter = 0;
							util.embed(
								`💃 | Queue is **currently ${queueStatus}**\n\n${sepQ[counter]}\n\nPage ${counter +
									1}/${sepQ.length}`,
								m
							);
						} else if (r.emoji.name == `🔵` && counter > 0) {
							// Move to begining
							counter = 0;
							util.embed(
								`💃 | Queue is **currently ${queueStatus}**\n\n${sepQ[counter]}\n\nPage ${counter +
									1}/${sepQ.length}`,
								m
							);
						} else if (r.emoji.name == `▶` && counter < sepQ.length - 1) {
							// Move right
							counter++;
							if (counter > sepQ.length - 1) counter = sepQ.length - 1;
							util.embed(
								`💃 | Queue is **currently ${queueStatus}**\n\n${sepQ[counter]}\n\nPage ${counter +
									1}/${sepQ.length}`,
								m
							);
						} else if (r.emoji.name == `❌`) {
							// Cancel
							collector.stop();
							m.delete({ timeout: 500 }).catch((err) => util.error(`Delete Message Eror`, err));
						}
					});
					return;
				}
				// Send normal queue
				util.embed(`💃 | Queue is **currently ${queueStatus}**\n\n${formatedQueue.join('\n')}`);
				break;
			}
			// ---------------------------------------------------------------------------
			// Removes items from queue
			case 'rm':
			case 'remove':
			case '-rm':
			case '-remove': {
				let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;
				let rm: string = args[1];

				// If queue exists
				if (q.length < 1)
					return util.embed(`:x: | There's **nothing to remove**, add something with \`${nep.prefix}play\`!`);
				else if (!rm)
					// Handle no arguments
					return util.embed(`:x: | What do you **want to remove**? To see do \`${nep.prefix}queue show\`!`);
				else if (!parseInt(rm))
					// Handle arguments being valid
					return util.embed(`:x: | \`${util.parseArgs(rm)}\` is not a **valid number**!`);
				else if (!q[parseInt(rm) - 1])
					return util.embed(`:x: | \`${util.parseArgs(rm)}\` **doesn't exist** in the queue!`);
				else if (
					msg.author.id !== q[parseInt(rm) - 1].author &&
					!msg.member.hasPermission('ADMINISTRATOR') &&
					!util.findRole('NeptuneDJ')
				)
					// Handle permissions
					return util.embed(
						`:x: | You can only remove if you:\n- \`Queued the item\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `
					);
				else if (voiceConnection !== null && parseInt(rm) - 1 == 0) {
					// Handle what happens when removing playing item
					// Skip the first item of queue
					return util
						.embed(
							`❎ | [${q[parseInt(rm) - 1].video.title}](${q[parseInt(rm) - 1].video
								.url}) has been removed by **[${msg.author}]**!`
						)
						.then(() => {
							if (q.length == 1) {
								q = [];
								util.updateQueue(q);

								let dispatcher = (voiceConnection.player as any).dispatcher;

								if (dispatcher.paused) dispatcher.resume();
								if (!dispatcher) return;

								return dispatcher.end();
							}
							q.splice(0, 1 - 1);
							util.updateQueue(q);

							let dispatcher = (voiceConnection.player as any).dispatcher;

							if (dispatcher.paused) dispatcher.resume();
							if (!dispatcher) return;

							return dispatcher.end();
						});
				} else if (q.length == 1 && parseInt(rm) - 1 == 0) {
					// If only 1 item in queue clear it
					util.embed(
						`❎ | [${q[parseInt(rm) - 1].video.title}](${q[parseInt(rm) - 1].video
							.url}) has been removed by **[${msg.author}]**!`
					);
					q = [];
					util.updateQueue(q);
				} else if (voiceConnection == null) {
					// If not playing, remove
					util.embed(
						`❎ | [${q[parseInt(rm) - 1].video.title}](${q[parseInt(rm) - 1].video
							.url}) has been removed by **[${msg.author}]**!`
					);
					q.splice(parseInt(rm) - 1, 1);
					util.updateQueue(q);
				} else if (voiceConnection !== null) {
					// If playing remove
					util.embed(
						`❎ | [${q[parseInt(rm) - 1].video.title}](${q[parseInt(rm) - 1].video
							.url}) has been removed by **[${msg.author}]**!`
					);
					q.splice(parseInt(rm) - 1, 1);
					util.updateQueue(q);
				}
				break;
			}
			// ---------------------------------------------------------------------------
			// Clears the queue
			case 'cq':
			case 'clear':
			case '-cq':
			case '-clear': {
				let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;

				// Check if queue has items
				if (q.length < 1)
					return util.embed(`:x: | There's **nothing to remove**, add something with \`${nep.prefix}play\`!`);
				else if (!msg.member.hasPermission('ADMINISTRATOR') && !util.findRole('NeptuneDJ'))
					// Handle permissions
					return util.embed(
						`:x: | You can only remove if you:\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `
					);
				else if (voiceConnection !== null) {
					if (q.length > 1) {
						return util.embed(`⛔ | Queue has been  **cleared** by **[${msg.author}]**!`).then(async () => {
							q = [];
							await util.updateQueue(q);

							voiceConnection.channel.leave();
						});
					}
					// Handle what happens if clear and playing and only 1 item in queue
					// Skip the first item of queue
					return util.embed(`⛔ | Queue has been  **cleared** by **[${msg.author}]**!`).then(() => {
						let dispatcher = (voiceConnection.player as any).dispatcher;

						if (!dispatcher) return;
						else if (dispatcher.paused) dispatcher.resume();

						dispatcher.end();
						q.splice(0, q.length);
						util.updateQueue(q);
					});
				} else if (voiceConnection == null) {
					// If not playing, remove
					util.embed(`⛔ | Queue has been **cleared** by **[${msg.author}]**!`);

					q.splice(0, q.length);
					util.updateQueue(q);
				}
				break;
			}
			// ---------------------------------------------------------------------------
			// Shuffles the queue
			case 'shuffle':
			case '-shuffle': {
				let voiceConnection = msg.guild.members.get(nep.user.id).voice.connection;

				// Shuffle
				const shuffle = (arr: Array<_Queues>, t: boolean = false) => {
					let newArr = arr.reduce((r, e, i) => {
						let pos = Math.random() * (i + 1);
						r.splice(pos, 0, e);
						return r;
					}, []);

					if (t) newArr.unshift(newArr.splice(newArr.indexOf(q[0]), 1)[0]);
					return newArr;
				};

				// Check if more than 1 item in queue
				if (q.length <= 1) return util.embed(`:x: | What is there to shuffle?!`);
				else if (
					msg.author !== q[0].video.author &&
					!msg.member.hasPermission('ADMINISTRATOR') &&
					!util.findRole('NeptuneDJ')
				)
					// Check if permissions check out
					return util.embed(
						`:x: | You can only shuffle if you:\n- \`Queued this\`\n- \`Have admin permissions\`\n- \`Have NeptuneDJ role\` `
					);
				else if (voiceConnection !== null) {
					// If queue is playing, don't shuffle first item
					q = shuffle(q, true);
					util.updateQueue(q);
					return util.embed(`♻ | Queue has been **shuffled** by **[${msg.author}]**`);
				} else {
					// If not, shuffle everything
					q = shuffle(q);
					util.updateQueue(q);
					return util.embed(`♻ | Queue has been **shuffled** by **[${msg.author}]**`);
				}

				break;
			}
			// ---------------------------------------------------------------------------
			default: {
				util.embed(
					`:x: | Dude, those are **Invalid arguments**, try \`${nep.prefix}help ${this.info
						.name}\` for more info!`
				);
				break;
			}
			// ---------------------------------------------------------------------------
		}
	}
}

export default Command;
