import { IncomingCommandData } from '../Command.js';
import Message from '../Message.js';

export default abstract class TA {
    public static process(data: IncomingCommandData): Promise<Message> {
        return Promise.resolve(new Message().setContent('Hello from TA process function'));
    }
}
