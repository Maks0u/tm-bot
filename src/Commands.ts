import { readdirSync, readFileSync } from 'fs';
import { join, normalize } from 'path';
import logger, { white } from 'logger';
import Command from './Command.js';

export default class Commands extends Map<string, Command> {
    constructor(path: string) {
        const folder = normalize(path);
        logger.info(`Reading commands from ${folder}`);

        const files = readdirSync(folder);
        if (0 === files.length) {
            logger.warn(`Commands folder is empty`);
        }

        super(
            files.map(file => {
                const content = JSON.parse(readFileSync(join(folder, file), 'utf-8'));
                const command = new Command(content.config, content.response);
                logger.info(`Loading command ${white(command.getName())}`);
                return [command.getName(), command];
            })
        );
    }

    getConfigs() {
        return Array.from(this.values()).map(command => command.getConfig());
    }
}
