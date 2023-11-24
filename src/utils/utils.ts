import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

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
