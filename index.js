import App from './src/App.js';

const app = new App();

app.loadCommands().installCommands();
// app.loadCommands();
// app.start(parseInt(process.env.DISCORD_PORT), process.env.DISCORD_HOST);
