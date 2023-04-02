import App from './dist/App.js';

const app = new App();

// app.loadCommands();
app.loadCommands().installCommands();
// app.start(parseInt(process.env.DISCORD_PORT), process.env.DISCORD_HOST);
