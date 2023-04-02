import Message from './Message.js';

export default class Command {
    private readonly config: CommandConfig;
    private readonly response: CommandResponse;

    constructor(config: CommandConfig, response: CommandResponse, process: ProcessFunction) {
        this.config = config;
        this.response = response;
        this.process = process;
    }

    getName(): string {
        return this.getConfig().name;
    }
    getConfig(): CommandConfig {
        return this.config;
    }
    getResponse(): CommandResponse {
        return this.response;
    }
    async process(data: IncomingCommandData): Promise<Message> {
        return new Message();
    }
}

export interface ProcessFunction {
    (data: IncomingCommandData): Promise<Message>;
}
export interface CommandResponse {
    type: number;
    data?: Message;
}
export interface CommandConfig {
    name: string;
    description: string;
    type: number;
    options?: (SubCommandConfig | SubCommandGroupConfig)[];
}
export interface SubCommandConfig {
    name: string;
    description: string;
    type: number; // 1
    options?: (SubCommandConfig | SubCommandGroupConfig)[];
    choices?: { name: string; value: string | number }[];
    required?: boolean;
}
export interface SubCommandGroupConfig {
    name: string;
    description: string;
    type: number; // 2
    options?: (SubCommandConfig | SubCommandGroupConfig)[];
    choices?: { name: string; value: string | number }[];
    required?: boolean;
}
export interface IncomingCommandData {
    type: number;
    name: string;
    id: string;
    options?: any[];
}
