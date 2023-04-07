import logger, { white } from 'logger';
import Command, { CommandConfig } from './Command.js';

import * as configFiles from './commands/index.js';

export default class Commands extends Map<string, Command> {
    constructor() {
        super(
            Object.values(configFiles).map(config => {
                const command = new Command(config.config, config.response, config.compute);
                logger.info(`Loading command ${white(command.getName())}`);
                return [command.getName(), command];
            })
        );
    }

    getConfigs(): CommandConfig[] {
        return Array.from(this.values()).map(command => command.getConfig());
    }
}
