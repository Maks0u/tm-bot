import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';

import Client, { escape } from 'nadeo-client';
import { getGuildPlayers } from '../utils/utils.js';
const nadeoClient = new Client();

export const config: CommandConfig = {
    name: 'cotd',
    description: 'Get latest COTD records',
    type: 1,
};

export const response: CommandResponse = {
    type: 5,
};

export async function compute(data: IncomingCommandData, guildId: string): Promise<Message> {
    const accountIdList = getGuildPlayers(guildId);
    const cotd = await nadeoClient.getCotd();
    const records = await nadeoClient.getCompetitionRecords(`${cotd.id}`, accountIdList, 512);

    let formattedRecords = '';

    records
        .map(record => {
            const id = record.participant;
            const rank = record.rank;
            return {
                accountId: id,
                displayName: id,
                rank: rank,
                div: Math.floor(rank / 64) + 1,
                divRank: rank % 64,
            };
        })
        .sort((a, b) => a.rank - b.rank)
        .forEach(record => {
            formattedRecords += `Div ${record.div} \u00b7 ${record.divRank} \u00b7 ${record.displayName}\n`;
        });

    const message = new Message().setEmbeds([
        {
            title: escape(cotd.name),
            description: `${'||```\n'}${formattedRecords}${'\n```||'}`,
        },
    ]);

    return message;
}
