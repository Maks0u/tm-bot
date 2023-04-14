import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

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

    if (!data.options?.length) {
        return new Message('Error: missing args');
    }

    const option = data.options[0];

    if (OPTION.LIST === option.name) {
        return list(players);
    }

    if (OPTION.ADD === option.name) {
        var newPlayers = option.options[0].value.split(/\s*,\s*/g);
        return add(filepath, players, newPlayers);
    }

    if (OPTION.REMOVE === option.name) {
        var removePlayers = option.options[0].value.split(/\s*,\s*/g);
        return remove(filepath, players, removePlayers);
    }

    return new Message('Error: invalid option');
}

function list(players: string[], title: string = 'Player list'): Message {
    return new Message().setEmbeds([
        {
            title: title,
            description: `${'```\n'}${players.join('\n')}${'\n```'}`,
        },
    ]);
}

function add(filepath: string, players: string[], newPlayers: string[]): Message {
    const updatedList = save(filepath, Array.from(new Set(players.concat(newPlayers))));
    return list(updatedList, 'Player list updated');
}

function remove(filepath: string, players: string[], removePlayers: string[]): Message {
    const playersMap = new Map(players.map(p => [p, p]));
    removePlayers.forEach(id => {
        playersMap.delete(id);
    });
    const updatedList = save(filepath, Array.from(playersMap.values()));
    return list(updatedList, 'Player list updated');
}

function save(filepath: string, players: string[]) {
    writeFileSync(filepath, JSON.stringify(players), { encoding: 'utf-8' });
    return players;
}
