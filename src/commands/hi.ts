import { CommandConfig, CommandResponse, IncomingCommandData } from '../Command.js';
import Message from '../Message.js';

export const config: CommandConfig = {
    name: 'hi',
    description: 'Greetings',
    type: 1,
};

export const response: CommandResponse = {
    type: 4,
    data: new Message('https://tenor.com/view/hello-there-baby-yoda-mandolorian-hello-gif-20136589'),
};

export async function compute(): Promise<Message> {
    return new Message();
}
