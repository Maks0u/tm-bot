import Message from './Message.js';
import TA from './processors/TA.js';

export default class Command {
    private readonly config: CommandConfig;
    private readonly response: CommandResponse;

    constructor(config: CommandConfig, response: CommandResponse, process?: ProcessFunction) {
        this.config = config;
        this.response = response;
        this.process = process || this.process;
    }

    getName() {
        return this.getConfig().name;
    }
    getConfig() {
        return this.config;
    }
    getResponse() {
        return this.response;
    }
    process(data: IncomingCommandData): Promise<Message> {
        if ('ta' === this.getName()) {
            return TA.process(data);
        }
        return Promise.resolve(new Message());
    }
}

export interface ProcessFunction {
    (data: IncomingCommandData): Promise<Message>;
}
export interface CommandResponse {
    type: number;
    data: Message;
}
export interface CommandConfig {
    name: string;
    description: string;
    type: number;
    options: (SubCommandConfig | SubCommandGroupConfig)[];
}
export interface SubCommandConfig {
    name: string;
    description: string;
    type: number; // 1
    options: (SubCommandConfig | SubCommandGroupConfig)[];
    choices: { name: string; value: string | number }[];
}
export interface SubCommandGroupConfig {
    name: string;
    description: string;
    type: number; // 2
    options: (SubCommandConfig | SubCommandGroupConfig)[];
    choices: { name: string; value: string | number }[];
}
export interface IncomingCommandData {
    type: number;
    name: string;
    id: string;
    options?: any[];
}
