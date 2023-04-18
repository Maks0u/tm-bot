import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import Client from 'nadeo-client';
const nadeoClient = new Client();

export function getGuildPlayers(guildId: string): string[] {
    const guildPath = path.join(process.cwd(), 'data', guildId);
    const filepath = path.join(guildPath, 'players.json');
    if (!existsSync(filepath)) {
        mkdirSync(guildPath, { recursive: true });
        writeFileSync(filepath, '[]', { encoding: 'utf-8' });
    }
    const players: string[] = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));
    return players;
}

export async function getPlayerNames(
    accountIdList: string[]
): Promise<Map<string, { accountId: string; displayName: string; timestamp: string }>> {
    return new Map((await nadeoClient.getDisplayNames(accountIdList)).map(player => [player.accountId, player]));
}
