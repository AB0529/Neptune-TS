import { nep } from '../index';

const _run = () => {
	nep.util.log(`Ready`, `Client logged in`, nep.user.tag);
	// Set status
	nep.user.setActivity(`I'm back! | --help`, { type: 'PLAYING' });
};

export default { _run };
