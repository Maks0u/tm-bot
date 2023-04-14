import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

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

export async function compute(data: IncomingCommandData, guildId: string): Promise<Message> {
    const guildPath = path.join(process.cwd(), 'data', guildId);
    const filepath = path.join(guildPath, 'players.json');
    if (!existsSync(filepath)) {
        mkdirSync(guildPath, { recursive: true });
        writeFileSync(filepath, '[]', { encoding: 'utf-8' });
    }
    const players: string[] = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));

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

    return message;
}
