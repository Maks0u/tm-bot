import App from './src/App.js';
new App().loadCommands().start(parseInt(process.env.DISCORD_PORT), process.env.DISCORD_HOST);
