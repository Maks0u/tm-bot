import logger from 'logger';
import { inspect } from 'util';
import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';

import Client, { escape, formatTime } from 'nadeo-client';
import { getGuildPlayers } from '../utils/utils.js';
const nadeoClient = new Client();

export const config: CommandConfig = {
    name: 'totd',
    description: 'Get TOTD records',
    type: 1,
};

export const response: CommandResponse = {
    type: 5,
};

export async function compute(data: IncomingCommandData, guildId: string): Promise<Message> {
    const players = getGuildPlayers(guildId);

    const map = await nadeoClient.getTotdMap();
    const records = await nadeoClient.getMapRecords(players, [map.mapId]);

    logger.info(inspect(records));

    return new Message('Not implemented yet');
}
