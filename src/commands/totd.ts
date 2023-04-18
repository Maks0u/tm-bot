import logger from 'logger';
import { inspect } from 'util';
import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';

import Client, { escape, formatTime } from 'nadeo-client';
import { getGuildPlayers, getPlayerNames } from '../utils/utils.js';
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
    const accountIdList = getGuildPlayers(guildId);
    const map = await nadeoClient.getTotdMap();
    const players = await getPlayerNames(accountIdList);
    const records = await nadeoClient.getMapRecords(accountIdList, [map.mapId]);

    let formattedRecords = '';

    records
        .map(record => {
            return {
                accountId: record.accountId,
                displayName: players.get(record.accountId)?.displayName,
                time: record.recordScore.time,
            };
        })
        .sort((a, b) => a.time - b.time)
        .forEach(record => {
            formattedRecords += `${formatTime(record.time)} - ${record.displayName}\n`;
        });

    const message = new Message().setEmbeds([
        {
            title: escape(map.name),
            description: `${'```\n'}${formattedRecords}${'\n```'}`,
        },
    ]);

    return message;
}
