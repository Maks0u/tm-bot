import { inspect } from 'util';
import logger from 'logger';
import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';

import Client, { escape, formatTime } from 'nadeo-client';
const nadeoClient = new Client();

const OPTION_CAMPAIGN = 'campaign';

export const config: CommandConfig = {
    name: 'ta',
    description: 'TimeAttack times for provided campaign name',
    type: 1,
    options: [
        {
            name: OPTION_CAMPAIGN,
            description: 'Campaign name',
            type: 3,
            required: true,
        },
    ],
};

export const response: CommandResponse = {
    type: 5,
};

const players: string[] = [
    '04bffe12-8efd-46cc-9eba-6c606574e5dc',
    '2c7c9ffd-1e43-46f2-87f0-984ed7011438',
    '6c5f44ab-9426-46e4-b1fb-62ea8b3ef52f',
    '724aaf97-e817-4fea-80ae-b12671c49ecd',
    '9815388e-6929-4913-a0fd-d94f19afbd8e',
    '9a75c1be-1eeb-4303-ad19-b77addbf7510',
    'bf06de13-8d35-431e-9ecc-8625797ef47e',
    'df70348a-8db0-4384-92b0-bdd909582cd4',
];

export async function process(data: IncomingCommandData): Promise<Message> {
    logger.debug(inspect(data));

    const campaignName: string = data.options?.find(opt => OPTION_CAMPAIGN === opt.name).value;
    const campaign = (await nadeoClient.getCampaign(campaignName)).campaign;
    const mapUids: string[] = campaign.playlist.map(m => m.mapUid);

    if (mapUids.length > 10) {
        return new Message("**Error:** Can't process a campaign with more than 10 maps.");
    }

    const maps: Map<
        string,
        {
            uid: string;
            mapId: string;
            name: string;
            records: { accountId: string; displayName: string; time: number }[];
            formattedRecords: string;
        }
    > = new Map();

    for (const uid of mapUids) {
        const map = await nadeoClient.getMap(uid);
        maps.set(map.mapId, {
            uid: map.uid,
            mapId: map.mapId,
            name: map.name,
            records: [],
            formattedRecords: '',
        });
    }

    const displayNames = new Map();
    (await nadeoClient.getDisplayNames(players)).forEach(player => {
        displayNames.set(player.accountId, player);
    });

    const records = await nadeoClient.getMapRecords(players, Array.from(maps.keys()));
    records.forEach((record: { mapId: string; accountId: string; recordScore: { time: number } }) => {
        const map = maps.get(record.mapId);
        if (!map) {
            return;
        }
        map.records.push({
            accountId: record.accountId,
            displayName: displayNames.get(record.accountId).displayName,
            time: record.recordScore.time,
        });
    });

    maps.forEach(map => {
        map.records.sort((a: { time: number }, b: { time: number }) => a.time - b.time);
    });
    maps.forEach(map => {
        if (!map.records.length) {
            return;
        }
        const records = Array.from(map.records);
        const first = records.shift() || { accountId: '', displayName: '', time: 0 };
        map.formattedRecords = records.reduce(
            (a, b) => `${a}\n${formatTime(b.time)} - ${b.displayName}`,
            `${formatTime(first.time)} - ${first.displayName}`
        );
    });

    const message = new Message(`**${escape(campaign.name)}**`);

    maps.forEach(map => {
        message.addEmbed({
            title: escape(map.name),
            description: `${'```\n'}${map.formattedRecords}${'\n```'}`,
        });
    });

    logger.debug(`Processed message\n${inspect(message)}`);
    return message;
}
