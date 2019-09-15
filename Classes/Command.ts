import { User } from 'discord.js';
import { _Config, Neptune } from '../index';

class _Command {
	// Command class

	public info: _Config;
	public config: _Config;
	public cooldown: Set<any>;
	public sentCooldownMessage: Set<any>;

	constructor(nep: Neptune, options: { [k: string]: any }) {
		this.info = {
			// Command information
			name: options.name || undefined,
			help: options.help || 'No help specified.',
			longHelp: options.longHelp || 'No long help specified.',
			usage: options.usage || [],
			examples: options.examples || [],
			category: options.category || 'No category given.'
		};

		this.config = {
			// Command config
			cooldown: options.cooldown || 5e2,
			aliases: options.aliases || [],
			allowDM: options.allowDM || false,
			locked: options.locked || false
		};
		this.cooldown = new Set(); // Users on cooldown
		this.sentCooldownMessage = new Set(); // Cooldown messages sent
	}
	// ---------------------------------------------------------------------------

	startCooldown(user: User) {
		// Sets a user on cooldown
		this.cooldown.add(user);

		setTimeout(() => {
			// Remove user from cooldown
			this.cooldown.delete(user);
			this.sentCooldownMessage.delete(user);
		}, this.config.cooldown);
	}

	// ---------------------------------------------------------------------------
}

export default _Command;
