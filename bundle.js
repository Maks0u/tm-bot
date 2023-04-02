import App from './dist/App.js';
new App().loadCommands().start(parseInt(process.env.DISCORD_PORT), process.env.DISCORD_HOST);
