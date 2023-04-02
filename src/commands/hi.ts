import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';

export const config: CommandConfig = {
    name: 'hi',
    description: 'Greetings',
    type: 1,
};

export const response: CommandResponse = {
    type: 4,
    data: new Message('Hello there!'),
};

export async function process(data: IncomingCommandData): Promise<Message> {
    return new Message();
}
