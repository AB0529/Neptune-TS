import { config, _Config, _Queues, _Command, _Event, Util, mongoose, Model } from '../index';
import { Client, Collection } from 'discord.js';
import fs from 'fs';

// Custom class for Client
class Neptune extends Client {
	// Client vars
	public config: _Config = config;
	public _queues: _Queues = {};
	public _commands: Collection<String, Object> = new Collection();
	public _aliases: Collection<String, String> = new Collection();
	public prefix: string;
	public rColor: string;
	public util: Util;
	public servers: Model<mongoose.Document>;

	constructor() {
		// Client options
		super({ disableEveryone: true, messageCacheLifetime: 60, messageSweepInterval: 65 });

		this.prefix = this.config.discord.prefix;
		this.rColor = Math.floor(Math.random() * 16777215).toString(16);
		this.util = new Util(this);
		this.servers;

		// MongoDB
		mongoose.connect(
			`mongodb://${this.config.mogo.user}:${this.config.mongo.password}@localhost/${this.config.mongo.db}`,
			{
				useNewUrlParser: true,
				useFindAndModify: false
			}
		);
	}

	// ---------------------------------------------------------------------------
	public loadCommands() {
		// Get categories
		let categories = fs.readdirSync(`${this.config.dir}/Commands/`);
		let Cmd: _Command;

		categories.map((c) => {
			fs.readdirSync(`${this.config.dir}/Commands/${c}`).map((cmds) => {
				// Load command
				Cmd = new (require(`${this.config.dir}/Commands/${c}/${cmds}`)).default(this);

				this._commands.set(Cmd.info.name, Cmd);
				Cmd.config.aliases.forEach((a: string) => this._aliases.set(a, Cmd.info.name));
			});
		});
		this.util.log('Client', `Loaded commands`, this._commands.size);
	}
	// ---------------------------------------------------------------------------

	public loadEvents() {
		// Get events
		let events = fs.readdirSync(`${this.config.dir}/Events/`);

		events.forEach((e) => {
			let event: _Event = require(`${this.config.dir}/Events/${e}`).default;
			super.on(e.split('.')[0], (...args: any[]) => event._run(...args));
		});

		this.util.log('Client', `Loaded events`, events.length);
	}

	// ---------------------------------------------------------------------------

	public get nep() {
		return this;
	}

	// ---------------------------------------------------------------------------
}

// Export
export { Neptune };
