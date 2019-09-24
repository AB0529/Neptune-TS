// Import
import { Neptune } from './Classes/Neptune';
import { Util } from './Classes/Util';
import mongoose, { Schema, Model } from 'mongoose';

import config from './config';
import Colors from 'colors';
import _Command from './Classes/Command';
import discord from 'discord.js';
import request from 'request';
import Neko_Client from 'nekos.life';

const nep = new Neptune();
const neko = new Neko_Client();

// Bot login
nep.login(nep.config.discord.token);
// Load commands
nep.loadCommands();
// Load events
nep.loadEvents();

// Mongo Schemas
const serversSchema: Schema = new Schema({
	guildId: {
		type: String,
		default: ''
	},
	prefix: {
		type: String,
		default: nep.prefix
	},
	queue: {
		type: Array,
		default: []
	},
	nsfw: {
		type: Array,
		default: []
	},
	roles: {
		type: Array,
		default: []
	},
	ignore: {
		type: Array,
		default: []
	}
});
const Servers = mongoose.model('Servers', serversSchema);

// Interfaces
interface _Event {
	_run: Function;
}

interface _Config {
	[key: string]: any;
}

interface _Queues {
	[k: string]: any;
}

// Export
export {
	_Command,
	Neptune,
	config,
	_Config,
	_Queues,
	_Event,
	Colors,
	nep,
	discord,
	Util,
	mongoose,
	Servers,
	Model,
	request,
	neko
};
