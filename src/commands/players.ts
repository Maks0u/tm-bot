import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { inspect } from 'util';
import logger from 'logger';

enum OPTION {
    ADD = 'add',
    REMOVE = 'remove',
    LIST = 'list',
    IDS = 'ids',
}

const playersIdsInput = {
    name: OPTION.IDS,
    description: "Players' ids",
    type: 3,
    required: true,
};

export const config: CommandConfig = {
    name: 'players',
    description: 'Manage player list',
    type: 1,
    options: [
        {
            name: OPTION.ADD,
            description: 'Add player(s)',
            type: 1,
            options: [playersIdsInput],
        },
        {
            name: OPTION.REMOVE,
            description: 'Remove player(s)',
            type: 1,
            options: [playersIdsInput],
        },
        {
            name: OPTION.LIST,
            description: 'List players',
            type: 1,
        },
    ],
};

export const response: CommandResponse = {
    type: 5,
};

export async function compute(data: IncomingCommandData, guildId: string): Promise<Message> {
    const guildPath = path.join(process.cwd(), 'data', guildId);
    const filepath = path.join(guildPath, 'players.json');
    if (!existsSync(filepath)) {
        mkdirSync(guildPath, { recursive: true });
        writeFileSync(filepath, '[]', { encoding: 'utf-8' });
    }
    const players: string[] = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));
    logger.debug(inspect(players));

    return new Message('Not implemented yet');
}
