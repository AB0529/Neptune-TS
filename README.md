# Neptune-TS

This is the TypeScript varient of [Neptune](https://github.com/MoistSenpai/Neptune) which is built in JavaScript.

## Getting Started

```
git clone https://github.com/MoistSenpai/Neptune-TS
cd Neptune-TS
```

### Prerequisites

* Node.js 10.0.0 or newer

* TypeScript 3.6.0 or newer

* MongoDB 4.2.0 or newer

### Installing

Remove 'sample.' from sample.config.ts and fill it in.
```ts
{
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
	},
	wolke: {
		// (Not currently used for now) https://weeb.sh/
		key: 'KEY' // Wolke key
	}
}
```

Install required dependencies.

```
npm i
```

Running the bot.

```
ts-node index.ts
```

## Built With

* [Discord.JS](https://github.com/discordjs/discord.js/) - The framework used.

## Authors

* **Anish B.** - *Initial Work* - [MoistSenpai](https://github.com/MoistSenpai)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
