export default {
	dir: '/home/USER/path/to/dir', // The path to your root directory (/home/USER/Neptune-TS)
	discord: {
		token: 'TOKEN', // Discord bot token
		prefix: '=', // Prefix for your bot
		owner: [ 'YOUR ID' ] // Array of owner IDs
	},
	mongo: {
		// MongoDB
		user: 'USER', // MongoDB user
		password: 'PASS', // Mongo pass
		db: 'DB' // Mongo DB for that user
	},
	api: {
		// Neptune API (https://github.com/MoistSenpai/Neptune-API)
		key: 'KEY', // API key
		url: 'https://localhost/api' // Url to API
	}
};
