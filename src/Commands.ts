import logger, { white } from 'logger';
import Command, { CommandConfig } from './Command.js';

import * as hi from './commands/hi.js';
import * as ta from './commands/ta.js';
const configFiles = [hi, ta];

export default class Commands extends Map<string, Command> {
    constructor() {
        super(
            configFiles.map(config => {
                const command = new Command(config.config, config.response, config.process);
                logger.info(`Loading command ${white(command.getName())}`);
                return [command.getName(), command];
            })
        );
    }

    getConfigs(): CommandConfig[] {
        return Array.from(this.values()).map(command => command.getConfig());
    }
}
