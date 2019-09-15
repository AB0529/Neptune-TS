import { Neptune, Colors, discord, _Queues, Servers, request } from '../index';
import { Message, VoiceConnection, StreamDispatcher } from 'discord.js';
import ytdl from 'ytdl-core';

// Util class with Util functions
class Util {
	public nep: Neptune;
	public msg: Message;

	constructor(nep: Neptune, msg?: Message) {
		this.nep = nep;
		this.msg = msg || undefined;
	}
	// ---------------------------------------------------------------------------
	// Pretty log
	public log(title: any, content: any, extra: any = '') {
		console.log(`[`.green + `${title}`.magenta + `]`.green + ` ${content.yellow} ` + `(${`${extra}`.blue})`);
	}
	// ---------------------------------------------------------------------------
	// Easy embed
	public async embed(content: string, m?: Message): Promise<Message> {
		let embed = new discord.MessageEmbed().setDescription(content).setColor(this.nep.rColor);

		// Handle edit
		if (m)
			return m.edit({
				embed: embed
			});
		return await this.msg.channel.send({
			embed: embed
		});
	}
	// ---------------------------------------------------------------------------
	// Pretty error handle
	public error(type: string, err: any, log: boolean = true) {
		if (log) this.log(`${type}`, JSON.stringify(err));

		this.embed(
			`:x: | Oh heck, **an error occured**:\n\n\`\`\`css\nType: ${type}\nError Stack: \n${err instanceof Error
				? err.stack
				: err}\n\`\`\``
		);
	}
	// ---------------------------------------------------------------------------
	// Handle user input
	public parseArgs(s: string, leng: number = 15): string {
		return s.length > leng ? (s = s.substring(0, leng) + '...') : s;
	}
	// ---------------------------------------------------------------------------
	// Convert MS time into seconds or minutes etc.
	public msParser(millisec: number) {
		let seconds = millisec / 1e3;
		let minutes = millisec / (1e3 * 60);
		let hours = millisec / (1e3 * 60 * 60);
		let days = millisec / (1e3 * 60 * 60 * 24);

		if (seconds < 60) {
			return seconds + ' second(s)';
		} else if (minutes < 60) {
			return minutes + ' minute(s)';
		} else if (hours < 24) {
			return hours + ' hour(s)';
		} else {
			return days + ' day(s)';
		}
	}
	// ---------------------------------------------------------------------------
	// Get JSON response
	public getJSON(url: string) {
		return new Promise((resolve) => {
			request(url, (err, resp, bod) => {
				if (err) return this.error(`Request Error`, err);

				try {
					resolve(JSON.parse(bod));
				} catch (err) {
					return this.error(`Request Error`, err);
				}
			});
		});
	}
	// ---------------------------------------------------------------------------
	// Get data from Mongo
	public getData(where: any): Promise<{ [key: string]: any }> {
		return new Promise(async (resolve) => {
			Servers.findOneAndUpdate({ guildId: where }, { guildId: where }, (err, resp) => {
				if (err) return this.error(`Mongo Error`, err);
				else if (!resp)
					// If guild not in database, add it
					resp = new Servers({
						guildId: where,
						prefix: this.nep.prefix,
						queue: []
					});
				resp.save();
				// Send data
				resolve({
					guildId: resp.get('guildId'),
					prefix: resp.get('prefix'),
					queue: resp.get('queue')
				});
			});
		});
	}
	// ---------------------------------------------------------------------------
	// Get API url and pass in params
	public getAPIUrl(route: string, params: string[]): string {
		return `https://api.anishb.net/${route}?key=${this.nep.config.api.key}&${params.join('&')}`;
	}
	// ---------------------------------------------------------------------------
	// Update queue
	public updateQueue(q: _Queues) {
		Servers.findOneAndUpdate({ guildId: this.msg.guild.id }, { $set: { queue: q } }, (err, resp) => {
			if (err) return this.error(`Mongo Error`, err);
			resp.save();
		});
	}
	// ---------------------------------------------------------------------------
	// Get queue
	public async getQueue(id: string) {
		let q = await Servers.find({ guildId: id });
		let qt = q[0].get('queue', Array);
		qt.volume = 100;

		return qt;
	}
	// ---------------------------------------------------------------------------
	// Find role in guild
	public findRole(name: string): boolean {
		let role = this.msg.guild.roles.find((r) => r.name.toLowerCase() == name);
		let isOwner = this.nep.config.discord.owner.map((o: string) => (this.msg.author.id == o ? true : false));

		// Role doesn't eixst
		if (!role) return false;
		else if (isOwner)
			// Is owner
			return true;
		else if (!this.msg.member.roles.get(role.id))
			// Member doesn't have role
			return false;
		// All checks don't pass return true
		return true;
	}
	// ---------------------------------------------------------------------------
	// Play queue
	public playQueue(q: _Queues) {
		// Handle queue finished
		if (q.length == 0)
			return this.nep.util
				.embed(`<:Sharcat:390652483577577483> | Queue has **finished playing**, see ya' later alligator!`)
				.then(() => {
					let vc: VoiceConnection = this.msg.guild.voice.connection;

					q.volume = 100; // Reset volume

					// Leave vc
					if (vc !== null) this.msg.guild.members.get(this.nep.user.id).voice.channel.leave();
				})
				.catch((err) => this.error(`Leave VC Error`, err));

		// Join vc
		new Promise(async (resolve) => {
			let vc: VoiceConnection = this.msg.guild.members.get(this.nep.user.id).voice.connection;

			// Atempt to join vc
			if (vc == null) {
				// Join member
				if (this.msg.member.voice.channel) return resolve(await this.msg.member.voice.channel.join());
				else return this.embed(`:x: | You're **not in a voice channel**, I can't do everything myself!`);
			}
			resolve(vc);
		}).then((c: any) => {
			// Handle playing sound
			let video = q[0].video.url;
			let stream = ytdl(video, {
				filter: 'audioonly'
			});
			let dispatcher: StreamDispatcher = c.play(stream);

			this.msg.channel.send({
				embed: new discord.MessageEmbed()
					.setDescription(
						`<:ThumbsUp:427532146140250124> | **Now playing** [${q[0].video.title.replace(
							'&amp;',
							'&'
						)}](${q[0].video.url}) **[<@${q[0].author}>]**`
					)
					.setColor(this.nep.rColor)
					.setThumbnail(q[0].thumbnail.default.url)
			});

			// Set volume
			dispatcher.setVolume(!q.volume ? 1 : Math.floor(q.volume) / 100);

			// Handle music end
			dispatcher.on('end', () => {
				setTimeout(async () => {
					q.shift();

					await this.updateQueue(q);
					await this.playQueue(await this.getQueue(this.msg.guild.id));
				}, 1e3);
			});
			// Handle error
			dispatcher.on('error', (err) => this.error(`Dsipatcher Error`, err));
		});
	}
	// ---------------------------------------------------------------------------
}

export { Util };
